'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

export function useDoc<T>(collectionName: string | null, docId: string | null) {
    const db = useFirestore();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!db || !collectionName || !docId) {
            setLoading(false);
            setData(null);
            return;
        }

        const docRef = doc(db, collectionName, docId);

        const unsubscribe = onSnapshot(
            docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setData({ id: snapshot.id, ...snapshot.data() } as T);
                } else {
                    setData(null); // Document does not exist
                }
                setLoading(false);
            },
            (err) => {
                console.error(`Error fetching document ${collectionName}/${docId}:`, err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [db, collectionName, docId]);

    return { data, loading, error };
}
