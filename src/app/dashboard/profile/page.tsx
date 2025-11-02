'use client';

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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';

export default function ProfilePage() {
  const { user } = useUser();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez les informations de votre compte.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations ici.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" defaultValue={user.displayName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input id="email" type="email" defaultValue={user.email || ''} readOnly />
              </div>
              <Button>Enregistrer les modifications</Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Photo de profil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                {user.photoURL ? (
                  <AvatarImage src={user.photoURL} />
                ) : userAvatar ? (
                  <AvatarImage src={userAvatar.imageUrl} />
                ) : null}
                <AvatarFallback className="text-4xl">{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="outline">Changer la photo</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Separator />

      <div className="grid gap-8 md:grid-cols-2">
         <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>Il est recommandé d'utiliser un mot de passe fort.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input id="new-password" type="password" />
              </div>
              <Button>Mettre à jour le mot de passe</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Zone de danger</CardTitle>
              <CardDescription>Ces actions sont irréversibles.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Supprimer mon compte</Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
