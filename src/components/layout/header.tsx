'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/logo';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useUser } from '@/firebase';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/courses', label: 'Formations' },
  { href: '/instructors', label: 'Nos Formateurs' },
  { href: '/about', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
  { href: '/donate', label: 'Faire un don' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Conditionally call the hook
  const isPublicPage = navLinks.some(link => link.href === pathname);
  const { user, loading } = isPublicPage ? useUser() : { user: null, loading: false };

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsAuthenticated(!!user);
    }
  }, [user, loading]);


  const closeMobileMenu = () => setIsMobileMenuOpen(false);


  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-primary text-primary-foreground shadow-md">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center">
            <Logo className="text-primary-foreground" />
            <span className="sr-only">FormaAfrique Home</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-yellow-custom',
                  pathname === link.href ? 'text-yellow-custom font-bold' : 'text-primary-foreground/90'
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
            <Button variant="ghost" className="md:hidden text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-primary text-primary-foreground">
             <SheetTitle className="sr-only">Menu principal</SheetTitle>
            <div className="flex flex-col h-full">
              <Link href="/" className="mb-8" onClick={closeMobileMenu}>
                <Logo className="text-primary-foreground" />
              </Link>
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      'text-lg transition-colors hover:text-yellow-custom',
                       pathname === link.href ? 'text-yellow-custom font-bold' : 'text-primary-foreground/90'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                 <Link
                    href="/search"
                    onClick={closeMobileMenu}
                    className={cn(
                      'text-lg transition-colors hover:text-yellow-custom',
                       pathname === '/search' ? 'text-yellow-custom font-bold' : 'text-primary-foreground/90'
                    )}
                  >
                    Rechercher
                  </Link>
              </nav>
              <div className="mt-auto pt-4">
                {isAuthenticated ? (
                  <Button asChild variant="secondary" className="w-full" onClick={closeMobileMenu}>
                    <Link href="/dashboard">Tableau de bord</Link>
                  </Button>
                ) : (
                  <Button asChild variant="secondary" className="w-full" onClick={closeMobileMenu}>
                    <Link href="/login">Connexion / Inscription</Link>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Logo for mobile */}
        <div className="flex justify-center flex-1 md:hidden">
          <Link href="/">
              <Logo className="text-primary-foreground"/>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/search" className="text-primary-foreground/90 hover:text-yellow-custom p-2">
                <Search />
                <span className="sr-only">Rechercher</span>
            </Link>
            {loading ? null : isAuthenticated ? (
              <Button asChild variant="secondary">
                <Link href="/dashboard">Tableau de bord</Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" className="hidden md:inline-flex">
                <Link href="/login">Connexion / Inscription</Link>
              </Button>
            )}
          </nav>
           <div className="flex items-center md:hidden">
             <Link href="/search" className="text-primary-foreground/90 hover:text-yellow-custom p-2">
                <Search />
                <span className="sr-only">Rechercher</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
