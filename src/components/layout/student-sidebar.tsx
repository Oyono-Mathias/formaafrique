"use client";

/**
 * @fileOverview Barre latérale Étudiant Ndara Afrique.
 * ✅ I18N : Labels et groupes traduits intégralement.
 * ✅ DESIGN : Design épuré, navigation fluide.
 */

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Users, 
  MessageSquare, 
  Bot, 
  Heart, 
  ClipboardCheck, 
  ChevronRight, 
  Shield, 
  ArrowLeftRight, 
  LogOut, 
  X, 
  Search,
  Bell,
  LifeBuoy,
  UserCircle,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { collection, query, where, onSnapshot, getFirestore } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocale, useTranslations } from 'next-intl';
import type { CourseProgress } from "@/lib/types";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  count?: number;
  badge?: string;
  onClick: () => void;
  highlight?: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, count, badge, onClick, highlight }: SidebarItemProps) => {
  const pathname = usePathname() || '';
  const cleanPath = pathname.replace(/^\/(en|fr|sg)/, '') || '/';
  const cleanHref = href.replace(/^\/(en|fr|sg)/, '') || '/';
  
  const isActive = cleanPath === cleanHref || (cleanHref !== '/student/dashboard' && cleanPath.startsWith(cleanHref));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 py-3.5 my-0.5 cursor-pointer transition-all duration-200 rounded-2xl mx-2 group relative",
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-slate-400 hover:bg-white/5 hover:text-white',
        highlight && !isActive && "text-primary"
      )}
    >
      <div className="flex items-center">
        <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            isActive ? "bg-primary text-slate-950" : "bg-white/5 text-slate-500 group-hover:text-primary"
        )}>
            <Icon size={18} />
        </div>
        <span className={cn(
            "ml-4 text-[13px] font-bold uppercase tracking-tight",
            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
        )}>
            {label}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {badge && (
            <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5">{badge}</Badge>
        )}
        {count !== undefined && count > 0 && (
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse">
                <span className="text-white text-[9px] font-black">{count}</span>
            </div>
        )}
        {!count && !isActive && (
            <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-500 transition-all" />
        )}
      </div>
    </Link>
  );
};

export function StudentSidebar({ onLinkClick, siteName, logoUrl }: { onLinkClick: () => void, siteName?: string, logoUrl?: string }) {
  const { currentUser, switchRole, availableRoles, secureSignOut, user } = useRole();
  const isAdmin = availableRoles.includes('admin');
  const isInstructor = availableRoles.includes('instructor');
  const locale = useLocale();
  const t = useTranslations('Sidebar');
  const nav = useTranslations('Nav');
  const db = getFirestore();
  
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubChats = onSnapshot(query(collection(db, 'chats'), where('unreadBy', 'array-contains', user.uid)), (snap) => setUnreadMessages(snap.size));
    const unsubNotifs = onSnapshot(query(collection(db, `users/${user.uid}/notifications`), where('read', '==', false)), (snap) => setUnreadNotifs(snap.size));

    return () => { unsubChats(); unsubNotifs(); };
  }, [user?.uid, db]);

  const groups = [
    {
      label: t('universe'),
      items: [
        { href: `/${locale}/student/dashboard`, icon: LayoutDashboard, label: nav('dashboard') },
        { href: `/${locale}/search`, icon: Search, label: nav('catalogue') },
        { href: `/${locale}/bourse`, icon: TrendingUp, label: nav('bourse'), badge: "HOT" },
        { href: `/${locale}/student/courses`, icon: BookOpen, label: nav('my_courses') },
        { href: `/${locale}/student/tutor`, icon: Bot, label: t('tutor'), badge: 'IA' },
      ],
    },
    {
      label: t('network'),
      items: [
        { href: `/${locale}/student/ambassadeur`, icon: TrendingUp, label: t('ambassador'), highlight: true },
        { href: `/${locale}/student/annuaire`, icon: Users, label: t('community') },
        { href: `/${locale}/student/messages`, icon: MessageSquare, label: nav('messages'), count: unreadMessages },
      ]
    },
    {
      label: t('tracking'),
      items: [
        { href: `/${locale}/student/results`, icon: Award, label: t('results') },
        { href: `/${locale}/student/mes-certificats`, icon: Award, label: "Diplômes" },
        { href: `/${locale}/student/wishlist`, icon: Heart, label: t('wishlist') },
      ],
    },
    {
        label: t('settings'),
        items: [
          { href: `/${locale}/student/profile`, icon: UserCircle, label: nav('profile') },
          { href: `/${locale}/student/notifications`, icon: Bell, label: nav('alerts'), count: unreadNotifs },
          { href: `/${locale}/student/support`, icon: LifeBuoy, label: 'Support' },
        ],
      },
  ];

  return (
    <aside className="w-full h-full bg-[#0f172a] flex flex-col relative overflow-hidden font-sans border-r border-white/5 shadow-2xl">
        <div className="grain-overlay opacity-[0.03]" />

        <header className="px-6 py-8 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-primary/20">
                        N
                    </div>
                    <div>
                        <h2 className="font-black text-lg text-white tracking-tighter uppercase leading-none">{siteName || 'NDARA'}</h2>
                    </div>
                </div>
                <button onClick={onLinkClick} className="md:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                    <X size={20} />
                </button>
            </div>

            <div className="bg-[#1e293b] rounded-[1.5rem] p-4 border border-white/5 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-2xl">
                            <AvatarImage src={currentUser?.profilePictureURL} className="object-cover" />
                            <AvatarFallback className="bg-slate-800 text-slate-500 font-black uppercase">
                                {currentUser?.fullName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        {currentUser?.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-[#1e293b] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-white text-sm truncate uppercase tracking-tight">{currentUser?.fullName}</h3>
                        <p className="text-primary text-[9px] font-black uppercase tracking-widest mt-1">Étudiant Ndara</p>
                    </div>
                </div>
            </div>
        </header>

        <div className="px-6 py-4 border-b border-white/5 space-y-3 bg-black/10">
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] ml-1">Changer de mode</p>
            <div className="grid grid-cols-2 gap-2">
                {isInstructor && (
                    <button 
                        onClick={() => { switchRole('instructor'); onLinkClick(); }}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1e293b] border border-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-slate-950 transition-all active:scale-95 shadow-lg"
                    >
                        <ArrowLeftRight size={12} />
                        <span>Expert</span>
                    </button>
                )}
                {isAdmin && (
                    <button 
                        onClick={() => { switchRole('admin'); onLinkClick(); }}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1e293b] border border-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all active:scale-95 shadow-lg"
                    >
                        <Shield size={12} />
                        <span>Admin</span>
                    </button>
                )}
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto hide-scrollbar py-4">
            {groups.map((group) => (
                <div key={group.label} className="mb-6">
                    <p className="px-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3">{group.label}</p>
                    <div className="space-y-0.5">
                        {group.items.map((item) => (
                            <SidebarItem 
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                count={(item as any).count}
                                badge={(item as any).badge}
                                highlight={(item as any).highlight}
                                onClick={onLinkClick}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </nav>

        <footer className="px-6 py-6 border-t border-white/5 bg-black/20 flex-shrink-0">
            <button 
                onClick={() => secureSignOut()}
                className="w-full h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-3 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-xl"
            >
                <LogOut size={16} />
                <span>Déconnexion</span>
            </button>
        </footer>
    </aside>
  );
}