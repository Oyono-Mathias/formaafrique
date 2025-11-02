'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, Query, DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

interface Options {
    where?: [string, any, any];
}

export function useCollection<T>(collectionName: string, options?: Options) {
    const db = useFirestore();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        let q: Query<DocumentData>;
        const collectionRef = collection(db, collectionName);

        if (options?.where) {
            q = query(collectionRef, where(...options.where));
        } else {
            q = query(collectionRef);
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
                setData(items);
                setLoading(false);
            },
            (err) => {
                console.error(`Error fetching collection ${collectionName}:`, err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [db, collectionName, options?.where]);

    return { data, loading, error };
}
