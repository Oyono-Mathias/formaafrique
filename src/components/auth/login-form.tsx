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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { isFirebaseConfigured } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !db || !isFirebaseConfigured) {
      toast({
        variant: 'destructive',
        title: 'Configuration Firebase incomplète',
        description: 'Veuillez configurer vos clés Firebase pour vous connecter.',
      });
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      toast({
        title: 'Connexion réussie',
        description: 'Redirection vers votre tableau de bord...',
      });

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        if (userData.role === 'admin') {
          router.replace('/admin');
        } else if (userData.role === 'formateur') {
          router.replace('/formateur');
        } else {
          router.replace('/dashboard');
        }
      } else {
        // Fallback for users who might not have a profile doc yet
        router.replace('/dashboard');
      }

    } catch (error: any) {
      console.error('Error signing in:', error);
      let description = "Une erreur est survenue. Veuillez réessayer.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = "L'email ou le mot de passe est incorrect.";
      } else if (error.code === 'auth/configuration-not-found') {
          description = "L'authentification par email/mot de passe n'est pas activée dans votre projet Firebase.";
      }
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
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
            La configuration de Firebase est manquante. Veuillez ajouter vos clés au fichier .env.local pour activer la connexion.
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Input type="password" placeholder="********" {...field} disabled={!isFirebaseConfigured || form.formState.isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !isFirebaseConfigured}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>
    </Form>
  );
}
