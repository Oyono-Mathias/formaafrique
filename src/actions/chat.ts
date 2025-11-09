'use server';

import { db } from '@/firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import type { UserProfile } from '@/lib/types';

/**
 * Finds an existing 1-on-1 chat between two users or creates a new one if it doesn't exist.
 * Then redirects to the chat page.
 * @param uid1 - The UID of the first user (usually the current user).
 * @param uid2 - The UID of the second user.
 */
export async function getOrCreateChat(uid1: string, uid2: string) {
    if (!uid1 || !uid2) {
        console.error("Invalid user IDs provided for chat creation. Both UIDs are required.");
        return;
    }
     if (uid1 === uid2) {
        console.error("Cannot create a chat with oneself.");
        // Redirect to a safe page, maybe the user's own profile or dashboard
        redirect('/dashboard');
        return;
    }
    
    const chatsRef = collection(db, 'chats');

    // Query for chats where both users are members.
    const q = query(chatsRef, where('members', 'in', [[uid1, uid2], [uid2, uid1]]));
    
    const querySnapshot = await getDocs(q);
    
    let existingChatId: string | null = null;
    
    if (!querySnapshot.empty) {
        // A chat with this exact pair of members exists.
        existingChatId = querySnapshot.docs[0].id;
    }

    if (existingChatId) {
        console.log(`Found existing chat: ${existingChatId}`);
        redirect(`/messages/${existingChatId}`);
    } else {
        console.log("No existing chat found. Verifying users before creating...");

        try {
            // --- Step 5 Logic Integration ---
            const user1DocRef = doc(db, "users", uid1);
            const user2DocRef = doc(db, "users", uid2);
            
            const [user1Snap, user2Snap] = await Promise.all([
                getDoc(user1DocRef),
                getDoc(user2DocRef)
            ]);

            if (!user1Snap.exists() || !user2Snap.exists()) {
                console.error("One or both users do not exist.");
                return;
            }

            const user1Profile = user1Snap.data() as UserProfile;
            const user2Profile = user2Snap.data() as UserProfile;

            if (user1Profile.formationId !== user2Profile.formationId) {
                console.error("Users are not in the same formation. Chat creation blocked.");
                // In a real app, you might redirect with an error query param
                // or simply rely on the UI and security rules to prevent this.
                return;
            }
            // --- End of Step 5 Logic ---

            const newChatDoc = await addDoc(chatsRef, {
                members: [uid1, uid2],
                lastMessage: 'Nouvelle conversation',
                lastTimestamp: serverTimestamp(),
                unreadCounts: {
                    [uid1]: 0,
                    [uid2]: 0,
                },
                formationId: user1Profile.formationId, // Add formationId
            });
            console.log(`Created new chat with ID: ${newChatDoc.id}`);
            redirect(`/messages/${newChatDoc.id}`);
        } catch (error) {
            console.error("Error creating new chat:", error);
            // Handle error, maybe redirect to an error page or show a toast
            // For now, we'll just log it.
            return;
        }
    }
}
