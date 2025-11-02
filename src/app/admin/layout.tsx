'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  BookCopy,
  Users,
  GraduationCap,
  LogOut,
  ShieldCheck,
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
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

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
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    // Here you would add logic to check if the user is an admin
    // For now, we just check if they are logged in.
  }, [user, loading, router]);
  
  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  if (loading || !user) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Vérification de l'accès...</p>
        </div>
    );
  }

  return (
    <SidebarProvider>
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
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <div className="flex items-center gap-4">
             <span className="font-medium hidden sm:inline">{user.displayName || 'Admin'}</span>
             <Avatar>
                {user.photoURL && <AvatarImage src={user.photoURL} alt="Admin Avatar" />}
                <AvatarFallback>{user.displayName ? user.displayName.charAt(0) : 'A'}</AvatarFallback>
             </Avatar>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 bg-primary/5 min-h-[calc(100vh-4rem)]">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
