'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import type { Course } from '@/lib/types';
import { Loader2, Search, Filter, MoreVertical, Eye, Check, X, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/lib/categories';

type StatusFilter = 'tous' | 'en_attente' | 'approuvee' | 'rejetee';

export default function AdminValidationPage() {
  const { data: coursesData, loading, error } = useCollection<Course>('courses');
  const courses = coursesData || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('en_attente');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [courseToReject, setCourseToReject] = useState<Course | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const db = useFirestore();
  const { toast } = useToast();

  const filteredCourses = useMemo(() => {
    return courses
      .filter(course => statusFilter === 'tous' || course.statut === statusFilter)
      .filter(course => categoryFilter === 'all' || course.categorie === categoryFilter)
      .filter(course =>
        course.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.auteur.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [courses, searchTerm, statusFilter, categoryFilter]);

  const handleApprove = async (course: Course) => {
    if (!db || !course.id) return;
    const courseRef = doc(db, 'courses', course.id);
    try {
      await updateDoc(courseRef, {
        statut: 'approuvee',
        publie: true,
        dateValidation: serverTimestamp(),
      });
      toast({
        title: 'Formation Approuvée',
        description: `"${course.titre}" est maintenant visible par les étudiants.`,
      });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'approuver la formation.' });
    }
  };

  const handleReject = async () => {
    if (!db || !courseToReject?.id || !rejectionReason) return;
    const courseRef = doc(db, 'courses', courseToReject.id);
    try {
      await updateDoc(courseRef, {
        statut: 'rejetee',
        publie: false,
        motifRejet: rejectionReason,
        dateValidation: serverTimestamp(),
      });
      toast({
        title: 'Formation Rejetée',
        description: `Le formateur sera notifié du motif.`,
      });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de rejeter la formation.' });
    } finally {
      setCourseToReject(null);
      setRejectionReason('');
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  const getStatusBadge = (status: Course['statut']) => {
    switch (status) {
      case 'approuvee': return <Badge variant="default" className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejetee': return <Badge variant="destructive">Rejetée</Badge>;
      case 'en_attente':
      default: return <Badge variant="secondary">En attente</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Validation des Formations</h1>
        <p className="text-muted-foreground">Approuvez ou rejetez les formations soumises par les formateurs.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle>Formations soumises</CardTitle>
              <CardDescription>Recherchez, filtrez et validez les formations.</CardDescription>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par titre, auteur..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select onValueChange={(value: StatusFilter) => setStatusFilter(value)} defaultValue="en_attente">
              <SelectTrigger><div className="flex items-center gap-2"><Filter className="h-4 w-4" /> Statut</div></SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="approuvee">Approuvée</SelectItem>
                <SelectItem value="rejetee">Rejetée</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setCategoryFilter(value)} defaultValue="all">
              <SelectTrigger><div className="flex items-center gap-2"><Filter className="h-4 w-4" /> Catégorie</div></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : error ? (
            <div className="text-destructive text-center py-12">❌ Erreur de chargement des formations.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Soumission</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.titre}</TableCell>
                      <TableCell>{course.auteur}</TableCell>
                      <TableCell><Badge variant="outline">{course.categorie}</Badge></TableCell>
                      <TableCell>{formatDate(course.date_creation)}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(course.statut)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/apercu/${course.id}`}><Eye className="mr-2 h-4 w-4" />Aperçu</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handleApprove(course)} className="text-green-600 focus:text-green-600">
                              <Check className="mr-2 h-4 w-4" />Approuver
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setCourseToReject(course)} className="text-destructive focus:text-destructive">
                              <X className="mr-2 h-4 w-4" />Rejeter
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">Aucune formation ne correspond à vos filtres.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!courseToReject} onOpenChange={() => setCourseToReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'><ShieldAlert/> Confirmer le rejet</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de rejeter la formation "{courseToReject?.titre}". Veuillez fournir un motif clair pour le formateur.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: La qualité vidéo est insuffisante, la description du cours est trop courte..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
