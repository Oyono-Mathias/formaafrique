'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, Query, DocumentData, WhereFilterOp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

interface Options {
    where?: [string, WhereFilterOp, any] | [string, WhereFilterOp, any][];
}

export function useCollection<T>(collectionName: string | null, options?: Options) {
    const db = useFirestore();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Memoize the where clause to prevent re-renders from creating new array instances
    // JSON.stringify is a common technique to create a stable dependency from an object/array.
    const optionsDependencies = useMemo(() => JSON.stringify(options?.where), [options?.where]);

    useEffect(() => {
        if (!db || !collectionName) {
            setLoading(false);
            return;
        }

        let q: Query<DocumentData>;
        const collectionRef = collection(db, collectionName);

        if (options?.where) {
            // Check if it's a single where clause or an array of where clauses
            if (Array.isArray(options.where[0])) {
                // It's an array of where clauses for compound queries
                const whereClauses = options.where as [string, WhereFilterOp, any][];
                const queryConstraints = whereClauses.map(w => {
                    if (w.length !== 3 || w.some(val => val === undefined)) return null;
                    return where(w[0], w[1], w[2]);
                }).filter(Boolean);

                if (queryConstraints.length !== whereClauses.length) {
                     setLoading(false);
                     setData([]);
                     return;
                }
                
                q = query(collectionRef, ...queryConstraints as any);

            } else {
                 // It's a single where clause
                const whereClause = options.where as [string, WhereFilterOp, any];
                if (whereClause.length !== 3 || whereClause.some(val => val === undefined)) {
                    setLoading(false);
                    setData([]);
                    return;
                }
                q = query(collectionRef, where(whereClause[0], whereClause[1], whereClause[2]));
            }
        } else {
            q = query(collectionRef);
        }

        setLoading(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db, collectionName, optionsDependencies]);

    return { data, loading, error };
}
