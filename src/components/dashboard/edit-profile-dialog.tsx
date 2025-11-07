'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestore } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { countries } from '@/lib/countries';
import { Textarea } from '../ui/textarea';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  paysOrigine: z.string().min(1, { message: 'Veuillez sélectionner un pays.' }),
  paysActuel: z.string().min(1, { message: 'Veuillez sélectionner un pays.' }),
  bio: z.string().max(300, { message: 'La biographie ne doit pas dépasser 300 caractères.' }).optional(),
  skills: z.string().optional(), // We'll handle string to array conversion
});

type EditProfileDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userProfile: UserProfile;
  userId: string;
};

export default function EditProfileDialog({
  isOpen,
  setIsOpen,
  userProfile,
  userId,
}: EditProfileDialogProps) {
  const db = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      paysOrigine: '',
      paysActuel: '',
      bio: '',
      skills: '',
    },
  });

  useEffect(() => {
    if (userProfile && isOpen) {
      form.reset({
        name: userProfile.name,
        paysOrigine: userProfile.paysOrigine,
        paysActuel: userProfile.paysActuel,
        bio: userProfile.bio || '',
        skills: (userProfile.skills || []).join(', '),
      });
    }
  }, [userProfile, form, isOpen]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!userId || !db) return;

    const skillsArray = values.skills ? values.skills.split(',').map(s => s.trim()).filter(s => s) : [];

    const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, {
        name: values.name,
        paysOrigine: values.paysOrigine,
        paysActuel: values.paysActuel,
        bio: values.bio,
        skills: skillsArray,
      });
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating profile: ', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour de votre profil.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Modifier mes informations</DialogTitle>
          <DialogDescription>
            Apportez des modifications à votre profil ici. Cliquez sur Enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
             <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biographie</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Parlez un peu de vous..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compétences</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Développement Web, Marketing, Design" />
                  </FormControl>
                   <p className="text-xs text-muted-foreground">Séparez les compétences par des virgules.</p>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <ScrollArea className="h-72">
                            {countries.map((c) => (
                            <SelectItem key={c.code} value={c.name}>
                                {c.name}
                            </SelectItem>
                            ))}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <ScrollArea className="h-72">
                            {countries.map((c) => (
                            <SelectItem key={c.code} value={c.name}>
                                {c.name}
                            </SelectItem>
                            ))}
                        </ScrollArea>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <DialogFooter className="pt-4 sticky bottom-0 bg-background py-4 -mx-6 px-6 border-t">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
