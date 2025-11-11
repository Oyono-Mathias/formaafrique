
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Award, Users, Bot, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { testimonials } from '@/lib/mock-data';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useCollection } from '@/firebase';
import { Course } from '@/lib/types';
import { useMemo } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';


const CourseCard = ({ course }: { course: Course }) => {
    const courseImage = PlaceHolderImages.find((img) => img.id === 'course-project-management');
    
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
            <CardContent className="flex-grow p-4">
                <Badge variant="secondary" className="mb-2">{course.categoryId}</Badge>
                <CardTitle className="text-base font-bold leading-tight hover:text-primary">
                    <Link href={`/courses/${course.id}`}>{course.title}</Link>
                </CardTitle>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                 <Button asChild variant="link" size="sm" className="p-0 h-auto">
                  <Link href={`/courses/${course.id}`}>Voir les détails <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function Home() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero');
    const { data: coursesData } = useCollection<Course>("formations", { where: ['published', '==', true]});
    const popularCourses = useMemo(() => {
        return [...(coursesData || [])].sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0)).slice(0, 10);
    }, [coursesData]);

  const features = [
    {
      icon: BookOpen,
      title: "Apprenez à votre rythme",
      description: "Accédez à des milliers de cours sur mobile et ordinateur, quand vous le voulez.",
    },
    {
      icon: Award,
      title: "Obtenez des certificats",
      description: "Validez vos compétences avec des certificats reconnus pour booster votre carrière.",
    },
     {
      icon: Bot,
      title: "Tuteur IA intégré",
      description: "Notre assistant intelligent répond à vos questions et vous guide dans votre apprentissage.",
    },
    {
      icon: MessageSquare,
      title: "Rejoignez une communauté",
      description: "Échangez avec d'autres apprenants et des formateurs pour progresser ensemble.",
    },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-primary/5 py-20 md:py-32">
           {heroImage && (
             <Image 
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover z-0 opacity-10"
                data-ai-hint={heroImage.imageHint}
                priority
             />
           )}
           <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
                    L'éducation pour l'avenir de l'Afrique.
                </h1>
                <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                    Acquérez les compétences de demain avec des formations créées par les meilleurs experts du continent. Gratuitement.
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Button size="lg" asChild>
                        <Link href="/courses">Explorer les formations</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                         <Link href="/devenir-formateur">Devenir Formateur</Link>
                    </Button>
                </div>
           </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <feature.icon className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Popular Courses Section */}
        <section className="py-16 sm:py-24 bg-primary/5">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold font-headline text-center mb-12">Formations populaires</h2>
                 <Carousel 
                    opts={{ align: "start", loop: true }} 
                    className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                    {popularCourses.map((course) => (
                        <CarouselItem key={course.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                            <CourseCard course={course} />
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden lg:flex bg-card/50"/>
                    <CarouselNext className="hidden lg:flex bg-card/50"/>
                </Carousel>
            </div>
        </section>


        {/* Testimonials Section */}
        <section className="py-16 sm:py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                 <h2 className="text-3xl font-bold font-headline text-center mb-12">Ce que nos étudiants disent</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map(testimonial => {
                        const image = PlaceHolderImages.find(p => p.id === testimonial.imageId);
                        return (
                            <Card key={testimonial.id} className="bg-card text-center p-8 shadow-sm">
                                <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-primary/20">
                                    {image && <AvatarImage src={image.imageUrl} alt={testimonial.name} />}
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <blockquote className="text-muted-foreground italic">"{testimonial.quote}"</blockquote>
                                <p className="font-bold mt-4">{testimonial.name}</p>
                                <p className="text-sm text-primary">{testimonial.course}</p>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
             <div className="container mx-auto px-4 md:px-6 text-center">
                 <h2 className="text-3xl font-bold font-headline">Rejoignez-nous dans notre mission</h2>
                 <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/80">Que vous souhaitiez apprendre une nouvelle compétence ou partager votre savoir, FormaAfrique est la plateforme pour vous.</p>
                 <div className="mt-8 flex justify-center gap-4">
                     <Button size="lg" variant="secondary" asChild>
                        <Link href="/devenir-formateur">Devenir Formateur</Link>
                     </Button>
                 </div>
            </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
