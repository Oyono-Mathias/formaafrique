'use client';

import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { Loader2, Video, User, Lock, Bell, HelpCircle, Share2, BarChart2, Download, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import EditProfileDialog from '@/components/dashboard/edit-profile-dialog';
import { cn } from '@/lib/utils';

const SettingsItem = ({ icon: Icon, title, description, action, onClick, href }: { icon: React.ElementType, title: string, description: string, action?: React.ReactNode, onClick?: () => void, href?: string }) => {
    const content = (
        <div onClick={onClick} className={cn("flex items-center justify-between py-3", (onClick || href) && "cursor-pointer")}>
            <div className="flex items-center gap-4">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            {action}
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>
    }

    return content;
};


export default function SettingsPage() {
  const { user, userProfile, loading } = useUser();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  if (loading || !user || !userProfile) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement...</div>;
  }
  
  const photoUrl = userProfile?.photoURL || user?.photoURL;
  const userName = userProfile?.name || user?.displayName || 'Utilisateur';
  const userEmail = user?.email || 'Email non disponible';

  return (
    <>
      <div className="space-y-8">
        
        <Card className="shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 text-center flex flex-col items-center">
              <Avatar className="w-24 h-24 text-3xl mb-4">
                  {photoUrl && <AvatarImage src={photoUrl} alt={userName} />}
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h1 className='text-2xl font-bold'>{userName}</h1>
              <p className='text-muted-foreground'>{userEmail}</p>
          </CardContent>
           <CardFooter className="p-3 bg-muted/50 justify-center">
                <Button variant="outline" asChild>
                    <Link href="/devenir-formateur">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Devenir Formateur
                    </Link>
                </Button>
            </CardFooter>
        </Card>

        <div className="space-y-4">
          {/* Section Préférences Vidéo */}
          <h2 className='font-bold text-lg'>Préférences vidéo</h2>
          <Card>
              <CardContent className='divide-y p-4'>
                  <SettingsItem 
                      icon={Download}
                      title="Options de téléchargement"
                      description="Gérer la qualité et l'espace de stockage"
                      href="/dashboard/settings/download-options"
                      action={<Button variant="outline" size="sm">Gérer</Button>}
                  />
                   <SettingsItem 
                      icon={Video}
                      title="Options de lecture vidéo"
                      description="Gérez l'arrière-plan et la lecture auto."
                      href="/dashboard/settings/video-playback"
                      action={<Button variant="outline" size="sm">Gérer</Button>}
                  />
              </CardContent>
          </Card>

           {/* Section Paramètres du compte */}
          <h2 className='font-bold text-lg mt-6'>Paramètres du compte</h2>
          <Card>
              <CardContent className='divide-y p-4'>
                   <SettingsItem 
                      icon={User}
                      title="Modifier le profil"
                      description="Changez votre nom, pays, et biographie."
                      onClick={() => setIsProfileDialogOpen(true)}
                      action={<Button variant="outline" size="sm">Modifier</Button>}
                  />
                  <SettingsItem 
                      icon={Lock}
                      title="Sécurité du compte"
                      description="Changez votre mot de passe."
                      action={<Button variant="outline" size="sm">Modifier</Button>}
                  />
                  <SettingsItem 
                      icon={Bell}
                      title="Préférences de notification"
                      description="Gérez les e-mails et notifications."
                       action={<Button variant="outline" size="sm">Gérer</Button>}
                  />
                   <SettingsItem 
                      icon={Bell}
                      title="Rappel d'apprentissage"
                      description="Notifications pour vous motiver."
                      action={<Switch id="learning-reminder" defaultChecked />}
                  />
              </CardContent>
          </Card>

          {/* Section Aide et support */}
          <h2 className='font-bold text-lg mt-6'>Aide et support</h2>
          <Card>
               <CardContent className='divide-y p-4'>
                    <SettingsItem 
                        icon={HelpCircle}
                        title="En savoir plus sur FormaAfrique"
                        description="Découvrez notre mission et notre vision."
                        href="/about"
                        action={<Button variant="outline" size="sm">Visiter</Button>}
                    />
                    <SettingsItem 
                        icon={HelpCircle}
                        title="Foire aux questions"
                        description="Trouvez des réponses à vos questions."
                        href="/contact"
                        action={<Button variant="outline" size="sm">Consulter</Button>}
                    />
                   <SettingsItem 
                      icon={Share2}
                      title="Partager l'application"
                      description="Aidez-nous à faire connaître FormaAfrique."
                      action={<Button variant="outline" size="sm">Partager</Button>}
                  />
              </CardContent>
          </Card>

          {/* Section Diagnostic */}
          <h2 className='font-bold text-lg mt-6'>Diagnostic</h2>
          <Card>
              <CardContent className='divide-y p-4'>
                  <SettingsItem 
                      icon={BarChart2}
                      title="Statut"
                      description="Vérifiez l'état des services de FormaAfrique."
                      action={<div className='flex items-center gap-2'><div className='h-2 w-2 rounded-full bg-green-500'></div><span className='text-sm text-muted-foreground'>Opérationnel</span></div>}
                  />
              </CardContent>
          </Card>
        </div>
      </div>
      
      {userProfile && user && (
        <EditProfileDialog
          isOpen={isProfileDialogOpen}
          setIsOpen={setIsProfileDialogOpen}
          userProfile={userProfile}
          userId={user.uid}
        />
      )}
    </>
  );
}
