
'use client';

import Link from 'next/link';
import { ArrowRight, BookCopy, Loader2, Star, Users, Bot } from 'lucide-react';
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
import type { Course, Enrollment } from '@/lib/types';
import { useMemo, useRef } from 'react';
import { categories } from '@/lib/categories';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Timestamp } from 'firebase/firestore';
import Autoplay from "embla-carousel-autoplay"
import XPTracker from '@/components/dashboard/Gamification/XPTracker';
import Badges from '@/components/dashboard/Gamification/Badges';
import WeeklyGoals from '@/components/dashboard/Gamification/WeeklyGoals';

const CourseCard = ({ course }: { course: Course }) => {
    const courseImage = PlaceHolderImages.find((img) => img.id === 'course-project-management');
    const isFree = true;

    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 bg-card">
            <CardHeader className="p-0">
                <Link href={`/courses/${course.id}`} className="block aspect-video relative bg-muted">
                {courseImage && (
                    <Image
                        src={courseImage.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}
                </Link>
            </CardHeader>
            <CardContent className="flex-grow p-3">
                <CardTitle className="text-base font-bold leading-tight hover:text-primary">
                    <Link href={`/courses/${course.id}`}>{course.title}</Link>
                </CardTitle>
                <div className="flex items-center gap-1 mt-1 text-xs">
                    <span className='font-bold text-amber-400'>4.5</span>
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-muted-foreground">(1,250)</span>
                </div>
                <p className="mt-2 text-sm font-bold">
                    {isFree ? 'Gratuit' : `Prix à venir`}
                </p>
            </CardContent>
        </Card>
    )
}

const CourseCarousel = ({ title, courses }: { title: string, courses: Course[] }) => {
    const plugin = useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    )

    if (courses.length === 0) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                <Button asChild variant="link">
                    <Link href="/courses">Afficher tout</Link>
                </Button>
            </div>
            <Carousel 
                plugins={[plugin.current]}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{ align: "start", loop: true }} 
                className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                {courses.map((course, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                        <CourseCard course={course} />
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="hidden lg:flex bg-card/50"/>
                <CarouselNext className="hidden lg:flex bg-card/50"/>
            </Carousel>
        </div>
    )
}


export default function DashboardPage() {
  const { user, userProfile } = useUser();
  const {data: coursesData, loading: coursesLoading} = useCollection<Course>("formations", { where: ['publie', '==', true]});
  const {data: enrollmentsData, loading: enrollmentsLoading} = useCollection<Enrollment>(user ? `users/${user.uid}/enrollments` : undefined);
  
  const allCourses = coursesData || [];
  const enrollments = enrollmentsData || [];

  const { recommendedCourses, popularCourses, newCourses, inProgressCourses } = useMemo(() => {
    const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
    const inProgress = enrollments
      .filter(e => (e.progression || 0) > 0 && (e.progression || 0) < 100)
      .sort((a,b) => (b.progression || 0) - (a.progression || 0));

    const sortedNew = [...allCourses].sort((a, b) => {
            const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
            const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
            return dateB - dateA;
        }).slice(0, 10);

    return {
        recommendedCourses: shuffled.slice(0, 10),
        popularCourses: shuffled.slice(10, 20),
        newCourses: sortedNew,
        inProgressCourses: inProgress,
    }
  }, [allCourses, enrollments]);
  
  const loading = coursesLoading || enrollmentsLoading;
  
  const firstModuleId = (enrollment: Enrollment) => (enrollment.modules && Object.keys(enrollment.modules).length > 0) ? Object.keys(enrollment.modules)[0] : null;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Accueil
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Bienvenue, {user?.displayName || 'cher étudiant'} ! Prêt à apprendre ?
        </p>
      </div>

       <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {userProfile?.formationId && (
                    <Link href="/community">
                        <Card className="p-4 bg-primary/10 hover:bg-primary/20 transition rounded-2xl cursor-pointer flex items-center gap-4 h-full">
                            <div className='p-3 bg-primary/20 rounded-lg'>
                                <Users className='h-6 w-6 text-primary'/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary">Communauté {userProfile.formationId}</h3>
                                <p className="text-sm text-primary/80">Rejoignez le groupe de discussion de votre formation.</p>
                            </div>
                        </Card>
                    </Link>
                )}
                <Link href="/chatbot">
                    <Card className="p-4 bg-accent/50 hover:bg-accent/80 transition rounded-2xl cursor-pointer flex items-center gap-4 h-full">
                        <div className='p-3 bg-accent/60 rounded-lg'>
                            <Bot className='h-6 w-6 text-accent-foreground'/>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-accent-foreground">Tuteur IA</h3>
                            <p className="text-sm text-foreground/80">Posez vos questions sur les cours à notre assistant intelligent.</p>
                        </div>
                    </Card>
                </Link>
            </div>
             {inProgressCourses.length > 0 && (
                <div>
                     <h2 className="text-2xl font-bold text-foreground mb-4">Reprendre où vous en étiez</h2>
                     <div className="grid gap-6 md:grid-cols-2">
                        {inProgressCourses.slice(0, 2).map(enrollment => {
                            const fModuleId = firstModuleId(enrollment);
                            return (
                                <Card key={enrollment.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg hover:text-primary">
                                            <Link href={`/courses/${enrollment.courseId}`}>{enrollment.courseTitle}</Link>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Progress value={enrollment.progression || 0} />
                                        <p className="text-sm text-muted-foreground mt-2">{Math.round(enrollment.progression || 0)}% terminé</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild disabled={!fModuleId}>
                                            <Link href={`/courses/${enrollment.courseId}/modules/${fModuleId}`}>
                                                Continuer la formation <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                     </div>
                </div>
            )}
        </div>
        <div className="lg:col-span-1 space-y-6">
            <XPTracker xp={userProfile?.xp || 0} />
            <Badges badges={userProfile?.badges || []} />
            <WeeklyGoals />
        </div>
      </div>


      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-12">
            
            <CourseCarousel title="Recommandé pour vous" courses={recommendedCourses} />

            <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Catégories populaires</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.slice(0, 8).map(cat => (
                        <Button key={cat} variant="secondary" asChild className="h-16 text-base justify-start text-left">
                            <Link href={`/courses?category=${encodeURIComponent(cat)}`}>{cat}</Link>
                        </Button>
                    ))}
                </div>
            </div>

            <CourseCarousel title="Populaire en Développement Web" courses={popularCourses} />

            <CourseCarousel title="Nouveautés sur FormaAfrique" courses={newCourses} />
        </div>
      )}
    </div>
  );
}
