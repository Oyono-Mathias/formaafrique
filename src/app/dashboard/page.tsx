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
import type { Course } from '@/lib/types';
import { useMemo } from 'react';
import { categories } from '@/lib/categories';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Timestamp } from 'firebase/firestore';

const CourseCard = ({ course }: { course: Course }) => {
    const courseImage = PlaceHolderImages.find((img) => img.id === course.image);
    const isFree = course.prix === 0;

    return (
        <Card className="flex flex-col h-full overflow-hidden transition-transform duration-300 hover:shadow-xl border-0">
            <CardHeader className="p-0">
                <Link href={`/courses/${course.id}`} className="block aspect-video relative bg-muted">
                {courseImage && (
                    <Image
                        src={courseImage.imageUrl}
                        alt={course.titre}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}
                </Link>
            </CardHeader>
            <CardContent className="flex-grow p-3">
                <CardTitle className="text-base font-bold leading-tight hover:text-primary">
                    <Link href={`/courses/${course.id}`}>{course.titre}</Link>
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{course.auteur}</p>
                 <div className="flex items-center gap-1 mt-1 text-xs">
                    <span className='font-bold text-amber-600'>4.5</span>
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-muted-foreground">(1,250)</span>
                </div>
                <p className="mt-2 text-sm font-bold">
                    {isFree ? 'Gratuit' : `${course.prix.toLocaleString('fr-FR')} FCFA`}
                </p>
            </CardContent>
        </Card>
    )
}

const CourseCarousel = ({ title, courses }: { title: string, courses: Course[] }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <Button asChild variant="link">
                    <Link href="/courses">Afficher tout</Link>
                </Button>
            </div>
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                {courses.map((course, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                        <CourseCard course={course} />
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="hidden lg:flex"/>
                <CarouselNext className="hidden lg:flex"/>
            </Carousel>
        </div>
    )
}


export default function DashboardPage() {
  const { user, userProfile } = useUser();
  const {data: coursesData, loading: coursesLoading} = useCollection<Course>("courses", { where: ['publie', '==', true]});
  const allCourses = coursesData || [];

  const { recommendedCourses, popularCourses, newCourses } = useMemo(() => {
    // This is a simplified logic. In a real app, this would be based on user data and real metrics.
    const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
    return {
        recommendedCourses: shuffled.slice(0, 10),
        popularCourses: shuffled.slice(10, 20),
        newCourses: [...allCourses].sort((a, b) => {
            const dateA = a.date_creation instanceof Timestamp ? a.date_creation.toMillis() : new Date(a.date_creation as string).getTime();
            const dateB = b.date_creation instanceof Timestamp ? b.date_creation.toMillis() : new Date(b.date_creation as string).getTime();
            return dateB - dateA;
        }).slice(0, 10),
    }
  }, [allCourses]);
  
  const loading = coursesLoading;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Bienvenue, {user?.displayName || 'cher étudiant'} 👋
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Prêt à apprendre quelque chose de nouveau aujourd'hui ?
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      ) : (
        <div className="space-y-12">
            {recommendedCourses.length > 0 && (
                <CourseCarousel title="Recommandé pour vous" courses={recommendedCourses} />
            )}

            <div>
                <h2 className="text-2xl font-bold mb-4">Catégories</h2>
                <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 6).map(cat => (
                        <Button key={cat} variant="outline" asChild>
                            <Link href={`/courses?category=${encodeURIComponent(cat)}`}>{cat}</Link>
                        </Button>
                    ))}
                </div>
            </div>

            {popularCourses.length > 0 && (
                <CourseCarousel title="Populaire pour les développeurs" courses={popularCourses} />
            )}

            {newCourses.length > 0 && (
                <CourseCarousel title="Nouveautés sur FormaAfrique" courses={newCourses} />
            )}
        </div>
      )}

      {/* Placeholder for in-progress courses if needed later */}
      {/* 
      <div>
        <div className='flex justify-between items-center mb-4'>
            <h2 className="text-2xl font-bold">Reprendre là où vous vous êtes arrêté</h2>
             <Button asChild variant="link">
                <Link href="/dashboard/courses">Voir toutes mes formations</Link>
            </Button>
        </div>
        ...
      </div>
      */}

    </div>
  );
}
