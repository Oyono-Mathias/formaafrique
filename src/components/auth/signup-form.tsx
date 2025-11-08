'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';
import { isFirebaseConfigured } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  email: z.string().email({ message: 'Adresse email invalide.' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' }),
  confirmPassword: z.string(),
  paysOrigine: z.string().min(1, { message: 'Veuillez sélectionner un pays.'}),
  paysActuel: z.string().min(1, { message: 'Veuillez sélectionner un pays.'}),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas.',
  path: ['confirmPassword'],
});

export default function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      paysOrigine: '',
      paysActuel: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !db || !isFirebaseConfigured) {
       toast({
        variant: 'destructive',
        title: 'Configuration Firebase incomplète',
        description: "Veuillez configurer vos clés Firebase dans le fichier .env.local pour vous inscrire.",
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Update user profile in auth
      await updateProfile(user, {
        displayName: values.name,
      });

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const newUserProfile: Omit<UserProfile, 'createdAt' | 'photoURL'> & { createdAt: any, photoURL: string | null } = {
        name: values.name,
        email: values.email,
        createdAt: serverTimestamp(),
        role: 'etudiant', // Default role for new users
        status: 'actif',
        paysOrigine: values.paysOrigine,
        paysActuel: values.paysActuel,
        bio: `Bonjour, je suis ${values.name}. Je suis passionné(e) par l'apprentissage et le développement de nouvelles compétences.`,
        skills: [],
        photoURL: null,
        friends: [],
        followers: [],
        following: [],
        online: true,
        lastSeen: serverTimestamp(),
      };
      await setDoc(userDocRef, newUserProfile);

      toast({
        title: 'Inscription réussie !',
        description: 'Vous êtes maintenant connecté. Redirection...',
      });
      router.push('/dashboard');
    } catch (error: any)
    {
      console.error('Error signing up:', error);
      
      let description = 'Une erreur est survenue.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Cette adresse email est déjà utilisée. Veuillez vous connecter.';
      } else if (error.code === 'auth/configuration-not-found') {
        description = "L'authentification par email/mot de passe n'est pas activée dans votre projet Firebase. Veuillez l'activer dans la console Firebase.";
      } else if (error.code === 'auth/api-key-not-valid') {
        description = "La clé d'API Firebase n'est pas valide. Veuillez vérifier votre configuration dans .env.local.";
      }


      toast({
        variant: 'destructive',
        title: "Erreur d'inscription",
        description: description,
      });
    }
  }

  return (
    <Form {...form}>
      {!isFirebaseConfigured && (
        <Alert variant="destructive" className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Action requise</AlertTitle>
          <AlertDescription>
            La configuration de Firebase est manquante. Veuillez ajouter vos clés au fichier .env.local pour activer l'inscription.
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Jean Dupont" {...field} disabled={!isFirebaseConfigured || form.formState.isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="votre@email.com" {...field} disabled={!isFirebaseConfigured || form.formState.isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="paysOrigine"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Pays d'origine</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isFirebaseConfigured || form.formState.isSubmitting}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <ScrollArea className='h-72'>
                            {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                        </ScrollArea>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="paysActuel"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Pays actuel</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isFirebaseConfigured || form.formState.isSubmitting}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       <ScrollArea className='h-72'>
                         {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                       </ScrollArea>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} disabled={!isFirebaseConfigured || form.formState.isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} disabled={!isFirebaseConfigured || form.formState.isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !isFirebaseConfigured}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? 'Création du compte...' : 'Créer un compte'}
        </Button>
      </form>
    </Form>
  );
}
