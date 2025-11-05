'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import type { Course, Module, Video } from '@/lib/types';
import { Loader2, ArrowLeft, PlusCircle, Video as VideoIcon, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const moduleSchema = z.object({
  titre: z.string().min(3, { message: 'Le titre doit avoir au moins 3 caractères.' }),
  description: z.string().min(10, { message: 'La description doit avoir au moins 10 caractères.' }),
});

const videoSchema = z.object({
    titre: z.string().min(3, "Titre requis."),
    url: z.string().url("URL de vidéo valide requise."),
});

export default function ManageModulesPage({ params }: { params: { id: string } }) {
  const { data: course, loading: courseLoading } = useDoc<Course>('courses', params.id);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(`courses/${params.id}/modules`);
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  // This state will hold the videos for the selected module
  const { data: videosData, loading: videosLoading } = useCollection<Video>(
    selectedModule ? `courses/${params.id}/modules/${selectedModule.id}/videos` : null
  );

  const sortedModules = useMemo(() => {
    return (modulesData || []).sort((a, b) => a.ordre - b.ordre);
  }, [modulesData]);

  const sortedVideos = useMemo(() => {
    return (videosData || []).sort((a,b) => a.ordre - b.ordre);
  }, [videosData]);

  const moduleForm = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { titre: '', description: '' },
  });

  const videoForm = useForm<z.infer<typeof videoSchema>>({
    resolver: zodResolver(videoSchema),
    defaultValues: { titre: '', url: '' },
  });

  useEffect(() => {
    if(selectedModule) {
      moduleForm.reset({
        titre: selectedModule.titre,
        description: selectedModule.description,
      });
    } else {
      moduleForm.reset({ titre: '', description: '' });
    }
  }, [selectedModule, isModuleModalOpen, moduleForm]);

  async function onModuleSubmit(values: z.infer<typeof moduleSchema>) {
    if (!db || !course?.id) return;
    
    try {
      if (selectedModule) {
        // Update existing module
        const moduleRef = doc(db, `courses/${course.id}/modules`, selectedModule.id!);
        await updateDoc(moduleRef, values);
        toast({ title: 'Module mis à jour !' });
      } else {
        // Create new module
        const modulesCollectionRef = collection(db, 'courses', course.id, 'modules');
        await addDoc(modulesCollectionRef, {
          ...values,
          ordre: (sortedModules.length || 0) + 1,
          videos: [] // Videos will be in a subcollection
        });
        toast({ title: 'Module ajouté !' });
      }
      setIsModuleModalOpen(false);
    } catch (error) {
      console.error("Error saving module:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'enregistrer le module." });
    }
  }

  async function onVideoSubmit(values: z.infer<typeof videoSchema>) {
    if (!db || !course?.id || !selectedModule?.id) return;

    try {
        const videosCollectionRef = collection(db, `courses/${course.id}/modules/${selectedModule.id}/videos`);
        await addDoc(videosCollectionRef, {
            ...values,
            ordre: (sortedVideos.length || 0) + 1,
        });
        toast({ title: "Vidéo ajoutée !" });
        videoForm.reset();
        setIsVideoModalOpen(false);
    } catch(error) {
         console.error("Error adding video:", error);
         toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'ajouter la vidéo." });
    }
  }
  
  const openVideoDialog = (module: Module) => {
    setSelectedModule(module);
    setIsVideoModalOpen(true);
  }

  if (courseLoading || modulesLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Chargement...</div>;
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <Link href="/formateur/courses" className="flex items-center text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à mes formations
      </Link>

      <div>
        <h1 className="text-3xl font-bold font-headline">{course.titre}</h1>
        <p className="text-muted-foreground">Gérez les modules et les vidéos de votre formation.</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => { setSelectedModule(null); setIsModuleModalOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un module
        </Button>
      </div>
      
      <div className="space-y-6">
        {sortedModules.length > 0 ? sortedModules.map(module => (
            <Card key={module.id}>
                <CardHeader className='flex-row justify-between items-start'>
                    <div>
                        <CardTitle>{module.titre}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant="outline" onClick={() => {setSelectedModule(module); setIsModuleModalOpen(true)}}>Modifier</Button>
                        <Button onClick={() => openVideoDialog(module)}>
                            <PlusCircle className='mr-2 h-4 w-4'/> Ajouter Vidéo
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                  <ModuleVideos courseId={params.id} moduleId={module.id} />
                </CardContent>
            </Card>
        )) : (
             <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <p className='font-semibold'>Aucun module pour cette formation.</p>
                <p className="text-sm">Cliquez sur "Ajouter un module" pour commencer.</p>
            </div>
        )}
      </div>

      {/* Module Dialog */}
      <Dialog open={isModuleModalOpen} onOpenChange={setIsModuleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedModule ? 'Modifier le module' : 'Ajouter un nouveau module'}</DialogTitle>
          </DialogHeader>
          <Form {...moduleForm}>
            <form onSubmit={moduleForm.handleSubmit(onModuleSubmit)} className='space-y-4 py-4'>
               <FormField control={moduleForm.control} name="titre" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du module</FormLabel>
                    <FormControl><Input {...field} placeholder="Ex: Introduction à la comptabilité" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={moduleForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea {...field} placeholder="Que vont apprendre les étudiants ?" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                  <Button type="submit" disabled={moduleForm.formState.isSubmitting}>
                    {moduleForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer
                  </Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Video Dialog */}
       <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une vidéo à "{selectedModule?.titre}"</DialogTitle>
             <DialogDescription>Entrez les détails de la vidéo ci-dessous.</DialogDescription>
          </DialogHeader>
          <Form {...videoForm}>
            <form onSubmit={videoForm.handleSubmit(onVideoSubmit)} className='space-y-4 py-4'>
               <FormField control={videoForm.control} name="titre" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de la vidéo</FormLabel>
                    <FormControl><Input {...field} placeholder="Ex: Les bases du bilan" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={videoForm.control} name="url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la vidéo (YouTube/Google Drive)</FormLabel>
                    <FormControl><Input {...field} placeholder="https://www.youtube.com/watch?v=..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                  <Button type="submit" disabled={videoForm.formState.isSubmitting}>
                    {videoForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ajouter la vidéo
                  </Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


function ModuleVideos({ courseId, moduleId }: { courseId: string; moduleId: string }) {
    const { data: videos, loading, error } = useCollection<Video>(`courses/${courseId}/modules/${moduleId}/videos`);
    const db = useFirestore();
    const {toast} = useToast();

    const sortedVideos = useMemo(() => {
        return (videos || []).sort((a,b) => a.ordre - b.ordre);
    }, [videos]);

    const handleDeleteVideo = async (videoId: string) => {
        if(!db) return;
        const videoRef = doc(db, `courses/${courseId}/modules/${moduleId}/videos`, videoId);
        try {
            await deleteDoc(videoRef);
            toast({title: "Vidéo supprimée !"})
        } catch(e) {
            toast({variant: 'destructive', title: "Erreur", description: "Impossible de supprimer la vidéo."})
        }
    }

    if (loading) return <div className='flex items-center text-sm text-muted-foreground'><Loader2 className='mr-2 h-4 w-4 animate-spin'/>Chargement des vidéos...</div>
    if (error) return <div className='text-destructive text-sm'>Erreur de chargement des vidéos.</div>

    return (
        <div>
            <h4 className='font-semibold mb-2'>Vidéos du module ({sortedVideos.length})</h4>
            {sortedVideos.length > 0 ? (
                 <div className="space-y-2">
                  {sortedVideos.map(video => (
                    <div key={video.id} className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                         <GripVertical className='h-5 w-5 text-muted-foreground cursor-grab'/>
                         <VideoIcon className="h-5 w-5 text-primary"/>
                         <p className="font-medium text-sm">{video.titre}</p>
                      </div>
                      <div className='flex gap-2'>
                        {/* <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button> */}
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDeleteVideo(video.id!)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
            ): (
                <p className='text-sm text-muted-foreground'>Aucune vidéo dans ce module.</p>
            )}
        </div>
    )
}
