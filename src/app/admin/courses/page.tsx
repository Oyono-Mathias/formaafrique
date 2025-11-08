'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import type { Course, UserProfile } from '@/lib/types';
import { Loader2, PlusCircle, Search, Trash2, Edit, MoreVertical, BookCopy, Tag, DollarSign, Eye, Wrench } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
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
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import CourseDialog from './course-dialog';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminCoursesPage() {
  const { data: coursesData, loading: coursesLoading, error: coursesError } = useCollection<Course>('courses');
  const { data: usersData, loading: usersLoading, error: usersError } = useCollection<UserProfile>('users');
  
  const courses = coursesData || [];
  const users = usersData || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const { formateurCourses, adminCourses, totalCourses, uniqueCategories, totalRevenue } = useMemo(() => {
    const formateurIds = new Set(users.filter(u => u.role === 'formateur').map(u => u.id));
    
    const allCourses = courses.filter(course =>
      course.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.categorie.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      formateurCourses: allCourses.filter(c => c.instructorId && formateurIds.has(c.instructorId)),
      adminCourses: allCourses.filter(c => !c.instructorId || !formateurIds.has(c.instructorId)),
      totalCourses: courses.length,
      uniqueCategories: new Set(courses.map(c => c.categorie)).size,
      totalRevenue: courses.reduce((sum, course) => sum + (course.prix > 0 ? 5 * course.prix : 0), 0) // Mock: 5 inscriptions par cours payant
    };
  }, [courses, users, searchTerm]);

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCourse(null);
    setIsDialogOpen(true);
  };
  
  const handleManageModules = (courseId: string | undefined) => {
    if (!courseId) return;
    router.push(`/admin/courses/${courseId}/modules`);
  }

  const handleDelete = async () => {
    if (!courseToDelete || !db) return;
    try {
      await deleteDoc(doc(db, 'courses', courseToDelete.id!));
      toast({
        title: 'Cours supprimé',
        description: `La formation "${courseToDelete.titre}" a été supprimée.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'La suppression de la formation a échoué.',
      });
    } finally {
      setCourseToDelete(null);
    }
  };
  
  const loading = coursesLoading || usersLoading;
  const error = coursesError || usersError;

  const renderCoursesTable = (coursesToList: Course[]) => (
     <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[350px]'>Titre</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead className="hidden sm:table-cell">Catégorie</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="hidden md:table-cell text-center">Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coursesToList.length > 0 ? coursesToList.map((course) => {
              const courseImage = PlaceHolderImages.find((img) => img.id === course.image);
              return (
                <TableRow key={course.id}>
                  <TableCell>
                      <div className="flex items-center gap-3">
                        {courseImage && (
                          <Image
                              src={courseImage.imageUrl}
                              alt={course.titre}
                              width={80}
                              height={45}
                              className="rounded-md object-cover aspect-video"
                          />
                        )}
                        <span className='font-medium'>{course.titre}</span>
                      </div>
                  </TableCell>
                  <TableCell>{course.auteur}</TableCell>
                  <TableCell className="hidden sm:table-cell">{course.categorie}</TableCell>
                  <TableCell className="text-right font-mono">{course.prix === 0 ? 'Gratuit' : `${course.prix} XAF`}</TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                      <Badge variant={course.publie ? 'default' : 'secondary'}>
                          {course.publie ? 'Publié' : 'Brouillon'}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(course)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleManageModules(course.id)}>
                          <Wrench className="mr-2 h-4 w-4" />
                          Gérer les modules
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/courses/${course.id}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="mr-2 h-4 w-4" />
                              Voir la page
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onSelect={() => setCourseToDelete(course)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucune formation ne correspond à votre recherche.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Gestion des Formations</h1>
        <p className="text-muted-foreground">
          Gérez, ajoutez et suivez les statistiques de toutes les formations.
        </p>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des Formations</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className='h-6 w-6 animate-spin'/> : totalCourses}</div>
              <p className="text-xs text-muted-foreground">Nombre total de cours sur la plateforme.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catégories Actives</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className='h-6 w-6 animate-spin'/> : uniqueCategories}</div>
              <p className="text-xs text-muted-foreground">Nombre de catégories de formations uniques.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Estimés</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className='h-6 w-6 animate-spin'/> : `${totalRevenue.toLocaleString('fr-FR')} XAF`}</div>
              <p className="text-xs text-muted-foreground">Estimation basée sur les cours payants.</p>
            </CardContent>
          </Card>
        </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle>Liste des Formations</CardTitle>
              <CardDescription>
                Recherchez, modifiez ou supprimez des formations.
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une formation
            </Button>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par titre, auteur, catégorie..."
                className="pl-8 w-full"
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
              ❌ Erreur de chargement des formations.
            </div>
          ) : (
            <Tabs defaultValue="formateurs" className="w-full">
              <TabsList>
                <TabsTrigger value="formateurs">Soumissions des Formateurs</TabsTrigger>
                <TabsTrigger value="admin">Formations de l'Admin</TabsTrigger>
              </TabsList>
              <TabsContent value="formateurs" className="mt-4">
                {renderCoursesTable(formateurCourses)}
              </TabsContent>
              <TabsContent value="admin" className="mt-4">
                {renderCoursesTable(adminCourses)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      <CourseDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        course={selectedCourse}
      />

       <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la formation "{courseToDelete?.titre}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive hover:bg-destructive/90'
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
