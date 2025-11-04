'use client';

import React, { useState, useMemo } from 'react';
import { useCollection } from '@/firebase';
import type { Donation } from '@/lib/types';
import { Loader2, Search, Download, Filter, Eye } from 'lucide-react';
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

type Statut = 'tous' | 'succes' | 'en_attente' | 'echec';

export default function AdminDonationsPage() {
  const { data: donations, loading, error } = useCollection<Donation>('donations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Statut>('tous');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

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

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Gestion des Donations</h1>
        <p className="text-muted-foreground">
          Visualisez et gérez les dons effectués sur la plateforme.
        </p>
      </div>

       <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle>Liste des dons</CardTitle>
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
             {loading && (
                <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className='ml-2'>Chargement des dons...</p>
                </div>
             )}
             {error && (
                <div className="text-destructive text-center h-60 flex items-center justify-center">Erreur de chargement des dons.</div>
             )}
             {!loading && !error && (
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
             )}
             { !loading && donations.length === 0 && (
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
