'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/logo';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useUser, useAuth } from '@/firebase';
import { useLanguage } from '@/contexts/language-context';
import { signOut } from 'firebase/auth';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/courses', label: t('nav_courses') },
    { href: '/instructors', label: t('nav_instructors') },
    { href: '/community', label: t('nav_community') },
    { href: '/about', label: t('nav_about') },
    { href: '/contact', label: t('nav_contact') },
    { href: '/donate', label: t('nav_donate') },
  ];

  const isAuthenticated = !loading && !!user;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSignOut = async () => {
    closeMobileMenu();
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center">
            <Logo />
            <span className="sr-only">FormaAfrique Home</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
             <SheetTitle className="sr-only">Menu principal</SheetTitle>
            <div className="flex flex-col h-full">
              <Link href="/" className="mb-8" onClick={closeMobileMenu}>
                <Logo />
              </Link>
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      'text-lg transition-colors hover:text-foreground',
                       pathname === link.href ? 'text-foreground font-bold' : 'text-foreground/80'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                 <Link
                    href="/search"
                    onClick={closeMobileMenu}
                    className={cn(
                      'text-lg transition-colors hover:text-foreground',
                       pathname === '/search' ? 'text-foreground font-bold' : 'text-foreground/80'
                    )}
                  >
                    {t('search')}
                  </Link>
              </nav>
              <div className="mt-auto pt-4 border-t">
                {isAuthenticated ? (
                  <>
                    <Button asChild variant="default" className="w-full mb-2" onClick={closeMobileMenu}>
                      <Link href="/dashboard">{t('dashboard')}</Link>
                    </Button>
                    <Button variant="ghost" className="w-full text-destructive" onClick={handleSignOut}>
                       <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="default" className="w-full" onClick={closeMobileMenu}>
                    <Link href="/login">{t('login_signup')}</Link>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Logo for mobile */}
        <div className="flex justify-center flex-1 md:hidden">
          <Link href="/">
              <Logo />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/search" className="text-foreground/60 hover:text-foreground/80 p-2">
                <Search />
                <span className="sr-only">{t('search')}</span>
            </Link>
            {loading ? null : isAuthenticated ? (
              <Button asChild variant="default">
                <Link href="/dashboard">{t('dashboard')}</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="hidden md:inline-flex">
                <Link href="/login">{t('login_signup')}</Link>
              </Button>
            )}
          </nav>
           <div className="flex items-center md:hidden">
             <Link href="/search" className="text-foreground/60 hover:text-foreground/80 p-2">
                <Search />
                <span className="sr-only">{t('search')}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
