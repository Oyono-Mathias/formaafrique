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

export default function FormateurDashboardPage() {
  const { user } = useUser();
  const { data: coursesData, loading: coursesLoading } = useCollection<Course>('courses', {
    where: user?.uid ? ['instructorId', '==', user.uid] : undefined
  });
  
  const courses = coursesData || [];

  // This is a simplified query. For a real app, you'd query each course's subcollection.
  const { data: enrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(`courses/${courses[0]?.id}/enrollments`);

  const totalStudents = (courses || []).reduce((acc, course) => acc + (course.modules?.length || 0), 0); // Mock, needs real enrollment count per course
  const totalRevenue = (courses || []).reduce((acc, course) => acc + course.prix, 0) * totalStudents; // Highly simplified mock revenue

  const stats = [
    {
      label: 'Cours publiés',
      value: coursesLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (courses || []).filter(c => c.publie).length,
      icon: BookOpen,
      description: 'Nombre de formations visibles par les étudiants.',
    },
    {
      label: 'Étudiants inscrits',
      value: '125', // Mock data
      icon: Users,
      description: 'Nombre total d\'étudiants dans vos cours.',
    },
    {
      label: 'Revenus Totaux (Est.)',
      value: `${new Intl.NumberFormat('fr-FR').format(125000)} XAF`, // Mock data
      icon: Wallet,
      description: 'Revenus générés par vos formations.',
    },
  ];

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
          ) : (courses || []).length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 3).map(course => (
                  <Card key={course.id}>
                      <CardHeader>
                          <CardTitle className='text-lg leading-tight'>{course.titre}</CardTitle>
                          <CardDescription>{course.categorie}</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className='text-sm text-muted-foreground'>{course.publie ? 'Publié' : 'Brouillon'}</p>
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
