
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

export default function FormateurDashboardPage() {
  const { user, loading: userLoading } = useUser();
  
  const { data: coursesData, loading: coursesLoading } = useCollection<Course>(
    'formations',
    // user?.uid ? { where: ['instructorId', '==', user.uid] } : undefined
  );
  
  const courses = useMemo(() => coursesData || [], [coursesData]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  useEffect(() => {
    if (coursesLoading || !db) {
        return;
    }
    
    if (!courses.length) {
        setEnrollmentsLoading(false);
        setTotalStudents(0);
        setTotalRevenue(0);
        return;
    }

    setEnrollmentsLoading(true);
    const unsubscribes: Unsubscribe[] = [];
    const studentIds = new Set<string>();
    let revenue = 0;

    let listenersInitialized = 0;

    courses.forEach(course => {
        if (course.id) {
            const enrollmentsQuery = collection(db, `formations/${course.id}/enrollments`);
            const unsubscribe = onSnapshot(enrollmentsQuery, (snapshot) => {
                
                snapshot.docs.forEach(doc => {
                    const enrollment = doc.data() as Enrollment;
                    if (!studentIds.has(enrollment.studentId)) {
                        studentIds.add(enrollment.studentId);
                    }
                });

                setTotalStudents(studentIds.size);
                
                if (listenersInitialized < courses.length) {
                  listenersInitialized++;
                  if (listenersInitialized === courses.length) {
                    setEnrollmentsLoading(false);
                  }
                }

            }, (error) => {
                console.error(`Error fetching enrollments for course ${course.id}: `, error);
                 if (listenersInitialized < courses.length) {
                  listenersInitialized++;
                  if (listenersInitialized === courses.length) {
                    setEnrollmentsLoading(false);
                  }
                }
            });
            unsubscribes.push(unsubscribe);
        } else {
             if (listenersInitialized < courses.length) {
                listenersInitialized++;
                if (listenersInitialized === courses.length) {
                setEnrollmentsLoading(false);
                }
            }
        }
    });

    return () => {
        unsubscribes.forEach(unsub => unsub());
    };
  }, [courses, db, coursesLoading]);


  const loading = userLoading || coursesLoading || enrollmentsLoading;
  
  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
  }

  const stats = [
    {
      label: 'Cours publiés',
      value: coursesLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : courses.length,
      icon: BookOpen,
      description: 'Nombre de formations visibles par les étudiants.',
    },
    {
      label: 'Étudiants inscrits',
      value: loading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalStudents,
      icon: Users,
      description: 'Nombre total d\'étudiants dans vos cours.',
    },
    {
      label: 'Revenus Totaux (Est.)',
      value: loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(totalRevenue),
      icon: Wallet,
      description: 'Revenus générés par vos formations.',
    },
  ];

  if (userLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className='ml-2'>Chargement du tableau de bord...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Bonjour, {user?.displayName} 👋</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre tableau de bord de formateur.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl shadow-md transition-transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Mes cours</h2>
            <Button asChild variant="link">
                <Link href="/formateur/courses">
                    Gérer tous mes cours
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
