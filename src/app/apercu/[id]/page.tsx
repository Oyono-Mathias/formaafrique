'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, CheckCircle, Lock, Loader2, ArrowLeft } from 'lucide-react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useDoc, useCollection } from '@/firebase';
import type { Course, Module, Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useMemo, useState, useEffect } from 'react';


type ApercuPageProps = {
  params: {
    id: string;
  };
};

export default function ApercuPage({ params }: ApercuPageProps) {
  const { data: course, loading: courseLoading } = useDoc<Course>('courses', params.id);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(`courses/${params.id}/modules`);
  const modules = useMemo(() => (modulesData || []).sort((a,b) => a.ordre - b.ordre), [modulesData]);

  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  
  useEffect(() => {
    if (modules.length > 0 && !currentModuleId) {
        setCurrentModuleId(modules[0].id!);
    }
  }, [modules, currentModuleId]);
  
  const { data: videosData, loading: videosLoading } = useCollection<Video>(currentModuleId ? `courses/${params.id}/modules/${currentModuleId}/videos` : null);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  const loading = courseLoading || modulesLoading || videosLoading;

  const { currentModule, sortedVideos } = useMemo(() => {
      const allVideos = videosData || [];
      const currentMod = modules.find(m => m.id === currentModuleId);
      const sortedVids = [...allVideos].sort((a,b) => a.ordre - b.ordre);
      return { currentModule: currentMod, sortedVideos: sortedVids };
  }, [modules, videosData, currentModuleId]);

  useEffect(() => {
    if(sortedVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(sortedVideos[0]);
    }
     if (sortedVideos.length === 0) {
      setSelectedVideo(null);
    }
  }, [sortedVideos, selectedVideo]);


  if (loading && !course) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Chargement de l'aperçu...</p>
      </div>
    );
  }
  
  if (!course) {
    notFound();
  }

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.hostname.includes('youtu.be')
          ? urlObj.pathname.slice(1)
          : urlObj.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
       if (urlObj.hostname.includes('drive.google.com')) {
        const match = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
        const fileId = match ? match[1] : null;
        return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
      }
      return url; 
    } catch (error) {
      console.error("Invalid video URL:", error);
      return null;
    }
  };
  
  const videoPlaceholder = PlaceHolderImages.find((img) => img.id === 'video-placeholder');
  const currentModuleIndex = modules.findIndex(m => m.id === currentModuleId);
  const embedUrl = selectedVideo ? getEmbedUrl(selectedVideo.url) : null;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-background">
      <div className="flex-grow lg:w-3/4 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
             <Button variant="ghost" asChild>
                <Link href="/formateur/courses">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au tableau de bord
                </Link>
            </Button>
          </div>
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
             {embedUrl ? (
                <iframe
                    key={selectedVideo?.id}
                    src={embedUrl}
                    title={selectedVideo?.titre}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className='w-full h-full'
                ></iframe>
             ) : (
                <div className='w-full h-full bg-muted flex items-center justify-center text-center p-4'>
                    <p className='text-muted-foreground'>Sélectionnez une vidéo pour la prévisualiser, ou ajoutez-en une à ce module.</p>
                </div>
             )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-2">
            {selectedVideo?.titre || currentModule?.titre || course.titre}
          </h1>
          <p className="text-muted-foreground mb-6">
            Aperçu de la formation : <span className="text-primary font-semibold">{course.titre}</span>
          </p>
          <Separator />
          <div className="prose max-w-none mt-8">
            <h2 className="font-headline text-2xl">À propos de cette leçon</h2>
            <p>{currentModule?.description || "Contenu de la leçon à venir."}</p>
          </div>
        </div>
      </div>

      <aside className="w-full lg:w-1/4 bg-primary/5 border-l p-4 lg:p-6 overflow-y-auto">
        <h2 className="text-xl font-bold font-headline mb-4">Contenu du cours</h2>
        <Accordion type="single" collapsible defaultValue={`module-${currentModuleId}`} className="w-full">
            {modules.map((module) => {
              const isCurrentModule = module.id === currentModuleId;
              return (
                <AccordionItem value={`module-${module.id!}`} key={module.id}>
                    <AccordionTrigger 
                      className={cn('font-semibold hover:no-underline', isCurrentModule && 'text-primary')}
                      onClick={() => setCurrentModuleId(module.id!)}
                    >
                         <div className="flex items-center gap-3">
                          <PlayCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span>{module.titre}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 pl-4 list-none">
                        {isCurrentModule ? (
                          sortedVideos.length > 0 ? (
                            sortedVideos.map((video) => (
                              <li key={video.id}>
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
                            ))
                          ) : (
                            <li className='p-3 text-sm text-muted-foreground'>Aucune vidéo dans ce module.</li>
                          )
                        ) : (
                          <li className='p-3 text-sm text-muted-foreground'>Développez pour voir les vidéos.</li>
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
