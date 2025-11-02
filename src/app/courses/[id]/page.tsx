import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Clock, BarChart, Users, PlayCircle } from 'lucide-react';

import { courses } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type CoursePageProps = {
  params: {
    id: string;
  };
};

export default function CourseDetailPage({ params }: CoursePageProps) {
  const course = courses.find((c) => c.id === params.id);

  if (!course) {
    notFound();
  }

  const courseImage = PlaceHolderImages.find((img) => img.id === course.imageId);
  const instructorImage = PlaceHolderImages.find((img) => img.id === course.instructor.avatarId);
  const isFree = course.price === 0;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-4">
              <Badge variant="secondary">{course.category}</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold font-headline">{course.title}</h1>
              <p className="text-lg text-primary-foreground/80">{course.shortDescription}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    {instructorImage && (
                      <AvatarImage src={instructorImage.imageUrl} alt={course.instructor.name} data-ai-hint={instructorImage.imageHint} />
                    )}
                    <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{course.instructor.name}</span>
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
                        alt={course.title}
                        fill
                        className="object-cover rounded-t-lg"
                        data-ai-hint={courseImage.imageHint}
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="text-3xl font-bold text-center">
                      {isFree ? 'Gratuit' : `${course.price} €`}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Clock size={16} /> Durée</span>
                      <span className="font-semibold">{course.duration}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><BarChart size={16} /> Niveau</span>
                      <span className="font-semibold">{course.level}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Users size={16} /> Inscrits</span>
                      <span className="font-semibold">{course.enrollmentCount}</span>
                    </div>
                  <Button size="lg" className="w-full" asChild>
                    {isFree ? (
                      <Link href={`/courses/${course.id}/modules/${course.modules[0].id}`}>
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
            {/* What you'll learn */}
            <Card className="mb-8 bg-primary/5">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Ce que vous allez apprendre</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.whatYouWillLearn.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent-foreground mr-3 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Description */}
            <div className="prose prose-lg max-w-none mb-8">
              <h2 className="font-headline text-2xl text-primary">Description du cours</h2>
              <p>{course.longDescription}</p>
            </div>

            <Separator className="my-8" />
            
            {/* Modules */}
            <div>
              <h2 className="font-headline text-2xl text-primary mb-4">Contenu du cours</h2>
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <Link href={`/courses/${course.id}/modules/${module.id}`} key={module.id} className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <PlayCircle className="h-6 w-6 text-primary mr-4" />
                          <div>
                            <p className="font-semibold">{module.title}</p>
                            <p className="text-sm text-muted-foreground">{module.duration}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Voir</Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
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
                    <AvatarImage src={instructorImage.imageUrl} alt={course.instructor.name} data-ai-hint={instructorImage.imageHint}/>
                  )}
                  <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{course.instructor.name}</h3>
                <p className="text-accent-foreground font-medium">{course.instructor.title}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {course.instructor.name} est un {course.instructor.title} passionné avec plus de 10 ans d'expérience dans l'industrie. Il se consacre à partager ses connaissances pour former la prochaine génération de talents en Afrique.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
