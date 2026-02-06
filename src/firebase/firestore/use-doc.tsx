'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, type Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useDoc<T>(collectionName: string, docId: string) {
  const firestore = useFirestore() as Firestore;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !collectionName || !docId) {
      setData(null);
      setLoading(false);
      return;
    };

    const docRef = doc(firestore, collectionName, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching doc ${collectionName}/${docId}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, collectionName, docId]);

  return { data, loading, error };
}
