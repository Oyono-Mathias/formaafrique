'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { AiFlag, ModerationLog, UserProfile, Notification } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ShieldAlert, BarChart3, Check, Trash2, UserX, MoreVertical, Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { doc, getDoc, updateDoc, writeBatch, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


export default function AdminModerationPage() {
    const { data: flags, loading: flagsLoading } = useCollection<AiFlag>('aiFlags', { where: ['status', '==', 'pending_review'] });
    const { data: users, loading: usersLoading } = useCollection<UserProfile>('users');

    const db = useFirestore();
    const { toast } = useToast();

    const [actionState, setActionState] = useState<{ id: string, type: 'resolving' | 'deleting' | 'suspending' } | null>(null);
    const [flagToAction, setFlagToAction] = useState<AiFlag | null>(null);

    const usersMap = useMemo(() => {
        const map = new Map<string, UserProfile>();
        (users || []).forEach(u => map.set(u.id!, u));
        return map;
    }, [users]);
    
    const loading = flagsLoading || usersLoading;

    const handleAction = async (flag: AiFlag, action: 'dismissed' | 'resolved' | 'suspend') => {
        if (!db) return;

        setActionState({ id: flag.id!, type: action === 'dismissed' ? 'resolving' : action === 'resolved' ? 'deleting' : 'suspending' });
        
        try {
            const batch = writeBatch(db);
            const flagRef = doc(db, 'aiFlags', flag.id!);

            if (action === 'suspend') {
                const userRef = doc(db, 'users', flag.fromUid);
                batch.update(userRef, {
                    status: 'suspendu',
                    infractions: (usersMap.get(flag.fromUid)?.infractions || 0) + 1,
                });
                batch.update(flagRef, { status: 'resolved' });
            } else {
                 batch.update(flagRef, { status: action });
            }

            await batch.commit();

            toast({ title: 'Action enregistrée', description: `Le signalement a été marqué comme "${action}".` });

        } catch(e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'effectuer l'action." });
        } finally {
            setActionState(null);
            setFlagToAction(null);
        }
    };
    
    const getSeverityBadge = (severity?: 'low' | 'medium' | 'high') => {
        switch (severity) {
            case 'high': return <Badge variant="destructive">Haute</Badge>;
            case 'medium': return <Badge variant="secondary" className='bg-amber-500 text-white'>Moyenne</Badge>;
            default: return <Badge variant="outline">Basse</Badge>;
        }
    }


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Console de Modération</h1>
                <p className="text-muted-foreground">
                Gérez les contenus signalés et prenez des mesures de modération.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages à réviser</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin h-6 w-6"/> : flags?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">En attente d'action manuelle.</p>
                    </CardContent>
                </Card>
                {/* Other stats can be added here */}
            </div>

            <Card>
                <CardHeader>
                <CardTitle>File d'attente de modération</CardTitle>
                <CardDescription>
                    Messages signalés par l'IA en attente de votre décision.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Auteur</TableHead>
                                    <TableHead>Motif</TableHead>
                                    <TableHead className="text-center">Sévérité</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {flags && flags.length > 0 ? flags.map(flag => (
                                    <TableRow key={flag.id}>
                                        <TableCell>{usersMap.get(flag.fromUid)?.name || flag.fromUid}</TableCell>
                                        <TableCell><Badge variant="outline">{flag.reason}</Badge></TableCell>
                                        <TableCell className="text-center">{getSeverityBadge(flag.severity)}</TableCell>
                                        <TableCell>{formatDistanceToNow(flag.timestamp.toDate(), { addSuffix: true, locale: fr })}</TableCell>
                                        <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" disabled={!!actionState}><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleAction(flag, 'dismissed')} disabled={actionState?.id === flag.id}>
                                                    {actionState?.id === flag.id && actionState.type === 'resolving' ? <Loader2 className='animate-spin mr-2 h-4 w-4'/> : <Check className="mr-2 h-4 w-4"/>}
                                                    Approuver (ignorer)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction(flag, 'resolved')} disabled={actionState?.id === flag.id}>
                                                     {actionState?.id === flag.id && actionState.type === 'deleting' ? <Loader2 className='animate-spin mr-2 h-4 w-4'/> : <Trash2 className="mr-2 h-4 w-4"/>}
                                                    Confirmer & supprimer
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleAction(flag, 'suspend')} disabled={actionState?.id === flag.id}>
                                                    {actionState?.id === flag.id && actionState.type === 'suspending' ? <Loader2 className='animate-spin mr-2 h-4 w-4'/> : <UserX className="mr-2 h-4 w-4"/>}
                                                    Suspendre l'auteur
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">Aucun signalement en attente.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
