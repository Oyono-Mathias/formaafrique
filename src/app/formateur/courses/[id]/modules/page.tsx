
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, notFound, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
  writeBatch,
  query,
} from 'firebase/firestore';

import { useFirestore, useCollection, useDoc } from '@/firebase';
import type { Course, Module, Video } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, PlusCircle, Video as VideoIcon, Trash2, Edit, PlaySquare, Youtube, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import ReactPlayer from 'react-player';
import { getVideoDetails } from '@/lib/video-utils';
import { Label } from '@/components/ui/label';

const moduleSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit avoir au moins 3 caractères.' }),
  summary: z.string().min(10, { message: 'La description doit avoir au moins 10 caractères.' }),
});

const videoSchema = z.object({
  title: z.string().min(3, 'Titre requis.'),
  driveUrl: z.string().refine(url => getVideoDetails(url) !== null, {
    message: 'URL invalide. Veuillez utiliser un lien YouTube ou Google Drive public.',
  }),
});

// --- Main Page Component ---
export default function ManageModulesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { data: course, loading: courseLoading } = useDoc<Course>('formations', courseId);
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(courseId ? `formations/${courseId}/modules` : null);
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const sortedModules = useMemo(() => (modulesData || []).sort((a, b) => a.order - b.order), [modulesData]);
  
  // --- Forms ---
  const moduleForm = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { title: '', summary: '' },
  });

  const videoForm = useForm<z.infer<typeof videoSchema>>({
    resolver: zodResolver(videoSchema),
    defaultValues: { title: '', driveUrl: '' },
  });

  // --- Effects to reset forms when modals open ---
  useEffect(() => {
    if (editingModule) moduleForm.reset({ title: editingModule.title, summary: editingModule.summary });
    else moduleForm.reset({ title: '', summary: '' });
  }, [editingModule, isModuleModalOpen, moduleForm]);

  useEffect(() => {
    if (editingVideo) videoForm.reset({ title: editingVideo.title, driveUrl: editingVideo.driveUrl });
    else videoForm.reset({ title: '', driveUrl: '' });
  }, [editingVideo, isVideoModalOpen, videoForm]);

  // --- Handlers ---
  const onModuleSubmit = async (values: z.infer<typeof moduleSchema>) => {
    if (!db || !courseId) return;
    try {
      if (editingModule) {
        await updateDoc(doc(db, `formations/${courseId}/modules`, editingModule.id!), values);
        toast({ title: 'Module mis à jour !' });
      } else {
        await addDoc(collection(db, 'formations', courseId, 'modules'), { ...values, order: (sortedModules.length || 0) + 1 });
        toast({ title: 'Module ajouté !' });
      }
      setIsModuleModalOpen(false);
    } catch (e) { console.error(e); toast({ variant: 'destructive', title: 'Erreur' }); }
  };
  
  const onVideoSubmit = async (values: z.infer<typeof videoSchema>) => {
    if (!db || !courseId || !selectedModule?.id) return;
    
    const videoDetails = getVideoDetails(values.driveUrl);
    if (!videoDetails) {
        toast({ variant: "destructive", title: "URL de vidéo invalide" });
        return;
    }

    try {
        const videosCollectionRef = collection(db, `formations/${courseId}/modules/${selectedModule.id}/videos`);
        
        const videoData = {
            title: values.title,
            driveUrl: values.driveUrl, // On sauvegarde l'URL originale
            embedUrl: videoDetails.embedUrl, // Et l'URL d'intégration
            thumbnailUrl: videoDetails.thumbnailUrl, // Et la miniature si elle existe (YouTube)
            platform: videoDetails.platform,
            videoId: videoDetails.id,
            moduleId: selectedModule.id,
        };

        if (editingVideo) {
            await updateDoc(doc(videosCollectionRef, editingVideo.id!), videoData);
            toast({ title: 'Vidéo mise à jour !' });
        } else {
            const videosSnapshot = await getDocs(videosCollectionRef);
            await addDoc(videosCollectionRef, { ...videoData, order: (videosSnapshot.docs.length || 0) + 1 });
            toast({ title: 'Vidéo ajoutée !' });
        }
        
        // Si c'est une vidéo Drive, on pourrait appeler la Cloud Function ici
        if (videoDetails.platform === 'drive' && videoDetails.id) {
            // await processDriveVideo(videoDetails.id, courseId, newVideoDoc.id);
            toast({ title: "Traitement en cours", description: "La vidéo Google Drive est en cours de copie. Cela peut prendre quelques minutes."});
        }
        
        setIsVideoModalOpen(false);
    } catch (e) { console.error(e); toast({ variant: 'destructive', title: 'Erreur' }); }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!db || !courseId || !window.confirm('Voulez-vous vraiment supprimer ce module et toutes ses vidéos ?')) return;
    try {
        const batch = writeBatch(db);
        const videosSnapshot = await getDocs(query(collection(db, `formations/${courseId}/modules/${moduleId}/videos`)));
        videosSnapshot.forEach(doc => batch.delete(doc.ref));
        batch.delete(doc(db, 'formations', courseId, 'modules', moduleId));
        await batch.commit();
        toast({ title: 'Module supprimé' });
    } catch (e) { console.error(e); toast({ variant: 'destructive', title: 'Erreur' }); }
  };

  const openModuleDialog = (module: Module | null = null) => { setEditingModule(module); setIsModuleModalOpen(true); };
  const openVideoDialog = (module: Module, video: Video | null = null) => { setSelectedModule(module); setEditingVideo(video); setIsVideoModalOpen(true); };

  if (courseLoading || modulesLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Chargement...</div>;
  }
  if (!course) return notFound();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <Link href="/formateur/courses" className="flex items-center text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="mr-2 h-4 w-4" />Retour à mes formations</Link>
      <div>
        <h1 className="text-3xl font-bold font-headline">{course.title}</h1>
        <p className="text-muted-foreground">Gérez les modules et les vidéos de votre formation.</p>
      </div>
      <div className="flex justify-between items-center">
        <Link href={`/apercu/${courseId}`} target="_blank"><Button variant="outline"><PlaySquare className="mr-2 h-4 w-4" />Prévisualiser</Button></Link>
        <Button onClick={() => openModuleDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un module</Button>
      </div>

      <div className="space-y-6">
        {sortedModules.length > 0 ? (
          sortedModules.map(module => (
            <Card key={module.id}>
              <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div><CardTitle>{module.title}</CardTitle><CardDescription>{module.summary}</CardDescription></div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => openModuleDialog(module)}><Edit className="mr-2 h-4 w-4" /> Modifier</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteModule(module.id!)}><Trash2 className="mr-2 h-4 w-4" /> Supprimer</Button>
                  <Button size="sm" onClick={() => openVideoDialog(module)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter Vidéo</Button>
                </div>
              </CardHeader>
              <CardContent><ModuleVideos courseId={courseId} module={module} onEditVideo={(video) => openVideoDialog(module, video)} /></CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg"><p>Aucun module pour cette formation.</p></div>
        )}
      </div>

      <ModuleDialog isOpen={isModuleModalOpen} setIsOpen={setIsModuleModalOpen} form={moduleForm} onSubmit={onModuleSubmit} isEditing={!!editingModule} />
      <VideoUploader isOpen={isVideoModalOpen} setIsOpen={setIsVideoModalOpen} form={videoForm} onSubmit={onVideoSubmit} isEditing={!!editingVideo} moduleTitle={selectedModule?.title || ''} />
    </div>
  );
}

