'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle, CheckCircle, Lock, Loader2, ArrowLeft } from 'lucide-react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useDoc } from '@/firebase';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';


type ModulePageProps = {
  params: {
    id: string;
    moduleId: string;
  };
};

export default function ModulePage({ params }: ModulePageProps) {
  const { data: course, loading, error } = useDoc<Course>('courses', params.id);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Chargement du module...</p>
      </div>
    );
  }
  
  if (error || !course) {
    notFound();
  }

  const currentModule = course.modules.find((m) => m.id === params.moduleId);
  if (!currentModule) notFound();
  
  const videoPlaceholder = PlaceHolderImages.find((img) => img.id === 'video-placeholder');

  // Logic for completion status (to be implemented with user progress)
  const currentModuleIndex = course.modules.findIndex(m => m.id === currentModule.id);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Main Content: Video Player and Details */}
      <div className="flex-grow lg:w-3/4 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
             <Button variant="ghost" asChild>
                <Link href={`/courses/${course.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la formation
                </Link>
            </Button>
          </div>
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
             {videoPlaceholder && (
                <Image 
                    src={videoPlaceholder.imageUrl} 
                    alt="Video placeholder"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                    data-ai-hint={videoPlaceholder.imageHint}
                />
             )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-2">
            {currentModule.titre}
          </h1>
          <p className="text-muted-foreground mb-6">
            Leçon en cours de la formation : <Link href={`/courses/${course.id}`} className="text-primary hover:underline">{course.titre}</Link>
          </p>
          <Separator />
          <div className="prose max-w-none mt-8">
            <h2 className="font-headline text-2xl">À propos de cette leçon</h2>
            <p>Contenu de la leçon à venir. Vous trouverez ci-dessous les vidéos incluses dans ce module.</p>
          </div>
          <div className='mt-8'>
             <h3 className="font-headline text-xl mb-4 text-primary">Vidéos du module</h3>
              <ul className="list-none p-0 space-y-3">
                {currentModule.videos.map((video, index) => (
                  <li key={index}>
                    <Card className="hover:bg-muted transition-colors hover:shadow-md">
                        <CardContent className='p-4 flex items-center gap-4'>
                            <PlayCircle className="h-6 w-6 text-primary flex-shrink-0" />
                            <span className="font-medium flex-grow">{video.titre}</span>
                            <Button variant="ghost" size="sm">Regarder</Button>
                        </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
          </div>
        </div>
      </div>

      {/* Sidebar: Course Modules List */}
      <aside className="w-full lg:w-1/4 bg-primary/5 border-l p-4 lg:p-6 overflow-y-auto">
        <h2 className="text-xl font-bold font-headline mb-4">Contenu du cours</h2>
        <Accordion type="single" collapsible defaultValue={`module-${currentModule.id}`} className="w-full">
            {course.modules.map((module, index) => {
              const isCurrentModule = module.id === currentModule.id;
              // Mock progress logic
              const isCompleted = index < currentModuleIndex;
              const isLocked = false; // For now, all are unlocked

              return (
                <AccordionItem value={`module-${module.id}`} key={module.id}>
                    <AccordionTrigger 
                      className={cn('font-semibold', isCurrentModule && 'text-primary')}
                      disabled={isLocked}
                    >
                       <Link href={`/courses/${course.id}/modules/${module.id}`} className='w-full text-left'>
                         <div className="flex items-center gap-3">
                          {isCompleted ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <PlayCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                          <span>{module.titre}</span>
                        </div>
                       </Link>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {module.videos.map((video, videoIndex) => (
                           <Link
                            key={videoIndex}
                            href="#" // Link to the actual video player view in the future
                            className={cn(
                              "block p-3 rounded-md transition-colors text-sm hover:bg-muted"
                            )}
                          >
                            <div className="flex items-center">
                              <PlayCircle className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium">{video.titre}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      </aside>
    </div>
  );
}
