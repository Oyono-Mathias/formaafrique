'use client';

/**
 * @fileOverview Dashboard Expert Ndara Afrique v2.5 - Cockpit Wealth Management.
 * ✅ BUSINESS : Radar de croissance et widgets financiers de luxe.
 * ✅ PÉDAGOGIE : File d'attente de correction et accès rapide à Mathias.
 */

import { useRole } from '@/context/RoleContext';
import { 
  collection, 
  query, 
  where, 
  getFirestore, 
  onSnapshot, 
  orderBy,
  limit
} from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Landmark,
  TrendingUp, 
  ClipboardCheck, 
  History,
  Loader2,
  Wallet,
  ChartLine,
  Percent,
  Video,
  Megaphone,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AssignmentSubmission, Payment, Course, Enrollment } from '@/lib/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, subMonths, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function InstructorDashboard() {
    const { currentUser: instructor, isUserLoading } = useRole();
    const db = getFirestore();
    const t = useTranslations('Instructor');

    const [payments, setPayments] = useState<Payment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [pendingSubmissions, setPendingSubmissions] = useState<AssignmentSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!instructor?.uid) return;

        setIsLoading(true);

        const unsubPayments = onSnapshot(
            query(collection(db, 'payments'), where('instructorId', '==', instructor.uid), where('status', '==', 'completed')),
            (snap) => {
                setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
            }
        );

        const unsubCourses = onSnapshot(
            query(collection(db, 'courses'), where('instructorId', '==', instructor.uid)),
            (snap) => {
                setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
            }
        );

        const unsubEnrollments = onSnapshot(
            query(collection(db, 'enrollments'), where('instructorId', '==', instructor.uid)),
            (snap) => {
                setEnrollments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Enrollment)));
            }
        );

        const unsubDevoirs = onSnapshot(
            query(
                collection(db, 'devoirs'), 
                where('instructorId', '==', instructor.uid), 
                where('status', '==', 'submitted'),
                orderBy('submittedAt', 'desc'),
                limit(5)
            ),
            (snap) => {
                setPendingSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as AssignmentSubmission)));
                setIsLoading(false);
            },
            (err) => {
                console.error("Dashboard Fetch Error:", err);
                setIsLoading(false);
            }
        );

        return () => { 
            unsubPayments(); 
            unsubCourses(); 
            unsubEnrollments();
            unsubDevoirs(); 
        };
    }, [instructor?.uid, db]);

    const analytics = useMemo(() => {
        const totalRevenue = payments.reduce((acc, p) => acc + (p.amount * 0.7 || 0), 0); // Part expert
        const totalStudentsCount = Array.from(new Set(enrollments.map(e => e.studentId))).length;
        const completedCount = enrollments.filter(e => e.progress === 100).length;
        const successRate = enrollments.length > 0 ? Math.round((completedCount / enrollments.length) * 100) : 100;

        const now = new Date();
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = subMonths(now, i);
            const monthLabel = format(monthDate, 'MMM', { locale: fr });
            const revenue = payments
                .filter(p => isSameMonth((p.date as any)?.toDate?.() || new Date(0), monthDate))
                .reduce((acc, p) => acc + (p.amount * 0.7 || 0), 0);
            
            chartData.push({ name: monthLabel.toUpperCase(), total: revenue });
        }

        return {
            totalRevenue,
            chartData,
            totalStudentsCount,
            successRate
        };
    }, [payments, enrollments]);

    if (isUserLoading || isLoading) {
        return (
            <div className="flex flex-col gap-8 p-4 bg-[#0f172a] min-h-screen">
                <Skeleton className="h-12 w-1/2 bg-slate-900 rounded-xl" />
                <div className="grid grid-cols-1 gap-4">
                    <Skeleton className="h-48 rounded-[2.5rem] bg-slate-900" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-28 rounded-[2rem] bg-slate-900" />
                    <Skeleton className="h-28 rounded-[2rem] bg-slate-900" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0 pb-32 bg-[#0f172a] min-h-screen relative overflow-hidden font-sans">
            <div className="grain-overlay opacity-[0.04]" />
            
            <main className="flex-1 overflow-y-auto pt-6 px-6 space-y-8 animate-in fade-in duration-700 relative z-10">

                {/* --- WEALTH CARD --- */}
                <div className="grid grid-cols-1 gap-4">
                    <Link href="/instructor/revenus" className="block group active:scale-[0.98] transition-all">
                        <Card className="bg-gradient-to-br from-[#10b981] via-[#059669] to-[#064e3b] rounded-[2.5rem] p-8 border-none shadow-[0_20px_50px_rgba(16,185,129,0.3)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-1000" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10">
                                        <Landmark className="text-white h-5 w-5" />
                                    </div>
                                    <span className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.3em]">{t('stats.available_balance')}</span>
                                </div>
                                <h2 className="text-white font-black text-5xl mb-2 tracking-tighter">
                                    {analytics.totalRevenue.toLocaleString('fr-FR')} <span className="text-xl opacity-60">XOF</span>
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-400/20 text-emerald-100 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5 uppercase tracking-widest">
                                        <TrendingUp size={12} /> Live Profit
                                    </div>
                                    <div className="bg-white/10 text-white/60 text-[9px] font-black px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">
                                        Audit Mathias OK
                                    </div>
                                </div>
                                
                                <Button className="mt-8 w-full h-14 rounded-2xl bg-white text-[#047857] hover:bg-slate-50 font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl border-none active:scale-95 transition-all">
                                    <Wallet className="mr-2 h-4 w-4" /> {t('stats.payout_request')}
                                </Button>
                            </div>
                        </Card>
                    </Link>

                    <div className="grid grid-cols-2 gap-4">
                        <StatWidget 
                            icon={Users} 
                            label={t('enrollments')} 
                            value={analytics.totalStudentsCount.toString()} 
                            subLabel={t('stats.active_students')}
                            color="text-blue-400"
                            bgColor="bg-blue-500/10"
                        />
                        <StatWidget 
                            icon={Percent} 
                            label="Impact" 
                            value={`${analytics.successRate}%`} 
                            subLabel={t('stats.completion_rate')}
                            color="text-[#10b981]"
                            bgColor="bg-[#10b981]/10"
                        />
                    </div>
                </div>

                {/* --- GROWTH RADAR (Chart) --- */}
                <Card className="bg-[#1e293b]/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h3 className="font-black text-white text-xs uppercase tracking-[0.3em]">{t('stats.treasury')}</h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Radar de croissance trimestriel</p>
                        </div>
                        <div className="bg-[#0f172a] px-3 py-1.5 rounded-xl border border-white/5 text-[9px] font-black text-primary uppercase tracking-widest shadow-inner">
                            LIVE FEED
                        </div>
                    </div>
                    <div className="h-56 w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.chartData}>
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white" opacity={0.05} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#475569', fontSize: 10, fontWeight: '900'}} 
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px'}} 
                                    itemStyle={{color: '#10b981', fontWeight: 'bold'}}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="#10b981" 
                                    strokeWidth={4} 
                                    fill="url(#chartGradient)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* --- TO CORRECT SECTION --- */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
                            <Zap className="h-3 w-3 text-red-500 fill-current animate-pulse" />
                            {t('to_correct')}
                        </h2>
                        <Link href="/instructor/devoirs" className="text-primary text-[10px] font-black uppercase tracking-widest hover:text-white transition group flex items-center gap-1">
                            {t('revenue_by_course')}
                            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid gap-3">
                        {pendingSubmissions.length > 0 ? (
                            pendingSubmissions.map(sub => (
                                <Card key={sub.id} className="bg-[#1e293b] rounded-[2rem] p-4 border border-white/5 flex items-center gap-4 shadow-xl active:scale-[0.98] transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12" />
                                    <Avatar className="h-12 w-12 border-2 border-white/10 shadow-lg group-hover:border-primary/30 transition-colors shrink-0">
                                        <AvatarImage src={sub.studentAvatarUrl} className="object-cover" />
                                        <AvatarFallback className="bg-slate-800 text-slate-500 font-bold uppercase">
                                            {sub.studentName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <h4 className="font-black text-white text-[13px] truncate uppercase tracking-tight leading-none mb-1">{sub.studentName}</h4>
                                        <p className="text-slate-500 text-[10px] font-bold truncate italic">"{sub.assignmentTitle}"</p>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#10b981]" />
                                            <span className="text-slate-600 text-[8px] font-black uppercase tracking-widest">En attente d'arbitrage</span>
                                        </div>
                                    </div>
                                    <Button asChild className="h-10 px-5 rounded-2xl bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black uppercase text-[10px] tracking-widest shadow-xl border-none shrink-0 transition-all active:scale-90">
                                        <Link href="/instructor/devoirs">Noter</Link>
                                    </Button>
                                </Card>
                            ))
                        ) : (
                            <div className="py-12 text-center bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-white/5 opacity-20 flex flex-col items-center">
                                <ClipboardCheck className="h-10 w-10 text-slate-700 mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t('all_corrected')}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- QUICK COMMANDS --- */}
                <div className="grid grid-cols-2 gap-4 pb-12">
                    <CommandCard icon={Video} label={t('manage_catalog')} href="/instructor/courses/create" color="text-primary bg-primary/10" />
                    <CommandCard icon={Megaphone} label="Diffuser Annonce" href="/instructor/annonces" color="text-blue-400 bg-blue-500/10" />
                </div>

            </main>
        </div>
    );
}

function StatWidget({ icon: Icon, label, value, subLabel, color, bgColor }: any) {
    return (
        <Card className="bg-[#1e293b] rounded-[2rem] p-5 border border-white/5 shadow-xl active:scale-[0.98] transition-all group overflow-hidden relative">
            <div className={cn("absolute -right-2 -top-2 w-12 h-12 rounded-full blur-2xl opacity-10", bgColor.replace('/10', ''))} />
            <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shadow-inner", bgColor, color)}>
                    <Icon size={18} />
                </div>
                <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
            </div>
            <p className="text-white font-black text-3xl leading-none relative z-10 tracking-tighter">{value}</p>
            <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest mt-1.5 relative z-10">{subLabel}</p>
        </Card>
    );
}

function CommandCard({ icon: Icon, label, href, color }: any) {
    return (
        <Link href={href} className="block group active:scale-95 transition-all">
            <Card className="bg-[#1e293b] rounded-[2rem] p-6 border border-white/5 flex flex-col items-center justify-center gap-4 shadow-xl group-hover:border-primary/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center transition-all shadow-inner group-hover:scale-110", color)}>
                    <Icon size={24} />
                </div>
                <span className="text-white text-[9px] font-black uppercase tracking-[0.25em] text-center relative z-10">{label}</span>
            </Card>
        </Link>
    );
}

