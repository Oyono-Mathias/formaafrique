
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  BookCopy,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Loader2,
  Menu,
  ShieldCheck,
  Tag,
  Activity,
  Bell,
  Wrench,
  MessageSquare,
  ShieldAlert,
  ThumbsDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationBell from '@/components/notifications/notification-bell';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';


const adminNavLinks = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Formations', icon: BookCopy },
  { href: '/admin/categories', label: 'Catégories', icon: Tag },
  { href: '/admin/validation', label: 'Validation', icon: ShieldCheck },
  { href: '/admin/moderation', label: 'Modération', icon: ShieldAlert },
  { href: '/admin/tutor-feedback', label: 'Feedback Tuteur', icon: ThumbsDown },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/community', label: 'Communauté', icon: MessageSquare },
  { href: '/admin/donations', label: 'Transactions', icon: CreditCard },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/behavior', label: 'Comportements & Sécurité', icon: Activity },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

function NavLink({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

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

function AdminSidebar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-16 items-center border-b border-gray-700 px-6">
        <Link href="/admin">
          <Logo className="h-6 text-white" />
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {adminNavLinks.map((link) => (
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


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  const isPublicPage = ['/', '/courses', '/about', '/contact', '/login'].includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!isPublicPage) router.replace('/login');
      return;
    }

    if (userProfile && userProfile.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Accès refusé',
        description: "Redirection vers votre tableau de bord.",
      });
      if (userProfile.role === 'formateur') {
        router.replace('/formateur');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, userProfile, loading, router, toast, isPublicPage]);

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  if (isPublicPage && !user) {
      return (
        <>
            <Header/>
            <main className='flex-grow'>{children}</main>
            <Footer />
        </>
      )
  }

  if (loading || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className='ml-3'>Vérification des droits d'accès...</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-[#111827] text-white lg:block">
        <AdminSidebar onSignOut={handleSignOut} />
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
                <SheetTitle>Menu administrateur</SheetTitle>
              </VisuallyHidden>
              <AdminSidebar onSignOut={handleSignOut} />
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
             <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar>
                        <AvatarImage src={user?.photoURL || ''} alt="Admin" />
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/admin/settings">Paramètres</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className='text-destructive'>Déconnexion</DropdownMenuItem>
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
