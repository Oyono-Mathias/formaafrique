
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookOpen,
  Users,
  Wallet,
  Loader2,
} from 'lucide-react';
import { useUser, useCollection } from '@/firebase';
import type { Course, Enrollment } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe, getFirestore } from 'firebase/firestore';
import { db } from '@/firebase/config';
import FormateurStats from '@/components/formateur/FormateurStats';

/**
 * @page Dashboard Formateur
 * @description Page d'accueil pour le formateur, affichant des statistiques clés.
 * @hooks
 *  - useUser: Pour obtenir les informations sur le formateur connecté.
 *  - useCollection: Pour écouter les cours créés par le formateur.
 *  - useState, useEffect: Pour agréger les données des étudiants en temps réel.
 * @firestore
 *  - Ecoute en temps réel la collection `formations` pour les cours du formateur.
 *  - Ecoute en temps réel les sous-collections `enrollments` de chaque cours pour compter les étudiants.
 * @ux
 *  - Affiche des cartes de statistiques qui se mettent à jour dynamiquement.
 *  - Fournit des liens rapides vers les sections de gestion principales.
 *  - Affiche un état de chargement pendant la récupération des données.
 */
export default function FormateurDashboardPage() {
  const { user, loading: userLoading } = useUser();
  
  const { data: coursesData, loading: coursesLoading } = useCollection<Course>(
    'formations',
    // Dans une application réelle, on filtrerait par `authorId`
    // user?.uid ? { where: ['authorId', '==', user.uid] } : undefined
  );
  
  const courses = useMemo(() => coursesData || [], [coursesData]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  /**
   * PSEUDO-CODE pour l'écoute en temps réel des inscriptions
   * useEffect(() => {
   *   if (courses.length === 0) return;
   *   
   *   const unsubscribes = courses.map(course => {
   *     const q = query(collection(db, 'enrollments'), where('courseId', '==', course.id));
   *     return onSnapshot(q, snapshot => {
   *       // Logique pour recalculer le nombre total d'étudiants
   *       // et les revenus en fonction des nouvelles inscriptions.
   *     });
   *   });
   * 
   *   return () => unsubscribes.forEach(unsub => unsub());
   * }, [courses]);
   */
   useEffect(() => {
    if (coursesLoading) return;
    if (!courses || courses.length === 0) {
      setEnrollmentsLoading(false);
      setTotalStudents(0);
      setTotalRevenue(0);
      return;
    }

    const listeners: Unsubscribe[] = [];
    let studentCount = 0;
    let revenue = 0;

    const enrollmentsByCourse: { [courseId: string]: number } = {};
    const revenueByCourse: { [courseId: string]: number } = {};

    courses.forEach(course => {
      if (!course.id) return;
      const enrollmentsQuery = query(collection(db, `formations/${course.id}/enrollments`));
      
      const unsubscribe = onSnapshot(enrollmentsQuery, (snapshot) => {
        enrollmentsByCourse[course.id!] = snapshot.size;
        revenueByCourse[course.id!] = snapshot.size * (course.price || 0);

        studentCount = Object.values(enrollmentsByCourse).reduce((a, b) => a + b, 0);
        revenue = Object.values(revenueByCourse).reduce((a, b) => a + b, 0);
        
        setTotalStudents(studentCount);
        setTotalRevenue(revenue);
      });
      listeners.push(unsubscribe);
    });
    
    setEnrollmentsLoading(false);

    return () => {
      listeners.forEach(unsub => unsub());
    };
  }, [courses, coursesLoading, db]);

  const loading = userLoading || coursesLoading || enrollmentsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Bonjour, {user?.displayName} 👋</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre tableau de bord de formateur.
        </p>
      </div>

      <FormateurStats
        coursesCount={courses.length}
        studentsCount={totalStudents}
        totalRevenue={totalRevenue}
        loading={loading}
      />
      
      <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Mes cours récents</h2>
            <Button asChild variant="link">
                <Link href="/formateur/courses">
                    Gérer tous les cours
                </Link>
            </Button>
          </div>
          {coursesLoading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
          ) : courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 3).map(course => (
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
