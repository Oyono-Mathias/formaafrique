'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useCollection, useFirestore } from '@/firebase';
import type { Course } from '@/lib/types';
import { Loader2, Plus, Users, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import CourseDialog from '@/app/admin/courses/course-dialog';
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
import { deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


export default function FormateurCoursesPage() {
  const { user } = useUser();
  const router = useRouter();
  const { data: coursesData, loading, error } = useCollection<Course>(
    'courses', 
    user?.uid ? { where: ['instructorId', '==', user.uid] } : undefined
  );
  const courses = coursesData || [];
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const db = useFirestore();
  const { toast } = useToast();

  const handleAddNew = () => {
    setSelectedCourse(null);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  }

  const handleManageModules = (courseId: string) => {
    if (!courseId) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "ID de cours introuvable.",
        });
        return;
    }
    router.push(`/formateur/courses/${courseId}/modules`);
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


  return (
    <div className="space-y-8">
       <div className='flex justify-between items-center'>
        <div>
            <h1 className="text-3xl font-bold font-headline">Mes cours</h1>
            <p className="text-muted-foreground">
            Gérez, modifiez et publiez vos formations.
            </p>
        </div>
        <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" /> Créer une formation
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
                <Button className="mt-4" onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Créer une formation
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
                                        <DropdownMenuItem onSelect={() => handleEdit(course)}><Edit className='mr-2 h-4 w-4'/> Modifier les détails</DropdownMenuItem>
                                        <DropdownMenuItem asChild><Link href={`/apercu/${course.id}`}><Eye className='mr-2 h-4 w-4'/> Voir comme étudiant</Link></DropdownMenuItem>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem onSelect={() => setCourseToDelete(course)} className='text-destructive'><Trash2 className='mr-2 h-4 w-4'/> Supprimer</DropdownMenuItem>
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
                            <CardFooter className="p-4 bg-muted/50 flex flex-col items-start gap-4">
                                <div className="w-full flex justify-between text-sm text-muted-foreground">
                                    <div>
                                        <span>Prix: </span>
                                        <span className="font-bold text-foreground">{course.prix === 0 ? 'Gratuit' : `${course.prix} XAF`}</span>
                                    </div>
                                    <div className='flex items-center'>
                                        <Users className="mr-1.5 h-4 w-4" />
                                        <span className="font-bold text-foreground">0</span>
                                    </div>
                                </div>
                                <Button className="w-full" variant="outline" onClick={() => handleManageModules(course.id!)}>
                                    Gérer les modules et vidéos
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
           </div>
       )}

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
              Êtes-vous sûr de vouloir supprimer la formation "{courseToDelete?.titre}" ? Cette action est irréversible et supprimera également tous les modules et vidéos associés.
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