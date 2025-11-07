'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Clock, BarChart, Users, PlayCircle, Loader2, BookOpen } from 'lucide-react';
import { use } from 'react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDoc, useCollection } from '@/firebase';
import type { Course, Module, Video, InstructorProfile } from '@/lib/types';
import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type CoursePageProps = {
  params: {
    id: string;
  };
};

export default function CourseDetailPage({ params }: CoursePageProps) {
  const { id: courseId } = use(params);

  const { data: course, loading, error } = useDoc<Course>('courses', courseId);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(courseId ? `courses/${courseId}/modules` : null);
  const { data: instructorData, loading: instructorLoading } = useDoc<InstructorProfile>(course?.instructorId ? 'instructors' : null, course?.instructorId);


  const sortedModules = useMemo(() => {
      return (modulesData || []).sort((a, b) => a.ordre - b.ordre);
  }, [modulesData]);

  const firstModuleId = (sortedModules.length > 0) ? sortedModules[0].id : null;


  if (loading || modulesLoading || instructorLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Chargement de la formation...</p>
      </div>
    );
  }
  
  if (error || !courseId || !course) {
    notFound();
  }

  const courseImage = PlaceHolderImages.find((img) => img.id === course.image);
  
  const isFree = course.prix === 0;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="grid md:grid-cols-2/3 gap-8 items-start">
            <div className="space-y-4">
              <Badge variant="secondary">{course.categorie}</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold font-headline">{course.titre}</h1>
              <p className="text-lg text-primary-foreground/80">{course.description}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm">
                {instructorData && (
                    <Link href={`/instructors/${instructorData.id}`} className="flex items-center gap-2 group">
                        <Avatar className="h-8 w-8">
                            {instructorData.photoURL && (
                            <AvatarImage src={instructorData.photoURL} alt={instructorData.name} />
                            )}
                            <AvatarFallback>{instructorData.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className='font-semibold group-hover:underline'>{instructorData.name}</span>
                    </Link>
                )}
                <div className="flex items-center gap-2"><Clock size={16} /> <span>{sortedModules.length} modules</span></div>
                <div className="flex items-center gap-2"><BarChart size={16} /> <span>Niveau {course.niveau}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            
            {/* What you'll learn */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">Qu'allez-vous apprendre ?</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <p>Maîtriser les concepts fondamentaux liés à {course.categorie.toLowerCase()}.</p>
                    </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <p>Appliquer des techniques pratiques à travers des projets concrets.</p>
                    </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <p>Développer des compétences directement applicables sur le marché du travail africain.</p>
                    </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <p>Obtenir un certificat de réussite pour valoriser votre profil professionnel.</p>
                    </div>
                </CardContent>
            </Card>

            
            {/* Modules */}
            <div>
              <h2 className="font-headline text-2xl text-primary mb-4">Contenu du cours</h2>
                <Accordion type="single" collapsible className="w-full">
                 {sortedModules.length > 0 ? sortedModules.map((module, index) => (
                    <AccordionItem value={`item-${index}`} key={module.id}>
                        <AccordionTrigger>
                            <div className="flex justify-between w-full items-center">
                                <span className="font-bold text-left">{module.titre}</span>
                                {/* <span className="text-sm text-muted-foreground mr-4">X leçons</span> */}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <p className="text-muted-foreground px-4 py-2">{module.description}</p>
                            {/* Future place for videos list */}
                        </AccordionContent>
                    </AccordionItem>
                 )) : (
                    <p className="text-muted-foreground py-4">Le contenu de cette formation est en cours de préparation et sera bientôt disponible.</p>
                 )}
                </Accordion>
            </div>

            <Separator className="my-12" />

             {/* Instructor bio */}
           {instructorData && (
                <div className="mt-8">
                    <h2 className="font-headline text-2xl text-primary mb-4">À propos du formateur</h2>
                    <div className="flex items-start gap-6">
                        <Link href={`/instructors/${instructorData.id}`}>
                            <Avatar className="w-24 h-24 border-4 border-primary">
                            {instructorData.photoURL && (
                                <AvatarImage src={instructorData.photoURL} alt={instructorData.name} />
                            )}
                            <AvatarFallback className="text-3xl">{instructorData.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <Link href={`/instructors/${instructorData.id}`}>
                                <h3 className="text-xl font-bold hover:text-primary">{instructorData.name}</h3>
                            </Link>
                            <p className="text-accent-foreground font-semibold">{instructorData.headline}</p>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-4">
                                {instructorData.bio || `${instructorData.name} est un formateur passionné.`}
                            </p>
                        </div>
                    </div>
                </div>
           )}

          </div>
          
          {/* Sticky Card */}
          <div className="lg:col-span-1">
             <Card className="sticky top-24 shadow-xl">
                <CardHeader className="p-0">
                  {courseImage && (
                    <div className="aspect-video relative">
                      <Image
                        src={courseImage.imageUrl}
                        alt={course.titre}
                        fill
                        className="object-cover rounded-t-lg"
                        data-ai-hint={courseImage.imageHint}
                      />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
                            <PlayCircle className="h-16 w-16 text-white/80" />
                        </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="text-4xl font-bold text-center">
                      {isFree ? 'Gratuit' : `${course.prix.toLocaleString('fr-FR')} XAF`}
                    </div>
                    
                  <Button size="lg" className="w-full h-12 text-lg" asChild disabled={!firstModuleId}>
                    {firstModuleId ? (
                       <Link href={`/courses/${course.id}/modules/${firstModuleId}`}>
                        Commencer la formation
                      </Link>
                    ) : (
                      <Button size="lg" className="w-full h-12 text-lg" disabled>
                        Contenu bientôt disponible
                      </Button>
                    )}
                  </Button>
                   <div className="text-xs text-muted-foreground text-center">Accès illimité</div>

                   <Separator/>

                   <h4 className="font-bold">Cette formation inclut :</h4>
                   <ul className="space-y-2 text-sm">
                       <li className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-muted-foreground" /> {sortedModules.length} modules de cours</li>
                       <li className="flex items-center gap-3"><PlayCircle className="h-4 w-4 text-muted-foreground" /> Vidéos à la demande</li>
                       <li className="flex items-center gap-3"><Users className="h-4 w-4 text-muted-foreground" /> Accès à la communauté</li>
                       <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-muted-foreground" /> Certificat de réussite</li>
                   </ul>
                </CardContent>
              </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
