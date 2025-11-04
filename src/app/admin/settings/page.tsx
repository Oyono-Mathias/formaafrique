
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Palette, Bell } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { doc, updateDoc } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
});

export default function AdminSettingsPage() {
  const { user, userProfile, loading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name,
      });
    }
  }, [userProfile, form]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user || !db) return;

    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, {
        name: values.name,
      });
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'La mise à jour du profil a échoué.',
      });
    }
  }
  
  if (loading || !userProfile) {
      return (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Chargement des paramètres...</p>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre compte et vos préférences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Information Card */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles. L'adresse e-mail ne peut pas être modifiée.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input id="email" type="email" value={userProfile?.email || ''} disabled />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer les modifications
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Security Card */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Sécurité
                </div>
              </CardTitle>
              <CardDescription>
                Changez votre mot de passe.
              </CardDescription>
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
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Changer le mot de passe</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
            {/* Preferences Card */}
            <Card className="rounded-2xl shadow-md">
                 <CardHeader>
                    <CardTitle>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Préférences
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Personnalisez l'apparence de votre tableau de bord.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                        <span>Mode Sombre</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Activez pour une interface plus sombre.
                        </span>
                        </Label>
                        <Switch id="dark-mode" />
                    </div>
                </CardContent>
            </Card>
            {/* Notifications Card */}
            <Card className="rounded-2xl shadow-md">
                 <CardHeader>
                    <CardTitle>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Gérez la manière dont vous recevez les notifications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                        <span>Notifications par e-mail</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Recevez les mises à jour importantes par e-mail.
                        </span>
                        </Label>
                        <Switch id="email-notifications" />
                    </div>
                     <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="app-notifications" className="flex flex-col space-y-1">
                        <span>Notifications in-app</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Affichez les notifications dans le tableau de bord.
                        </span>
                        </Label>
                        <Switch id="app-notifications" defaultChecked/>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
