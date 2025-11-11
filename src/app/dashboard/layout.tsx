
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  Star,
  Search as SearchIcon,
  BookCopy,
  GraduationCap,
  LogOut,
  Menu,
  Bell,
  Settings,
  Loader2,
  Heart,
  Home,
  MessageSquare,
  Users,
  Bot,
} from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useToast } from '@/hooks/use-toast';
import NotificationBell from '@/components/notifications/notification-bell';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { FirebaseProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/firebase';
import { LanguageProvider } from '@/contexts/language-context';

const navLinks = [
    { href: '/dashboard', label: 'Accueil', icon: Home },
    { href: '/dashboard/courses', label: 'Mes Formations', icon: BookCopy },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/team', label: 'Mes Camarades', icon: Users },
    { href: '/community', label: 'Communauté', icon: MessageSquare },
    { href: '/chatbot', label: 'Tuteur IA', icon: Bot },
    { href: '/dashboard/wishlist', label: 'Favoris', icon: Heart },
    { href: '/dashboard/certificates', label: 'Certificats', icon: GraduationCap },
];

function NavLink({
  href,
  icon: Icon,
  label,
  isMobile = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isMobile?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard');


  if (isMobile) {
    return (
         <Link
            href={href}
            className={cn(
                'flex flex-col items-center justify-center h-16 w-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}
            >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
        </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground/70 hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function SidebarContent() {
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/" aria-label="Retour à la page d'accueil">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navLinks.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-border">
        <Link
            href="/dashboard/settings"
            className="flex items-center gap-4 px-4 py-3 rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Paramètres</span>
        </Link>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start flex items-center gap-4 px-4 py-3 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Déconnexion</span>
        </Button>
      </div>
    </div>
  );
}

function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, userProfile, loading } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace('/login');
            return;
        }

        if (userProfile && userProfile.role !== 'etudiant') {
            toast({
                title: 'Redirection en cours...',
                description: "Vous n'êtes pas un étudiant. Redirection vers votre tableau de bord."
            });
            if (userProfile.role === 'admin') {
                router.replace('/admin');
            } else if (userProfile.role === 'formateur') {
                router.replace('/formateur');
            } else {
                if (auth) signOut(auth);
                router.replace('/login');
            }
        }
    }, [user, userProfile, loading, router, auth, toast]);

    if (loading || !user || !userProfile || userProfile.role !== 'etudiant') {
        return (
            <div className="flex justify-center items-center h-screen bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="flex items-center gap-2 text-lg ml-4">
                Vérification de votre accès...
                </p>
            </div>
        );
    }
  
    const handleSignOut = async () => {
        if (!auth) return;
        await signOut(auth);
        router.push('/');
    };

    const isFullPageLayout = pathname.startsWith('/messages') || pathname.startsWith('/courses/');
    if (isFullPageLayout) {
        return (
            <div className="h-screen overflow-hidden">
                    {children}
                </div>
        )
    }

    const MobileNavBar = () => (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-lg flex justify-around items-center lg:hidden z-20">
            {navLinks.slice(0, 5).map(link => (
                <NavLink key={link.href} {...link} isMobile />
            ))}
        </nav>
    );

    return (
        <div className="min-h-screen w-full bg-background text-foreground flex flex-col lg:flex-row">
            <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border bg-card">
                <SidebarContent />
            </aside>

            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 lg:px-8">
                <div className="lg:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 bg-card border-r p-0">
                        <SidebarContent />
                    </SheetContent>
                    </Sheet>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center gap-4 ml-auto">
                    <Button variant="ghost" size="icon" asChild>
                    <Link href="/search">
                        <SearchIcon className="h-5 w-5" />
                        <span className="sr-only">Rechercher</span>
                    </Link>
                    </Button>
                    <NotificationBell />

                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 p-1 rounded-full h-auto">
                        <Avatar className="h-9 w-9">
                            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />}
                            <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline font-medium">{user.displayName}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Paramètres</span>
                        </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Déconnexion</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto animate-fade-in text-foreground">
                    <div className="pb-16 lg:pb-0">
                        {children}
                    </div>
                </main>
            </div>

            <MobileNavBar />
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseProvider>
            <UserProvider>
                <LanguageProvider>
                    <ProtectedDashboardLayout>{children}</ProtectedDashboardLayout>
                </LanguageProvider>
            </UserProvider>
        </FirebaseProvider>
    );
}
