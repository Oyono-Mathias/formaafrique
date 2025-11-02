'use client';

import Link from 'next/link';
import { ArrowRight, BookCopy, CheckCircle, Clock } from 'lucide-react';
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
import { courses } from '@/lib/mock-data';
import { useUser } from '@/firebase';

export default function DashboardPage() {
  const { user } = useUser();
  // This is mock data. We'll replace this with real user data later.
  const enrolledCourses = courses.filter(course => ['developpement-web-moderne', 'entrepreneuriat-en-afrique'].includes(course.id));

  const stats = [
    { label: 'Cours Inscrits', value: enrolledCourses.length, icon: BookCopy },
    { label: 'Cours Terminés', value: 1, icon: CheckCircle },
    { label: 'Heures Apprises', value: '15h', icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Bienvenue, {user?.displayName || 'cher étudiant'} !
        </h1>
        <p className="text-muted-foreground">
          Continuons à apprendre et à grandir ensemble.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">
          Mes Formations en cours
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {enrolledCourses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Progress value={course.id === 'developpement-web-moderne' ? 66 : 25} className="flex-grow" />
                  <span className="text-sm font-medium">{course.id === 'developpement-web-moderne' ? 66 : 25}%</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="default" size="sm">
                  <Link href={`/courses/${course.id}/modules/${course.modules[0].id}`}>
                    Continuer <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-6">
            <Button asChild variant="outline">
                <Link href="/dashboard/courses">Voir toutes mes formations</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
