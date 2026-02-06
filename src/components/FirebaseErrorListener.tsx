
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      // In development, this will trigger the Next.js error overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        console.error(error.message);
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
