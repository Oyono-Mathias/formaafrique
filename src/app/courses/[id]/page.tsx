'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Clock, BarChart, Users, PlayCircle, Loader2, BookOpen, Heart } from 'lucide-react';
import { use, useMemo, useState, useEffect } from 'react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDoc, useCollection, useUser, useFirestore } from '@/firebase';
import type { Course, Module, Video, InstructorProfile, Enrollment } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


// Nouveau composant pour afficher les vidéos d'un module
function ModuleVideos({ courseId, moduleId }: { courseId: string; moduleId: string }) {
  const { data: videosData, loading, error } = useCollection<Video>(
    `courses/${courseId}/modules/${moduleId}/videos`
  );

  const sortedVideos = useMemo(() => {
    return (videosData || []).sort((a, b) => a.ordre - b.ordre);
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
            <span className="text-sm text-foreground">{video.titre}</span>
          </div>
          {/* Vous pouvez ajouter la durée de la vidéo ici si disponible */}
          {/* <span className="text-sm text-muted-foreground">03:13</span> */}
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
  const { id: courseId } = use(params);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const { data: course, loading, error } = useDoc<Course>('courses', courseId);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(courseId ? `courses/${courseId}/modules` : undefined);
  const { data: instructorData, loading: instructorLoading } = useDoc<InstructorProfile>(course?.instructorId ? 'instructors' : null, course?.instructorId);
  
  const { data: enrollmentData } = useDoc<Enrollment>(user && courseId ? `users/${user.uid}/enrollments` : null, courseId);
  const { data: wishlistItem } = useCollection(
      user && courseId ? 'wishlist' : null,
      user && courseId ? { where: [['userId', '==', user.uid], ['courseId', '==', courseId]] } : undefined
  );
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useMemo(() => {
    setIsWishlisted(wishlistItem && wishlistItem.length > 0);
  }, [wishlistItem]);
  
  useMemo(() => {
      setIsEnrolled(!!enrollmentData);
  }, [enrollmentData]);

  const sortedModules = useMemo(() => {
      return (modulesData || []).sort((a, b) => a.ordre - b.ordre);
  }, [modulesData]);

  const firstModuleId = (sortedModules.length > 0) ? sortedModules[0].id : null;

  const handleEnroll = async () => {
    if (!user || !db || !course) return;

    const enrollmentRef = doc(db, 'users', user.uid, 'enrollments', course.id!);
    const newEnrollment: Enrollment = {
        studentId: user.uid,
        courseId: course.id!,
        courseTitle: course.titre,
        enrollmentDate: serverTimestamp() as any,
        progression: 0,
        modules: {},
    };

    try {
        await setDoc(enrollmentRef, newEnrollment);
        toast({ title: "Inscription réussie !", description: `Vous êtes maintenant inscrit à "${course.titre}".` });
        setIsEnrolled(true);
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Erreur', description: "L'inscription a échoué."});
    }
  }

  const handleToggleWishlist = async () => {
    if (!user || !db || !course) return;

    if (isWishlisted) {
        // Remove from wishlist
        const wishlistItemToRemove = wishlistItem?.[0];
        if (wishlistItemToRemove?.id) {
            await deleteDoc(doc(db, 'wishlist', wishlistItemToRemove.id));
            toast({ title: "Retiré de vos favoris." });
            setIsWishlisted(false);
        }
    } else {
        // Add to wishlist
        await setDoc(doc(collection(db, 'wishlist')), {
            userId: user.uid,
            courseId: course.id,
            createdAt: serverTimestamp(),
        });
        toast({ title: "Ajouté à vos favoris !" });
        setIsWishlisted(true);
    }
  }


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
                <Accordion type="multiple" className="w-full space-y-2">
                 {sortedModules.length > 0 ? sortedModules.map((module, index) => (
                    <AccordionItem value={`item-${index}`} key={module.id} className="border-b-0 rounded-lg bg-primary/5">
                        <AccordionTrigger className="p-4 hover:no-underline">
                            <div className="flex justify-between w-full items-center">
                                <span className="font-bold text-left text-primary">{module.titre}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                           <p className="text-muted-foreground px-4 pb-4 text-sm">{module.description}</p>
                           {module.id && <ModuleVideos courseId={course.id!} moduleId={module.id} />}
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
                    
                    <div className="flex items-stretch gap-2">
                        <div className="flex-grow">
                            <CtaButton />
                        </div>
                        <Button variant="outline" size="icon" className="h-12 w-12" onClick={handleToggleWishlist}>
                            <Heart className={cn("h-6 w-6", isWishlisted && "fill-red-500 text-red-500")} />
                        </Button>
                    </div>

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
