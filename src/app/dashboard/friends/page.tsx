'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import type { UserProfile, FriendRequest } from '@/lib/types';
import { Loader2, Search, User, Users, UserCheck, UserPlus, Send, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { doc, getDocs, collection } from 'firebase/firestore';
import FollowButton from '@/components/social/follow-button';
import FriendRequestButton from '@/components/social/friend-request-button';
import { getOrCreateChat } from '@/actions/chat';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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

export default function FriendsPage() {
    const { user, userProfile } = useUser();
    const db = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [following, setFollowing] = useState<UserProfile[]>([]);
    const [friendRequests, setFriendRequests] = useState<{ request: FriendRequest, fromUser: UserProfile }[]>([]);
    const [sentRequests, setSentRequests] = useState<{ request: FriendRequest, toUser: UserProfile }[]>([]);
    const [loading, setLoading] = useState(true);

    const { data: allUsers, loading: usersLoading } = useCollection<UserProfile>('users');
    
    // Fetch friend requests
    const { data: requestsData, loading: requestsLoading } = useCollection<FriendRequest>('friendRequests', user?.uid ? { where: [['to', '==', user.uid], ['status', '==', 'pending']] } : undefined);
    const { data: sentData, loading: sentLoading } = useCollection<FriendRequest>('friendRequests', user?.uid ? { where: [['from', '==', user.uid], ['status', '==', 'pending']] } : undefined);
    
    const allUsersMap = useMemo(() => {
        const map = new Map<string, UserProfile>();
        (allUsers || []).forEach(u => map.set(u.id!, u));
        return map;
    }, [allUsers]);

    // Effect to enrich friends, following, and requests with user data
    useEffect(() => {
        if (usersLoading || requestsLoading || sentLoading || !allUsersMap.size) return;

        setLoading(true);
        // Friends
        const friendProfiles = (userProfile?.friends || []).map(id => allUsersMap.get(id)).filter((u): u is UserProfile => !!u);
        setFriends(friendProfiles);

        // Following
        const followingProfiles = (userProfile?.following || []).map(id => allUsersMap.get(id)).filter((u): u is UserProfile => !!u);
        setFollowing(followingProfiles);

        // Received Requests
        const receivedRequestsWithUsers = (requestsData || []).map(req => ({
            request: req,
            fromUser: allUsersMap.get(req.from)!,
        })).filter(item => !!item.fromUser);
        setFriendRequests(receivedRequestsWithUsers);

        // Sent Requests
        const sentRequestsWithUsers = (sentData || []).map(req => ({
            request: req,
            toUser: allUsersMap.get(req.to)!,
        })).filter(item => !!item.toUser);
        setSentRequests(sentRequestsWithUsers);

        setLoading(false);
    }, [usersLoading, requestsLoading, sentLoading, userProfile, allUsersMap, requestsData, sentData]);

    const searchedUsers = useMemo(() => {
        if (!searchTerm) return [];
        return (allUsers || []).filter(u => 
            u.id !== user?.uid && (
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, allUsers, user]);

    if (!user || !userProfile) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Mes Amis & Réseau</h1>
                <p className="text-muted-foreground">
                    Gérez vos contacts, vos demandes et découvrez de nouvelles personnes.
                </p>
            </div>

             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Rechercher des utilisateurs par nom ou email..."
                    className="pl-10 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {searchTerm ? (
                <div className="space-y-4">
                     <h2 className="text-xl font-bold">Résultats de la recherche</h2>
                     {usersLoading ? <Loader2 className='animate-spin' /> :
                      searchedUsers.length > 0 ? (
                        <div className='space-y-2'>
                          {searchedUsers.map(u => <UserCard key={u.id} displayedUser={u} currentUserId={user.uid} />)}
                        </div>
                      ) : <p className='text-muted-foreground'>Aucun utilisateur trouvé.</p>
                    }
                </div>
            ) : (
                <Tabs defaultValue="friends" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="friends"><UserCheck className="mr-2 h-4 w-4"/>Amis ({friends.length})</TabsTrigger>
                        <TabsTrigger value="requests"><UserPlus className="mr-2 h-4 w-4"/>Demandes ({friendRequests.length})</TabsTrigger>
                        <TabsTrigger value="sent"><History className="mr-2 h-4 w-4" />Demandes envoyées</TabsTrigger>
                        <TabsTrigger value="following"><Users className="mr-2 h-4 w-4"/>Personnes suivies</TabsTrigger>
                    </TabsList>
                    
                    <Separator className="my-6" />

                    {loading ? <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                        <>
                        <TabsContent value="friends">
                           {friends.length > 0 ? (
                                <div className="space-y-2">
                                    {friends.map(f => <UserCard key={f.id} displayedUser={f} currentUserId={user.uid} />)}
                                </div>
                            ) : <p className='text-center text-muted-foreground py-12'>Vous n'avez aucun ami pour le moment.</p>}
                        </TabsContent>
                        <TabsContent value="requests">
                             {friendRequests.length > 0 ? (
                                <div className="space-y-2">
                                    {friendRequests.map(item => <UserCard key={item.request.id} displayedUser={item.fromUser} currentUserId={user.uid} />)}
                                </div>
                            ) : <p className='text-center text-muted-foreground py-12'>Aucune demande d'ami reçue.</p>}
                        </TabsContent>
                        <TabsContent value="sent">
                             {sentRequests.length > 0 ? (
                                <div className="space-y-2">
                                    {sentRequests.map(item => <UserCard key={item.request.id} displayedUser={item.toUser} currentUserId={user.uid} />)}
                                </div>
                            ) : <p className='text-center text-muted-foreground py-12'>Aucune demande d'ami envoyée.</p>}
                        </TabsContent>
                        <TabsContent value="following">
                             {following.length > 0 ? (
                                <div className="space-y-2">
                                    {following.map(f => <UserCard key={f.id} displayedUser={f} currentUserId={user.uid} />)}
                                </div>
                            ) : <p className='text-center text-muted-foreground py-12'>Vous ne suivez personne pour le moment.</p>}
                        </TabsContent>
                        </>
                    )}
                </Tabs>
            )}
        </div>
    );
}