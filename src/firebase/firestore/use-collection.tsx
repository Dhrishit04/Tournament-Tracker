'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, type Firestore, type Query, where, type WhereFilterOp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface UseCollectionOptions<T> {
    queries?: [string, WhereFilterOp, any][];
    sort?: { field: keyof T; order: 'asc' | 'desc' };
}

export function useCollection<T>(collectionName: string, options: UseCollectionOptions<T> = {}) {
  const firestore = useFirestore() as Firestore;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !collectionName) {
        setData([]);
        setLoading(false);
        return;
    }

    let q: Query = collection(firestore, collectionName);

    if (options.queries) {
        options.queries.forEach(([field, op, value]) => {
            q = query(q, where(field as string, op, value));
        });
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching collection ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, collectionName, JSON.stringify(options.queries), JSON.stringify(options.sort)]);

  return { data, loading, error };
}
