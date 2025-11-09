'use server';

import { db } from '@/firebase/config';
import { auth } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

/**
 * Creates a moderation appeal ticket for an administrator to review.
 * @param flagId - The ID of the AiFlag document being appealed.
 */
export async function createModerationAppeal(flagId: string) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("Utilisateur non authentifié.");
    }
    
    if (!flagId) {
        throw new Error("ID de signalement manquant.");
    }

    // Check if an appeal already exists for this flag by this user
    const appealsRef = collection(db, 'moderationAppeals');
    const q = query(appealsRef, where('userId', '==', user.uid), where('flagId', '==', flagId));
    const existingAppeals = await getDocs(q);

    if (!existingAppeals.empty) {
        throw new Error("Une demande de révision a déjà été envoyée pour ce message.");
    }

    try {
        await addDoc(appealsRef, {
            userId: user.uid,
            flagId: flagId,
            reason: "Demande de révision de la décision de modération automatique.", // A reason field could be added to the UI later
            status: 'pending',
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating moderation appeal:", error);
        throw new Error("Impossible de créer la demande de révision.");
    }
}
