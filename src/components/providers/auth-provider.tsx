'use client';

import { useState, useEffect, useCallback, type FC, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  type User as FirebaseUser,
  type AuthError,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, addDoc } from 'firebase/firestore';
import { AuthContext, type AuthState, type User } from '@/contexts/auth-context';
import { useFirebaseAuth, useFirestore } from '@/firebase';

const SYSTEM_ADMIN_EMAIL = 'dfplowners@gmail.com';

/**
 * Build the app-level User from a FirebaseUser by reading custom claims off
 * the ID token. Claims are the source of truth for role and privileges.
 * Falls back to /admins collection for migrated users who don't have claims set yet.
 */
const userFromClaims = async (
  fb: FirebaseUser,
  firestore: ReturnType<typeof import('firebase/firestore').getFirestore> | null,
  forceRefresh = false
): Promise<User> => {
  const tokenResult = await fb.getIdTokenResult(forceRefresh);
  const claims = tokenResult.claims;
  let role: User['role'] = 'USER';
  let canAccessSettings = false;

  // Primary: Check custom claims
  if (claims.role === 'system_admin' && fb.email === SYSTEM_ADMIN_EMAIL) {
    role = 'SYSTEM_ADMIN';
    canAccessSettings = true;
  } else if (claims.role === 'admin') {
    role = 'ADMIN';
    canAccessSettings = !!claims.canAccessSettings;
  }
  // Fallback: Check /admins collection for migrated users without claims yet
  // Note: /admins uses UID as doc ID, email is a field - must query
  else if (firestore && fb.email) {
    const adminQuery = query(
      collection(firestore, 'admins'),
      where('email', '==', fb.email.toLowerCase().trim())
    );
    const adminSnap = await getDocs(adminQuery);
    if (!adminSnap.empty) {
      const adminData = adminSnap.docs[0].data();
      role = 'ADMIN';
      canAccessSettings = !!adminData.canAccessSettings;
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug('[Auth] Claims:', { email: fb.email, role: claims.role, canAccessSettings: claims.canAccessSettings, derivedRole: role });
  }

  return {
    id: fb.uid,
    email: fb.email || '',
    role,
    canAccessSettings,
  };
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const fbAuth = useFirebaseAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on initial mount (for instant UI)
  useEffect(() => {
    const savedUser = localStorage.getItem('dfpl_admin_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('dfpl_admin_session');
      }
    }
  }, []);

  // Monitor Firebase Auth State (Primary for System Admin & Migrated Admins)
  useEffect(() => {
    if (!fbAuth) return;

    const unsubscribe = onAuthStateChanged(fbAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Always force refresh to get latest custom claims (e.g. after manageAdmin updates)
          // This avoids a race where login() sets fresh claims but listener overwrites with stale cache
          const u = await userFromClaims(firebaseUser, firestore, true);
          setUser(u);
          localStorage.setItem('dfpl_admin_session', JSON.stringify(u));
        } catch (err) {
          console.error('Failed to derive user from claims:', err);
          setUser(null);
          localStorage.removeItem('dfpl_admin_session');
        }
      } else {
        // If Auth clears, only clear the session if it belonged to a Firebase Auth user
        setUser(prev => {
          if (prev?.role === 'SYSTEM_ADMIN') {
            localStorage.removeItem('dfpl_admin_session');
            return null;
          }
          return prev;
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fbAuth, firestore]);

  // Real-time Registry Listener for privilege changes (legacy & migrated admins)
  useEffect(() => {
    if (!firestore || !user || user.role === 'SYSTEM_ADMIN') return;

    // Query by email since /admins uses UID as doc ID
    const adminQuery = query(
      collection(firestore, 'admins'),
      where('email', '==', user.email.toLowerCase().trim())
    );

    const unsubscribe = onSnapshot(adminQuery, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setUser(prev => {
          if (!prev || prev.email !== user.email) return prev;

          // If privileges changed; update immediately
          if (data.canAccessSettings !== prev.canAccessSettings) {
            const updated = { ...prev, canAccessSettings: !!data.canAccessSettings };
            localStorage.setItem('dfpl_admin_session', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      } else {
        // Document deleted: Revoke session immediately
        setUser(null);
        localStorage.removeItem('dfpl_admin_session');
      }
    }, (error) => {
      // Silent background listener
    });

    return () => unsubscribe();
  }, [firestore, user?.email]);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      if (!fbAuth || !firestore) throw new Error('Services not initialized');

      const logAuth = async (emailStr: string, action: string) => {
        const adminIdentity = emailStr === SYSTEM_ADMIN_EMAIL ? 'SYS_ADMIN' : emailStr.split('@')[0];
        try {
          await addDoc(collection(firestore, 'logs'), {
            timestamp: Date.now(),
            adminEmail: adminIdentity,
            action,
            details: action === 'AUTH_LOGIN' ? `Admin authenticated.` : `Admin session terminated.`
          });
        } catch (e) {
          console.error('Failed to log auth event:', e);
        }
      };

      const normalizedEmail = email.toLowerCase().trim();

      // Path 1: Try Firebase Auth login (System Admin + Migrated Admins)
      try {
        const cred = await signInWithEmailAndPassword(fbAuth, normalizedEmail, password);
        await logAuth(normalizedEmail, 'AUTH_LOGIN');
        // Force a token refresh so the latest custom claims are reflected
        const fresh = await userFromClaims(cred.user, firestore, true);
        setUser(fresh);
        localStorage.setItem('dfpl_admin_session', JSON.stringify(fresh));
        return;
      } catch (err) {
        const authError = err as AuthError;

        // Path 2: Legacy admin login via /admins collection (plaintext password)
        // This handles existing admin users who don't have Firebase Auth accounts yet
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
          const adminQuery = query(
            collection(firestore, 'admins'),
            where('email', '==', normalizedEmail),
            where('password', '==', password)
          );
          const snap = await getDocs(adminQuery);

          if (!snap.empty) {
            const adminDoc = snap.docs[0];
            const data = adminDoc.data();
            const virtualUser: User = {
              id: adminDoc.id,
              email: normalizedEmail,
              role: 'ADMIN',
              canAccessSettings: data.canAccessSettings || false
            };
            setUser(virtualUser);
            localStorage.setItem('dfpl_admin_session', JSON.stringify(virtualUser));
            await logAuth(normalizedEmail, 'AUTH_LOGIN');

            // MIGRATION: Create Firebase Auth account for this admin (async, non-blocking)
            // This removes the plaintext password from Firestore
            createUserWithEmailAndPassword(fbAuth, normalizedEmail, password)
              .then(async (cred) => {
                // Mark the admin document as migrated and remove plaintext password
                await setDoc(adminDoc.ref, {
                  migrated: true,
                  password: null, // Remove plaintext password
                  migratedAt: new Date().toISOString()
                }, { merge: true });

                // Note: Custom claims must be set via Cloud Function (manageAdmin)
                // The onAuthStateChanged listener will pick up the fallback from /admins
                // until claims are set by system admin
              })
              .catch((createErr) => {
                const createError = createErr as AuthError;
                if (createError.code !== 'auth/email-already-exists') {
                  console.error('Migration failed:', createErr);
                }
              });

            return;
          }
        }

        // Path 3: Wrong password for Firebase Auth user
        throw err;
      }
    }, [fbAuth, firestore]
  );

  const logout = useCallback(async () => {
    if (user && firestore) {
      const adminIdentity = user.email === SYSTEM_ADMIN_EMAIL ? 'SYS_ADMIN' : user.email.split('@')[0];
      try {
        await addDoc(collection(firestore, 'logs'), {
          timestamp: Date.now(),
          adminEmail: adminIdentity,
          action: 'AUTH_LOGOUT',
          details: 'Admin session terminated.'
        });
      } catch (e) {
        console.error('Failed to log logout:', e);
      }
    }
    if (fbAuth) await signOut(fbAuth);
    setUser(null);
    localStorage.removeItem('dfpl_admin_session');
  }, [fbAuth, user, firestore]);

  const authState: AuthState = {
    user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SYSTEM_ADMIN',
    isSystemAdmin: user?.role === 'SYSTEM_ADMIN',
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};