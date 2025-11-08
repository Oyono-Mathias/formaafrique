
'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, CheckCircle, Lock, Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { use, useMemo, useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useUser, useDoc, useCollection, useFirestore } from '@/firebase';
import type { Course, Module, Video, Enrollment, VideoProgress } from '@/lib/types';
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
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const playerRef = useRef<ReactPlayer>(null);

  const { data: course, loading: courseLoading } = useDoc<Course>('courses', courseId);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(
    courseId ? `courses/${courseId}/modules` : undefined
  );
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [canPlay, setCanPlay] = useState(false);

  // Fetch all videos for all modules to calculate total course videos
  useEffect(() => {
    if (!modulesData || modulesData.length === 0 || !db) return;
  
    const fetchAllVideos = async () => {
      let allVideos: Video[] = [];
      for (const module of modulesData) {
        if(module.id) {
          const videosCollectionRef = collection(db, `courses/${courseId}/modules/${module.id}/videos`);
          const videosSnapshot = await getDocs(videosCollectionRef);
          const moduleVideos = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
          allVideos = [...allVideos, ...moduleVideos];
        }
      }
      const videosOfCurrentModule = allVideos.filter(v => 
          (modulesData.find(m => m.id === moduleId)?.videos as any)?.includes(v.id)
      ).sort((a, b) => a.ordre - b.ordre);

      setVideos(videosOfCurrentModule);
      setVideosLoading(false);
    };
  
    fetchAllVideos();

  }, [courseId, moduleId, modulesData, db]);

  // Enrollment listener
  useEffect(() => {
    if (!user || !db || !courseId) {
        if (!userLoading) setEnrollmentLoading(false);
        return;
    };

    const enrollmentDocRef = doc(db, 'users', user.uid, 'enrollments', courseId);
    
    const unsubscribe = onSnapshot(enrollmentDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setEnrollment(docSnap.data() as Enrollment);
        } else {
            // Auto-enroll user if they visit a course page
            const newEnrollment: Enrollment = {
                studentId: user.uid,
                courseId: courseId,
                courseTitle: course?.titre || 'Titre inconnu',
                enrollmentDate: serverTimestamp() as any,
                progression: 0,
                modules: {},
            };
            setDoc(enrollmentDocRef, newEnrollment).catch(e => console.error("Failed to auto-enroll", e));
        }
        setEnrollmentLoading(false);
    });

    return () => unsubscribe();

  }, [user, userLoading, db, courseId, course?.titre]);

  const sortedModules = useMemo(() => (modulesData || []).sort((a,b) => a.ordre - b.ordre), [modulesData]);
  const sortedVideos = useMemo(() => videos.sort((a,b) => a.ordre - b.ordre), [videos]);
  
  const { currentModule, currentModuleIndex, nextModule, previousModule } = useMemo(() => {
    const currentIndex = sortedModules.findIndex(m => m.id === moduleId);
    if(currentIndex === -1) return { currentModule: null, currentModuleIndex: -1, nextModule: null, previousModule: null };
    return { 
      currentModule: sortedModules[currentIndex], 
      currentModuleIndex: currentIndex, 
      nextModule: sortedModules[currentIndex + 1] || null, 
      previousModule: sortedModules[currentIndex - 1] || null,
    };
  }, [sortedModules, moduleId]);

  const { currentVideoIndex, nextVideo, previousVideo } = useMemo(() => {
    if (!selectedVideo || sortedVideos.length === 0) return { currentVideoIndex: -1, nextVideo: null, previousVideo: null };
    const vidIndex = sortedVideos.findIndex(v => v.id === selectedVideo.id);
    return {
      currentVideoIndex: vidIndex,
      nextVideo: sortedVideos[vidIndex + 1] || null,
      previousVideo: sortedVideos[vidIndex - 1] || null,
    };
  }, [selectedVideo, sortedVideos]);

  // Effect to select first video of the module
  useEffect(() => {
    if (sortedVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(sortedVideos[0]);
    }
  }, [sortedVideos, selectedVideo]);
  
  const videoProgressMap = useMemo(() => {
      if (!enrollment || !enrollment.modules || !enrollment.modules[moduleId]) return {};
      return enrollment.modules[moduleId].videos || {};
  }, [enrollment, moduleId]);

  // Effect to handle seeking to last position
   useEffect(() => {
    if (selectedVideo && playerRef.current && videoProgressMap[selectedVideo.id!]?.lastPosition) {
      const lastPosition = videoProgressMap[selectedVideo.id!]?.lastPosition!;
      playerRef.current.seekTo(lastPosition, 'seconds');
    }
  }, [selectedVideo, videoProgressMap]);

  // Handlers
  const handleProgress = async ({ played, playedSeconds }: { played: number; playedSeconds: number }) => {
    if (!user || !db || !selectedVideo || !enrollment) return;
    const videoId = selectedVideo.id!;
    const videoProg = videoProgressMap[videoId];

    // Mark as watched
    if (played > 0.9 && !videoProg?.watched) {
      await updateVideoProgress(videoId, { watched: true, watchedAt: serverTimestamp() as any });
      toast({ title: "Leçon terminée !", description: `"${selectedVideo.titre}" marquée comme terminée.`});
    }
    
    // Save last position periodically
    if (playedSeconds > 5 && Math.round(playedSeconds) % 10 === 0) {
      await updateVideoProgress(videoId, { lastPosition: playedSeconds });
    }
  };

  const handleVideoEnd = () => {
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
      // Ensure final progress is 100%
      if (enrollment) {
        updateDoc(doc(db, 'users', user!.uid, 'enrollments', courseId), { progression: 100 });
      }
      router.push(`/dashboard/certificates`);
    }
  };
  
  const updateVideoProgress = async (videoId: string, data: Partial<VideoProgress>) => {
      if (!user || !db || !enrollment) return;
      
      const newVideoProgress = { ...videoProgressMap[videoId], ...data };
      const newModulesData = { 
        ...enrollment.modules,
        [moduleId]: {
            ...enrollment.modules?.[moduleId],
            videos: {
                ...enrollment.modules?.[moduleId]?.videos,
                [videoId]: newVideoProgress,
            }
        }
      };

      const watchedCount = Object.values(newModulesData[moduleId].videos).filter(v => v.watched).length;
      const totalVideosInModule = sortedVideos.length;
      const moduleProgress = totalVideosInModule > 0 ? (watchedCount / totalVideosInModule) * 100 : 0;
      newModulesData[moduleId].progress = moduleProgress;
      
      const totalModuleProgress = Object.values(newModulesData).reduce((sum, mod) => sum + (mod.progress || 0), 0);
      const totalModules = sortedModules.length;
      const courseProgress = totalModules > 0 ? (totalModuleProgress / (totalModules * 100)) * 100 : 0;

      await updateDoc(doc(db, 'users', user.uid, 'enrollments', courseId), {
          modules: newModulesData,
          progression: courseProgress
      });
  }

  const handleNext = () => nextVideo && setSelectedVideo(nextVideo);
  const handlePrevious = () => previousVideo && setSelectedVideo(previousVideo);

  const loading = courseLoading || modulesLoading || userLoading || videosLoading || enrollmentLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Chargement du module...</p>
      </div>
    );
  }
  
  if (!courseId || !moduleId || !course || !currentModule || !user) {
    notFound();
  }

  const playerConfig = {
    youtube: {
      playerVars: {
        showinfo: 0,
        rel: 0,
        modestbranding: 1,
      },
    },
    file: {
        attributes: {
            controlsList: 'nodownload',
        }
    }
  };

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
         <div className="w-48 flex flex-col items-center">
            <Progress value={enrollment?.progression || 0} className="h-2 w-full" />
            <p className='text-center text-xs text-muted-foreground mt-1'>
                Progression totale: {Math.round(enrollment?.progression || 0)}%
            </p>
        </div>
       </header>

      <div className="flex-grow flex flex-col md:flex-row">
        <main className="flex-1 p-4 md:p-8">
             <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
             {selectedVideo?.url ? (
                <ReactPlayer
                    ref={playerRef}
                    url={selectedVideo.url}
                    controls
                    width="100%"
                    height="100%"
                    playing={true}
                    onProgress={handleProgress}
                    onEnded={handleVideoEnd}
                    config={playerConfig}
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
                        <Progress value={enrollment?.modules?.[moduleId]?.progress || 0} />
                        <p className='text-center text-sm text-muted-foreground mt-1'>
                            Module: {Math.round(enrollment?.modules?.[moduleId]?.progress || 0)}% terminé
                        </p>
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
                            {videoProgressMap[video.id!]?.watched && (
                                <CheckCircle className='h-5 w-5 text-green-500 flex-shrink-0' />
                            )}
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
