'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import EditProfileDialog from '@/components/dashboard/edit-profile-dialog';

export default function ProfilePage() {
  const { user } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? 'users' : null, user?.uid || '');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (profileLoading || !user) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement du profil...</div>;
  }

  const userEmail = user?.email || userProfile?.email || 'Non disponible';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground mt-2">Gérez les informations de votre compte.</p>
      </div>

      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Vos détails personnels et de contact.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              {user.photoURL && <AvatarImage src={user.photoURL} />}
              <AvatarFallback className="text-3xl">{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <h2 className='text-2xl font-bold'>{userProfile?.name}</h2>
              <p className='text-muted-foreground'>{userEmail}</p>
            </div>
          </div>
          
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label>Nom complet</Label>
              <p className="text-foreground">{userProfile?.name}</p>
            </div>
             <div className="space-y-1">
              <Label>Adresse e-mail</Label>
              <p className="text-muted-foreground">{userEmail}</p>
            </div>
            <div className="space-y-1">
              <Label>Pays d'origine</Label>
              <p className="text-foreground">{userProfile?.paysOrigine}</p>
            </div>
            <div className="space-y-1">
              <Label>Pays de résidence actuel</Label>
              <p className="text-foreground">{userProfile?.paysActuel}</p>
            </div>
          </div>
          
          <div className='flex justify-start'>
            <Button onClick={() => setIsDialogOpen(true)}>Modifier mes informations</Button>
          </div>

        </CardContent>
      </Card>
      
      {userProfile && (
        <EditProfileDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            userProfile={userProfile}
            userId={user.uid}
        />
      )}

      <Separator />

       <Card className="border-destructive shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-destructive">Zone de danger</CardTitle>
          <CardDescription>Ces actions sont irréversibles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Supprimer mon compte</Button>
        </CardContent>
      </Card>
    </div>
  );
}
