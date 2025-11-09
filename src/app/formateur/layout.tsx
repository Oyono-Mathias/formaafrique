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


export default function FormateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const instructorProfile = userProfile as InstructorProfile;

    if (instructorProfile && instructorProfile.role !== 'formateur') {
        toast({
            variant: 'destructive',
            title: 'Accès refusé',
            description: "Redirection vers votre tableau de bord.",
        });
        if (instructorProfile.role === 'admin') {
            router.replace('/admin');
        } else {
            router.replace('/dashboard');
        }
    } else if (!instructorProfile) {
        // If loading is done, user exists, but no profile, it's an error state.
        toast({
            variant: 'destructive',
            title: 'Profil introuvable',
            description: "Votre profil n'a pas pu être chargé. Veuillez vous reconnecter.",
        });
        if (auth) signOut(auth);
        router.replace('/login');
    } else if (instructorProfile.validation_status === 'incomplete' && pathname !== '/formateur/mise-a-jour') {
        // Redirect to update page if profile is incomplete
        router.replace('/formateur/mise-a-jour');
    }
  }, [user, userProfile, loading, router, toast, auth, pathname]);

  if (loading || !userProfile || userProfile.role !== 'formateur') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-3'>Vérification des droits d'accès...</p>
      </div>
    );
  }
  
  if (userProfile.validation_status === 'incomplete' && pathname !== '/formateur/mise-a-jour') {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-3'>Redirection vers la mise à jour du profil...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };


  return (
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
  );
}
