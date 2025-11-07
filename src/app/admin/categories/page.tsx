'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import type { Category } from '@/lib/types';
import { Loader2, PlusCircle, Search, Trash2, Edit, MoreVertical } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { doc, addDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';

const categorySchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit avoir au moins 3 caractères.' }),
  description: z.string().min(10, { message: 'La description doit avoir au moins 10 caractères.' }),
});

export default function AdminCategoriesPage() {
  const { data: categories, loading, error } = useCollection<Category>('categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const db = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  });

  const filteredCategories = useMemo(() => {
    return (categories || []).filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    form.reset({ name: category.name, description: category.description });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    form.reset({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete || !db) return;
    try {
      await deleteDoc(doc(db, 'categories', categoryToDelete.id!));
      toast({
        title: 'Catégorie supprimée',
        description: `La catégorie "${categoryToDelete.name}" a été supprimée.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'La suppression de la catégorie a échoué.',
      });
    } finally {
      setCategoryToDelete(null);
    }
  };

  async function onSubmit(values: z.infer<typeof categorySchema>) {
    if (!db) return;
    try {
      if (selectedCategory) {
        // Update
        const categoryRef = doc(db, 'categories', selectedCategory.id!);
        await updateDoc(categoryRef, values);
        toast({ title: 'Catégorie mise à jour' });
      } else {
        // Create
        await addDoc(collection(db, 'categories'), values);
        toast({ title: 'Catégorie créée' });
      }
      setIsDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue.' });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Gestion des Catégories</h1>
        <p className="text-muted-foreground">
          Ajoutez, modifiez ou supprimez les catégories de formation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle>Liste des Catégories</CardTitle>
              <CardDescription>
                Organisez vos formations en différentes catégories.
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une catégorie
            </Button>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une catégorie..."
                className="pl-8 w-full md:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-12">
              ❌ Erreur de chargement des catégories.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length > 0 ? filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                        </Button>
                         <Button variant="destructive" size="sm" className="ml-2" onClick={() => setCategoryToDelete(category)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Aucune catégorie trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la catégorie</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Compétences numériques" />
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
                      <Textarea {...field} placeholder="Courte description de ce que couvre la catégorie." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Annuler</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie "{categoryToDelete?.name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}