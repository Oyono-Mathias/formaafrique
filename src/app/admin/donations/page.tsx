'use client';

import React, { useState, useMemo } from 'react';
import { useCollection } from '@/firebase';
import type { Donation } from '@/lib/types';
import { Loader2, Search, Download, Filter, Eye, BarChart3, CalendarDays } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts";

type Statut = 'tous' | 'succes' | 'en_attente' | 'echec';

const chartConfig = {
  montant: {
    label: "Montant (XAF)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function AdminDonationsPage() {
  const { data: donations, loading, error } = useCollection<Donation>('donations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Statut>('tous');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const donationsByCountry = useMemo(() => {
    if (!donations) return [];
    const countryData = donations.reduce((acc, donation) => {
      if (donation.statut !== 'succes') return acc;
      const country = donation.paysOrigine || 'Inconnu';
      if (!acc[country]) {
        acc[country] = 0;
      }
      acc[country] += donation.montant;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryData)
      .map(([country, total]) => ({ country, total }))
      .sort((a, b) => b.total - a.total);
  }, [donations]);

  const donationsByMonth = useMemo(() => {
    if (!donations) return [];
    const monthlyData: Record<string, number> = {};
    const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    for (let i = 0; i < 12; i++) {
        monthlyData[monthLabels[i]] = 0;
    }

    donations.forEach(donation => {
        if (donation.statut !== 'succes') return;
        const date = donation.date.toDate();
        const monthName = monthLabels[date.getMonth()];
        monthlyData[monthName] += donation.montant;
    });

    return Object.keys(monthlyData).map(month => ({
      month,
      montant: monthlyData[month],
    }));

  }, [donations]);

  const filteredDonations = useMemo(() => {
    return donations
      .filter(donation => {
        const term = searchTerm.toLowerCase();
        return donation.donateurNom.toLowerCase().includes(term) ||
               donation.donateurEmail.toLowerCase().includes(term);
      })
      .filter(donation => {
        return statusFilter === 'tous' || donation.statut === statusFilter;
      });
  }, [donations, searchTerm, statusFilter]);
  
  const getStatusBadgeVariant = (status: Donation['statut']) => {
    switch (status) {
      case 'succes': return 'default';
      case 'en_attente': return 'secondary';
      case 'echec': return 'destructive';
      default: return 'outline';
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency }).format(amount);
  }

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className='ml-2'>Chargement des données...</p>
        </div>
    )
  }

  if (error) {
      return <div className="text-destructive text-center py-12">❌ Impossible de récupérer les données des dons.</div>
  }

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Gestion des Donations</h1>
        <p className="text-muted-foreground">
          Visualisez, gérez et analysez les dons effectués sur la plateforme.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3/> Dons par Pays</CardTitle>
                <CardDescription>Total des dons reçus par pays.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={donationsByCountry.slice(0, 5)} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="country" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickFormatter={(value) => `${value/1000}k`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="total" fill="var(--color-montant)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
         </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays/> Dons par Mois (Année en cours)</CardTitle>
                 <CardDescription>Évolution mensuelle des dons.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart data={donationsByMonth} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false}/>
                        <YAxis tickFormatter={(value) => `${value/1000}k`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <defs>
                            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-montant)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--color-montant)" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="montant" stroke="var(--color-montant)" fill="url(#fill)" />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
         </Card>
      </div>

       <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle>Liste de toutes les transactions</CardTitle>
              <CardDescription>
                Recherchez, filtrez et consultez les dons.
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter en CSV
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom ou email..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select onValueChange={(value: Statut) => setStatusFilter(value)} defaultValue="tous">
                <SelectTrigger className="w-full md:w-[180px]">
                    <div className='flex items-center gap-2'>
                        <Filter className='h-4 w-4'/>
                        <SelectValue placeholder="Filtrer par statut" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="tous">Tous les statuts</SelectItem>
                    <SelectItem value="succes">Succès</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="echec">Échec</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
             <div className='overflow-x-auto'>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donateur</TableHead>
                        <TableHead className='text-right'>Montant</TableHead>
                        <TableHead className="hidden sm:table-cell text-center">Statut</TableHead>
                        <TableHead className="hidden md:table-cell text-right">Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDonations.length > 0 ? filteredDonations.map((donation) => (
                           <TableRow key={donation.id}>
                                <TableCell>
                                    <div className="font-medium">{donation.donateurNom}</div>
                                    <div className="text-sm text-muted-foreground">{donation.donateurEmail}</div>
                                </TableCell>
                                <TableCell className="font-mono text-right">{formatCurrency(donation.montant, donation.devise)}</TableCell>
                                <TableCell className="hidden sm:table-cell text-center">
                                    <Badge variant={getStatusBadgeVariant(donation.statut)}>
                                        {donation.statut.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-right">{formatDate(donation.date)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedDonation(donation)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                           </TableRow>
                        )) : (
                           <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Aucun don ne correspond à vos critères.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
             </div>
             { donations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Aucun don enregistré pour le moment.</p>
                </div>
             )}
        </CardContent>
       </Card>

        {selectedDonation && (
            <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Détails du Don</DialogTitle>
                        <DialogDescription>
                            ID de la transaction: {selectedDonation.id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 items-center gap-4">
                           <span className='text-muted-foreground'>Nom du Donateur:</span>
                           <span className='font-semibold'>{selectedDonation.donateurNom}</span>
                        </div>
                         <div className="grid grid-cols-2 items-center gap-4">
                           <span className='text-muted-foreground'>Email:</span>
                           <span className='font-semibold'>{selectedDonation.donateurEmail}</span>
                        </div>
                         <div className="grid grid-cols-2 items-center gap-4">
                           <span className='text-muted-foreground'>Montant:</span>
                           <span className='font-semibold'>{formatCurrency(selectedDonation.montant, selectedDonation.devise)}</span>
                        </div>
                         <div className="grid grid-cols-2 items-center gap-4">
                           <span className='text-muted-foreground'>Date:</span>
                           <span className='font-semibold'>{formatDate(selectedDonation.date)}</span>
                        </div>
                         <div className="grid grid-cols-2 items-center gap-4">
                           <span className='text-muted-foreground'>Statut:</span>
                           <Badge variant={getStatusBadgeVariant(selectedDonation.statut)}>
                                {selectedDonation.statut.replace('_', ' ')}
                            </Badge>
                        </div>
                         <div className="grid grid-cols-2 items-center gap-4">
                           <span className='text-muted-foreground'>Moyen de paiement:</span>
                           <span className='font-semibold capitalize'>{selectedDonation.moyenPaiement.replace('_', ' ')}</span>
                        </div>
                         <div className="grid grid-cols-2 items-center gap-4">
                           <span className='text-muted-foreground'>Pays:</span>
                           <span className='font-semibold'>{selectedDonation.paysOrigine}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button">Fermer</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}

    </div>
  );
}

    