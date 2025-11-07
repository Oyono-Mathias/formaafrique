import { collection, getDocs, query, where, QueryConstraint } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetCollectionApiRequest } from '@/lib/types';

// This is a temporary workaround to fetch data from the client
// when using a combination of server/client components and firebase
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { path, filters } = req.query as unknown as GetCollectionApiRequest;

  if (!path) {
    return res.status(400).json({ message: 'Collection path is required' });
  }

  try {
    const constraints: QueryConstraint[] = [];
    if (filters && Array.isArray(filters)) {
      filters.forEach(filter => {
         let value = filter.value;
        // Basic type conversion
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        constraints.push(where(filter.field, filter.op, value));
      });
    }

    const collectionRef = collection(db, path);
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(data);
  } catch (error: any) {
    console.error(`Error fetching collection ${path}:`, error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
