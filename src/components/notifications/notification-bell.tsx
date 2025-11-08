'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import type { Notification, UserProfile } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '../ui/separator';

export default function NotificationBell() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: notifications, loading } = useCollection<Notification>(
    user ? `notifications` : null,
    user ? { where: [['toUid', '==', user.uid]] } : undefined
  );
  
  const [fromUsers, setFromUsers] = useState<Record<string, UserProfile>>({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const sortedNotifications = [...notifications].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

  useEffect(() => {
    if (!notifications.length || !db) return;

    const fetchFromUsers = async () => {
      const userIdsToFetch = notifications
        .map((n) => n.fromUid)
        .filter((uid, index, self) => self.indexOf(uid) === index && !fromUsers[uid]);
      
      if (userIdsToFetch.length === 0) return;

      const userDocs = await Promise.all(
        userIdsToFetch.map((uid) => getDoc(doc(db, 'users', uid)))
      );

      const newUsers = userDocs.reduce((acc, userDoc) => {
        if (userDoc.exists()) {
          acc[userDoc.id] = userDoc.data() as UserProfile;
        }
        return acc;
      }, {} as Record<string, UserProfile>);

      setFromUsers((prev) => ({ ...prev, ...newUsers }));
    };

    fetchFromUsers();
  }, [notifications, db, fromUsers]);

  const handleOpenChange = async (open: boolean) => {
    setIsPopoverOpen(open);
    if (!open || unreadNotifications.length === 0 || !db) return;

    // Mark all as read
    const batch = writeBatch(db);
    unreadNotifications.forEach((notif) => {
      const notifRef = doc(db, 'notifications', notif.id!);
      batch.update(notifRef, { read: true });
    });
    await batch.commit();
  };

  const getNotificationMessage = (notification: Notification) => {
      const fromName = fromUsers[notification.fromUid]?.name || 'Quelqu\'un';
      switch (notification.type) {
          case 'friend_request':
              return <p><span className='font-bold'>{fromName}</span> vous a envoyé une demande d'ami.</p>
          default:
              return <p>Nouvelle notification.</p>
      }
  }
  
  const getNotificationIcon = (notification: Notification) => {
      const fromUser = fromUsers[notification.fromUid];
      const avatar = fromUser?.photoURL;

      if(avatar) {
          return <AvatarImage src={avatar} alt={fromUser.name}/>
      }
      
      switch (notification.type) {
          case 'friend_request':
              return <UserPlus className="h-5 w-5"/>
          default:
              return <Bell className="h-5 w-5"/>
      }
  }


  return (
    <Popover open={isPopoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && !loading && (
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className='p-4'>
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
         <Separator/>
        <div className='max-h-96 overflow-y-auto'>
            {sortedNotifications.length > 0 ? (
                sortedNotifications.map(notif => (
                    <div key={notif.id} className={cn("flex items-start gap-3 p-4", !notif.read && "bg-primary/5")}>
                         <Avatar className='h-8 w-8 mt-1'>
                             {getNotificationIcon(notif)}
                             <AvatarFallback>{fromUsers[notif.fromUid]?.name?.charAt(0) || '?'}</AvatarFallback>
                         </Avatar>
                        <div>
                            <div className='text-sm'>{getNotificationMessage(notif)}</div>
                            <p className='text-xs text-muted-foreground'>
                                {formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true, locale: fr })}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <p className='text-center text-sm text-muted-foreground p-8'>Aucune notification pour le moment.</p>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
