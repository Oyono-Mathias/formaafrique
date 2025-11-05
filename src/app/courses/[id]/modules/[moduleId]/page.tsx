'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle, CheckCircle, Lock, Loader2, ArrowLeft } from 'lucide-react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useDoc, useCollection } from '@/firebase';
import type { Course, Module, Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMemo, useState } from 'react';


type ModulePageProps = {
  params: {
    id: string;
    moduleId: string;
  };
};

export default function ModulePage({ params }: ModulePageProps) {
  const { data: course, loading: courseLoading } = useDoc<Course>('courses', params.id);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(`courses/${params.id}/modules`);
  const { data: videosData, loading: videosLoading } = useCollection<Video>(`courses/${params.id}/modules/${params.moduleId}/videos`);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  const loading = courseLoading || modulesLoading || videosLoading;

  const { currentModule, sortedModules, sortedVideos } = useMemo(() => {
      const sortedMods = (modulesData || []).sort((a,b) => a.ordre - b.ordre);
      const currentMod = sortedMods.find(m => m.id === params.moduleId);
      const sortedVids = (videosData || []).sort((a,b) => a.ordre - b.ordre);
      return { currentModule: currentMod, sortedModules: sortedMods, sortedVideos: sortedVids };
  }, [modulesData, videosData, params.moduleId]);

  useMemo(() => {
    if(sortedVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(sortedVideos[0]);
    }
  }, [sortedVideos, selectedVideo]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Chargement du module...</p>
      </div>
    );
  }
  
  if (!course || !currentModule) {
    notFound();
  }

  const getEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.hostname.includes('youtu.be')
          ? urlObj.pathname.slice(1)
          : urlObj.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (urlObj.hostname.includes('drive.google.com')) {
        const fileId = urlObj.pathname.split('/')[3];
        return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
      }
      return url; // fallback for other valid iframe sources
    } catch (error) {
      return null;
    }
  };
  
  const videoPlaceholder = PlaceHolderImages.find((img) => img.id === 'video-placeholder');
  const currentModuleIndex = (sortedModules || []).findIndex(m => m.id === currentModule.id);
  const embedUrl = selectedVideo ? getEmbedUrl(selectedVideo.url) : null;

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
             {embedUrl ? (
                <iframe
                    src={embedUrl}
                    title={selectedVideo?.titre}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className='w-full h-full'
                ></iframe>
             ) : videoPlaceholder && (
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
            {selectedVideo?.titre || currentModule.titre}
          </h1>
          <p className="text-muted-foreground mb-6">
            Leçon en cours de la formation : <Link href={`/courses/${course.id}`} className="text-primary hover:underline">{course.titre}</Link>
          </p>
          <Separator />
          <div className="prose max-w-none mt-8">
            <h2 className="font-headline text-2xl">À propos de cette leçon</h2>
            <p>{currentModule.description || "Contenu de la leçon à venir. Vous trouverez ci-dessous les vidéos incluses dans ce module."}</p>
          </div>
        </div>
      </div>

      {/* Sidebar: Course Modules List */}
      <aside className="w-full lg:w-1/4 bg-primary/5 border-l p-4 lg:p-6 overflow-y-auto">
        <h2 className="text-xl font-bold font-headline mb-4">Contenu du cours</h2>
        <Accordion type="single" collapsible defaultValue={`module-${currentModule.id}`} className="w-full">
            {(sortedModules || []).map((module, index) => {
              const isCurrentModule = module.id === currentModule.id;
              const isCompleted = index < currentModuleIndex;
              const isLocked = false;

              return (
                <AccordionItem value={`module-${module.id}`} key={module.id}>
                    <AccordionTrigger 
                      className={cn('font-semibold hover:no-underline', isCurrentModule && 'text-primary')}
                      disabled={isLocked}
                    >
                       <Link href={`/courses/${course.id}/modules/${module.id}`} className='w-full text-left'>
                         <div className="flex items-center gap-3">
                          {isCompleted ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : isLocked ? <Lock className='h-5 w-5 text-muted-foreground flex-shrink-0' /> : <PlayCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                          <span>{module.titre}</span>
                        </div>
                       </Link>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 pl-4 list-none">
                        {module.id === currentModule.id ? sortedVideos.map((video, videoIndex) => (
                           <li key={videoIndex}>
                                <button
                                onClick={() => setSelectedVideo(video)}
                                className={cn(
                                "block w-full text-left p-3 rounded-md transition-colors text-sm hover:bg-background",
                                selectedVideo?.id === video.id && "bg-primary/10 text-primary font-semibold"
                                )}
                            >
                                <div className="flex items-center">
                                <PlayCircle className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium">{video.titre}</span>
                                </div>
                            </button>
                           </li>
                        )) : (
                           <li className='p-3 text-sm text-muted-foreground'>Chargez le module pour voir les vidéos.</li>
                        )}
                      </ul>
                    </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      </aside>
    </div>
  );
}
