'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Clock, BarChart, Users, PlayCircle, Loader2 } from 'lucide-react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDoc, useCollection } from '@/firebase';
import type { Course, Module } from '@/lib/types';
import { useMemo } from 'react';

type CoursePageProps = {
  params: {
    id: string;
  };
};

export default function CourseDetailPage({ params }: CoursePageProps) {
  const { data: course, loading, error } = useDoc<Course>('courses', params.id);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(`courses/${params.id}/modules`);

  const modules = modulesData || [];
  
  const sortedModules = useMemo(() => {
      return [...modules].sort((a, b) => a.ordre - b.ordre);
  }, [modules]);

  const firstModuleId = (sortedModules.length > 0) ? sortedModules[0].id : null;


  if (loading || modulesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Chargement de la formation...</p>
      </div>
    );
  }
  
  if (error || !course) {
    notFound();
  }

  const courseImage = PlaceHolderImages.find((img) => img.id === course.image);
  
  const instructorImageId = `instructor-${course.auteur.split(' ')[0].toLowerCase()}`;
  const instructorImage = PlaceHolderImages.find((img) => img.id === instructorImageId);
  const isFree = course.prix === 0;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-4">
              <Badge variant="secondary">{course.categorie}</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold font-headline">{course.titre}</h1>
              <p className="text-lg text-primary-foreground/80">{course.description}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    {instructorImage && (
                      <AvatarImage src={instructorImage.imageUrl} alt={course.auteur} data-ai-hint={instructorImage.imageHint} />
                    )}
                    <AvatarFallback>{course.auteur.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{course.auteur}</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-1">
              <Card>
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
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="text-3xl font-bold text-center">
                      {isFree ? 'Gratuit' : `${course.prix} XAF`}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Clock size={16} /> Durée</span>
                      <span className="font-semibold">{modules.length} modules</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><BarChart size={16} /> Niveau</span>
                      <span className="font-semibold">{course.niveau}</span>
                    </div>
                    
                  <Button size="lg" className="w-full" asChild disabled={!firstModuleId}>
                    {isFree ? (
                      <Link href={firstModuleId ? `/courses/${course.id}/modules/${firstModuleId}` : '#'}>
                        Commencer la formation
                      </Link>
                    ) : (
                      <Link href="/donate">
                        Faire un don pour débloquer
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            
            {/* Description */}
            <div className="prose prose-lg max-w-none mb-8">
              <h2 className="font-headline text-2xl text-primary">Description du cours</h2>
              <p>{course.description}</p>
            </div>

            <Separator className="my-8" />
            
            {/* Modules */}
            <div>
              <h2 className="font-headline text-2xl text-primary mb-4">Contenu du cours</h2>
              <div className="space-y-4">
                {sortedModules.map((module) => (
                  <Link href={`/courses/${course.id}/modules/${module.id}`} key={module.id} className="block">
                    <Card className="hover:bg-muted/50 transition-colors shadow-sm hover:shadow-md">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-3 bg-primary/10 rounded-full mr-4">
                            <PlayCircle className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{module.titre}</p>
                            {/* This needs to be updated to fetch video count from subcollection */}
                            <p className="text-sm text-muted-foreground">Vidéos à venir</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Voir le module</Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                 {modules.length === 0 && (
                    <p className="text-muted-foreground">Le contenu du cours sera bientôt disponible.</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Instructor bio */}
          <div className="lg:col-span-1">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Votre formateur</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
                  {instructorImage && (
                    <AvatarImage src={instructorImage.imageUrl} alt={course.auteur} data-ai-hint={instructorImage.imageHint}/>
                  )}
                  <AvatarFallback>{course.auteur.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{course.auteur}</h3>
                {/* <p className="text-accent-foreground font-medium">{instructor?.title}</p> */}
                <p className="mt-4 text-sm text-muted-foreground">
                  {course.auteur} est un formateur passionné avec une vaste expérience dans son domaine.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
    