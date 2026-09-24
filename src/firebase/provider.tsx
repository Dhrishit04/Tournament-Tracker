
'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Functions } from 'firebase/functions';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  functions: Functions | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  firestore: null,
  functions: null,
});

interface FirebaseProviderProps {
  children: ReactNode;
  value: {
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    functions: Functions;
  };
}

export function FirebaseProvider({ children, value }: FirebaseProviderProps) {
  const memoizedValue = useMemo(() => value, [value]);
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <FirebaseContext.Provider value={memoizedValue}>
      {isDev && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext).app;
export const useFirebaseAuth = () => useContext(FirebaseContext).auth;
export const useFirestore = () => useContext(FirebaseContext).firestore;
export const useFunctions = () => useContext(FirebaseContext).functions;
