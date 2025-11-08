'use server';

import { db } from '@/firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { redirect } from 'next/navigation';

/**
 * Finds an existing 1-on-1 chat between two users or creates a new one if it doesn't exist.
 * Then redirects to the chat page.
 * @param uid1 - The UID of the first user (usually the current user).
 * @param uid2 - The UID of the second user.
 */
export async function getOrCreateChat(uid1: string, uid2: string) {
    if (!uid1 || !uid2) {
        console.error("Invalid user IDs provided for chat creation. Both UIDs are required.");
        // Optionally redirect to an error page or show a toast on the client
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
    // Firestore's `array-contains-all` is perfect for this, but to be absolutely sure
    // we find the exact 1-on-1 chat, we check the members array length as well.
    const q = query(chatsRef, where('members', 'in', [[uid1, uid2], [uid2, uid1]]));
    
    const querySnapshot = await getDocs(q);
    
    let existingChatId: string | null = null;
    
    if (!querySnapshot.empty) {
        // A chat with this exact pair of members exists.
        existingChatId = querySnapshot.docs[0].id;
    }

    if (existingChatId) {
        console.log(`Found existing chat: ${existingChatId}`);
        redirect(`/chat/${existingChatId}`);
    } else {
        console.log("No existing chat found. Creating a new one...");

        try {
            const newChatDoc = await addDoc(chatsRef, {
                members: [uid1, uid2],
                lastMessage: 'Nouvelle conversation',
                lastTimestamp: serverTimestamp(),
                unreadCounts: {
                    [uid1]: 0,
                    [uid2]: 0,
                },
            });
            console.log(`Created new chat with ID: ${newChatDoc.id}`);
            redirect(`/chat/${newChatDoc.id}`);
        } catch (error) {
            console.error("Error creating new chat:", error);
            // Handle error, maybe redirect to an error page or show a toast
            // For now, we'll just log it.
            return;
        }
    }
}
