'use client';

import { useState, useEffect, useCallback, type FC, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { AuthContext, type AuthState, type User } from '@/contexts/auth-context';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';

const SYSTEM_ADMIN_EMAIL = 'dfplowners@gmail.com';

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const fbAuth = useFirebaseAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on initial mount
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

  // Monitor Firebase Auth State (Primary for System Admin)
  useEffect(() => {
    if (!fbAuth || !firestore) return;

    const unsubscribe = onAuthStateChanged(fbAuth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        let role: User['role'] = 'USER';
        let canAccessSettings = false;
        
        if (firebaseUser.email === SYSTEM_ADMIN_EMAIL) {
          role = 'SYSTEM_ADMIN';
          canAccessSettings = true;
        } else {
          // Regular admins are managed via the Registry (Firestore)
          const adminDoc = await getDoc(doc(firestore, 'admins', firebaseUser.uid));
          if (adminDoc.exists()) {
            role = 'ADMIN';
            canAccessSettings = adminDoc.data().canAccessSettings || false;
          }
        }

        const newUser: User = { id: firebaseUser.uid, email: firebaseUser.email || '', role, canAccessSettings };
        setUser(newUser);
        localStorage.setItem('dfpl_admin_session', JSON.stringify(newUser));
      } else {
        // If Auth clears, only clear the session if it belonged to the System Admin
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

  // Real-time Registry Listener 
  useEffect(() => {
    if (!firestore || !user || user.role === 'SYSTEM_ADMIN') return;

    const adminRef = doc(firestore, 'admins', user.id);
    
    const unsubscribe = onSnapshot(adminRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            setUser(prev => {
                if (!prev || prev.id !== user.id) return prev;
                
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
  }, [firestore, user?.id]);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      if (!fbAuth || !firestore) throw new Error('Services not initialized');
      
      try {
        await signInWithEmailAndPassword(fbAuth, email, password);
      } catch (e) {
        // Fallback: Registry-based login (Regular Admin path)
        const q = query(
          collection(firestore, 'admins'), 
          where('email', '==', email.toLowerCase().trim()), 
          where('password', '==', password)
        );
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const adminDoc = snap.docs[0];
          const data = adminDoc.data();
          const virtualUser: User = { 
            id: adminDoc.id, 
            email: email.toLowerCase().trim(), 
            role: 'ADMIN', 
            canAccessSettings: data.canAccessSettings || false 
          };
          setUser(virtualUser);
          localStorage.setItem('dfpl_admin_session', JSON.stringify(virtualUser));
          return;
        }
        throw e;
      }
    }, [fbAuth, firestore]
  );

  const logout = useCallback(async () => {
    if (fbAuth) await signOut(fbAuth);
    setUser(null);
    localStorage.removeItem('dfpl_admin_session');
  }, [fbAuth]);

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
