'use client';

import Link from 'next/link';
import { ArrowRight, BookCopy, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUser, useCollection } from '@/firebase';
import type { Course } from '@/lib/types';
import { useMemo } from 'react';


export default function DashboardPage() {
  const { user, userProfile } = useUser();
  const {data: coursesData, loading: coursesLoading} = useCollection<Course>("courses");
  const courses = coursesData || [];

  const enrolledCourses = useMemo(() => {
    // This is a simplified logic. In a real app, enrollments would be their own collection.
    // Here, we simulate enrollment based on a mock field, which we assume doesn't exist,
    // so we'll just show the first course as an "enrolled" example.
    if (courses.length > 0) return [courses[0]];
    return [];
  }, [courses]);
  
  const loading = coursesLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Bienvenue, {user?.displayName || 'cher étudiant'} 👋
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Prêt à apprendre quelque chose de nouveau aujourd'hui ?
        </p>
      </div>

      <div>
        <div className='flex justify-between items-center mb-4'>
            <h2 className="text-2xl font-bold">
            Reprendre là où vous vous êtes arrêté
            </h2>
             <Button asChild variant="link">
                <Link href="/dashboard/courses">Voir toutes mes formations</Link>
            </Button>
        </div>
        {loading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : enrolledCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden shadow-md transition-transform hover:scale-105 duration-300 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg">{course.titre}</CardTitle>
                    <CardDescription>{course.categorie}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                    <Progress value={66} className="h-2 flex-grow" />
                    <span className="text-sm font-medium">66%</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="default" className="w-full">
                    <Link href={`/courses/${course.id}`}>
                        Continuer la formation <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        ) : (
            <Card className="text-center p-8">
                <CardTitle>Aucune formation en cours</CardTitle>
                <CardDescription className="mt-2 mb-4">Il est temps de commencer votre parcours d'apprentissage !</CardDescription>
                <Button asChild>
                    <Link href="/courses">Explorer les formations</Link>
                </Button>
            </Card>
        )}
      </div>
    </div>
  );
}
    