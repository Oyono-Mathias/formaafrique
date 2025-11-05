'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useCollection, useFirestore } from '@/firebase';
import type { Course } from '@/lib/types';
import { Loader2, Plus, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/lib/categories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const courseSchema = z.object({
  titre: z.string().min(5, { message: "Le titre doit avoir au moins 5 caractères." }),
  description: z.string().min(20, { message: "La description doit avoir au moins 20 caractères." }),
  categorie: z.string().min(1, { message: "Veuillez sélectionner une catégorie." }),
  prix: z.coerce.number().min(0, { message: "Le prix ne peut pas être négatif." }),
});

export default function FormateurCoursesPage() {
  const { user } = useUser();
  const { data: courses, loading, error } = useCollection<Course>('courses', {
    where: ['instructorId', '==', user?.uid || '']
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      titre: '',
      description: '',
      categorie: '',
      prix: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof courseSchema>) {
    if (!user || !db) return;

    try {
      await addDoc(collection(db, 'courses'), {
        ...values,
        instructorId: user.uid,
        auteur: user.displayName,
        date_creation: serverTimestamp(),
        publie: false, // Draft by default
        image: 'course-project-management', // Default placeholder
        niveau: 'Débutant',
        langue: 'Français',
        modules: [],
        slug: values.titre.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
      });
      toast({
        title: "Cours ajouté avec succès!",
        description: "Votre cours a été créé en tant que brouillon.",
      });
      setIsDialogOpen(false);
      form.reset();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le cours.",
      });
    }
  }

  return (
    <div className="space-y-8">
       <div className='flex justify-between items-center'>
        <div>
            <h1 className="text-3xl font-bold font-headline">Mes cours</h1>
            <p className="text-muted-foreground">
            Gérez, modifiez et publiez vos formations.
            </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Créer un cours
        </Button>
      </div>

       {loading && (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
       )}
       {!loading && error && <p className="text-destructive">Erreur de chargement des cours.</p>}
       
       {!loading && courses.length === 0 && (
           <Card className="flex flex-col items-center justify-center p-12 rounded-2xl border-dashed mt-8">
                <CardTitle>Vous n'avez pas encore de cours</CardTitle>
                <CardDescription className="mt-2">Commencez par créer votre première formation.</CardDescription>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Créer un cours
                </Button>
            </Card>
       )}

       {!loading && courses.length > 0 && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => {
                    const courseImage = PlaceHolderImages.find((img) => img.id === course.image);
                    return (
                        <Card key={course.id} className="flex flex-col rounded-2xl overflow-hidden shadow-md transition-transform hover:scale-105">
                            <CardHeader className="p-0 relative">
                                {courseImage && (
                                    <Image
                                        src={courseImage.imageUrl}
                                        alt={course.titre}
                                        width={400}
                                        height={225}
                                        className="object-cover aspect-video"
                                    />
                                )}
                                <div className='absolute top-2 right-2'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className='h-8 w-8 rounded-full bg-background/80'>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem><Edit className='mr-2 h-4 w-4'/> Modifier</DropdownMenuItem>
                                        <DropdownMenuItem className='text-destructive'><Trash2 className='mr-2 h-4 w-4'/> Supprimer</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <div className='flex justify-between items-start'>
                                    <Badge variant={course.publie ? "default" : "secondary"}>{course.publie ? 'Publié' : 'Brouillon'}</Badge>
                                </div>
                                <h3 className="text-lg font-bold mt-2 leading-tight">{course.titre}</h3>
                            </CardContent>
                             <CardFooter className="p-4 bg-muted/50 flex justify-between text-sm text-muted-foreground">
                                <div>
                                    <span>Prix: </span>
                                    <span className="font-bold text-foreground">{course.prix === 0 ? 'Gratuit' : `${course.prix} XAF`}</span>
                                </div>
                                <div className='flex items-center'>
                                    <Users className="mr-1.5 h-4 w-4" />
                                    <span className="font-bold text-foreground">0</span>
                                </div>
                            </CardFooter>
                        </Card>
                    )
                })}
           </div>
       )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
                 <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">Créer un nouveau cours</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations de base de votre cours. Vous pourrez ajouter les modules et vidéos plus tard.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="titre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Titre du cours</FormLabel>
                                    <FormControl><Input placeholder="Ex: Introduction à la comptabilité" {...field} /></FormControl>
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
                                    <FormControl><Textarea placeholder="Décrivez votre cours en quelques mots..." {...field} rows={4} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                           <FormField
                                control={form.control}
                                name="categorie"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Catégorie</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                                        <FormControl><Input type="number" placeholder="0 pour un cours gratuit" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className='animate-spin mr-2'/> : null}
                                Créer le brouillon
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
