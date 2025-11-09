'use client';

import { useUser, useCollection, useFirestore } from '@/firebase';
import type { Chat, UserProfile } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatList() {
  const { user } = useUser();
  const { chatId: activeChatId } = useParams();
  const db = useFirestore();

  const { data: chats, loading: chatsLoading } = useCollection<Chat>(
    'chats',
    user ? { where: ['members', 'array-contains', user.uid] } : undefined
  );
  
  const [otherUsers, setOtherUsers] = useState<Record<string, UserProfile>>({});
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (!chats || chats.length === 0 || !db) {
        setUsersLoading(false);
        return;
    }

    const fetchOtherUsers = async () => {
      setUsersLoading(true);
      const userIds = chats.map(c => c.members.find(m => m !== user?.uid)).filter(Boolean) as string[];
      const uniqueUserIds = [...new Set(userIds)];
      
      const usersToFetch = uniqueUserIds.filter(id => !otherUsers[id]);
      if(usersToFetch.length === 0) {
          setUsersLoading(false);
          return;
      }

      const userDocs = await Promise.all(usersToFetch.map(id => getDoc(doc(db, 'users', id))));
      const newUsers: Record<string, UserProfile> = {};
      userDocs.forEach(docSnap => {
        if (docSnap.exists()) {
          newUsers[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as UserProfile;
        }
      });
      setOtherUsers(prev => ({...prev, ...newUsers}));
      setUsersLoading(false);
    };

    fetchOtherUsers();

  }, [chats, user, db, otherUsers]);

  const sortedChats = useMemo(() => {
    return (chats || []).sort((a, b) => b.lastTimestamp.toMillis() - a.lastTimestamp.toMillis());
  }, [chats]);
  
  const loading = chatsLoading || usersLoading;

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold font-headline">Messages</h2>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une conversation..." className="pl-8" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className='p-4 space-y-4'>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            ))}
          </div>
        ) : sortedChats.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">
            <p>Aucune conversation.</p>
            <p className="text-sm">Commencez une discussion depuis le profil d'un utilisateur.</p>
          </div>
        ) : (
          sortedChats.map(chat => {
            const otherUserId = chat.members.find(m => m !== user?.uid);
            const otherUser = otherUserId ? otherUsers[otherUserId] : null;
            const unreadCount = chat.unreadCounts[user?.uid || ''] || 0;

            return (
              <Link key={chat.id} href={`/messages/${chat.id}`}>
                <div className={cn('p-4 flex items-center gap-4 hover:bg-muted/50 cursor-pointer border-b', activeChatId === chat.id && 'bg-primary/10')}>
                    <Avatar className="relative">
                        <AvatarImage src={otherUser?.photoURL || undefined} />
                        <AvatarFallback>{otherUser?.name.charAt(0)}</AvatarFallback>
                        {otherUser?.online && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />}
                    </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold truncate">{otherUser?.name || 'Utilisateur inconnu'}</h3>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(chat.lastTimestamp.toDate(), { addSuffix: true, locale: fr })}
                        </p>
                    </div>
                    <div className="flex justify-between items-center">
                         <p className={cn('text-sm text-muted-foreground truncate', unreadCount > 0 && 'font-bold text-foreground')}>
                            {chat.lastMessage}
                        </p>
                        {unreadCount > 0 && (
                            <div className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center flex-shrink-0">
                                {unreadCount}
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
