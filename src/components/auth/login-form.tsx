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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { isFirebaseConfigured } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Adresse email invalide.' }),
  password: z.string().min(1, { message: 'Le mot de passe ne peut pas être vide.' }),
});

export default function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSuccessfulLogin = async (user: User) => {
    if (!db) return;
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    let profileToUse: UserProfile | null = null;

    if (!userDoc.exists()) {
      // Create profile if it's a first-time login (e.g., with Google)
      const newUserProfileData: Omit<UserProfile, 'createdAt' | 'photoURL'> & { createdAt: any, photoURL: string | null } = {
        name: user.displayName || 'Nouvel Utilisateur',
        email: user.email!,
        createdAt: serverTimestamp(),
        role: 'etudiant',
        status: 'actif',
        paysOrigine: '',
        paysActuel: '',
        bio: '',
        skills: [],
        friends: [],
        followers: [],
        following: [],
        online: true,
        lastSeen: serverTimestamp(),
        photoURL: user.photoURL || null,
      };
      await setDoc(userDocRef, newUserProfileData);
      profileToUse = newUserProfileData as UserProfile;
    } else {
        await setDoc(userDocRef, { online: true, lastSeen: serverTimestamp() }, { merge: true });
        profileToUse = userDoc.data() as UserProfile;
    }

    toast({
      title: 'Connexion réussie',
      description: 'Redirection vers votre tableau de bord...',
    });

    if (profileToUse?.role === 'admin') {
      router.replace('/admin');
    } else if (profileToUse?.role === 'formateur') {
      router.replace('/formateur');
    } else {
      router.replace('/dashboard');
    }
  };

  async function onEmailSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !db) return;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await handleSuccessfulLogin(userCredential.user);
    } catch (error: any) {
      handleLoginError(error);
    }
  }

  async function onGoogleSubmit() {
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await handleSuccessfulLogin(result.user);
    } catch (error: any) {
        handleLoginError(error);
    }
  }

  function handleLoginError(error: any) {
      console.error('Error signing in:', error);
      let description = "Une erreur est survenue. Veuillez réessayer.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = "L'email ou le mot de passe est incorrect.";
      } else if (error.code === 'auth/popup-closed-by-user') {
          description = "La fenêtre de connexion a été fermée avant la fin de l'opération.";
      }
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: description,
      });
  }
  
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="space-y-4">
      {!isFirebaseConfigured && (
        <Alert variant="destructive" className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Action requise</AlertTitle>
          <AlertDescription>
            La configuration de Firebase est manquante. Veuillez ajouter vos clés au fichier .env.local pour activer la connexion.
          </AlertDescription>
        </Alert>
      )}
      
       <Button variant="outline" className="w-full" onClick={onGoogleSubmit} disabled={!isFirebaseConfigured || isSubmitting}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 264.1 0 127.9 111.8 16 244 16c73.1 0 134.3 29.3 179.3 74.5L364.5 149c-34.8-33.2-83-53.4-143.4-53.4-109.4 0-198.6 90.9-198.6 203.3 0 111.5 88.3 202.4 198.6 202.4 121.3 0 186.2-85.7 192.3-130.5H244V261.8h244z"></path></svg>
            Continuer avec Google
        </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
            OU CONTINUER AVEC
            </span>
        </div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="votre@email.com" {...field} disabled={!isFirebaseConfigured || isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-baseline">
                  <FormLabel>Mot de passe</FormLabel>
                  <Link href="#" className="text-sm text-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} disabled={!isFirebaseConfigured || isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting || !isFirebaseConfigured}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
