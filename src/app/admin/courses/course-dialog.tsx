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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useFirestore, useUser } from '@/firebase';
import type { Course } from '@/lib/types';
import { useEffect } from 'react';
import { doc, updateDoc, addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/lib/categories';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const courseSchema = z.object({
  titre: z.string().min(5, { message: 'Le titre doit avoir au moins 5 caractères.' }),
  description: z.string().min(20, { message: 'La description doit avoir au moins 20 caractères.' }),
  categorie: z.string().min(1, { message: 'Veuillez sélectionner une catégorie.' }),
  niveau: z.enum(['Débutant', 'Intermédiaire', 'Avancé']),
  prix: z.coerce.number().min(0, { message: "Le prix ne peut être négatif." }),
  image: z.string().min(1, { message: 'Veuillez sélectionner une image.' }),
  publie: z.boolean().default(false),
});

type CourseDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  course: Course | null;
};

export default function CourseDialog({
  isOpen,
  setIsOpen,
  course,
}: CourseDialogProps) {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const isEditing = !!course;

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      titre: '',
      description: '',
      categorie: '',
      niveau: 'Débutant',
      prix: 0,
      image: '',
      publie: false,
    },
  });

  useEffect(() => {
    if (isOpen && course) {
      form.reset({
        titre: course.titre,
        description: course.description,
        categorie: course.categorie,
        niveau: course.niveau,
        prix: course.prix,
        image: course.image,
        publie: course.publie,
      });
    } else if (isOpen) {
      form.reset({
        titre: '',
        description: '',
        categorie: '',
        niveau: 'Débutant',
        prix: 0,
        image: '',
        publie: false,
      });
    }
  }, [isOpen, course, form]);

  async function onSubmit(values: z.infer<typeof courseSchema>) {
    if (!db || !user) return;

    try {
      if (isEditing && course?.id) {
        // Update existing course
        const courseDocRef = doc(db, 'courses', course.id);
        await updateDoc(courseDocRef, values);
        toast({
          title: 'Formation mise à jour',
          description: `"${values.titre}" a été modifié avec succès.`,
        });
      } else {
        // Create new course
        await addDoc(collection(db, 'courses'), {
          ...values,
          auteur: user.displayName || 'Admin',
          instructorId: user.uid,
          date_creation: serverTimestamp(),
          langue: 'Français',
          modules: [],
        });
        toast({
          title: 'Formation créée',
          description: `"${values.titre}" a été ajouté en tant que brouillon.`,
        });
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving course: ', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'enregistrement.",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isEditing ? 'Modifier la formation' : 'Créer une nouvelle formation'}
          </DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous. Vous pourrez ajouter les modules et vidéos plus tard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la formation</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Introduction au marketing digital" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Décrivez le contenu et les objectifs de la formation." rows={4}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="categorie"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Catégorie</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="niveau"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Niveau requis</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Débutant">Débutant</SelectItem>
                                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                                    <SelectItem value="Avancé">Avancé</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="prix"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prix (XAF)</FormLabel>
                            <FormControl><Input type="number" {...field} placeholder="0 pour gratuit" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image de couverture</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez une image..." /></SelectTrigger></FormControl>
                        <SelectContent>
                            {PlaceHolderImages.filter(img => img.id.startsWith('course-')).map((img) => (
                                <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publie"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Publier la formation</FormLabel>
                    <FormDescription>
                      Rendre cette formation visible et accessible à tous les utilisateurs.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 sticky bottom-0 bg-background py-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Enregistrer les modifications' : 'Créer la formation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
