'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, BrainCircuit, Star, Users, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { testimonials } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection } from '@/firebase';
import type { Course } from '@/lib/types';
import { useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const { data: courses, loading, error } = useCollection<Course>('courses', {
      where: ['publie', '==', true]
  });

  const featuredCourses = useMemo(() => {
    if (!courses) return [];
    return [...courses]
        .sort((a, b) => {
            const dateA = a.date_creation instanceof Timestamp ? a.date_creation.toMillis() : new Date(a.date_creation as string).getTime();
            const dateB = b.date_creation instanceof Timestamp ? b.date_creation.toMillis() : new Date(b.date_creation as string).getTime();
            return dateB - dateA;
        })
        .slice(0, 3);
  }, [courses]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-primary/10">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover z-0"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10 bg-background/80 backdrop-blur-sm rounded-xl py-12">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
                Débloquez votre potentiel avec FormaAfrique
              </h1>
              <p className="mt-6 text-lg leading-8 text-foreground/80">
                Des formations de qualité, conçues par des experts africains, pour les leaders de demain.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg">
                  <Link href="/courses">
                    Découvrir les formations <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about">En savoir plus</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section id="courses" className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
                Nos formations à la une
              </h2>
              <p className="mt-4 text-lg text-foreground/70">
                Démarrez votre parcours d'apprentissage avec nos cours les plus populaires.
              </p>
            </div>
            <div className="mt-12">
              {loading ? (
                 <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                 </div>
              ) : error ? (
                <div className="text-center text-destructive">Erreur de chargement des formations.</div>
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {(featuredCourses || []).map((course) => {
                    const courseImage = PlaceHolderImages.find((img) => img.id === course.image);
                    return (
                      <Card key={course.id} className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                        <CardHeader className="p-0">
                          <div className="aspect-video relative">
                            {courseImage && (
                              <Image
                                src={courseImage.imageUrl}
                                alt={course.titre}
                                fill
                                className="object-cover"
                                data-ai-hint={courseImage.imageHint}
                              />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow p-6">
                          <Badge variant="secondary" className="mb-2">{course.categorie}</Badge>
                          <CardTitle className="text-xl font-headline leading-tight hover:text-primary">
                            <Link href={`/courses/${course.id}`}>{course.titre}</Link>
                          </CardTitle>
                          <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
                        </CardContent>
                        <CardFooter className="p-6 pt-0 flex justify-between items-center">
                          <Button asChild variant="link">
                            <Link href={`/courses/${course.id}`}>Voir le cours <ArrowRight className="ml-1" /></Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-12 text-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/courses">Voir toutes les formations</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section className="py-16 sm:py-24 bg-primary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
                Pourquoi choisir FormaAfrique ?
              </h2>
              <p className="mt-4 text-lg text-foreground/70">
                Nous nous engageons à fournir une éducation accessible et de classe mondiale.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-y-12 text-center sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-accent/20 rounded-full">
                  <Users className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-primary font-headline">Experts locaux</h3>
                <p className="mt-2 text-base text-foreground/70">Apprenez auprès des meilleurs professionnels et universitaires du continent.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-4 bg-accent/20 rounded-full">
                  <BookOpen className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-primary font-headline">Apprentissage flexible</h3>
                <p className="mt-2 text-base text-foreground/70">Accédez à vos cours à tout moment, n'importe où, et progressez à votre rythme.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-4 bg-accent/20 rounded-full">
                  <BrainCircuit className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-primary font-headline">Technologie de pointe</h3>
                <p className="mt-2 text-base text-foreground/70">Utilisez notre tuteur IA pour une aide personnalisée 24h/24 et 7j/7.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
                Ce que nos étudiants disent
              </h2>
              <p className="mt-4 text-lg text-foreground/70">
                Rejoignez des milliers d'étudiants qui transforment leur carrière avec nous.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => {
                const avatarImage = PlaceHolderImages.find((img) => img.id === testimonial.imageId);
                return (
                  <Card key={testimonial.id} className="bg-primary/5">
                    <CardContent className="p-6 text-center flex flex-col items-center">
                      <Avatar className="w-20 h-20 mb-4 border-4 border-accent">
                        {avatarImage && (
                          <AvatarImage src={avatarImage.imageUrl} alt={testimonial.name} data-ai-hint={avatarImage.imageHint} />
                        )}
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-foreground/80 italic">"{testimonial.quote}"</p>
                      <div className="mt-4">
                        <p className="font-semibold text-primary">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.course}</p>
                      </div>
                      <div className="flex mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
