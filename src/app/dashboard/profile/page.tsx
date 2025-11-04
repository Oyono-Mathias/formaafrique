'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import type { UserProfile, CourseProgress } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Trash2, PlusCircle, X } from 'lucide-react';
import EditProfileDialog from '@/components/dashboard/edit-profile-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? 'users' : null, user?.uid || '');
  const { data: courseProgress, loading: progressLoading } = useCollection<CourseProgress>(user ? `users/${user.uid}/progress` : '');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const db = useFirestore();
  const { toast } = useToast();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });

      // Update Firebase Auth profile
      await updateProfile(user, { photoURL: downloadURL });

      toast({
        title: "Photo de profil mise à jour",
        description: "Votre nouvelle photo est maintenant visible.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Erreur de téléversement",
        description: "Impossible de mettre à jour votre photo de profil.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSkill = async () => {
    if (newSkill.trim() === '' || !userProfile || !db || !user) return;
    const updatedSkills = [...(userProfile.skills || []), newSkill.trim()];
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, { skills: updatedSkills });
      setNewSkill('');
      toast({ title: "Compétence ajoutée !" });
    } catch (error) {
      console.error("Error adding skill:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'ajouter la compétence." });
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!userProfile || !db || !user) return;
    const updatedSkills = (userProfile.skills || []).filter(skill => skill !== skillToRemove);
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, { skills: updatedSkills });
      toast({ title: "Compétence supprimée" });
    } catch (error) {
      console.error("Error removing skill:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la compétence." });
    }
  };


  if (profileLoading || userLoading || !user) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement du profil...</div>;
  }

  const userEmail = user?.email || userProfile?.email || 'Non disponible';
  const photoUrl = userProfile?.photoURL || user?.photoURL;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground mt-2">Gérez les informations de votre compte pour personnaliser votre expérience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-md rounded-2xl overflow-hidden">
                <CardContent className="p-6 text-center flex flex-col items-center">
                    <div className="relative group w-32 h-32">
                        <Avatar className="w-full h-full text-4xl">
                            {photoUrl && <AvatarImage src={photoUrl} alt={userProfile?.name} />}
                            <AvatarFallback>{userProfile?.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute inset-0 w-full h-full bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300 flex items-center justify-center"
                            onClick={handleAvatarClick}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="animate-spin" /> : <Camera />}
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/png, image/jpeg"
                        />
                    </div>
                    <h2 className='text-2xl font-bold mt-4'>{userProfile?.name}</h2>
                    <p className='text-muted-foreground'>{userEmail}</p>
                    <Button onClick={() => setIsDialogOpen(true)} className="mt-4 w-full">Modifier le profil</Button>
                </CardContent>
            </Card>

             <Card className="shadow-md rounded-2xl">
                <CardHeader>
                    <CardTitle>Bio</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">{userProfile?.bio || "Ajoutez une courte biographie pour vous présenter."}</p>
                </CardContent>
             </Card>
        </div>
        
        {/* Right Column - Skills & History */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-md rounded-2xl">
                <CardHeader>
                    <CardTitle>Mes compétences</CardTitle>
                    <CardDescription>Mettez en valeur vos talents et expertises.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {userProfile?.skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-base py-1 px-3 flex items-center gap-2">
                            {skill}
                            <button onClick={() => handleRemoveSkill(skill)} className="rounded-full hover:bg-destructive/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Ajouter une compétence..." 
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                        />
                        <Button onClick={handleAddSkill}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-md rounded-2xl">
                <CardHeader>
                    <CardTitle>Historique d'apprentissage</CardTitle>
                    <CardDescription>Suivez la progression de toutes vos formations.</CardDescription>
                </CardHeader>
                <CardContent>
                  {progressLoading ? (
                     <div className="flex items-center justify-center h-24"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement...</div>
                  ): courseProgress.length > 0 ? (
                    <div className="space-y-4">
                        {courseProgress.map(progress => (
                            <div key={progress.id} className="space-y-2">
                                <p className="font-medium">{progress.courseTitle}</p>
                                <div className="flex items-center gap-4">
                                  <Progress value={progress.progressPercentage} className="flex-grow" />
                                  <span className="text-sm font-semibold text-primary">{progress.progressPercentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">Aucune formation commencée pour le moment.</p>
                  )}
                </CardContent>
            </Card>

            <Card className="border-destructive shadow-md rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-destructive">Zone de danger</CardTitle>
                    <CardDescription>Ces actions sont irréversibles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer mon compte
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
      
      {userProfile && (
        <EditProfileDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            userProfile={userProfile}
            userId={user.uid}
        />
      )}
    </div>
  );
}
