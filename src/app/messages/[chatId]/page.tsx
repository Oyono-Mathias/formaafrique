
'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useUser, useCollection, useDoc, useFirestore, useStorage } from '@/firebase';
import { Loader2, Send, ArrowLeft, Paperclip, X, Phone, Video } from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, addDoc, serverTimestamp, orderBy, query, doc, updateDoc, writeBatch, onSnapshot, Unsubscribe, DocumentReference } from 'firebase/firestore';
import type { Message, Chat, UserProfile, AdminNotification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { moderateText } from '@/ai/flows/moderate-text-flow';
import { autoReply } from '@/ai/flows/auto-reply-flow';


// --- WebRTC Call Modal ---
function CallModal({ localStream, remoteStream, onHangup, callType }: { localStream: MediaStream | null, remoteStream: MediaStream | null, onHangup: () => void, callType: 'video' | 'audio' }) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onHangup()}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0" onPointerDownOutside={(e) => e.preventDefault()}>
                <div className="relative flex-1 bg-black">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                     <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-md border-2 border-white" />
                </div>
                <DialogFooter className="p-4 bg-card border-t">
                    <Button variant="destructive" onClick={onHangup}>Raccrocher</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Chat Page Component ---
export default function ChatPage() {
    const { chatId } = useParams() as { chatId: string };
    const { user, userProfile, loading: userLoading } = useUser();
    const router = useRouter();
    const db = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();

    // State for messaging
    const { data: chatData, loading: chatLoading } = useDoc<Chat>('chats', chatId);
    const { data: messages, loading: messagesLoading } = useCollection<Message>(
        `chats/${chatId}/messages`,
        { orderBy: ['timestamp', 'asc'] }
    );
    
    const [newMessage, setNewMessage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for WebRTC
    const [isCalling, setIsCalling] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callType, setCallType] = useState<'video' | 'audio'>('video');
    const pc = useRef<RTCPeerConnection | null>(null);
    const callDocRef = useRef<DocumentReference | null>(null);

    const otherUserId = useMemo(() => chatData?.members.find(m => m !== user?.uid), [chatData, user]);
    const { data: otherUser, loading: otherUserLoading } = useDoc<UserProfile>('users', otherUserId || null);
    
    // Scroll to bottom effect for messages
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

    // --- WebRTC Logic ---
    const servers = {
        iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }],
        iceCandidatePoolSize: 10,
    };

    const startCall = useCallback(async (type: 'video' | 'audio') => {
        if (!db || !user || !otherUserId) return;
        setCallType(type);
        setIsCalling(true);
        
        pc.current = new RTCPeerConnection(servers);
        
        // Get local media
        const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
        setLocalStream(stream);
        stream.getTracks().forEach(track => pc.current!.addTrack(track, stream));

        // Create call document
        callDocRef.current = doc(collection(db, 'webrtc_sessions'));
        const offerCandidates = collection(callDocRef.current, 'offerCandidates');
        const answerCandidates = collection(callDocRef.current, 'answerCandidates');

        pc.current.onicecandidate = event => {
            event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
        };

        const offerDescription = await pc.current.createOffer();
        await pc.current.setLocalDescription(offerDescription);

        const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
        await updateDoc(callDocRef.current, { offer, callerId: user.uid, calleeId: otherUserId });

        // Listen for answer
        const unsubscribeAnswer = onSnapshot(callDocRef.current, (snapshot) => {
            const data = snapshot.data();
            if (!pc.current?.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                pc.current?.setRemoteDescription(answerDescription);
            }
        });

        // Listen for remote ICE candidates
        const unsubscribeIce = onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.current?.addIceCandidate(candidate);
                }
            });
        });
        
        pc.current.ontrack = event => {
            setRemoteStream(event.streams[0]);
        };
        
        // Cleanup function for this call
        return () => {
             unsubscribeAnswer();
             unsubscribeIce();
        };
    }, [db, user, otherUserId]);

    const hangup = useCallback(async () => {
        localStream?.getTracks().forEach(track => track.stop());
        pc.current?.close();
        
        if (callDocRef.current) {
            // Logic to delete candidates and the call doc if needed
        }
        
        setLocalStream(null);
        setRemoteStream(null);
        pc.current = null;
        callDocRef.current = null;
        setIsCalling(false);
    }, [localStream]);
    
    // --- End WebRTC Logic ---


    const handleSendMessage = async () => {
        const messageText = newMessage.trim();
        if ((!messageText && !imageFile) || !user || !db || !chatData) return;
        
        setIsProcessing(true);
        setNewMessage('');
        
        try {
            // Step 1: Moderate Text
            const moderationResult = await moderateText({
                text: messageText,
                formationId: chatData.formationId
            });

            // Log moderation
            addDoc(collection(db, 'moderationLogs'), {
                chatId: chatId,
                fromUid: user.uid,
                text: messageText,
                verdict: moderationResult.verdict,
                category: moderationResult.category,
                score: moderationResult.score,
                action: 'none', // This could be updated later by an admin
                timestamp: serverTimestamp(),
            });
            
            // Step 2: Handle verdict
            if (moderationResult.verdict !== 'allowed') {
                 // Flag the message
                 addDoc(collection(db, 'aiFlags'), {
                    chatId: chatId,
                    fromUid: user.uid,
                    reason: moderationResult.category,
                    severity: moderationResult.score > 0.8 ? 'high' : 'medium',
                    status: 'pending_review',
                    timestamp: serverTimestamp(),
                });

                // Escalate if needed
                if(moderationResult.verdict === 'block' || moderationResult.verdict === 'escalate') {
                    addDoc(collection(db, 'admin_notifications'), {
                        type: 'possible_scam',
                        title: `Activité suspecte dans le chat`,
                        message: `Le message de ${user.displayName} à ${otherUser?.name} a été bloqué. Motif: ${moderationResult.reason}.`,
                        createdAt: serverTimestamp(),
                        read: false,
                        link: `/messages/${chatId}`
                    } as AdminNotification);

                    // Placeholder for sanction system
                    // const userRef = doc(db, 'users', user.uid);
                    // await updateDoc(userRef, { infractions: increment(1) });
                    // check for suspension...
                }

                toast({
                    variant: 'destructive',
                    title: 'Message bloqué par la modération',
                    description: `Motif : ${moderationResult.reason}. Votre message ne sera pas envoyé.`
                });
                setIsProcessing(false);
                return;
            }
            
            let imageUrl = '';
            if (imageFile) {
                setIsUploading(true);
                const storageRef = ref(storage, `chat_images/${chatId}/${Date.now()}_${imageFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);
                await uploadTask;
                imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                setImageFile(null);
                setIsUploading(false);
            }
            
            // Send user message
            await addDoc(collection(db, `chats/${chatId}/messages`), {
                from: user.uid,
                text: messageText,
                attachments: imageUrl ? [imageUrl] : [],
                timestamp: serverTimestamp(),
                seen: false,
            });

            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: messageText || "Image envoyée",
                lastTimestamp: serverTimestamp(),
                [`unreadCounts.${otherUserId}`]: (chatData?.unreadCounts[otherUserId!] || 0) + 1,
            });

            // Step 3: Trigger Auto-Reply (if applicable)
            const reply = await autoReply({
                text: messageText,
                fromUid: user.uid,
                chatId: chatId,
                formationId: chatData.formationId,
            });

            if (reply.reply) {
                 await addDoc(collection(db, `chats/${chatId}/messages`), {
                    from: 'FormaAI',
                    text: reply.reply,
                    attachments: [],
                    timestamp: serverTimestamp(),
                    seen: false,
                    auto: true,
                });
                await updateDoc(doc(db, 'chats', chatId), {
                    lastMessage: reply.reply,
                    lastTimestamp: serverTimestamp(),
                     [`unreadCounts.${otherUserId}`]: (chatData?.unreadCounts[otherUserId!] || 0) + 2, // +1 for user msg, +1 for bot
                });
            }

        } catch (error) {
            console.error("Error during message pipeline:", error);
            toast({ variant: 'destructive', title: "L'envoi du message a échoué." });
        } finally {
            setIsProcessing(false);
            setIsUploading(false);
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
            {isCalling && <CallModal localStream={localStream} remoteStream={remoteStream} onHangup={hangup} callType={callType} />}
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
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => startCall('video')}><Video className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => startCall('audio')}><Phone className="h-5 w-5"/></Button>
                 </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                {(messages || []).map((message, index) => {
                    const isSender = message.from === user.uid;
                    const isBot = message.from === 'FormaAI';
                    return (
                        <div key={message.id || index} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                            <div className={cn('p-3 rounded-lg max-w-sm', 
                                isSender && 'bg-primary text-primary-foreground',
                                !isSender && !isBot && 'bg-card shadow-sm',
                                isBot && 'bg-blue-100 text-blue-900'
                            )}>
                                {isBot && <p className='font-bold text-xs mb-1'>FormaAfrique Assistant</p>}
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
                     <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isProcessing}>
                        <Paperclip className="h-5 w-5"/>
                     </Button>
                    <Input
                        placeholder="Écrire un message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isUploading || isProcessing}
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={(!newMessage.trim() && !imageFile) || isUploading || isProcessing}>
                        {isProcessing || isUploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send/>}
                    </Button>
                </div>
            </CardFooter>
        </div>
    )
}
