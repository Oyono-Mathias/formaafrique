
'use server';

/**
 * @fileOverview This file defines AI tools related to course management.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/firebase/config';

/**
 * A tool that retrieves the total count of published courses from Firestore.
 */
export const getPublishedCoursesCount = ai.defineTool(
  {
    name: 'getPublishedCoursesCount',
    description: 'Permet d\'obtenir le nombre total de formations actuellement publiées sur la plateforme.',
    inputSchema: z.object({}), // No input needed
    outputSchema: z.object({
      count: z.number().describe('Le nombre total de formations publiées.'),
    }),
  },
  async () => {
    console.log('Tool getPublishedCoursesCount called');
    if (!db) {
      throw new Error('Firestore is not initialized.');
    }
    
    try {
      const coursesCollection = collection(db, 'formations');
      const q = query(coursesCollection, where('publie', '==', true));
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;
      console.log(`Found ${count} published courses.`);
      return { count };
    } catch (error) {
      console.error('Error fetching published courses count:', error);
      // In case of an error, we can return a neutral value or throw.
      // Returning 0 is safer for the LLM to handle.
      return { count: 0 };
    }
  }
);
