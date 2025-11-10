
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useUser, useCollection } from '@/firebase';
import type { Course } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import FormateurStats from '@/components/formateur/FormateurStats';
import { Timestamp } from 'firebase/firestore';

/**
 * @page Dashboard Formateur
 * @description Page d'accueil pour le formateur, affichant des statistiques clés et un aperçu de ses cours.
 */
export default function FormateurDashboardPage() {
  const { user, loading: userLoading } = useUser();
  
  const collectionOptions = useMemo(() => {
    if (!user?.uid) return undefined;
    return { where: [['authorId', '==', user.uid]] as [['authorId', '==', string]]};
  }, [user?.uid]);
  
  const { data: coursesData, loading: coursesLoading } = useCollection<Course>(
    user?.uid ? 'formations' : null,
    collectionOptions
  );
  
  const courses = useMemo(() => coursesData || [], [coursesData]);

  // Trier les cours par date de création pour afficher les plus récents
  const recentCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
    }).slice(0, 3);
  }, [courses]);

  const loading = userLoading || coursesLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Bonjour, {user?.displayName} 👋</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre tableau de bord de formateur.
        </p>
      </div>

      <FormateurStats courses={courses} loading={loading} />
      
      <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Mes cours récents</h2>
            <Button asChild variant="link">
                <Link href="/formateur/courses">
                    Gérer tous les cours
                </Link>
            </Button>
          </div>
          {loading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
          ) : recentCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentCourses.map(course => (
                  <Card key={course.id}>
                      <CardHeader>
                          <CardTitle className='text-lg leading-tight'>{course.title}</CardTitle>
                          <CardDescription>{course.categoryId}</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className='text-sm text-muted-foreground'>Publié</p>
                      </CardContent>
                  </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 rounded-2xl border-dashed">
                <CardTitle>Aucun cours pour le moment</CardTitle>
                <CardDescription className="mt-2">Commencez par créer votre première formation.</CardDescription>
                <Button className="mt-4" asChild>
                    <Link href="/formateur/courses">Créer un cours</Link>
                </Button>
            </Card>
          )}
      </div>

    </div>
  );
}
