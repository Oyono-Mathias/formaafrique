import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle, CheckCircle, Lock } from 'lucide-react';

import { courses } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type ModulePageProps = {
  params: {
    id: string;
    moduleId: string;
  };
};

export default function ModulePage({ params }: ModulePageProps) {
  const course = courses.find((c) => c.id === params.id);
  if (!course) notFound();

  const currentModule = course.modules.find((m) => m.id === params.moduleId);
  if (!currentModule) notFound();
  
  const videoPlaceholder = PlaceHolderImages.find((img) => img.id === 'video-placeholder');

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Main Content: Video Player and Details */}
      <div className="flex-grow lg:w-3/4 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
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
            {currentModule.title}
          </h1>
          <p className="text-muted-foreground mb-6">
            Formation : <Link href={`/courses/${course.id}`} className="text-primary hover:underline">{course.title}</Link>
          </p>
          <Separator />
          <div className="prose prose-lg max-w-none mt-6">
            <h2 className="font-headline text-2xl">À propos de cette leçon</h2>
            <p>{currentModule.content}</p>
          </div>
        </div>
      </div>

      {/* Sidebar: Course Modules List */}
      <aside className="w-full lg:w-1/4 bg-primary/5 border-l p-4 lg:p-6 overflow-y-auto">
        <h2 className="text-xl font-bold font-headline mb-4">Contenu du cours</h2>
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className='font-semibold'>Modules de formation</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {course.modules.map((module, index) => {
                  const isCurrent = module.id === currentModule.id;
                  const isCompleted = index < course.modules.findIndex(m => m.id === currentModule.id);
                  const isLocked = index > course.modules.findIndex(m => m.id === currentModule.id);
                  
                  return (
                    <Link
                      key={module.id}
                      href={`/courses/${course.id}/modules/${module.id}`}
                      className={cn(
                        "block p-3 rounded-md transition-colors",
                        isCurrent ? "bg-accent/50 text-accent-foreground" : "hover:bg-muted",
                        isLocked ? "opacity-60 cursor-not-allowed" : ""
                      )}
                      aria-disabled={isLocked}
                      onClick={(e) => isLocked && e.preventDefault()}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {isCurrent ? <PlayCircle className="h-5 w-5 mr-3 text-accent-foreground flex-shrink-0" /> 
                           : isCompleted ? <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                           : <Lock className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />}
                          <span className="text-sm font-medium">{module.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{module.duration}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </aside>
    </div>
  );
}
