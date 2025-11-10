
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { Loader2, LayoutDashboard, BookCopy, Users, Wallet, Settings, LogOut, Menu, Bell, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useToast } from '@/hooks/use-toast';
import NotificationBell from '@/components/notifications/notification-bell';
import type { InstructorProfile } from '@/lib/types';


const navLinks = [
  { href: '/formateur', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/formateur/courses', label: 'Mes cours', icon: BookCopy },
  { href: '/formateur/students', label: 'Mes étudiants', icon: Users },
  { href: '/formateur/revenues', label: 'Revenus', icon: Wallet },
  { href: '/formateur/settings', label: 'Paramètres', icon: Settings },
];

function NavLink({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/formateur' && pathname.startsWith(href));

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

function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-16 items-center border-b border-gray-700 px-6">
        <Link href="/formateur">
          <Logo className="h-6 text-white" />
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navLinks.map((link) => (
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

export default function FormateurLayout({ children }: { children: React.ReactNode }) {
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

    if (userProfile && userProfile.role !== 'formateur') {
      toast({
        variant: 'destructive',
        title: 'Accès refusé',
        description: "Vous n'êtes pas un formateur. Redirection...",
      });
      router.replace('/dashboard'); // Redirect non-instructors
      return;
    }

    const instructor = userProfile as InstructorProfile;

    if (instructor?.validation_status === 'incomplete' && pathname !== '/formateur/mise-a-jour') {
        toast({
            title: 'Profil incomplet',
            description: 'Veuillez mettre à jour votre profil pour continuer.',
            variant: 'destructive'
        });
        router.replace('/formateur/mise-a-jour');
    }

  }, [user, userProfile, loading, router, toast, pathname]);

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  if (loading || !userProfile || userProfile.role !== 'formateur') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-3'>Vérification de votre statut de formateur...</p>
      </div>
    );
  }

  const instructor = userProfile as InstructorProfile;

  if (instructor.validation_status === 'incomplete' && pathname === '/formateur/mise-a-jour') {
      return <>{children}</>;
  }

  if (instructor.validation_status === 'pending') {
      return (
           <div className="flex h-screen w-full items-center justify-center bg-background p-4">
                <div className='text-center'>
                    <AlertCircle className='mx-auto h-12 w-12 text-amber-500 mb-4' />
                    <h1 className='text-2xl font-bold'>Validation en attente</h1>
                    <p className='text-muted-foreground mt-2'>Votre profil est en cours de validation par notre équipe. <br/>Vous recevrez une notification dès que ce sera terminé.</p>
                     <Button variant="ghost" className="mt-6 text-destructive" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                    </Button>
                </div>
            </div>
      );
  }
  
  // If user is a validated instructor, show the layout and children.
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-[#111827] text-white lg:block">
        <Sidebar onSignOut={handleSignOut} />
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
               <VisuallyHidden><SheetTitle>Menu Formateur</SheetTitle></VisuallyHidden>
              <Sidebar onSignOut={handleSignOut} />
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
             <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar>
                        <AvatarImage src={user?.photoURL || ''} alt={userProfile.name} />
                        <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/formateur/settings">Paramètres</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className='text-destructive'>Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 bg-muted/40 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
