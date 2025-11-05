'use client';

import React, { useMemo } from 'react';
import { useUser } from '@/firebase';
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts";
import { Wallet, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// --- MOCK DATA ---
// Ces données sont fictives et seront remplacées par des données Firestore réelles.
const mockSales = [
    { id: 'sale1', courseName: 'Introduction à la comptabilité', date: new Date('2024-05-15'), amount: 15000, currency: 'XAF' },
    { id: 'sale2', courseName: 'Marketing Digital pour Débutants', date: new Date('2024-05-20'), amount: 20000, currency: 'XAF' },
    { id: 'sale3', courseName: 'Création d’entreprise de A à Z', date: new Date('2024-06-02'), amount: 25000, currency: 'XAF' },
    { id: 'sale4', courseName: 'Introduction à la comptabilité', date: new Date('2024-06-10'), amount: 15000, currency: 'XAF' },
    { id: 'sale5', courseName: 'Développement Web & Mobile', date: new Date('2024-06-18'), amount: 35000, currency: 'XAF' },
    { id: 'sale6', courseName: 'Marketing Digital pour Débutants', date: new Date('2024-07-01'), amount: 20000, currency: 'XAF' },
    { id: 'sale7', courseName: 'Introduction à la comptabilité', date: new Date('2024-07-05'), amount: 15000, currency: 'XAF' },
];
// --- END MOCK DATA ---

const chartConfig = {
  revenue: {
    label: "Revenus (XAF)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function FormateurRevenuesPage() {
    const { user } = useUser();

    // --- MOCK DATA LOGIC ---
    const { totalRevenue, monthlyRevenue, totalSales, salesByMonth, topCourses } = useMemo(() => {
        const totalRevenue = mockSales.reduce((acc, sale) => acc + sale.amount, 0);
        const now = new Date();
        const currentMonthSales = mockSales.filter(s => s.date.getMonth() === now.getMonth() && s.date.getFullYear() === now.getFullYear());
        const monthlyRevenue = currentMonthSales.reduce((acc, sale) => acc + sale.amount, 0);

        const salesByMonthData: Record<string, number> = {};
        const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        for (let i = 0; i < 12; i++) { salesByMonthData[monthLabels[i]] = 0; }
        mockSales.forEach(sale => {
            const monthName = monthLabels[sale.date.getMonth()];
            salesByMonthData[monthName] += sale.amount;
        });
        const salesByMonth = Object.keys(salesByMonthData).map(month => ({ month, revenue: salesByMonthData[month] }));

        const courseSales = mockSales.reduce((acc, sale) => {
            if (!acc[sale.courseName]) {
                acc[sale.courseName] = 0;
            }
            acc[sale.courseName]++;
            return acc;
        }, {} as Record<string, number>);
        const topCourses = Object.entries(courseSales).map(([name, sales]) => ({ name, sales })).sort((a,b) => b.sales - a.sales).slice(0, 5);

        return { totalRevenue, monthlyRevenue, totalSales: mockSales.length, salesByMonth, topCourses };
    }, []);
    // --- END MOCK DATA LOGIC ---

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
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Total des gains depuis le début.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gains ce mois-ci</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
                         <p className="text-xs text-muted-foreground">+20.1% par rapport au mois dernier</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventes Totales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalSales}</div>
                        <p className="text-xs text-muted-foreground">Nombre total de formations vendues.</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-5">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Évolution des revenus mensuels</CardTitle>
                        <CardDescription>Année 2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <AreaChart data={salesByMonth} accessibilityLayer>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis tickFormatter={(value) => `${Number(value)/1000}k`} tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <defs>
                                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#fillRevenue)" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Formations les plus vendues</CardTitle>
                        <CardDescription>Top 5 de vos formations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topCourses.map((course) => (
                                <div key={course.name} className="flex items-center">
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium leading-none">{course.name}</p>
                                    </div>
                                    <div className="ml-4 text-sm font-semibold">{course.sales} ventes</div>
                                </div>
                            ))}
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
                            {mockSales.sort((a,b) => b.date.getTime() - a.date.getTime()).map(sale => (
                                <TableRow key={sale.id}>
                                    <TableCell className="font-medium">{sale.courseName}</TableCell>
                                    <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(sale.date)}</TableCell>
                                    <TableCell className="hidden sm:table-cell text-center">
                                        <Badge variant="default">Payé</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(sale.amount, sale.currency)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}