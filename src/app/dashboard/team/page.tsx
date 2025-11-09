'use client';

import { useState, useMemo } from 'react';
import { useUser, useCollection } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Loader2, Search, Send, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import FollowButton from '@/components/social/follow-button';
import FriendRequestButton from '@/components/social/friend-request-button';
import { getOrCreateChat } from '@/actions/chat';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function UserCard({ displayedUser, currentUserId }: { displayedUser: UserProfile; currentUserId: string }) {
    if (!displayedUser) return null;
    const startChatAction = getOrCreateChat.bind(null, currentUserId, displayedUser.id!);

    return (
        <Card className="rounded-2xl p-4 shadow-md bg-card/70 backdrop-blur-sm transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
            <CardContent className="p-2 flex flex-col items-center text-center">
                 <div className="relative">
                    <Avatar className="w-20 h-20 rounded-full mx-auto border-4 border-background">
                        <AvatarImage src={displayedUser.photoURL || undefined} alt={displayedUser.name} />
                        <AvatarFallback>{displayedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <div className={cn("absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background", displayedUser.online ? "bg-green-500" : "bg-gray-400")} />
                </div>
                
                <h2 className="text-center mt-3 font-semibold text-lg">{displayedUser.name}</h2>
                
                <div className='mt-2 space-y-1'>
                    <p className="text-center text-gray-500 text-sm flex items-center gap-2">
                        <Badge variant="secondary"> {displayedUser.formationId}</Badge>
                    </p>
                    {displayedUser.moduleLevel &&
                        <p className="text-center text-gray-500 text-sm">
                            Niveau : {displayedUser.moduleLevel}
                        </p>
                    }
                </div>

                <div className='flex items-center gap-1 text-sm text-muted-foreground mt-2'>
                    <Users className='h-4 w-4'/>
                    <span>{displayedUser.friends?.length || 0} amis</span>
                </div>

            </CardContent>
            <CardFooter className="p-2 flex flex-col gap-2">
                <div className="flex w-full gap-2">
                    <FriendRequestButton targetUserId={displayedUser.id!} />
                    <FollowButton targetUserId={displayedUser.id!} />
                </div>
                 <form action={startChatAction} className='w-full'>
                    <Button variant="outline" size="sm" type="submit" className='w-full'>
                        <Send className="mr-2 h-4 w-4" /> Message privé
                    </Button>
                </form>
            </CardFooter>
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
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                      {searchedUsers.map(u => <UserCard key={u.id} displayedUser={u} currentUserId={user.uid} />)}
                    </div>
                  ) : <p className='text-center text-muted-foreground py-12'>Aucun utilisateur trouvé dans votre formation.</p>
                }
            </div>

        </div>
    );
}