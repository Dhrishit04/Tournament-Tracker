'use client';

import { useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { doc, increment, setDoc } from 'firebase/firestore';

export function FootfallTracker() {
    const firestore = useFirestore();
    const hasTracked = useRef(false);

    useEffect(() => {
        if (!firestore || hasTracked.current) return;

        const trackVisit = async () => {
            try {
                const today = new Date();
                // Ensure local timezone YYYY-MM-DD
                const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                
                const lastVisit = localStorage.getItem('dfpl_last_visit');
                
                if (lastVisit !== dateStr) {
                    hasTracked.current = true;
                    
                    // Master all-time counter
                    const allTimeRef = doc(firestore, 'analytics', 'footfall_all_time');
                    await setDoc(allTimeRef, { count: increment(1) }, { merge: true });

                    // Daily counter
                    const dailyRef = doc(firestore, 'analytics', `daily_${dateStr}`);
                    await setDoc(dailyRef, {
                        date: dateStr,
                        timestamp: today.getTime(),
                        count: increment(1)
                    }, { merge: true });

                    localStorage.setItem('dfpl_last_visit', dateStr);
                }
            } catch (error) {
                console.error("Failed to track footfall:", error);
            }
        };

        trackVisit();
    }, [firestore]);

    return null;
}
