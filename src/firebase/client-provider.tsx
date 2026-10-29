'use client';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { FirebaseServices } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [firebase, setFirebase] = useState<FirebaseServices | null>(null);
  useEffect(() => {
    const initialize = async () => {
      const { initializeFirebase } = await import('./index');
      setFirebase(initializeFirebase());
    };
    void initialize();
  }, []);
  if (!firebase) {
    return null;
  }
  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
