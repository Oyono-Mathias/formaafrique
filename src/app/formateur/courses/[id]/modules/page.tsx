'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
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
} from 'firebase/firestore';

import { useFirestore, useCollection, useDoc } from '@/firebase';
import type { Course, Module, Video } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Loader2,
  PlusCircle,
  Video as VideoIcon,
  Trash2,
  Edit,
  PlaySquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const moduleSchema = z.object({
  titre: z
    .string()
    .min(3, { message: 'Le titre doit avoir au moins 3 caractères.' }),
  description: z
    .string()
    .min(10, { message: 'La description doit avoir au moins 10 caractères.' }),
});

const videoSchema = z.object({
  titre: z.string().min(3, 'Titre requis.'),
  url: z.string().url('URL de vidéo valide requise.'),
});

async function isValidVideoUrl(url: string) {
    try {
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        // no-cors returns an opaque response, but a successfull fetch means the URL is likely reachable
        return true;
    } catch (error) {
        console.warn("URL validation failed:", error);
        return false;
    }
}


export default function ManageModulesPage({
  params,
}: {
  params: { id: string };
}) {
  const courseId = params?.id;
  
  const { data: course, loading: courseLoading } = useDoc<Course>(
    'courses',
    courseId
  );
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>(
    courseId ? `courses/${courseId}/modules` : null
  );
  const db = useFirestore();
  const { toast } = useToast();

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const sortedModules = useMemo(() => {
    return (modulesData || []).sort((a, b) => a.ordre - b.ordre);
  }, [modulesData]);

  const moduleForm = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { titre: '', description: '' },
  });

  const videoForm = useForm<z.infer<typeof videoSchema>>({
    resolver: zodResolver(videoSchema),
    defaultValues: { titre: '', url: '' },
  });

  useEffect(() => {
    if (isModuleModalOpen) {
      if (editingModule) {
        moduleForm.reset({
          titre: editingModule.titre,
          description: editingModule.description,
        });
      } else {
        moduleForm.reset({ titre: '', description: '' });
      }
    }
  }, [editingModule, isModuleModalOpen, moduleForm]);

  useEffect(() => {
    if (isVideoModalOpen) {
      if (editingVideo) {
        videoForm.reset({
          titre: editingVideo.titre,
          url: editingVideo.url,
        });
      } else {
        videoForm.reset({ titre: '', url: '' });
      }
    }
  }, [editingVideo, isVideoModalOpen, videoForm]);

  async function onModuleSubmit(values: z.infer<typeof moduleSchema>) {
    if (!db || !courseId) return;

    try {
      if (editingModule) {
        // Update existing module
        const moduleRef = doc(db, `courses/${courseId}/modules`, editingModule.id!);
        await updateDoc(moduleRef, values);
        toast({ title: 'Module mis à jour !' });
      } else {
        // Create new module
        const modulesCollectionRef = collection(db, 'courses', courseId, 'modules');
        await addDoc(modulesCollectionRef, {
          ...values,
          ordre: (sortedModules.length || 0) + 1,
        });
        toast({ title: 'Module ajouté !' });
      }
      setIsModuleModalOpen(false);
      setEditingModule(null);
    } catch (error) {
      console.error('Error saving module:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'enregistrer le module.",
      });
    }
  }

  async function onVideoSubmit(values: z.infer<typeof videoSchema>) {
    if (!db || !courseId || !selectedModule?.id) return;
    
    const isUrlValid = await isValidVideoUrl(values.url);
    if (!isUrlValid) {
        toast({
            variant: 'destructive',
            title: 'URL de vidéo invalide',
            description: "Le lien de la vidéo est invalide ou inaccessible. Veuillez vérifier et réessayer.",
        });
        return;
    }


    try {
      const videosCollectionRef = collection(
        db,
        `courses/${courseId}/modules/${selectedModule.id}/videos`
      );
      
      const videosSnapshot = await getDocs(videosCollectionRef);
      const nextOrder = (videosSnapshot.docs.length || 0) + 1;


      if (editingVideo) {
        const videoRef = doc(db, `courses/${courseId}/modules/${selectedModule.id}/videos`, editingVideo.id!);
        await updateDoc(videoRef, values);
        toast({ title: 'Vidéo mise à jour !' });
      } else {
        await addDoc(videosCollectionRef, {
          ...values,
          ordre: nextOrder,
          publie: false,
        });
        toast({ title: 'Vidéo ajoutée !' });
      }
      videoForm.reset();
      setIsVideoModalOpen(false);
      setEditingVideo(null);
    } catch (error) {
      console.error('Error adding video:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'ajouter la vidéo.",
      });
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!db || !courseId) return;
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer ce module et toutes ses vidéos ?'
    );
    if (!confirmed) return;

    const moduleRef = doc(db, `courses/${courseId}/modules`, moduleId);
    try {
      await deleteDoc(moduleRef);
      toast({ title: 'Module supprimé' });
    } catch (error) {
      console.error('Error deleting module:', error);
      toast({ variant: 'destructive', title: 'Erreur de suppression' });
    }
  };

  const openVideoDialog = (module: Module, video: Video | null = null) => {
    setSelectedModule(module);
    setEditingVideo(video);
    setIsVideoModalOpen(true);
  };

  const openModuleDialog = (module: Module | null = null) => {
    setEditingModule(module);
    setIsModuleModalOpen(true);
  };

  if (!courseId) {
    return (
        <div className="p-8 text-center text-destructive">
            <h1 className='text-2xl font-bold'>Erreur : ID de formation manquant</h1>
            <p className='mt-2'>Impossible de charger les modules car l'identifiant de la formation n'a pas été trouvé dans l'URL.</p>
             <Button asChild className='mt-4'>
                <Link href="/formateur/courses">Retour à mes formations</Link>
            </Button>
        </div>
    );
  }

  if (courseLoading || modulesLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Chargement...
      </div>
    );
  }

  if (!course) {
    return notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <Link
        href="/formateur/courses"
        className="flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à mes formations
      </Link>

      <div>
        <h1 className="text-3xl font-bold font-headline">{course.titre}</h1>
        <p className="text-muted-foreground">
          Gérez les modules et les vidéos de votre formation.
        </p>
      </div>

       <div className="flex justify-between items-center">
        <Link href={`/apercu/${courseId}`} target="_blank" className='text-sm'>
            <Button variant="outline">
                <PlaySquare className="mr-2 h-4 w-4" />
                Prévisualiser comme étudiant
            </Button>
        </Link>

        <Button onClick={() => openModuleDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un module
        </Button>
      </div>

      <div className="space-y-6">
        {sortedModules.length > 0 ? (
          sortedModules.map((module) => (
            <Card key={module.id}>
              <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <CardTitle>{module.titre}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModuleDialog(module)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Modifier Module
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteModule(module.id!)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer Module
                  </Button>
                  <Button size="sm" onClick={() => openVideoDialog(module)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Vidéo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ModuleVideos
                  courseId={courseId}
                  moduleId={module.id!}
                  onEditVideo={(video) => openVideoDialog(module, video)}
                />
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
            <p className="font-semibold">Aucun module pour cette formation.</p>
            <p className="text-sm">
              Cliquez sur "Ajouter un module" pour commencer.
            </p>
          </div>
        )}
      </div>

      {/* Module Dialog */}
      <Dialog open={isModuleModalOpen} onOpenChange={setIsModuleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Modifier le module' : 'Ajouter un nouveau module'}
            </DialogTitle>
          </DialogHeader>
          <Form {...moduleForm}>
            <form
              onSubmit={moduleForm.handleSubmit(onModuleSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={moduleForm.control}
                name="titre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du module</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Introduction à la comptabilité"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={moduleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Que vont apprendre les étudiants ?"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Annuler
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={moduleForm.formState.isSubmitting}
                >
                  {moduleForm.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <VideoDialog
        isOpen={isVideoModalOpen}
        setIsOpen={setIsVideoModalOpen}
        form={videoForm}
        onSubmit={onVideoSubmit}
        isEditing={!!editingVideo}
        moduleTitle={selectedModule?.titre || ''}
      />
    </div>
  );
}

function VideoDialog({ isOpen, setIsOpen, form, onSubmit, isEditing, moduleTitle }: any) {
  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        let videoId = null;
        if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('drive.google.com')) {
            const match = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
            return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
        }
        
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (error) {
        return null;
    }
  };

  const urlValue = form.watch('url');
  const embedUrl = getEmbedUrl(urlValue);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Modifier la vidéo'
              : `Ajouter une vidéo à "${moduleTitle}"`}
          </DialogTitle>
          <DialogDescription>
            Entrez les détails de la vidéo ci-dessous. Collez un lien YouTube ou Google Drive pour voir un aperçu.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la vidéo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Les bases du bilan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la vidéo (YouTube, G-Drive)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://www.youtube.com/watch?v=..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {embedUrl && (
              <div className="space-y-2">
                <Label>Prévisualisation</Label>
                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                  <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    title="Prévisualisation de la vidéo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}


            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Enregistrer les modifications' : 'Ajouter la vidéo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


function ModuleVideos({
  courseId,
  moduleId,
  onEditVideo,
}: {
  courseId: string;
  moduleId: string;
  onEditVideo: (video: Video) => void;
}) {
  const { data: videosData, loading, error } = useCollection<Video>(
    courseId && moduleId ? `courses/${courseId}/modules/${moduleId}/videos` : null
  );
  const db = useFirestore();
  const { toast } = useToast();

  const sortedVideos = useMemo(() => {
    const videos = videosData || [];
    return videos.sort((a, b) => a.ordre - b.ordre);
  }, [videosData]);

  const handleDeleteVideo = async (videoId: string) => {
    if (!db || !courseId || !moduleId) return;
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette vidéo ?'
    );
    if (!confirmed) return;
    const videoRef = doc(
      db,
      `courses/${courseId}/modules/${moduleId}/videos`,
      videoId
    );
    try {
      await deleteDoc(videoRef);
      toast({ title: 'Vidéo supprimée !' });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de supprimer la vidéo.",
      });
    }
  };

  const handlePublishToggle = async (video: Video) => {
    if (!db || !courseId || !moduleId) return;
    const videoRef = doc(db, `courses/${courseId}/modules/${moduleId}/videos`, video.id!);
    try {
      await updateDoc(videoRef, { publie: !video.publie });
      toast({
        title: `Vidéo ${video.publie ? 'dépubliée' : 'publiée'}`,
        description: `Le statut de la vidéo "${video.titre}" a été mis à jour.`
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de changer le statut de la vidéo.",
      });
    }
  };


  if (loading)
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement des vidéos...
      </div>
    );
  if (error)
    return (
      <div className="text-destructive text-sm">
        Erreur de chargement des vidéos.
      </div>
    );

  return (
    <div>
      <h4 className="font-semibold mb-2 text-muted-foreground">
        Vidéos du module ({sortedVideos.length})
      </h4>
      {sortedVideos.length > 0 ? (
        <div className="space-y-2">
          {sortedVideos.map((video) => (
            <div
              key={video.id}
              className="flex items-center justify-between rounded-md border bg-muted/50 p-3"
            >
              <div className="flex items-center gap-3">
                <VideoIcon className="h-5 w-5 text-primary" />
                <p className="font-medium text-sm">{video.titre}</p>
                 <Badge variant={video.publie ? 'default' : 'secondary'}>
                  {video.publie ? 'Publiée' : 'Brouillon'}
                </Badge>
              </div>
              <div className="flex gap-2 items-center">
                 <div className="flex items-center space-x-2">
                    <Switch
                        id={`publish-${video.id}`}
                        checked={video.publie}
                        onCheckedChange={() => handlePublishToggle(video)}
                    />
                    <Label htmlFor={`publish-${video.id}`} className="text-sm">Publier</Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEditVideo(video)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteVideo(video.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucune vidéo dans ce module.
        </p>
      )}
    </div>
  );
}
