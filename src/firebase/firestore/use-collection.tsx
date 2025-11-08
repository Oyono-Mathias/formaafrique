'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, Query, DocumentData, WhereFilterOp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

interface Options {
    where?: [string, WhereFilterOp, any];
}

export function useCollection<T>(collectionName: string | null, options?: Options) {
    const db = useFirestore();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Memoize the where clause to prevent re-renders from creating new array instances
    const whereClause = useMemo(() => options?.where, [options?.where]);

    useEffect(() => {
        if (!db || !collectionName) {
            setLoading(false);
            return;
        }

        // A more robust check for a valid where clause
        const isValidWhereClause = whereClause && 
                                   Array.isArray(whereClause) && 
                                   whereClause.length === 3 && 
                                   !whereClause.some(val => val === undefined);

        let q: Query<DocumentData>;
        const collectionRef = collection(db, collectionName);

        if (isValidWhereClause) {
            q = query(collectionRef, where(...whereClause));
        } else if (options?.where) {
            // If where is provided but invalid, don't query.
            setLoading(false);
            setData([]);
            return;
        } else {
            q = query(collectionRef);
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
                setData(items);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error(`Error fetching collection ${collectionName}:`, err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [db, collectionName, whereClause]);

    return { data, loading, error };
}
