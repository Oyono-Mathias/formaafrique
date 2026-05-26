'use client';

/**
 * @fileOverview Barre latérale Expert Ndara Afrique v2.5.
 * ✅ DESIGN : Immersion Fintech Vintage avec grain de texture.
 * ✅ I18N : Groupements stratégiques traduits.
 * ✅ FIX : Support de la locale 'sg' (Sango).
 */

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  MessageSquare, 
  BadgeEuro,
  ClipboardCheck,
  Folder,
  Award,
  Megaphone,
  Star,
  ArrowLeftRight,
  Shield,
  FileQuestion,
  Ticket,
  ChevronRight,
  LogOut,
  X,
  Landmark,
  Target,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/context/RoleContext";
import { useLocale, useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  siteName?: string;
  logoUrl?: string;
  onLinkClick: () => void;
}

const SidebarItem = ({ href, icon: Icon, label, onClick }: { href: string, icon: React.ElementType, label: string, onClick: () => void }) => {
  const pathname = usePathname() || '';
  const cleanPath = pathname.replace(/^\/(en|fr|sg)/, '') || '/';
  const cleanHref = href.replace(/^\/(en|fr|sg)/, '') || '/';
  const isActive = cleanPath.startsWith(cleanHref);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 py-3.5 my-0.5 cursor-pointer transition-all duration-300 rounded-2xl mx-2 group relative",
        isActive
          ? 'bg-primary/10 border-l-0 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      )}
    >
      <div className="flex items-center">
        <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-inner",
            isActive ? "bg-primary text-slate-950 scale-105" : "bg-white/5 text-slate-500 group-hover:text-primary group-hover:bg-primary/5"
        )}>
            <Icon size={18} />
        </div>
        <span className={cn(
            "ml-4 text-[13px] font-bold uppercase tracking-tight transition-colors",
            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
        )}>
            {label}
        </span>
      </div>
      {!isActive && (
          <ChevronRight size={14} className="text-slate-800 group-hover:text-slate-500 transition-all group-hover:translate-x-0.5" />
      )}
      {isActive && (
          <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#10b981]" />
      )}
    </Link>
  );
};

export function InstructorSidebar({ onLinkClick, siteName, logoUrl }: SidebarProps) {
  const { currentUser, switchRole, availableRoles, secureSignOut } = useRole();
  const isAdmin = availableRoles.includes('admin');
  const locale = useLocale();
  const t = useTranslations('Instructor');

  const groups = [
    {
      label: t('groups.management'),
      items: [
        { label: "Cockpit Dashboard", icon: LayoutDashboard, href: `/${locale}/instructor/dashboard` },
        { label: "Catalogue Formations", icon: BookOpen, href: `/${locale}/instructor/courses` },
        { label: "Supports & Ressources", icon: Folder, href: `/${locale}/instructor/ressources` },
      ]
    },
    {
      label: t('groups.growth'),
      items: [
        { label: "Ambassadeur Elite", icon: BadgeEuro, href: `/${locale}/student/ambassadeur` },
        { label: "Coupons & Marketing", icon: Ticket, href: `/${locale}/instructor/coupons` },
        { label: "Radar Annonces", icon: Megaphone, href: `/${locale}/instructor/annonces` },
      ]
    },
    {
      label: t('groups.pedagogy'),
      items: [
        { label: "Usine de Correction", icon: ClipboardCheck, href: `/${locale}/instructor/devoirs` },
        { label: "Évaluation (Quiz)", icon: FileQuestion, href: `/${locale}/instructor/quiz` },
        { label: "Interactions Q&R", icon: MessageSquare, href: `/${locale}/instructor/questions-reponses` },
        { label: "Avis & Témoignages", icon: Star, href: `/${locale}/instructor/avis` },
      ]
    },
    {
      label: t('groups.results'),
      items: [
        { label: "Base Étudiants", icon: Users, href: `/${locale}/instructor/students` },
        { label: "Wealth Management", icon: Landmark, href: `/${locale}/instructor/revenus` },
        { label: "Registre Diplômes", icon: Award, href: `/${locale}/instructor/certificats` },
      ]
    }
  ];

  return (
    <aside className="w-full h-full bg-[#0f172a] border-r border-white/5 flex flex-col shadow-2xl relative overflow-hidden font-sans">
      <div className="grain-overlay opacity-[0.03]" />

      <header className="px-6 py-8 border-b border-white/5 relative z-10">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-teal-600 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                    N
                </div>
                <div>
                    <h2 className="font-black text-lg text-white tracking-tighter uppercase leading-none">{siteName || 'NDARA'}</h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Afrique</p>
                </div>
            </div>
            <button onClick={() => onLinkClick?.()} className="md:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                <X size={20} />
            </button>
        </div>

        <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-[2.2rem] p-4 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/[0.03] animate-pulse" />
            <div className="flex items-center gap-4 relative z-10">
                <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-2xl shrink-0">
                    <AvatarImage src={currentUser?.profilePictureURL} className="object-cover" />
                    <AvatarFallback className="bg-slate-800 text-slate-500 font-black uppercase">
                        {currentUser?.fullName?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-sm truncate uppercase tracking-tight">{currentUser?.fullName}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Shield size={10} className="text-primary fill-primary/20" />
                        <span className="text-primary text-[9px] font-black uppercase tracking-[0.2em]">{t('labels.expert')}</span>
                    </div>
                </div>
            </div>
        </div>
      </header>

      <div className="px-6 py-5 border-b border-white/5 space-y-4 relative z-10 bg-black/10">
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] ml-1">{t('labels.switch_mode')}</p>
          <div className="grid grid-cols-2 gap-2">
              <button 
                  onClick={() => { switchRole('student'); onLinkClick?.(); }}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#1e293b] border border-white/5 text-slate-400 hover:bg-primary hover:text-slate-950 transition-all active:scale-95 shadow-xl group"
              >
                  <ArrowLeftRight size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Étudiant</span>
              </button>
              {isAdmin && (
                  <button 
                      onClick={() => { switchRole('admin'); onLinkClick?.(); }}
                      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#1e293b] border border-white/5 text-slate-400 hover:bg-amber-500 hover:text-slate-950 transition-all active:scale-95 shadow-xl group"
                  >
                      <Target size={14} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Cockpit</span>
                  </button>
              )}
          </div>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto hide-scrollbar relative z-10">
        {groups.map((group) => (
          <div key={group.label} className="mb-8">
            <p className="px-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                {group.label}
            </p>
            <div className="space-y-0.5">
                {group.items.map((item) => (
                <SidebarItem 
                    key={item.href} 
                    href={item.href} 
                    icon={item.icon} 
                    label={item.label}
                    onClick={() => onLinkClick?.()}
                />
                ))}
            </div>
          </div>
        ))}
      </nav>

      <footer className="px-6 py-6 border-t border-white/5 bg-black/40 relative z-10">
          <button 
              onClick={() => secureSignOut()}
              className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95 shadow-xl"
          >
              <LogOut size={16} />
              <span>{t('labels.logout')}</span>
          </button>
      </footer>
    </aside>
  );
}