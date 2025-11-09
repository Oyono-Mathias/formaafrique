'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useCollection } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import FollowButton from '@/components/social/follow-button';
import FriendRequestButton from '@/components/social/friend-request-button';
import { getOrCreateChat } from '@/actions/chat';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

function UserCard({ displayedUser, currentUserId }: { displayedUser: UserProfile; currentUserId: string }) {
    if (!displayedUser) return null;
    const startChatAction = getOrCreateChat.bind(null, currentUserId, displayedUser.id!);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                    <Avatar className="relative">
                        <AvatarImage src={displayedUser.photoURL || undefined} alt={displayedUser.name} />
                        <AvatarFallback>{displayedUser.name.charAt(0)}</AvatarFallback>
                        <div className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background", displayedUser.online ? "bg-green-500" : "bg-gray-400")} />
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-bold">{displayedUser.name}</p>
                        <p className="text-xs text-muted-foreground">{displayedUser.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    <FriendRequestButton targetUserId={displayedUser.id!} />
                    <FollowButton targetUserId={displayedUser.id!} />
                    <form action={startChatAction}>
                        <Button variant="outline" size="sm" type="submit">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}

export default function TeamPage() {
    const { user, userProfile } = useUser();
    const [searchTerm, setSearchTerm] = useState('');

    const sameFormationUsersOptions = useMemo(() => {
        if (!userProfile?.formationId) return undefined;
        return { where: ['formationId', '==', userProfile.formationId] as [string, '==', string]};
    }, [userProfile?.formationId]);

    const { data: allUsers, loading: usersLoading } = useCollection<UserProfile>(
        userProfile?.formationId ? 'users' : null,
        sameFormationUsersOptions
    );
    
    const searchedUsers = useMemo(() => {
        const usersToList = (allUsers || []).filter(u => u.id !== user?.uid);

        if (!searchTerm) return usersToList;

        return usersToList.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allUsers, user]);

    if (!user || !userProfile) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Mes Camarades de Formation</h1>
                <p className="text-muted-foreground">
                    Retrouvez ici tous les membres de votre groupe de formation.
                </p>
            </div>

             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Rechercher un camarade par nom ou email..."
                    className="pl-10 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="space-y-4">
                 {usersLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ): searchedUsers.length > 0 ? (
                    <div className='space-y-2'>
                      {searchedUsers.map(u => <UserCard key={u.id} displayedUser={u} currentUserId={user.uid} />)}
                    </div>
                  ) : <p className='text-center text-muted-foreground py-12'>Aucun utilisateur trouvé dans votre formation.</p>
                }
            </div>

        </div>
    );
}
