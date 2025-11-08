'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FollowButtonProps {
  targetUserId: string;
}

export default function FollowButton({ targetUserId }: FollowButtonProps) {
  const { user, userProfile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userProfile && targetUserId) {
      setIsFollowing(userProfile.following?.includes(targetUserId) || false);
    }
    setIsLoading(false);
  }, [userProfile, targetUserId]);

  const handleToggleFollow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user || !db || !userProfile) {
      toast({ variant: 'destructive', title: 'Vous devez être connecté.' });
      return;
    }
    if (user.uid === targetUserId) return;

    setIsLoading(true);

    const currentUserRef = doc(db, 'users', user.uid);
    const targetUserRef = doc(db, 'users', targetUserId);

    try {
      if (isFollowing) {
        // Unfollow
        await updateDoc(currentUserRef, { following: arrayRemove(targetUserId) });
        await updateDoc(targetUserRef, { followers: arrayRemove(user.uid) });
        toast({ title: 'Vous ne suivez plus cette personne.' });
        setIsFollowing(false);
      } else {
        // Follow
        await updateDoc(currentUserRef, { following: arrayUnion(targetUserId) });
        await updateDoc(targetUserRef, { followers: arrayUnion(user.uid) });
        toast({ title: 'Vous suivez maintenant cette personne !' });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({ variant: 'destructive', title: 'Une erreur est survenue.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user || user.uid === targetUserId) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'default'}
      onClick={handleToggleFollow}
      disabled={isLoading}
      size="sm"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="mr-2 h-4 w-4" />
          Suivi
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Suivre
        </>
      )}
    </Button>
  );
}
