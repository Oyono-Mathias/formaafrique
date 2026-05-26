'use client';

/**
 * @fileOverview AppShell Ndara Afrique - Cerveau de navigation global.
 * ✅ SÉCURITÉ : Connecté aux modules 'security' et 'marketing' des réglages Admin.
 * ✅ VISIBILITÉ : Logique de Sidebar renforcée pour un affichage immédiat sur Desktop.
 */

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { Button } from '@/components/ui/button';
import { Wrench, Loader2, Megaphone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { SplashScreen } from '@/components/SplashScreen';
import { Header } from '@/components/layout/header';
import { OfflineBar } from '@/components/OfflineBar';
import { useLocale } from 'next-intl';
import type { Settings } from '@/lib/types';

import { StudentSidebar } from '@/components/layout/student-sidebar';
import { InstructorSidebar } from '@/components/layout/instructor-sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { InstructorBottomNav } from '@/components/layout/instructor-bottom-nav';
import { AdminBottomNav } from '@/components/layout/admin-bottom-nav';

function AnnouncementBanner({ message }: { message: string }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message && sessionStorage.getItem('ndara-announcement-dismissed') !== message) {
            setIsVisible(true);
        }
    }, [message]);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('ndara-announcement-dismissed', message);
    };

    if (!isVisible || !message) return null;

    return (
        <div className="bg-primary/95 text-primary-foreground p-3 flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-wider relative z-[100]">
            <Megaphone className="h-4 w-4 hidden sm:block flex-shrink-0" />
            <p className="text-center px-8">{message}</p>
            <button onClick={handleDismiss} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-black/20 rounded-full transition-colors">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { role, loading, user, currentUser } = useRole();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname() || '';
  const db = getFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [siteSettings, setSiteSettings] = useState({
      maintenanceMode: false,
      announcementMessage: '',
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
        if (snap.exists()) {
            const data = snap.data() as Settings;
            setSiteSettings({ 
                maintenanceMode: data.security?.maintenanceMode || false,
                announcementMessage: data.marketing?.globalAnnouncement || '',
            });
        }
    });
    return () => unsub();
  }, [db]);

  const cleanPath = useMemo(() => {
    return pathname.replace(/^\/(en|fr|sg)/, '') || '/';
  }, [pathname]);

  const isFullScreen = useMemo(() => {
      // Le lecteur de cours est toujours plein écran
      return cleanPath.startsWith('/courses/') || (cleanPath.startsWith('/student/courses/') && cleanPath.split('/').length > 3);
  }, [cleanPath]);

  const isPublicPage = useMemo(() => {
    const publicPaths = ['/', '/about', '/abonnements', '/investir', '/cgu', '/mentions-legales', '/leaderboard'];
    if (publicPaths.includes(cleanPath)) return true;
    if (cleanPath.startsWith('/course/')) return true; 
    if (cleanPath.startsWith('/verify/')) return true;
    return false;
  }, [cleanPath]);

  const isAuthPage = useMemo(() => ['/login', '/register', '/forgot-password'].includes(cleanPath), [cleanPath]);

  // Déterminer quelle barre de navigation afficher
  const navToDisplay = useMemo(() => {
      if (!user || !mounted) return null;
      if (cleanPath.startsWith('/admin')) return 'admin';
      if (cleanPath.startsWith('/instructor')) return 'instructor';
      // Par défaut, si connecté et non admin/expert, on est en vue étudiant
      return 'student';
  }, [cleanPath, user, mounted]);

  // Redirection de sécurité
  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicPage && !isAuthPage && !isFullScreen) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, isPublicPage, isAuthPage, isFullScreen, router, locale]);

  if (siteSettings.maintenanceMode && currentUser?.role !== 'admin') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-center p-6">
            <Wrench className="h-16 w-16 text-primary mb-4" />
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Maintenance</h1>
            <p className="text-slate-500 mt-2 font-medium italic">Revenez dans quelques instants.</p>
        </div>
      );
  }

  const sidebarProps = { onLinkClick: () => {} };

  // Déterminer si on doit afficher le layout avec sidebar (Authenticated & Non-Full Screen & Non-Public)
  const showSidebar = !!user && !isFullScreen && !isPublicPage && !isAuthPage;

  return (
    <div className={cn(
        "min-h-screen w-full bg-[#0f172a] text-white flex flex-col md:flex-row",
        showSidebar ? "" : "flex-col"
    )}>
        <div className="grain-overlay opacity-[0.04]" />

        {/* SIDEBAR DESKTOP */}
        {showSidebar && (
          <aside className="hidden md:block w-72 h-screen sticky top-0 border-r border-white/5 flex-shrink-0">
             {navToDisplay === 'admin' ? (
                 <AdminSidebar {...sidebarProps} />
             ) : navToDisplay === 'instructor' ? (
                 <InstructorSidebar {...sidebarProps} />
             ) : (
                 <StudentSidebar {...sidebarProps} />
             )}
          </aside>
        )}

        {/* MAIN AREA */}
        <div className="flex flex-col flex-1 relative z-10 min-w-0">
          {siteSettings.announcementMessage && <AnnouncementBanner message={siteSettings.announcementMessage} />}
          
          {showSidebar && (
            <header className="h-16 flex items-center border-b border-white/5 sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md px-4">
                <Header />
            </header>
          )}

          <main className={cn("flex-1", showSidebar ? "pb-24 md:pb-6 md:p-6" : "p-0")}>
            {children}
          </main>

          {/* BOTTOM NAV MOBILE */}
          {showSidebar && (
              <div className="md:hidden">
                  {navToDisplay === 'admin' && <AdminBottomNav />}
                  {navToDisplay === 'instructor' && <InstructorBottomNav />}
                  {navToDisplay === 'student' && <BottomNav />}
              </div>
          )}
        </div>
      </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreen />
      <OfflineBar />
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#0f172a]"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}>
        <AppShellInner>{children}</AppShellInner>
      </Suspense>
    </>
  );
}