
'use client';

import Link from 'next/link';
import { ArrowRight, BookCopy, Loader2, Star } from 'lucide-react';
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {enrollmentsList.map((enrollment) => {
            const courseImage = PlaceHolderImages.find(img => img.id === 'course-project-management'); // Fallback image
            const progression = enrollment.progression || 0;
            return (
              <Card key={enrollment.id} className="flex flex-col overflow-hidden h-full shadow-sm hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                    <Link href={`/courses/${enrollment.courseId}`} className="block aspect-video relative bg-muted">
                        <Image
                            src={courseImage?.imageUrl || `https://picsum.photos/seed/${enrollment.courseId}/400/225`}
                            alt={enrollment.courseTitle}
                            fill
                            className="object-cover"
                        />
                    </Link>
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                    <CardTitle className="text-base font-bold leading-tight flex-grow hover:text-primary">
                        <Link href={`/courses/${enrollment.courseId}`}>{enrollment.courseTitle}</Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{enrollment.studentName}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col items-start gap-3">
                    <div className='w-full'>
                        <Progress value={progression} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1.5">{progression}% terminé</p>
                    </div>
                    <Button asChild variant="default" className="w-full" size="sm">
                    { progression < 100 ? (
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
              </Card>
            )
        })}
      </div>
    );
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Mes Formations</h1>
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
          <TabsTrigger value="all">Tout ({enrollments?.length || 0})</TabsTrigger>
          <TabsTrigger value="in-progress">En cours ({inProgressCourses.length})</TabsTrigger>
          <TabsTrigger value="completed">Terminées ({completedCourses.length})</TabsTrigger>
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
