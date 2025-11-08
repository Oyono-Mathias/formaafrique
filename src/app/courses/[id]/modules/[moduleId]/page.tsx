'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, CheckCircle, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { use } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useDoc, useCollection } from '@/firebase';
import type { Course, Module, Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useMemo, useState, useEffect } from 'react';

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

  const { data: course, loading: courseLoading } = useDoc<Course>('courses', courseId);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(
    courseId ? `courses/${courseId}/modules` : null
  );

  const [videosByModule, setVideosByModule] = useState<Record<string, Video[]>>({});
  const [videosLoading, setVideosLoading] = useState(true);
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Fetch videos for all modules once
  useEffect(() => {
    if (!modulesData || modulesData.length === 0 || !courseId) {
      setVideosLoading(false);
      return;
    }

    const fetchAllVideos = async () => {
      setVideosLoading(true);
      const allVideos: Record<string, Video[]> = {};
      for (const module of modulesData) {
        if (module.id) {
          const videosCollection = `courses/${courseId}/modules/${module.id}/videos`;
          
          try {
             // We can't use useCollection in a loop, so we fetch manually.
            const response = await fetch(`/api/get-collection?path=${encodeURIComponent(videosCollection)}`);
             if (response.ok) {
                const videos = (await response.json()) as Video[];
                // Filter for published videos and sort them
                allVideos[module.id] = videos.filter(v => v.publie).sort((a, b) => a.ordre - b.ordre);
            } else {
                allVideos[module.id] = [];
            }
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
  }, [modulesData, courseId]);


  const { sortedModulesWithVideos, currentModule, currentModuleIndex } = useMemo(() => {
    const sortedMods = (modulesData || []).sort((a, b) => a.ordre - b.ordre);
    const modsWithVideos = sortedMods.map(mod => ({
      ...mod,
      videos: videosByModule[mod.id!] || []
    }));
    const currentIndex = modsWithVideos.findIndex(m => m.id === moduleId);
    return { 
        sortedModulesWithVideos: modsWithVideos, 
        currentModule: modsWithVideos[currentIndex],
        currentModuleIndex: currentIndex
    };
  }, [modulesData, videosByModule, moduleId]);


  // Effect to select the first video of the current module by default
  useEffect(() => {
    if (currentModule && currentModule.videos.length > 0) {
      setSelectedVideo(currentModule.videos[0]);
    } else {
      setSelectedVideo(null); // No videos in this module
    }
  }, [currentModule]);


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
    // Update URL without full page reload if module is different
    if(module.id !== moduleId) {
        router.push(`/courses/${courseId}/modules/${module.id}`, { scroll: false });
    }
  };

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    let videoId: string | null = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.hostname.includes('youtu.be')
          ? urlObj.pathname.slice(1)
          : urlObj.searchParams.get('v');
        
        if (videoId) {
          const searchParams = new URLSearchParams({
            rel: '0',
            showinfo: '0',
            modestbranding: '1',
            iv_load_policy: '3',
            autoplay: '1'
          });
          return `https://www.youtube.com/embed/${videoId}?${searchParams.toString()}`;
        }
      } else if (urlObj.hostname.includes('drive.google.com')) {
        const match = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
        return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
      }
      return url; // Fallback for other video providers or direct links
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  };
  
  const embedUrl = selectedVideo ? getEmbedUrl(selectedVideo.url) : null;

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
