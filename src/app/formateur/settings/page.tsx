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
import { useUser, useFirestore, useStorage, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, User, Phone, Linkedin, Facebook, Camera } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  headline: z.string().optional(),
  bio: z.string().optional(),
});

const contactSchema = z.object({
    phone: z.string().optional(),
    linkedin: z.string().url({ message: "Veuillez entrer une URL valide." }).optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Veuillez entrer votre mot de passe actuel." }),
  newPassword: z.string().min(8, { message: "Le nouveau mot de passe doit contenir au moins 8 caractères." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});


export default function FormateurSettingsPage() {
  const { user, userProfile, loading } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', headline: '', bio: '' },
  });

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { phone: '', linkedin: '' },
  });
  
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: ''},
  });

  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        name: userProfile.name || '',
        headline: (userProfile as any).headline || '',
        bio: userProfile.bio || '',
      });
      contactForm.reset({
        phone: (userProfile as any).phone || '',
        linkedin: (userProfile as any).linkedin || '',
      });
    }
  }, [userProfile, profileForm, contactForm]);

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user || !db) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, values);
      if (user.displayName !== values.name) {
          await updateProfile(user, { displayName: values.name });
      }
      toast({ title: 'Profil mis à jour', description: 'Vos informations personnelles ont été enregistrées.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'La mise à jour du profil a échoué.' });
    }
  }

  async function onContactSubmit(values: z.infer<typeof contactSchema>) {
    if (!user || !db) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, values);
      toast({ title: 'Contact mis à jour', description: 'Vos informations de contact ont été enregistrées.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'La mise à jour a échoué.' });
    }
  }
  
  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    if(!user || !user.email) return;

    const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
    
    try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, values.newPassword);
        
        toast({ title: 'Mot de passe mis à jour', description: 'Votre mot de passe a été changé avec succès.' });
        setIsPasswordDialogOpen(false);
        passwordForm.reset();

    } catch (error: any) {
        console.error(error);
        let description = "Une erreur est survenue.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "Le mot de passe actuel est incorrect.";
        }
        toast({ variant: 'destructive', title: 'Erreur', description });
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !storage || !db) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });
      await updateProfile(user, { photoURL: downloadURL });

      toast({ title: "Photo de profil mise à jour" });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({ variant: "destructive", title: "Erreur de téléversement" });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" /><p className="ml-2">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos informations de profil et les paramètres de votre compte.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Card */}
          <Card>
            <CardHeader><CardTitle className='flex items-center gap-2'><User/>Profil Formateur</CardTitle></CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                       <Avatar className="w-24 h-24 text-3xl">
                            <AvatarImage src={userProfile?.photoURL || ''} alt={userProfile?.name} />
                            <AvatarFallback>{userProfile?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute inset-0 w-full h-full bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="animate-spin" /> : <Camera />}
                        </Button>
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                    </div>
                    <div className="flex-grow space-y-4">
                       <FormField control={profileForm.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>
                        <FormField control={profileForm.control} name="headline" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Titre professionnel</FormLabel>
                                <FormControl><Input {...field} placeholder="Ex: Développeur Web, Expert en Marketing..." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                  </div>
                  <FormField control={profileForm.control} name="bio" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Biographie</FormLabel>
                          <FormControl><Textarea {...field} placeholder="Parlez de votre parcours, vos expertises..." rows={5} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )}/>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer le profil
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

           {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound/>Sécurité</CardTitle>
              <CardDescription>Gérez les paramètres de sécurité de votre compte.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsPasswordDialogOpen(true)}>Changer le mot de passe</Button>
            </CardContent>
          </Card>

        </div>

        <div className="space-y-8">
            {/* Contact Card */}
            <Card>
                 <CardHeader><CardTitle className='flex items-center gap-2'><Phone/>Informations de contact</CardTitle></CardHeader>
                 <Form {...contactForm}>
                    <form onSubmit={contactForm.handleSubmit(onContactSubmit)}>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor="email">Adresse e-mail</Label>
                                <Input id="email" type="email" value={user?.email || ''} disabled />
                             </div>
                            <FormField control={contactForm.control} name="phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Téléphone</FormLabel>
                                    <FormControl><Input {...field} placeholder="+237 6 XX XX XX XX" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={contactForm.control} name="linkedin" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profil LinkedIn</FormLabel>
                                    <FormControl><Input {...field} placeholder="https://www.linkedin.com/in/..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={contactForm.formState.isSubmitting}>
                                {contactForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer contact
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
      </div>
      
       <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer votre mot de passe</DialogTitle>
            <DialogDescription>
              Pour des raisons de sécurité, veuillez entrer votre mot de passe actuel avant d'en choisir un nouveau.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 py-4">
               <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe actuel</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
               <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
               <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Changer le mot de passe
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
