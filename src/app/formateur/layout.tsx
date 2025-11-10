
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Wallet,
  User as UserIcon,
  Settings,
  LogOut,
  Loader2,
  Menu,
  Bell,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import NotificationBell from '@/components/notifications/notification-bell';
import type { InstructorProfile } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formateurNavLinks = [
  { href: '/formateur', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/formateur/courses', label: 'Mes cours', icon: BookOpen },
  { href: '/formateur/students', label: 'Étudiants', icon: Users },
  { href: '/formateur/revenues', label: 'Revenus', icon: Wallet },
  { href: '/formateur/settings', label: 'Paramètres', icon: Settings },
];

function NavLink({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) {
  const pathname = usePathname();
  // Ensure that nested routes like /formateur/courses/[id]/modules also activate the /formateur/courses link
  const isActive = pathname.startsWith(href) && (href !== '/formateur' || pathname === '/formateur');
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-primary/20 hover:text-white',
        isActive && 'bg-primary text-white'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function FormateurSidebar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-16 items-center border-b border-gray-700 px-6">
        <Link href="/formateur">
          <Logo className="h-6 text-white" />
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {formateurNavLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="ghost" className="w-full justify-start flex items-center gap-3 text-gray-300 hover:text-red-500" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}

function FormateurGuard({ children }: { children: React.ReactNode }) {
    const { user, userProfile, loading } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/login');
            return;
        }
        if (userProfile && userProfile.role !== 'formateur') {
            toast({ variant: 'destructive', title: 'Accès refusé', description: "Vous n'êtes pas un formateur." });
            router.replace('/dashboard');
        }
    }, [user, userProfile, loading, router, toast]);

    if (loading || !userProfile) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className='ml-3'>Vérification de votre statut...</p>
            </div>
        );
    }
    
    const instructorProfile = userProfile as InstructorProfile;
    const status = instructorProfile.validation_status;

    if (status === 'validated') {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen items-center justify-center p-4">
            <Card className="max-w-xl text-center">
                <CardHeader>
                    {status === 'pending' && (
                        <>
                            <Clock className="mx-auto h-12 w-12 text-blue-500" />
                            <CardTitle className="mt-4 text-blue-700">Votre profil est en cours de validation</CardTitle>
                            <CardDescription>
                                Merci pour votre patience. Notre équipe examine actuellement votre profil. Vous serez notifié par e-mail dès que la validation sera terminée.
                            </CardDescription>
                        </>
                    )}
                     {(status === 'incomplete' || status === 'rejected') && (
                        <>
                            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
                            <CardTitle className="mt-4 text-amber-700">Action requise pour votre profil</CardTitle>
                             <CardDescription>
                                {status === 'rejected' ? "Votre profil a été rejeté. Veuillez consulter les commentaires de l'administrateur et mettre à jour votre profil." : "Votre profil de formateur est incomplet. Veuillez le mettre à jour pour accéder à votre tableau de bord."}
                            </CardDescription>
                            <div className="pt-4">
                                 <Button asChild>
                                    <Link href="/formateur/mise-a-jour">Mettre à jour mon profil</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </CardHeader>
            </Card>
        </div>
    );
}

export default function FormateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };


  return (
     <FormateurGuard>
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-[#111827] text-white lg:block">
            <FormateurSidebar onSignOut={handleSignOut} />
        </aside>
        <div className="flex flex-col">
            <header className="flex h-16 items-center gap-4 border-b bg-card px-6 sticky top-0 z-30">
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-[#111827] text-white p-0 border-r-0">
                <VisuallyHidden>
                    <SheetTitle>Menu Formateur</SheetTitle>
                </VisuallyHidden>
                <FormateurSidebar onSignOut={handleSignOut} />
                </SheetContent>
            </Sheet>
            <div className="flex-1">
                {/* Can be used for a page title later */}
            </div>
            <div className="flex items-center gap-2">
                <NotificationBell />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar>
                            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'F'}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/formateur/settings">Paramètres & Profil</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">Déconnexion</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
            </header>
            <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8 animate-fade-in">
            {children}
            </main>
        </div>
        </div>
    </FormateurGuard>
  );
}
