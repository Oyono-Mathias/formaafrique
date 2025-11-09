'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser, useCollection, useDoc, useFirestore, useStorage } from '@/firebase';
import { Loader2, Send, ArrowLeft, Paperclip, X } from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, addDoc, serverTimestamp, orderBy, query, doc, updateDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import type { Message, Chat, UserProfile } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ChatPage() {
    const { chatId } = useParams() as { chatId: string };
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const db = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();

    const { data: chatData, loading: chatLoading } = useDoc<Chat>('chats', chatId);
    const { data: messages, loading: messagesLoading } = useCollection<Message>(
        `chats/${chatId}/messages`,
        { orderBy: ['timestamp', 'asc'] }
    );
    
    const [newMessage, setNewMessage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const otherUserId = useMemo(() => {
        return chatData?.members.find(m => m !== user?.uid);
    }, [chatData, user]);

    const { data: otherUser, loading: otherUserLoading } = useDoc<UserProfile>('users', otherUserId || null);
    
    // Scroll to bottom effect
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark messages as read effect
    useEffect(() => {
        if (!db || !user || !messages || messages.length === 0) return;

        const markAsRead = async () => {
            const unreadMessages = messages.filter(m => m.from !== user.uid && !m.seen);
            if (unreadMessages.length === 0) return;

            const batch = writeBatch(db);
            unreadMessages.forEach(msg => {
                const msgRef = doc(db, `chats/${chatId}/messages`, msg.id!);
                batch.update(msgRef, { seen: true });
            });

            const chatRef = doc(db, 'chats', chatId);
            batch.update(chatRef, { [`unreadCounts.${user.uid}`]: 0 });

            await batch.commit();
        };

        markAsRead();

    }, [messages, user, db, chatId]);


    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !imageFile) || !user || !db) return;
        
        let imageUrl = '';
        if (imageFile) {
            setIsUploading(true);
            const storageRef = ref(storage, `chat_images/${chatId}/${Date.now()}_${imageFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, imageFile);

            try {
                await uploadTask;
                imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                setImageFile(null);
            } catch (error) {
                console.error("Image upload failed:", error);
                toast({ variant: 'destructive', title: "L'envoi de l'image a échoué." });
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }
        
        const messageText = newMessage.trim();
        setNewMessage('');

        const messagesCollection = collection(db, `chats/${chatId}/messages`);
        const chatDoc = doc(db, 'chats', chatId);

        try {
            await addDoc(messagesCollection, {
                from: user.uid,
                text: messageText,
                attachments: imageUrl ? [imageUrl] : [],
                timestamp: serverTimestamp(),
                seen: false,
            });

            await updateDoc(chatDoc, {
                lastMessage: messageText || "Image envoyée",
                lastTimestamp: serverTimestamp(),
                [`unreadCounts.${otherUserId}`]: (chatData?.unreadCounts[otherUserId!] || 0) + 1,
            });
        } catch (error) {
            console.error("Error sending message:", error);
            toast({ variant: 'destructive', title: "L'envoi du message a échoué." });
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
             if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({ variant: 'destructive', title: "Fichier trop volumineux", description: "La taille maximale est de 5Mo."});
                return;
            }
            setImageFile(file);
        }
    };

    const loading = userLoading || chatLoading || messagesLoading || otherUserLoading;

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!user || !chatData) {
        return <div className="flex h-full w-full items-center justify-center">Sélectionnez une conversation</div>;
    }
    
    if (!chatData.members.includes(user.uid)) {
         return <div className="flex h-full w-full items-center justify-center">Accès refusé.</div>;
    }

    return (
        <div className="flex flex-col h-full bg-muted">
            <CardHeader className="flex-shrink-0 bg-background border-b flex flex-row items-center justify-between p-3">
                 <Button variant="ghost" size="icon" onClick={() => router.push('/messages')} className="md:hidden">
                    <ArrowLeft className="h-5 w-5"/>
                </Button>
                <div className="flex items-center gap-3">
                     <Avatar className="relative">
                        <AvatarImage src={otherUser?.photoURL || ''} alt={otherUser?.name} />
                        <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
                        <div className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background", otherUser?.online ? "bg-green-500" : "bg-gray-400")} />
                    </Avatar>
                    <div>
                        <CardTitle className="text-base">{otherUser?.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {otherUser?.online ? 'En ligne' : (otherUser?.lastSeen ? `Vu ${formatDistanceToNow(otherUser.lastSeen.toDate(), {addSuffix: true, locale: fr})}` : 'Hors ligne')}
                        </p>
                    </div>
                </div>
                 <div className="w-8"/>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                {(messages || []).map((message, index) => {
                    const isSender = message.from === user.uid;
                    return (
                        <div key={message.id || index} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-sm ${isSender ? 'bg-primary text-primary-foreground' : 'bg-card shadow-sm'}`}>
                                {message.text && <p className="text-sm">{message.text}</p>}
                                {message.attachments && message.attachments[0] && (
                                     <Image src={message.attachments[0]} alt="Pièce jointe" width={200} height={200} className="rounded-md mt-2 cursor-pointer" onClick={() => window.open(message.attachments[0], '_blank')}/>
                                )}
                                <p className={`text-xs mt-1 ${isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {message.timestamp ? formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true, locale: fr }) : '...'}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="p-2 border-t bg-background">
                 {imageFile && (
                    <div className="p-2 relative">
                        <Image src={URL.createObjectURL(imageFile)} alt="Preview" width={48} height={48} className="rounded-md object-cover"/>
                        <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setImageFile(null)}>
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                 )}
                <div className="flex items-center gap-2 w-full">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                     <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <Paperclip className="h-5 w-5"/>
                     </Button>
                    <Input
                        placeholder="Écrire un message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isUploading}
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={(!newMessage.trim() && !imageFile) || isUploading}>
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send/>}
                    </Button>
                </div>
            </CardFooter>
        </div>
    )
}
