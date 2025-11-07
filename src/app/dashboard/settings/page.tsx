
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { Loader2, Video, User, Lock, Bell, HelpCircle, Share2, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const SettingsItem = ({ icon: Icon, title, description, action }: { icon: React.ElementType, title: string, description: string, action?: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3">
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


export default function SettingsPage() {
  const { user, userProfile, loading } = useUser();

  if (loading || !user) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement...</div>;
  }
  
  const photoUrl = userProfile?.photoURL || user?.photoURL;
  const userName = userProfile?.name || user?.displayName || 'Utilisateur';
  const userEmail = user?.email || 'Email non disponible';

  return (
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
      </Card>

      <div className="space-y-4">
        {/* Section Préférences Vidéo */}
        <h2 className='font-bold text-lg'>Préférences vidéo</h2>
        <Card>
            <CardContent className='divide-y p-4'>
                <SettingsItem 
                    icon={Video}
                    title="Qualité de téléchargement"
                    description="Choisissez la qualité des vidéos téléchargées."
                    action={<Button variant="outline" size="sm">Auto</Button>}
                />
                 <SettingsItem 
                    icon={Video}
                    title="Lecture en arrière-plan"
                    description="Continuez à écouter vos cours lorsque l'application est fermée."
                    action={<Switch id="background-play" />}
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
                    action={<Button variant="outline" size="sm" asChild><Link href="/dashboard/profile">Modifier</Link></Button>}
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
                    action={<Button variant="outline" size="sm" asChild><Link href="/about">Visiter</Link></Button>}
                />
                 <SettingsItem 
                    icon={HelpCircle}
                    title="Foire aux questions"
                    description="Trouvez des réponses à vos questions."
                     action={<Button variant="outline" size="sm" asChild><Link href="/contact">Consulter</Link></Button>}
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
  );
}
