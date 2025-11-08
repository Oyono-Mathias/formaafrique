'use server';

import { db } from '@/firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { redirect } from 'next/navigation';

/**
 * Finds an existing 1-on-1 chat between two users or creates a new one if it doesn't exist.
 * @param uid1 - The UID of the first user.
 * @param uid2 - The UID of the second user.
 * @returns The ID of the existing or new chat document.
 */
export async function getOrCreateChat(uid1: string, uid2: string) {
    if (!uid1 || !uid2 || uid1 === uid2) {
        console.error("Invalid user IDs provided for chat creation.");
        return;
    }
    
    const chatsRef = collection(db, 'chats');

    // Query for chats where both users are members.
    // Firestore's `array-contains-all` is perfect for this.
    const q = query(chatsRef, where('members', 'array-contains-all', [uid1, uid2]));
    
    const querySnapshot = await getDocs(q);
    
    let existingChatId: string | null = null;
    
    // There should ideally be only one chat, but we loop just in case.
    querySnapshot.forEach(doc => {
        const chat = doc.data();
        if (chat.members.length === 2) { // Ensure it's a 1-on-1 chat
            existingChatId = doc.id;
        }
    });

    if (existingChatId) {
        console.log(`Found existing chat: ${existingChatId}`);
        redirect(`/chat/${existingChatId}`);
    }

    console.log("No existing chat found. Creating a new one...");

    try {
        const newChatDoc = await addDoc(chatsRef, {
            members: [uid1, uid2],
            lastMessage: '',
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
