'use client';

import Link from 'next/link';
import { ArrowRight, BookCopy } from 'lucide-react';
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
import { courses, users } from '@/lib/mock-data';
import { useUser } from '@/firebase';

export default function DashboardPage() {
  const { user } = useUser();
  // This is mock data. We'll replace this with real user data later.
  const enrolledCourses = courses.filter(course => users[0].enrolledCourses.includes(course.id));

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.filter(c => c.id === 'developpement-web').map((course) => (
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
                  <Link href={`/courses/${course.id}/modules/${course.modules[0].id}`}>
                    Continuer la formation <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
