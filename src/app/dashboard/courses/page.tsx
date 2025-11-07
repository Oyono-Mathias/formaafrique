
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
import type { Course, CourseProgress, Enrollment } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemo } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function MyCoursesPage() {
  const { user } = useUser();
  const { data: enrollments, loading, error } = useCollection<Enrollment>(
      user ? `users/${user.uid}/enrollments` : null
  );

  const { inProgressCourses, completedCourses } = useMemo(() => {
    const enrolls = enrollments || [];
    return {
      inProgressCourses: enrolls.filter(e => (e.progression || 0) < 100),
      completedCourses: enrolls.filter(e => (e.progression || 0) === 100),
    };
  }, [enrollments]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className='ml-2'>Chargement de vos formations...</p>
        </div>
    )
  }

  if (error) {
      return <div className="text-destructive text-center py-12">❌ Impossible de charger vos formations.</div>
  }

  const CourseList = ({ enrollmentsList }: { enrollmentsList: Enrollment[] }) => {
    if (enrollmentsList.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
          <p className="font-semibold">Aucune formation dans cette section.</p>
           <Button asChild variant="link">
              <Link href="/courses">Commencer une nouvelle formation</Link>
           </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {enrollmentsList.map((enrollment) => (
          <Card key={enrollment.id} className="flex flex-row overflow-hidden">
             <div className="w-1/3 relative">
                {/* Find image based on course title as we don't store it on enrollment */}
                <Image
                    src={`https://picsum.photos/seed/${enrollment.courseId}/300/200`}
                    alt={enrollment.courseTitle}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="w-2/3 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg leading-tight">{enrollment.courseTitle}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                 <p className='text-sm text-muted-foreground mb-2'>{enrollment.studentName}</p>
                <div className="flex items-center gap-2">
                  <Progress value={enrollment.progression || 0} className="w-full h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{(enrollment.progression || 0)}% terminé</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="default" className="w-full" size="sm">
                  { (enrollment.progression || 0) < 100 ? (
                     <Link href={`/courses/${enrollment.courseId}`}>
                        Continuer <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                  ) : (
                     <Link href={`/dashboard/certificate/${enrollment.courseId}`}>
                        Voir le certificat
                    </Link>
                  )}
                </Button>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
    );
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Mon Apprentissage</h1>
          <p className="text-muted-foreground">
            Suivez votre progression et reprenez là où vous vous êtes arrêté.
          </p>
        </div>
        <Button asChild>
          <Link href="/courses">Explorer les formations</Link>
        </Button>
      </div>

      <Tabs defaultValue="in-progress">
        <TabsList>
          <TabsTrigger value="all">Tout</TabsTrigger>
          <TabsTrigger value="in-progress">En cours</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
            <CourseList enrollmentsList={enrollments || []} />
        </TabsContent>
        <TabsContent value="in-progress" className="mt-6">
          <CourseList enrollmentsList={inProgressCourses} />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
           <CourseList enrollmentsList={completedCourses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
