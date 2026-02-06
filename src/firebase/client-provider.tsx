'use client';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Firebase } from './index';
import { FirebaseProvider } from './provider';
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<Firebase | null>(null);
  useEffect(() => {
    const initialize = async () => {
      const { initializeFirebase } = await import('./index');
      setFirebase(initializeFirebase());
    };
    initialize();
  }, []);
  if (!firebase) {
    return null; 
  }
  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}