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
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const formateurNavLinks = [
  { href: '/formateur', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/formateur/courses', label: 'Mes cours', icon: BookOpen },
  { href: '/formateur/students', label: 'Étudiants', icon: Users },
  { href: '/formateur/revenues', label: 'Revenus', icon: Wallet },
  { href: '/formateur/profile', label: 'Profil', icon: UserIcon },
  { href: '/formateur/settings', label: 'Paramètres', icon: Settings },
];

function NavLink({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
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
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isFormateur, setIsFormateur] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!db) return;

    const checkFormateurRole = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          if (userData.role === 'formateur' || userData.role === 'admin') {
            setIsFormateur(true);
          } else {
            toast({
              variant: 'destructive',
              title: 'Accès refusé',
              description: "Vous n'êtes pas un formateur.",
            });
            router.push('/dashboard');
          }
        } else {
          toast({ variant: 'destructive', title: 'Accès refusé', description: "Profil non trouvé." });
          router.push('/');
        }
      } catch (error) {
        console.error("Error checking formateur role:", error);
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de vérifier vos droits." });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkFormateurRole();
  }, [user, userLoading, db, router, toast]);

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  if (loading || userLoading || !isFormateur) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-3'>Vérification des droits de formateur...</p>
      </div>
    );
  }

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
            <h1 className="text-lg font-semibold">Dashboard Formateur</h1>
          </div>
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
                <DropdownMenuItem asChild><Link href="/formateur/profile">Profil</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/formateur/settings">Paramètres</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </header>
        <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}