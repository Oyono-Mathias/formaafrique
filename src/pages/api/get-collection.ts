import { collection, getDocs, query, where, QueryConstraint, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { NextApiRequest, NextApiResponse } from 'next';

interface GetCollectionApiRequest {
    path: string;
    where?: [string, any, any];
}


// This is a temporary workaround to fetch data from the client
// when using a combination of server/client components and firebase
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { path, where: whereFilter } = req.query as unknown as GetCollectionApiRequest;

  if (!path) {
    return res.status(400).json({ message: 'Collection path is required' });
  }

  try {
    const collectionRef = collection(db, path);
    let q: Query<DocumentData> | CollectionReference<DocumentData> = collectionRef;

    if (whereFilter && Array.isArray(whereFilter) && whereFilter.length === 3) {
      q = query(collectionRef, where(whereFilter[0], whereFilter[1], whereFilter[2]));
    }
    
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(data);
  } catch (error: any) {
    console.error(`Error fetching collection ${path}:`, error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
