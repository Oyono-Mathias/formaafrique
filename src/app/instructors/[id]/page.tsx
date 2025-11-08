
'use client';

import { useDoc, useCollection, useUser } from '@/firebase';
import type { InstructorProfile, Course } from '@/lib/types';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { Loader2, BookOpen, Star, Users, Linkedin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useMemo } from 'react';
import FollowButton from '@/components/social/follow-button';
import FriendRequestButton from '@/components/social/friend-request-button';

export default function InstructorProfilePage({ params }: { params: { id: string } }) {
    const { id: instructorId } = use(params);
    const { user } = useUser();
    
    const { data: instructor, loading: instructorLoading, error: instructorError } = useDoc<InstructorProfile>('users', instructorId);
    
    const coursesQueryOptions = useMemo(() => {
        if (!instructorId) return undefined;
        return { where: [['instructorId', '==', instructorId], ['publie', '==', true]] as [[string, '==', string], [string, '==', boolean]] };
    }, [instructorId]);

    const { data: coursesData, loading: coursesLoading, error: coursesError } = useCollection<Course>(
        'courses',
        coursesQueryOptions
    );

    const publishedCourses = coursesData || [];
    
    const loading = instructorLoading || coursesLoading;

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-3">Chargement du profil du formateur...</p>
            </div>
        );
    }

    if (instructorError || !instructor || instructor.role !== 'formateur') {
        notFound();
    }

    return (
        <div className="bg-primary/5">
            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Instructor Bio */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-lg sticky top-24">
                            <CardContent className="p-8 text-center flex flex-col items-center">
                                <Avatar className="w-40 h-40 mb-4 border-4 border-primary">
                                    <AvatarImage src={instructor.photoURL || undefined} alt={instructor.name} />
                                    <AvatarFallback className="text-5xl">{instructor.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h1 className="text-3xl font-bold font-headline">{instructor.name}</h1>
                                <p className="text-lg text-primary font-semibold mt-1">{(instructor as any).headline || 'Formateur Expert'}</p>
                                
                                {instructor.skills && instructor.skills.length > 0 && (
                                   <div className="flex flex-wrap gap-2 justify-center mt-4">
                                        {instructor.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                   </div>
                                )}
                                
                                <div className="flex items-center gap-4 mt-6">
                                    <FollowButton targetUserId={instructorId} />
                                    <FriendRequestButton targetUserId={instructorId} />
                                </div>


                                {(instructor as any).linkedin && (
                                     <Button variant="outline" size="sm" asChild className="mt-4">
                                        <Link href={(instructor as any).linkedin} target="_blank">
                                            <Linkedin className="mr-2 h-4 w-4" /> Suivre sur LinkedIn
                                        </Link>
                                    </Button>
                                )}

                                <div className="text-left w-full mt-6">
                                    <h3 className="font-bold text-lg">Biographie</h3>
                                    <p className="text-muted-foreground mt-2 text-sm">{instructor.bio || 'Aucune biographie fournie.'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Instructor Courses */}
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold font-headline text-primary mb-6">
                            Formations proposées par {instructor.name}
                        </h2>
                        
                        {coursesError && <p className="text-destructive">Impossible de charger les formations.</p>}

                        {!coursesLoading && publishedCourses.length > 0 ? (
                            <div className="space-y-6">
                                {publishedCourses.map(course => {
                                    const courseImage = PlaceHolderImages.find(img => img.id === course.image);
                                    return (
                                        <Card key={course.id} className="flex flex-col md:flex-row overflow-hidden transition-shadow hover:shadow-xl">
                                           <div className="md:w-1/3 aspect-video md:aspect-auto relative">
                                                {courseImage && (
                                                    <Image 
                                                        src={courseImage.imageUrl}
                                                        alt={course.titre}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                           </div>
                                           <div className="md:w-2/3 flex flex-col">
                                                <CardHeader>
                                                    <Badge variant="secondary" className="w-fit mb-2">{course.categorie}</Badge>
                                                    <CardTitle className="leading-tight hover:text-primary">
                                                        <Link href={`/courses/${course.id}`}>{course.titre}</Link>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-grow">
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button asChild>
                                                        <Link href={`/courses/${course.id}`}>Voir la formation</Link>
                                                    </Button>
                                                </CardFooter>
                                           </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : !coursesLoading && (
                            <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card">
                                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Aucune formation publiée</h3>
                                <p className="mt-2 text-sm text-muted-foreground">Ce formateur n'a pas encore publié de formation.</p>
                            </div>
                        )}
                         <div className="mt-8 text-center">
                            <Button variant="outline" asChild>
                                <Link href="/instructors">Voir tous les formateurs</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
