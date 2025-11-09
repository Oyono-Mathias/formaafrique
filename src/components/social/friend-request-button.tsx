'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, addDoc, updateDoc, deleteDoc, collection, serverTimestamp, where, getDocs, query, writeBatch, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FriendRequest, UserProfile } from '@/lib/types';

interface FriendRequestButtonProps {
  targetUserId: string;
}

type FriendStatus = 'not_friends' | 'request_sent' | 'request_received' | 'friends' | 'different_formation';

export default function FriendRequestButton({ targetUserId }: FriendRequestButtonProps) {
  const { user, userProfile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<FriendStatus>('not_friends');
  const [isLoading, setIsLoading] = useState(true);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [targetUserProfile, setTargetUserProfile] = useState<UserProfile | null>(null);

  // Memoize target user profile to avoid re-fetching
  const memoizedTargetUserId = useMemo(() => targetUserId, [targetUserId]);

  useEffect(() => {
    if (!db || !memoizedTargetUserId) return;

    const fetchTargetUser = async () => {
      const userDocRef = doc(db, 'users', memoizedTargetUserId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setTargetUserProfile(userDoc.data() as UserProfile);
      }
    };
    fetchTargetUser();
  }, [db, memoizedTargetUserId]);

  useEffect(() => {
    if (!user || !db || !userProfile || !targetUserProfile) {
        setIsLoading(false);
        return;
    };
    if (user.uid === memoizedTargetUserId) {
        setIsLoading(false);
        return;
    }
    // Check if formations are different
    if (userProfile.formationId !== targetUserProfile.formationId) {
        setStatus('different_formation');
        setIsLoading(false);
        return;
    }


    const checkStatus = async () => {
        setIsLoading(true);
        // 1. Check if they are already friends
        if (userProfile.friends?.includes(memoizedTargetUserId)) {
            setStatus('friends');
            setIsLoading(false);
            return;
        }

        // 2. Check for an existing friend request (sent or received)
        const q1 = query(collection(db, 'friendRequests'), where('from', '==', user.uid), where('to', '==', memoizedTargetUserId));
        const q2 = query(collection(db, 'friendRequests'), where('from', '==', memoizedTargetUserId), where('to', '==', user.uid));
        
        const [sentSnapshot, receivedSnapshot] = await Promise.all([getDocs(q1), getDocs(q2)]);

        const sentRequest = sentSnapshot.docs.find(doc => doc.data().status === 'pending');
        if (sentRequest) {
            setStatus('request_sent');
            setRequestId(sentRequest.id);
            setIsLoading(false);
            return;
        }

        const receivedRequest = receivedSnapshot.docs.find(doc => doc.data().status === 'pending');
        if (receivedRequest) {
            setStatus('request_received');
            setRequestId(receivedRequest.id);
            setIsLoading(false);
            return;
        }
        
        setStatus('not_friends');
        setIsLoading(false);
    };

    checkStatus();

  }, [user, db, userProfile, targetUserProfile, memoizedTargetUserId]);

  const handleSendRequest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user || !db || !userProfile || !targetUserProfile) return;

    if(userProfile.formationId !== targetUserProfile.formationId) {
        toast({
            variant: "destructive",
            title: "Action impossible",
            description: "Vous ne pouvez ajouter que des amis de la même formation que vous."
        });
        return;
    }
    
    setIsLoading(true);
    try {
        const batch = writeBatch(db);

        // Create the friend request
        const newRequestRef = doc(collection(db, 'friendRequests'));
        batch.set(newRequestRef, {
            from: user.uid,
            to: targetUserId,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
        setRequestId(newRequestRef.id);

        // Create a notification for the target user
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
            toUid: targetUserId,
            fromUid: user.uid,
            type: 'friend_request',
            payload: { fromName: user.displayName || 'Quelqu\'un' },
            read: false,
            createdAt: serverTimestamp(),
        });

        await batch.commit();

        setStatus('request_sent');
        toast({ title: "Demande d'ami envoyée." });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erreur' });
    }
    setIsLoading(false);
  };

  const handleCancelRequest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!db || !requestId) return;
    setIsLoading(true);
    try {
        await deleteDoc(doc(db, 'friendRequests', requestId));
        setStatus('not_friends');
        setRequestId(null);
        toast({ title: "Demande annulée." });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erreur' });
    }
    setIsLoading(false);
  };

  const handleAcceptRequest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user || !db || !requestId || !userProfile) return;
    setIsLoading(true);
    const batch = writeBatch(db);

    // Update request to accepted
    const requestRef = doc(db, 'friendRequests', requestId);
    batch.update(requestRef, { status: 'accepted' });

    // Add friend to both users
    const currentUserRef = doc(db, 'users', user.uid);
    const targetUserRef = doc(db, 'users', targetUserId);
    batch.update(currentUserRef, { friends: [...(userProfile.friends || []), targetUserId] });
    batch.update(targetUserRef, { friends: [...(targetUserProfile?.friends || []), user.uid] });

    try {
        await batch.commit();
        setStatus('friends');
        toast({ title: "Demande d'ami acceptée !" });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erreur' });
    }
    setIsLoading(false);
  };

  const renderButton = () => {
    if (isLoading) {
      return <Button size="sm" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Chargement...</Button>;
    }
    switch (status) {
      case 'friends':
        return <Button size="sm" variant="outline" disabled><UserCheck className="mr-2 h-4 w-4" /> Amis</Button>;
      case 'request_sent':
        return <Button size="sm" variant="secondary" onClick={handleCancelRequest}>Demande envoyée</Button>;
      case 'request_received':
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAcceptRequest}>Accepter</Button>
            <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); e.preventDefault(); alert("Fonctionnalité à venir"); }}>Refuser</Button>
          </div>
        );
      case 'different_formation':
          return <Button size="sm" variant="outline" disabled title="Vous ne pouvez pas ajouter des utilisateurs d'une autre formation."><UserX className="mr-2 h-4 w-4" /> Formation différente</Button>;
      case 'not_friends':
      default:
        return <Button size="sm" onClick={handleSendRequest}><UserPlus className="mr-2 h-4 w-4" /> Ajouter comme ami</Button>;
    }
  };
  
  if (!user || user.uid === targetUserId) {
    return null;
  }

  return <div>{renderButton()}</div>;
}
