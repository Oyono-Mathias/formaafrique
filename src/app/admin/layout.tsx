'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  BookCopy,
  Users,
  GraduationCap,
  LogOut,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const adminNavLinks = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Formations', icon: BookCopy },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/donations', label: 'Dons & Certificats', icon: GraduationCap },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) {
      return; // Wait for user auth state to be resolved
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (!db) {
        // Firestore not available yet
        return;
    }

    const checkAdminRole = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          if (userData.role === 'admin') {
            setIsAdmin(true);
          } else {
            toast({
              variant: 'destructive',
              title: 'Accès refusé',
              description: "Vous n'avez pas les droits pour accéder à cette page.",
            });
            router.push('/');
          }
        } else {
          // User document doesn't exist, deny access
          toast({
            variant: 'destructive',
            title: 'Accès refusé',
            description: "Profil utilisateur non trouvé.",
          });
          router.push('/');
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        toast({
            variant: 'destructive',
            title: 'Erreur de vérification',
            description: "Une erreur est survenue lors de la vérification de vos droits.",
          });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user, userLoading, db, router, toast]);

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  if (loading || userLoading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className='ml-2'>Vérification de l'accès administrateur...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <div className='p-2 flex items-center gap-2 bg-primary/10 rounded-md m-2 border border-primary/20'>
                <ShieldCheck className='text-primary' />
                <span className='font-semibold text-primary text-sm'>Menu Admin</span>
            </div>
            <SidebarMenu>
              {adminNavLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href}>
                    <SidebarMenuButton
                      isActive={pathname === link.href}
                      tooltip={link.label}
                    >
                      <link.icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Déconnexion" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <LogOut />
                    <span>Déconnexion</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b h-16 sticky top-0 bg-card z-10">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <span className="font-medium hidden sm:inline">{user?.displayName || 'Admin'}</span>
              <Avatar>
                  {user?.photoURL && <AvatarImage src={user.photoURL} alt="Admin Avatar" />}
                  <AvatarFallback>{user?.displayName ? user.displayName.charAt(0) : 'A'}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <div className="p-4 sm:p-6 lg:p-8 bg-primary/5 min-h-[calc(100vh-4rem)]">
              {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
