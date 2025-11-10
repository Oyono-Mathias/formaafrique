'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useUser, useCollection } from '@/firebase';
import type { Course, Enrollment } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Wallet, TrendingUp, ShoppingCart, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/firebase/config';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';


interface Sale {
    id: string;
    courseName: string;
    date: Date;
    amount: number;
    currency: string;
}

const chartConfig = {
  revenue: {
    label: "Revenus (XAF)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function FormateurRevenuesPage() {
    const { user } = useUser();
    const { data: coursesData, loading: coursesLoading } = useCollection<Course>(
        'formations',
        // In a real app with instructor-specific courses:
        // user?.uid ? { where: ['authorId', '==', user.uid] } : undefined
    );
    
    const [sales, setSales] = useState<Sale[]>([]);
    const [salesLoading, setSalesLoading] = useState(true);

    useEffect(() => {
        if (!db || !coursesData || coursesData.length === 0) {
            if (!coursesLoading) setSalesLoading(false);
            return;
        }

        setSalesLoading(true);
        const unsubscribes = coursesData.map(course => {
            if (!course.id) return () => {};
            const enrollmentsQuery = query(collection(db, `formations/${course.id}/enrollments`));
            
            return onSnapshot(enrollmentsQuery, (snapshot) => {
                const courseSales = snapshot.docs.map(doc => {
                    const enrollment = doc.data() as Enrollment;
                    return {
                        id: doc.id,
                        courseName: enrollment.courseTitle,
                        date: (enrollment.enrollmentDate as unknown as Timestamp)?.toDate(),
                        amount: course.price || 0,
                        currency: 'XAF',
                    };
                }).filter(sale => sale.date && sale.amount > 0);

                setSales(prevSales => {
                    const otherSales = prevSales.filter(s => !s.id.startsWith(course.id!));
                    return [...otherSales, ...courseSales];
                });
            });
        });
        
        // This logic helps determine when initial loading is done.
        Promise.all(unsubscribes).then(() => setSalesLoading(false));

        return () => unsubscribes.forEach(unsub => unsub());

    }, [coursesData, coursesLoading, db]);

    const { totalRevenue, monthlyRevenue, totalSales, salesByMonth, topCourses } = useMemo(() => {
        const total = sales.reduce((acc, sale) => acc + sale.amount, 0);
        const now = new Date();
        const currentMonthSales = sales.filter(s => s.date.getMonth() === now.getMonth() && s.date.getFullYear() === now.getFullYear());
        const monthly = currentMonthSales.reduce((acc, sale) => acc + sale.amount, 0);

        const salesByMonthData: Record<string, number> = {};
        const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        for (let i = 0; i < 12; i++) { salesByMonthData[monthLabels[i]] = 0; }
        sales.forEach(sale => {
            const monthName = monthLabels[sale.date.getMonth()];
            salesByMonthData[monthName] += sale.amount;
        });
        const salesData = Object.keys(salesByMonthData).map(month => ({ month, revenue: salesByMonthData[month] }));

        const courseSales = sales.reduce((acc, sale) => {
            if (!acc[sale.courseName]) {
                acc[sale.courseName] = 0;
            }
            acc[sale.courseName]++;
            return acc;
        }, {} as Record<string, number>);
        const top = Object.entries(courseSales).map(([name, sales]) => ({ name, sales })).sort((a,b) => b.sales - a.sales).slice(0, 5);

        return { totalRevenue: total, monthlyRevenue: monthly, totalSales: sales.length, salesByMonth: salesData, topCourses: top };
    }, [sales]);

    const loading = coursesLoading || salesLoading;

    const formatCurrency = (amount: number, currency: string = 'XAF') => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
    }
    
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Mes Revenus</h1>
                <p className="text-muted-foreground">
                    Suivez les gains, les ventes et les statistiques de vos formations.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className='h-6 w-6 animate-spin' /> : <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>}
                        <p className="text-xs text-muted-foreground">Total des gains depuis le début.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gains ce mois-ci</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className='h-6 w-6 animate-spin' /> : <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>}
                         <p className="text-xs text-muted-foreground">+20.1% par rapport au mois dernier (simulé)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventes Totales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className='h-6 w-6 animate-spin' /> : <div className="text-2xl font-bold">+{totalSales}</div>}
                        <p className="text-xs text-muted-foreground">Nombre total de formations vendues.</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-5">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Évolution des revenus mensuels</CardTitle>
                        <CardDescription>Année en cours</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {loading ? <div className='h-[300px] w-full flex items-center justify-center'><Loader2 className='h-8 w-8 animate-spin'/></div> : (
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <AreaChart data={salesByMonth} accessibilityLayer>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis tickFormatter={(value) => `${Number(value)/1000}k`} tickLine={false} axisLine={false} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                    <defs>
                                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#fillRevenue)" />
                                </AreaChart>
                            </ChartContainer>
                       )}
                    </CardContent>
                </Card>
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Formations les plus vendues</CardTitle>
                        <CardDescription>Top 5 de vos formations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? <Loader2 className='h-6 w-6 animate-spin'/> : topCourses.length > 0 ? topCourses.map((course) => (
                                <div key={course.name} className="flex items-center">
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium leading-none">{course.name}</p>
                                    </div>
                                    <div className="ml-4 text-sm font-semibold">{course.sales} ventes</div>
                                </div>
                            )) : <p className='text-sm text-muted-foreground'>Aucune vente enregistrée.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historique des Ventes</CardTitle>
                    <CardDescription>Liste de toutes les transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                   {loading ? <div className='h-40 flex items-center justify-center'><Loader2 className='h-8 w-8 animate-spin'/></div> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Formation</TableHead>
                                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                                    <TableHead className="hidden sm:table-cell text-center">Statut</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.length > 0 ? sales.sort((a,b) => b.date.getTime() - a.date.getTime()).map(sale => (
                                    <TableRow key={sale.id}>
                                        <TableCell className="font-medium">{sale.courseName}</TableCell>
                                        <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(sale.date)}</TableCell>
                                        <TableCell className="hidden sm:table-cell text-center">
                                            <Badge variant="default">Payé</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(sale.amount, sale.currency)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">Aucune vente enregistrée pour le moment.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                   )}
                </CardContent>
            </Card>
        </div>
    );
}