// --- VideoUploader Component ---
function VideoUploader({ isOpen, setIsOpen, form, onSubmit, isEditing, moduleTitle }: any) {
  const rawVideoUrl = form.watch('driveUrl');
  const videoDetails = getVideoDetails(rawVideoUrl);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier la vidéo' : `Ajouter une vidéo à "${moduleTitle}"`}</DialogTitle>
          <DialogDescription>Collez l'URL de votre vidéo (YouTube, Google Drive, etc.). Elle sera prévisualisée ci-dessous.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre de la vidéo</FormLabel><FormControl><Input {...field} placeholder="Ex: Les bases du bilan" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="driveUrl" render={({ field }) => (<FormItem><FormLabel>URL de la vidéo</FormLabel><FormControl><Input {...field} placeholder="https://www.youtube.com/watch?v=..." /></FormControl><FormMessage /></FormItem>)} />
            
            {videoDetails && (
              <div className="space-y-4">
                <Label>Prévisualisation</Label>
                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                  <ReactPlayer url={videoDetails.embedUrl} controls width="100%" height="100%" />
                </div>
                 <div className="flex items-center justify-between gap-4">
                  {videoDetails.platform === 'youtube' && (
                    <Button asChild variant="secondary" size="sm">
                        <Link href={`https://www.youtube.com/watch?v=${videoDetails.id}`} target="_blank">
                            <Youtube className='mr-2 h-4 w-4 text-red-500'/> S'abonner sur YouTube
                        </Link>
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" className='bg-red-500 hover:bg-red-600' asChild>
                    <Link href="/donate">
                      <Heart className='mr-2 h-4 w-4'/> Faire un don
                    </Link>
                  </Button>
                 </div>
              </div>
            )}
            
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditing ? 'Enregistrer' : 'Ajouter'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// --- ModuleVideos (sub-component) ---
function ModuleVideos({ courseId, module, onEditVideo }: { courseId: string; module: Module; onEditVideo: (video: Video) => void; }) {
  const { data: videosData, loading } = useCollection<Video>(`formations/${courseId}/modules/${module.id!}/videos`);
  const db = useFirestore();
  const { toast } = useToast();
  const sortedVideos = useMemo(() => (videosData || []).sort((a, b) => a.order - b.order), [videosData]);

  const handleDeleteVideo = async (videoId: string) => {
    if (!db || !window.confirm('Voulez-vous vraiment supprimer cette vidéo ?')) return;
    try {
      await deleteDoc(doc(db, `formations/${courseId}/modules/${module.id!}/videos`, videoId));
      toast({ title: 'Vidéo supprimée !' });
    } catch (e) { console.error(e); toast({ variant: 'destructive', title: 'Erreur' }); }
  };
  
  if (loading) return <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Chargement...</div>;

  return (
    <div>
      <h4 className="font-semibold mb-2 text-muted-foreground">Vidéos ({sortedVideos.length})</h4>
      {sortedVideos.length > 0 ? (
        <div className="space-y-2">
          {sortedVideos.map(video => (
            <div key={video.id} className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
              <div className="flex items-center gap-3"><VideoIcon className="h-5 w-5 text-primary" /><p className="font-medium text-sm">{video.title}</p></div>
              <div className="flex gap-2 items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditVideo(video)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteVideo(video.id!)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-muted-foreground">Aucune vidéo dans ce module.</p>}
    </div>
  );
}

// Dialog for adding/editing a module
function ModuleDialog({ isOpen, setIsOpen, form, onSubmit, isEditing }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEditing ? 'Modifier le module' : 'Nouveau module'}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="summary" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
