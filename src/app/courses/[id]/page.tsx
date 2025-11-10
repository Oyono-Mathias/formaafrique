
'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Clock, BarChart, Users, PlayCircle, Loader2, BookOpen, Heart } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDoc, useCollection, useUser, useFirestore } from '@/firebase';
import type { Course, Module, Video, InstructorProfile, Enrollment, WishlistItem } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function ModuleVideos({ courseId, moduleId }: { courseId: string; moduleId: string }) {
  const { data: videosData, loading, error } = useCollection<Video>(
    `formations/${courseId}/modules/${moduleId}/videos`
  );

  const sortedVideos = useMemo(() => {
    return (videosData || []).sort((a, b) => a.order - b.order);
  }, [videosData]);

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Chargement des leçons...</div>;
  }
  if (error) {
    return <div className="p-4 text-sm text-destructive">Erreur de chargement des leçons.</div>;
  }
  if (sortedVideos.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">Aucune leçon dans ce module.</div>;
  }

  return (
    <ul className="list-none p-0 m-0">
      {sortedVideos.map((video) => (
        <li key={video.id} className="flex items-center justify-between p-3 border-t">
          <div className="flex items-center gap-3">
            <PlayCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-foreground">{video.title}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

type CoursePageProps = {
  params: {
    id: string;
  };
};

export default function CourseDetailPage({ params }: CoursePageProps) {
  const courseId = params.id;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const { data: course, loading: courseLoading, error: courseError } = useDoc<Course>('formations', courseId);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(courseId ? `formations/${courseId}/modules` : undefined);
  
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [instructorLoading, setInstructorLoading] = useState(true);

  React.useEffect(() => {
    if (course?.authorId) {
      const getInstructor = async () => {
        if (!db) return;
        setInstructorLoading(true);
        const userDoc = await getDoc(doc(db, 'users', course.authorId));
        if (userDoc.exists() && userDoc.data().role === 'formateur') {
          setInstructor({ id: userDoc.id, ...userDoc.data() } as InstructorProfile);
        }
        setInstructorLoading(false);
      };
      getInstructor();
    } else if (course) {
        setInstructorLoading(false);
    }
  }, [course, db]);

  const { data: enrollmentData } = useDoc<Enrollment>(user && courseId ? `users/${user.uid}/enrollments` : null, courseId);
  const wishlistQuery = useMemo(() => {
    if (!user || !courseId) return undefined;
    return { where: [['userId', '==', user.uid], ['courseId', '==', courseId]] as any[] };
  }, [user, courseId]);

  const { data: wishlistItem } = useCollection<WishlistItem>(user && courseId ? 'wishlist' : undefined, wishlistQuery);
  
  const isWishlisted = useMemo(() => wishlistItem && wishlistItem.length > 0, [wishlistItem]);
  const isEnrolled = useMemo(() => !!enrollmentData, [enrollmentData]);

  const sortedModules = useMemo(() => {
      return (modulesData || []).sort((a, b) => a.order - b.order);
  }, [modulesData]);

  const firstModuleId = (sortedModules.length > 0) ? sortedModules[0].id : null;

  const handleEnroll = async () => {
    if (!user || !db || !course?.id) return;

    const enrollmentRef = doc(db, 'users', user.uid, 'enrollments', course.id);
    const newEnrollment: Partial<Enrollment> = {
        studentId: user.uid,
        courseId: course.id,
        courseTitle: course.title,
        enrollmentDate: serverTimestamp() as any,
        progression: 0,
        modules: {},
    };

    try {
        await setDoc(enrollmentRef, newEnrollment);
        toast({ title: "Inscription réussie !", description: `Vous êtes maintenant inscrit à "${course.title}".` });
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Erreur', description: "L'inscription a échoué."});
    }
  }

  const handleToggleWishlist = async () => {
    if (!user || !db || !course?.id) return;
    
    if (isWishlisted && wishlistItem?.[0]?.id) {
        await deleteDoc(doc(db, 'wishlist', wishlistItem[0].id));
        toast({ title: "Retiré de vos favoris." });
    } else {
        await addDoc(collection(db, 'wishlist'), {
            userId: user.uid,
            courseId: course.id,
            createdAt: serverTimestamp(),
        });
        toast({ title: "Ajouté à vos favoris !" });
    }
  }

  const loading = courseLoading || modulesLoading || instructorLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Chargement de la formation...</p>
      </div>
    );
  }
  
  if (courseError || !course) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-destructive">Désolé, cette formation est introuvable.</p>
        </div>
    );
  }

  const courseImage = PlaceHolderImages.find((img) => img.id === 'course-project-management');
  const isFree = true;

  const CtaButton = () => {
      if (isEnrolled) {
          return (
              <Button size="lg" className="w-full h-12 text-lg" asChild>
                   <Link href={`/courses/${course.id}/modules/${firstModuleId}`}>
                        Continuer la formation
                  </Link>
              </Button>
          )
      }
      return (
          <Button size="lg" className="w-full h-12 text-lg" onClick={handleEnroll} disabled={!firstModuleId}>
            {firstModuleId ? "S'inscrire maintenant" : "Contenu bientôt disponible"}
          </Button>
      )
  }

  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="grid md:grid-cols-2/3 gap-8 items-start">
            <div className="space-y-4">
              <Badge variant="secondary">{course.categoryId}</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold font-headline">{course.title}</h1>
              <p className="text-lg text-primary-foreground/80">{course.summary}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm">
                {instructor && (
                    <Link href={`/instructors/${instructor.id}`} className="flex items-center gap-2 group">
                        <Avatar className="h-8 w-8">
                            {instructor.photoURL && (
                            <AvatarImage src={instructor.photoURL} alt={instructor.name} />
                            )}
                            <AvatarFallback>{instructor.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className='font-semibold group-hover:underline'>{instructor.name}</span>
                    </Link>
                )}
                <div className="flex items-center gap-2"><Clock size={16} /> <span>{sortedModules.length} modules</span></div>
                <div className="flex items-center gap-2"><BarChart size={16} /> <span>Niveau Débutant</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">Qu'allez-vous apprendre ?</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /><p>Maîtriser les concepts fondamentaux.</p></div>
                    <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /><p>Appliquer des techniques pratiques.</p></div>
                    <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /><p>Développer des compétences applicables.</p></div>
                    <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /><p>Obtenir un certificat de réussite.</p></div>
                </CardContent>
            </Card>
            <div>
              <h2 className="font-headline text-2xl text-primary mb-4">Contenu du cours</h2>
                <Accordion type="multiple" className="w-full space-y-2">
                 {sortedModules.length > 0 ? sortedModules.map((module, index) => (
                    <AccordionItem value={`item-${index}`} key={module.id} className="border-b-0 rounded-lg bg-primary/5">
                        <AccordionTrigger className="p-4 hover:no-underline">
                            <div className="flex justify-between w-full items-center"><span className="font-bold text-left text-primary">{module.title}</span></div>
                        </AccordionTrigger>
                        <AccordionContent className="p-0"><p className="text-muted-foreground px-4 pb-4 text-sm">{module.summary}</p>{module.id && <ModuleVideos courseId={course.id!} moduleId={module.id} />}</AccordionContent>
                    </AccordionItem>
                 )) : (<p className="text-muted-foreground py-4">Le contenu de cette formation est en cours de préparation.</p>)}
                </Accordion>
            </div>
            <Separator className="my-12" />
           {instructor && (
                <div className="mt-8">
                    <h2 className="font-headline text-2xl text-primary mb-4">À propos du formateur</h2>
                    <div className="flex items-start gap-6">
                        <Link href={`/instructors/${instructor.id}`}><Avatar className="w-24 h-24 border-4 border-primary"><AvatarImage src={instructor.photoURL || ''} alt={instructor.name} /><AvatarFallback className="text-3xl">{instructor.name?.charAt(0)}</AvatarFallback></Avatar></Link>
                        <div>
                            <Link href={`/instructors/${instructor.id}`}><h3 className="text-xl font-bold hover:text-primary">{instructor.name}</h3></Link>
                            <p className="text-accent-foreground font-semibold">{instructor.headline}</p>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-4">{instructor.bio || `${instructor.name} est un formateur passionné.`}</p>
                        </div>
                    </div>
                </div>
           )}
          </div>
          <div className="lg:col-span-1">
             <Card className="sticky top-24 shadow-xl">
                <CardHeader className="p-0">
                  {courseImage && (
                    <div className="aspect-video relative">
                      <Image src={courseImage.imageUrl} alt={course.title} fill className="object-cover rounded-t-lg" data-ai-hint={courseImage.imageHint} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center"><PlayCircle className="h-16 w-16 text-white/80" /></div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="text-4xl font-bold text-center">{isFree ? 'Gratuit' : `Prix à venir`}</div>
                    <div className="flex items-stretch gap-2">
                        <div className="flex-grow"><CtaButton /></div>
                        <Button variant="outline" size="icon" className="h-12 w-12" onClick={handleToggleWishlist}><Heart className={cn("h-6 w-6", isWishlisted && "fill-red-500 text-red-500")} /></Button>
                    </div>
                   <div className="text-xs text-muted-foreground text-center">Accès illimité</div>
                   <Separator/>
                   <h4 className="font-bold">Cette formation inclut :</h4>
                   <ul className="space-y-2 text-sm">
                       <li className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-muted-foreground" /> {sortedModules.length} modules</li>
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
