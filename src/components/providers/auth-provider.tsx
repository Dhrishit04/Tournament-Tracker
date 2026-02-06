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

  useEffect(() => {
    const savedUser = localStorage.getItem('dfpl_admin_session');
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
        const session = localStorage.getItem('dfpl_admin_session');
        if (session && JSON.parse(session).role === 'SYSTEM_ADMIN') {
            setUser(null);
            localStorage.removeItem('dfpl_admin_session');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fbAuth, firestore]);

  useEffect(() => {
    if (!firestore || !user || user.role === 'SYSTEM_ADMIN') return;
    const unsubscribe = onSnapshot(doc(firestore, 'admins', user.id), (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.canAccessSettings !== user.canAccessSettings) {
                const updated = { ...user, canAccessSettings: data.canAccessSettings };
                setUser(updated);
                localStorage.setItem('dfpl_admin_session', JSON.stringify(updated));
            }
        } else {
            setUser(null);
            localStorage.removeItem('dfpl_admin_session');
        }
    });
    return () => unsubscribe();
  }, [firestore, user?.id]);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      if (!fbAuth || !firestore) throw new Error('Services not initialized');
      try {
        await signInWithEmailAndPassword(fbAuth, email, password);
      } catch (e) {
        const q = query(collection(firestore, 'admins'), where('email', '==', email.toLowerCase().trim()), where('password', '==', password));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          const data = doc.data();
          const virtualUser: User = { id: doc.id, email: email.toLowerCase().trim(), role: 'ADMIN', canAccessSettings: data.canAccessSettings || false };
          setUser(virtualUser);
          localStorage.setItem('dfpl_admin_session', JSON.stringify(virtualUser));
          return;
        }
        throw e;
      }
    }, [fbAuth, firestore]
  );

  const logout = useCallback(async () => {
    if (!fbAuth) return;
    await signOut(fbAuth);
    setUser(null);
    localStorage.removeItem('dfpl_admin_session');
  }, [fbAuth]);

  const authState: AuthState = {
    user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SYSTEM_ADMIN',
    isSystemAdmin: user?.role === 'SYSTEM_ADMIN',
    login, logout, loading,
  };

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};
