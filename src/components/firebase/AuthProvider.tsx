// src/components/firebase/AuthProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import FirebaseInitializer from './FirebaseInitializer'; // Make sure Firebase is initialized

// Create a context for the authentication state
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available to any child component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    // onAuthStateChanged returns an unsubscriber
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Unsubscribe to the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  return (
    <>
      <FirebaseInitializer />
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    </>
  );
}
