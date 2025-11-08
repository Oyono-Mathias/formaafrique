
'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, CheckCircle, Lock, Loader2, ArrowLeft } from 'lucide-react';
import React, { use, useMemo, useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useUser, useDoc, useCollection, useFirestore } from '@/firebase';
import type { Course, Module, Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

type ModulePageProps = {
  params: {
    id: string;
    moduleId: string;
  };
};

type ModuleWithVideos = Module & { videos: Video[] };

export default function ModulePage({ params }: ModulePageProps) {
  const { id: courseId, moduleId } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();

  const { data: course, loading: courseLoading } = useDoc<Course>('courses', courseId);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(
    courseId ? `courses/${courseId}/modules` : null
  );
  
  const [videosByModule, setVideosByModule] = useState<Record<string, Video[]>>({});
  const [videosLoading, setVideosLoading] = useState(true);
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Fetch videos for all modules once
  useEffect(() => {
    if (!modulesData || modulesData.length === 0 || !courseId || !db) {
      if (!modulesLoading) setVideosLoading(false);
      return;
    }

    const fetchAllVideos = async () => {
      setVideosLoading(true);
      const allVideos: Record<string, Video[]> = {};
      for (const module of modulesData) {
        if (module.id) {
          const videosCollectionRef = collection(db, `courses/${courseId}/modules/${module.id}/videos`);
          try {
            const snapshot = await getDocs(videosCollectionRef);
            const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Video[];
            allVideos[module.id] = videos.filter(v => v.publie).sort((a, b) => a.ordre - b.ordre);
          } catch(e) {
            console.error("Failed to fetch videos for module:", module.id, e);
            allVideos[module.id] = [];
          }
        }
      }
      setVideosByModule(allVideos);
      setVideosLoading(false);
    };

    fetchAllVideos();
  }, [modulesData, courseId, db, modulesLoading]);


  const { sortedModulesWithVideos, currentModule, currentModuleIndex, currentVideoIndex } = useMemo(() => {
    const sortedMods = (modulesData || []).sort((a, b) => a.ordre - b.ordre);
    const modsWithVideos = sortedMods.map(mod => ({
      ...mod,
      videos: videosByModule[mod.id!] || []
    }));
    const currentIndex = modsWithVideos.findIndex(m => m.id === moduleId);
    const currentMod = currentIndex !== -1 ? modsWithVideos[currentIndex] : null;
    const currentVidIndex = currentMod?.videos.findIndex(v => v.id === selectedVideo?.id) ?? -1;
    
    return { 
        sortedModulesWithVideos: modsWithVideos, 
        currentModule: currentMod,
        currentModuleIndex: currentIndex,
        currentVideoIndex: currentVidIndex
    };
  }, [modulesData, videosByModule, moduleId, selectedVideo]);


  // Effect to select the first video of the current module by default
  useEffect(() => {
    if (currentModule && currentModule.videos.length > 0) {
        // Only set default if no video is selected or if the selected one is not in the current module
        if (!selectedVideo || !currentModule.videos.some(v => v.id === selectedVideo.id)) {
             setSelectedVideo(currentModule.videos[0]);
        }
    } else if (currentModule && currentModule.videos.length === 0) {
      setSelectedVideo(null);
    }
  }, [currentModule, selectedVideo]);
  
  const handleVideoEnded = async () => {
    if (!currentModule || !selectedVideo) return;

    // --- Save Progress ---
    if(user && db) {
        const enrollmentRef = doc(db, `users/${user.uid}/enrollments`, courseId);
        try {
            const enrollmentSnap = await getDoc(enrollmentRef);
            if (enrollmentSnap.exists()) {
                const totalVideos = sortedModulesWithVideos.reduce((acc, mod) => acc + mod.videos.length, 0);
                const watchedVideos = (enrollmentSnap.data().watchedVideos || 0) + 1;
                const progression = Math.min(Math.round((watchedVideos / totalVideos) * 100), 100);

                await updateDoc(enrollmentRef, {
                    progression,
                    watchedVideos,
                    lastWatchedVideo: selectedVideo.id
                });
            }
        } catch(e) {
            console.error("Failed to update progression:", e);
        }
    }


    // --- Go to Next Video/Module ---
    const nextVideo = currentModule.videos[currentVideoIndex + 1];

    if (nextVideo) {
      setSelectedVideo(nextVideo);
    } else {
      // Go to the first video of the next module
      const nextModule = sortedModulesWithVideos[currentModuleIndex + 1];
      if (nextModule && nextModule.videos.length > 0) {
        router.push(`/courses/${courseId}/modules/${nextModule.id}`);
      } else {
        // Last video of the last module
        alert("Félicitations ! Vous avez terminé la formation 🎉");
        router.push(`/dashboard/certificate/${courseId}`);
      }
    }
  };


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

  const handleVideoSelect = (video: Video, module: ModuleWithVideos) => {
    setSelectedVideo(video);
    if(module.id !== moduleId) {
        router.push(`/courses/${courseId}/modules/${module.id}`, { scroll: false });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-background">
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
             {selectedVideo?.url ? (
                <ReactPlayer
                    key={selectedVideo.id}
                    url={selectedVideo.url}
                    width="100%"
                    height="100%"
                    controls
                    playing
                    onEnded={handleVideoEnded}
                    config={{
                        youtube: {
                            playerVars: { 
                                showinfo: 0, 
                                rel: 0,
                                modestbranding: 1
                            }
                        }
                    }}
                />
             ) : (
                <div className='w-full h-full bg-muted flex items-center justify-center text-center p-4'>
                    <p className='text-muted-foreground'>
                        {currentModule.videos.length === 0 ? "Ce module ne contient aucune vidéo publiée." : "Sélectionnez une vidéo pour commencer."}
                    </p>
                </div>
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
            <p>{currentModule.description || "Contenu de la leçon à venir."}</p>
          </div>
        </div>
      </div>

      {/* Sidebar: Course Modules List */}
      <aside className="w-full lg:w-1/4 bg-primary/5 border-l p-4 lg:p-6 overflow-y-auto max-h-screen">
        <h2 className="text-xl font-bold font-headline mb-4">Contenu du cours</h2>
        <Accordion type="single" collapsible defaultValue={`module-${currentModule.id}`} className="w-full">
            {sortedModulesWithVideos.map((module, index) => {
              const isCurrentModule = module.id === currentModule.id;
              const isCompleted = index < currentModuleIndex;
              const isLocked = false; 

              return (
                <AccordionItem value={`module-${module.id!}`} key={module.id}>
                    <AccordionTrigger 
                      className={cn('font-semibold hover:no-underline', isCurrentModule && 'text-primary')}
                      disabled={isLocked}
                      onClick={() => router.push(`/courses/${courseId}/modules/${module.id}`, { scroll: false })}
                    >
                         <div className="flex items-center gap-3 text-left">
                          {isCompleted ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : isLocked ? <Lock className='h-5 w-5 text-muted-foreground flex-shrink-0' /> : <PlayCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                          <span>{module.titre}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 pl-4 list-none">
                        {module.videos.length > 0 ? (
                          module.videos.map((video) => (
                            <li key={video.id}>
                              <button
                                onClick={() => handleVideoSelect(video, module)}
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
                          <li className='p-3 text-sm text-muted-foreground'>Aucune vidéo publiée.</li>
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
