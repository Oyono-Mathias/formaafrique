'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, CheckCircle, Lock, Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { use, useMemo, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useUser, useDoc, useCollection, useFirestore } from '@/firebase';
import type { Course, Module, Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

type ModulePageProps = {
  params: {
    id: string;
    moduleId: string;
  };
};

export default function ModulePage({ params }: ModulePageProps) {
  const { id: courseId, moduleId } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();

  const { data: course, loading: courseLoading } = useDoc<Course>('courses', courseId);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(
    courseId ? `courses/${courseId}/modules` : null
  );
  
  const { data: videosData, loading: videosLoading } = useCollection<Video>(
    courseId && moduleId ? `courses/${courseId}/modules/${moduleId}/videos` : null,
    { where: ['publie', '==', true] }
  );
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const sortedModules = useMemo(() => (modulesData || []).sort((a,b) => a.ordre - b.ordre), [modulesData]);
  const sortedVideos = useMemo(() => (videosData || []).sort((a,b) => a.ordre - b.ordre), [videosData]);

  const { currentModule, currentModuleIndex, nextModule, previousModule } = useMemo(() => {
    const currentIndex = sortedModules.findIndex(m => m.id === moduleId);
    const currentMod = currentIndex !== -1 ? sortedModules[currentIndex] : null;
    const nextMod = currentIndex !== -1 ? sortedModules[currentIndex + 1] : null;
    const prevMod = currentIndex > 0 ? sortedModules[currentIndex - 1] : null;
    return { currentModule: currentMod, currentModuleIndex: currentIndex, nextModule: nextMod, previousModule: prevMod };
  }, [sortedModules, moduleId]);

  const { currentVideoIndex, nextVideo, previousVideo, completedVideosCount } = useMemo(() => {
    if (!selectedVideo) return { currentVideoIndex: -1, nextVideo: null, previousVideo: null, completedVideosCount: 0 };
    const vidIndex = sortedVideos.findIndex(v => v.id === selectedVideo.id);
    const nxtVideo = sortedVideos[vidIndex + 1] || null;
    const prevVideo = vidIndex > 0 ? sortedVideos[vidIndex - 1] : null;
    // This is a mock completion count for now. Will be replaced with firestore data.
    const completedCount = sortedVideos.slice(0, vidIndex + 1).length;
    return { currentVideoIndex: vidIndex, nextVideo: nxtVideo, previousVideo: prevVideo, completedVideosCount: completedCount };
  }, [selectedVideo, sortedVideos]);

  const courseProgress = useMemo(() => {
    const totalVideos = sortedVideos.length;
    if (totalVideos === 0) return 0;
    return (completedVideosCount / totalVideos) * 100;
  }, [completedVideosCount, sortedVideos.length]);


  useEffect(() => {
    // Set the first video as selected by default
    if (sortedVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(sortedVideos[0]);
    }
  }, [sortedVideos, selectedVideo]);
  
  const handleVideoEnd = () => {
    // Here we will add logic to mark video as complete in Firestore
    toast({ title: "Leçon terminée !", description: `"${selectedVideo?.titre}" marquée comme terminée.`});

    if (nextVideo) {
      setSelectedVideo(nextVideo);
    } else if (nextModule) {
      router.push(`/courses/${courseId}/modules/${nextModule.id}`);
    } else {
      toast({
        title: "🎉 Félicitations !",
        description: "Vous avez terminé cette formation. Vous pouvez maintenant consulter votre certificat.",
        duration: 8000,
      });
      router.push(`/dashboard/certificate/${courseId}`);
    }
  };
  
  const handleNext = () => {
      if(nextVideo) setSelectedVideo(nextVideo);
  }
  
  const handlePrevious = () => {
      if(previousVideo) setSelectedVideo(previousVideo);
  }

  const loading = courseLoading || modulesLoading || videosLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Chargement du module...</p>
      </div>
    );
  }
  
  if (!courseId || !moduleId || !course || !currentModule) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
       <header className="p-4 border-b flex justify-between items-center bg-card">
        <Button variant="ghost" asChild>
            <Link href={`/courses/${course.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la formation
            </Link>
        </Button>
        <div className="text-center">
            <h1 className="text-xl font-bold font-headline text-primary hidden md:block">
                {currentModule.titre}
            </h1>
            <p className='text-sm text-muted-foreground'>Leçon {currentModuleIndex + 1} / {sortedModules.length}</p>
        </div>
        <div className="w-48"></div>
       </header>

      <div className="flex-grow flex flex-col md:flex-row">
        <main className="flex-1 p-4 md:p-8">
             <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
             {selectedVideo?.url ? (
                <ReactPlayer
                    url={selectedVideo.url}
                    controls
                    width="100%"
                    height="100%"
                    playing={true}
                    onEnded={handleVideoEnd}
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload' // prevent download
                            }
                        }
                    }}
                />
             ) : (
                <div className='w-full h-full bg-muted flex items-center justify-center text-center p-4'>
                    <p className='text-muted-foreground'>
                        {sortedVideos.length === 0 ? "Ce module ne contient aucune vidéo publiée." : "Sélectionnez une vidéo pour commencer."}
                    </p>
                </div>
             )}
            </div>
             <div className="mt-6 border-t pt-6">
                <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={handlePrevious} disabled={!previousVideo}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                    </Button>
                     <div className="w-full max-w-xs mx-4">
                        <Progress value={courseProgress} />
                        <p className='text-center text-sm text-muted-foreground mt-1'>{Math.round(courseProgress)}% terminé</p>
                    </div>
                    <Button onClick={handleNext} disabled={!nextVideo}>
                        Suivant <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </main>
         <aside className="w-full md:w-80 bg-primary/5 border-l p-4 overflow-y-auto">
            <h2 className="text-lg font-bold font-headline mb-4">Vidéos du module</h2>
             <ul className="space-y-2 list-none">
                {sortedVideos.length > 0 ? (
                sortedVideos.map((video, index) => (
                    <li key={video.id}>
                    <button
                        onClick={() => setSelectedVideo(video)}
                        className={cn(
                        "block w-full text-left p-3 rounded-md transition-colors text-sm hover:bg-background",
                        selectedVideo?.id === video.id && "bg-primary/10 text-primary font-semibold"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <span className='font-mono text-muted-foreground text-xs pt-1'>{String(index + 1).padStart(2, '0')}</span>
                            <span className="font-medium flex-grow">{video.titre}</span>
                            <CheckCircle className={cn('h-5 w-5 text-green-500 flex-shrink-0', index < currentVideoIndex ? 'opacity-100' : 'opacity-0')} />
                        </div>
                    </button>
                    </li>
                ))
                ) : (
                <li className='p-3 text-sm text-muted-foreground'>Aucune vidéo publiée dans ce module.</li>
                )}
            </ul>
        </aside>
      </div>

    </div>
  );
}
