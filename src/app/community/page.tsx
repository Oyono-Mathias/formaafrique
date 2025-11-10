
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import type { GroupChat, GroupMessage, UserProfile, AiFlag, AdminNotification, Notification } from '@/lib/types';
import { Loader2, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/categories';
import { moderateText } from '@/ai/flows/moderate-text-flow';
import { autoReply } from '@/ai/flows/auto-reply-flow';

const getFormationName = (formationId: string | undefined) => {
    if (!formationId) return "Communauté";
    const foundCategory = categories.find(c => c.toLowerCase().includes(formationId.toLowerCase()));
    return foundCategory || `Communauté ${formationId}`;
}


export default function CommunityPage() {
    const { user, userProfile } = useUser();
    const db = useFirestore();
    const { toast } = useToast();

    const [groupChat, setGroupChat] = useState<GroupChat | null>(null);
    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isInitialLoad = useRef(true);
    const formationId = userProfile?.formationId;
    const formationName = getFormationName(formationId);
    
    useEffect(() => {
        if (!formationId || !db) {
            setLoading(false);
            return;
        }

        const findOrCreateChat = async () => {
            setLoading(true);
            const q = query(collection(db, "group_chats"), where("formationId", "==", formationId));
            const chatSnap = await getDocs(q);
            
            if (chatSnap.empty) {
                console.log(`No group chat found for formation: ${formationId}, creating one...`);
                try {
                    const newChatRef = await addDoc(collection(db, "group_chats"), {
                        formationId: formationId,
                        name: getFormationName(formationId),
                        description: `Espace de discussion pour la formation ${getFormationName(formationId)}.`,
                        createdAt: serverTimestamp(),
                    });
                    setGroupChat({ id: newChatRef.id, formationId: formationId, name: getFormationName(formationId), description: `Espace de discussion pour la formation ${getFormationName(formationId)}.`, createdAt: serverTimestamp() as any });
                } catch (e) {
                    console.error("Failed to create group chat", e);
                    toast({variant: "destructive", title: "Erreur", description: "Impossible de créer le chat de groupe."})
                }

            } else {
                const chatData = { id: chatSnap.docs[0].id, ...chatSnap.docs[0].data() } as GroupChat;
                setGroupChat(chatData);
            }
        };

        findOrCreateChat();
    }, [formationId, db, toast]);

    useEffect(() => {
        if (!groupChat?.id || !db) {
            if(!loading) setLoading(false);
            return;
        }
        
        const messagesQuery = query(collection(db, `group_chats/${groupChat.id}/messages`), orderBy('timestamp', 'asc'));
        
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupMessage));
            setMessages(newMessages);

            if (isInitialLoad.current) {
                isInitialLoad.current = false;
            } else {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const messageData = change.doc.data() as GroupMessage;
                        if (messageData.authorId !== user?.uid) {
                             toast({
                                title: `Nouveau message de ${messageData.authorName}`,
                                description: messageData.text,
                            });
                        }
                    }
                });
            }
            
            setLoading(false);
        }, (error) => {
            console.error("Error fetching group messages:", error);
            toast({ variant: 'destructive', title: "Erreur de chargement des messages." });
            setLoading(false);
        });

        return () => {
            unsubscribe();
            isInitialLoad.current = true;
        }
    }, [groupChat, db, toast, user?.uid, loading]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = async () => {
        const messageText = newMessage.trim();
        if (!messageText || !user || !userProfile || !groupChat || !db) return;

        setIsProcessing(true);
        setNewMessage('');
        
        try {
            // Moderation
            const moderationResult = await moderateText({
                text: messageText,
                formationId: groupChat.formationId
            });

             if (moderationResult.verdict !== 'allowed') {
                const flagRef = await addDoc(collection(db, 'aiFlags'), {
                    chatId: groupChat.id,
                    fromUid: user.uid,
                    reason: moderationResult.category,
                    severity: moderationResult.score > 0.8 ? 'high' : 'medium',
                    status: 'pending_review',
                    timestamp: serverTimestamp(),
                } as Omit<AiFlag, 'id'>);

                let toastDescription = `Votre message est en cours de révision par la modération.`;
                if(moderationResult.verdict === 'block') {
                    toastDescription = `Votre message a été bloqué. Motif: ${moderationResult.reason}.`;
                }

                toast({
                    variant: 'destructive',
                    title: 'Action de modération',
                    description: toastDescription,
                });
                
                // User-facing notification
                addDoc(collection(db, 'notifications'), {
                    toUid: user.uid,
                    fromUid: 'system', // or a specific moderator AI UID
                    type: 'moderation_warning',
                    payload: {
                        reason: moderationResult.reason,
                        verdict: moderationResult.verdict,
                        flagId: flagRef.id
                    },
                    read: false,
                    createdAt: serverTimestamp(),
                });
                
                setIsProcessing(false);
                return;
            }

            // Send user message if allowed
            await addDoc(collection(db, `group_chats/${groupChat.id}/messages`), {
                authorId: user.uid,
                authorName: userProfile.name,
                authorImage: userProfile.photoURL || '',
                text: messageText,
                timestamp: serverTimestamp(),
            });

            // Trigger auto-reply
             const reply = await autoReply({
                text: messageText,
                fromUid: user.uid,
                chatId: groupChat.id!,
                formationId: groupChat.formationId,
            });

            if (reply.reply) {
                 await addDoc(collection(db, `group_chats/${groupChat.id}/messages`), {
                    authorId: 'FormaAI',
                    authorName: 'Assistant de Modération',
                    authorImage: '', // Add a URL to a bot avatar if you have one
                    text: reply.reply,
                    timestamp: serverTimestamp(),
                    auto: true,
                });
            }

        } catch (error) {
            console.error("Error sending message:", error);
            toast({ variant: 'destructive', title: "L'envoi du message a échoué." });
        } finally {
            setIsProcessing(false);
        }
    };

    const chatsLoading = !groupChat && loading;

    if (chatsLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-card rounded-2xl shadow-lg border">
            <header className="p-4 border-b text-center">
                <h1 className="text-2xl font-bold font-headline text-primary">{formationName}</h1>
                <p className="text-muted-foreground text-sm">{groupChat?.description || "Le lieu d'échange de votre promotion."}</p>
            </header>

            {!formationId ? (
                <div className="flex-1 flex items-center justify-center text-center p-4">
                    <p className="text-muted-foreground">Vous devez être assigné à une formation pour rejoindre un groupe.</p>
                </div>
            ) : !groupChat && !loading ? (
                 <div className="flex-1 flex items-center justify-center text-center p-4">
                    <p className="text-muted-foreground">Le chat de groupe pour votre formation n'est pas encore disponible.</p>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="p-4 md:p-8 space-y-6">
                                {messages.map((message) => {
                                    const isSender = message.authorId === user?.uid;
                                    const isBot = message.authorId === 'FormaAI';
                                    return (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                'flex items-start gap-3',
                                                isSender ? 'justify-end' : 'justify-start'
                                            )}
                                        >
                                            {!isSender && (
                                                 <Avatar className="h-10 w-10">
                                                    <AvatarImage src={message.authorImage} alt={message.authorName} />
                                                    <AvatarFallback>{isBot ? 'AI' : message.authorName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className="flex flex-col">
                                                {!isSender && <p className="text-xs text-muted-foreground ml-3 mb-1">{message.authorName}</p>}
                                                <div
                                                    className={cn(
                                                        'max-w-md md:max-w-lg p-3 rounded-2xl shadow-sm',
                                                        isSender && 'bg-primary text-primary-foreground rounded-br-none',
                                                        !isSender && !isBot && 'bg-muted rounded-bl-none',
                                                        isBot && 'bg-blue-100 text-blue-900 rounded-bl-none'
                                                    )}
                                                    >
                                                    <p>{message.text}</p>
                                                    <p className={`text-xs mt-1.5 opacity-70 ${isSender ? 'text-right' : 'text-left'}`}>
                                                        {message.timestamp ? formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true, locale: fr }) : '...'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                    </div>

                    <footer className="p-3 border-t bg-background rounded-b-2xl">
                        <div className="flex items-center gap-2 max-w-3xl mx-auto">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Envoyer un message à la communauté..."
                            className="flex-1 h-11 rounded-full px-4"
                            disabled={isProcessing}
                        />
                        <Button onClick={handleSendMessage} size="icon" className="h-11 w-11 flex-shrink-0 rounded-full" disabled={isProcessing || !newMessage.trim()}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : <Send />}
                            <span className="sr-only">Envoyer</span>
                        </Button>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
}
