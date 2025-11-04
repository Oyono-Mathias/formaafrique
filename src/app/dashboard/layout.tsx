'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  Home,
  BookCopy,
  GraduationCap,
  User as UserIcon,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  X,
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

const dashboardNavLinks = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/dashboard/courses', label: 'Mes Formations', icon: BookCopy },
  { href: '/dashboard/certificates', label: 'Certificats', icon: GraduationCap },
  { href: '/dashboard/profile', label: 'Profil', icon: UserIcon },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
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
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground/70 hover:bg-muted hover:text-foreground',
        isMobile ? 'text-lg' : 'text-sm'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function SidebarContent() {
  const { user } = useUser();
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <Link href="/" aria-label="Retour à la page d'accueil">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {dashboardNavLinks.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
      </nav>
      <div className="p-4 mt-auto">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-4 px-4 py-3 rounded-lg text-destructive-foreground/70 hover:bg-destructive/80 hover:text-destructive-foreground transition-colors text-sm"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <p className="flex items-center gap-2 text-lg">
          Chargement...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r bg-card">
        <SidebarContent />
      </aside>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-8">
          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menu principal</SheetTitle>
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Spacer for mobile to center the logo or title if any */}
          <div className="lg:hidden flex-1"></div>

          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Rechercher</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

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
                  <Link href="/dashboard/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut(useAuth()!)}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
