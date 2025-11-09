
'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import type { Course, InstructorRequest, UserProfile } from '@/lib/types';
import { Loader2, Search, Filter, MoreVertical, Eye, Check, X, ShieldAlert, UserCheck, Link as LinkIcon, MessageCircle, Video, TrendingUp, AlertCircle, CircleDot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/lib/categories';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function AdminValidationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Validation</h1>
        <p className="text-muted-foreground">Approuvez ou rejetez les nouvelles soumissions.</p>
      </div>
      <Tabs defaultValue="instructors" className="w-full">
        <TabsList>
          <TabsTrigger value="instructors">Demandes des Formateurs</TabsTrigger>
          <TabsTrigger value="courses">Formations à valider</TabsTrigger>
        </TabsList>
        <TabsContent value="instructors">
          <InstructorsValidationTab />
        </TabsContent>
        <TabsContent value="courses">
          <CoursesValidationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}


function CoursesValidationTab() {
  const { data: coursesData, loading, error } = useCollection<Course>('formations');
  const courses = coursesData || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<any>('en_attente');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [courseToReject, setCourseToReject] = useState<Course | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const db = useFirestore();
  const { toast } = useToast();

  const filteredCourses = useMemo(() => {
    return courses
      .filter(course => statusFilter === 'tous' /*|| course.statut === statusFilter*/)
      .filter(course => categoryFilter === 'all' || course.categoryId === categoryFilter)
      .filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [courses, searchTerm, statusFilter, categoryFilter]);

  const handleApprove = async (course: Course) => {
    if (!db || !course.id) return;
    const courseRef = doc(db, 'formations', course.id);
    try {
      await updateDoc(courseRef, {
        statut: 'approuvee',
        publie: true,
        dateValidation: serverTimestamp(),
      });
      toast({
        title: 'Formation Approuvée',
        description: `"${course.title}" est maintenant visible par les étudiants.`,
      });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'approuver la formation.' });
    }
  };

  const handleReject = async () => {
    if (!db || !courseToReject?.id || !rejectionReason) return;
    const courseRef = doc(db, 'formations', courseToReject.id);
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
  
  const getStatusBadge = (status: any) => {
    switch (status) {
      case 'approuvee': return <Badge variant="default" className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejetee': return <Badge variant="destructive">Rejetée</Badge>;
      case 'en_attente':
      default: return <Badge variant="secondary">En attente</Badge>;
    }
  };

  return (
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
          <Select onValueChange={(value) => setStatusFilter(value)} defaultValue="en_attente">
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
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Soumission</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell><Badge variant="outline">{course.categoryId}</Badge></TableCell>
                    <TableCell>{formatDate(course.createdAt)}</TableCell>
                    <TableCell className="text-center">{getStatusBadge('en_attente')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
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
       <Dialog open={!!courseToReject} onOpenChange={() => setCourseToReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'><ShieldAlert/> Confirmer le rejet</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de rejeter la formation "{courseToReject?.title}". Veuillez fournir un motif clair pour le formateur.
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
    </Card>
  );
}

function InstructorsValidationTab() {
    const { data: requests, loading, error } = useCollection<InstructorRequest>('instructor_requests');
    const { data: users, loading: usersLoading } = useCollection<UserProfile>('users');
    const db = useFirestore();
    const { toast } = useToast();
    const [selectedRequest, setSelectedRequest] = useState<InstructorRequest | null>(null);

    const pendingRequests = useMemo(() => (requests || []).filter(r => r.status === 'pending'), [requests]);
    const usersMap = useMemo(() => {
        const map = new Map<string, UserProfile>();
        (users || []).forEach(u => map.set(u.id!, u));
        return map;
    }, [users]);
    
    const handleDecision = async (request: InstructorRequest, decision: 'approved' | 'rejected') => {
        if (!db || !request.id || !request.userId) return;
        const requestRef = doc(db, 'instructor_requests', request.id);
        const userRef = doc(db, 'users', request.userId);

        try {
            const batch = writeBatch(db);
            
            if (decision === 'approved') {
                batch.update(userRef, { role: 'formateur' });
            }
            batch.update(requestRef, { status: decision });
            await batch.commit();

            toast({ title: `Demande ${decision === 'approved' ? 'Approuvée' : 'Rejetée'}`, description: `${request.userName} a été notifié.` });
            if (selectedRequest?.id === request.id) {
                setSelectedRequest(null);
            }

        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de traiter la demande.' });
        }
    };

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        const d = date instanceof Timestamp ? date.toDate() : new Date(date);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getStatusBadge = (status?: 'pending' | 'approved' | 'rejected' | 'éligible' | 'en_attente' | 'refusé') => {
        switch (status) {
            case 'approved':
            case 'éligible':
                return <Badge className="bg-green-100 text-green-800">Éligible</Badge>;
            case 'rejected':
            case 'refusé':
                return <Badge variant="destructive">Refusé</Badge>;
            case 'pending':
            case 'en_attente':
            default:
                return <Badge variant="secondary">En attente</Badge>;
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Demandes de statut Formateur</CardTitle>
                <CardDescription>Validez les utilisateurs qui souhaitent devenir formateurs. L'IA a déjà effectué une pré-analyse.</CardDescription>
            </CardHeader>
            <CardContent>
                {(loading || usersLoading) ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : error ? (
                    <div className="text-destructive text-center py-12">❌ Erreur de chargement des demandes.</div>
                ) : (
                     <div className="overflow-x-auto">
                         <Table>
                             <TableHeader>
                                 <TableRow>
                                     <TableHead>Nom</TableHead>
                                     <TableHead>Score IA</TableHead>
                                     <TableHead>Statut IA</TableHead>
                                     <TableHead>Date</TableHead>
                                     <TableHead className="text-right">Actions</TableHead>
                                 </TableRow>
                             </TableHeader>
                             <TableBody>
                                {pendingRequests && pendingRequests.length > 0 ? pendingRequests.map((request) => (
                                     <TableRow key={request.id}>
                                         <TableCell className="font-medium">{request.userName}</TableCell>
                                         <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <Progress value={(request as any).scoreFinal || 0} className="w-24" />
                                                <span>{(request as any).scoreFinal || 0}%</span>
                                            </div>
                                         </TableCell>
                                         <TableCell>
                                             {getStatusBadge((request as any).statut)}
                                         </TableCell>
                                         <TableCell>{formatDate(request.requestDate)}</TableCell>
                                         <TableCell className="text-right">
                                            <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)}><Eye className="mr-2 h-4 w-4" />Consulter le dossier</Button>
                                         </TableCell>
                                     </TableRow>
                                 )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">Aucune demande en attente.</TableCell>
                                    </TableRow>
                                 )}
                             </TableBody>
                         </Table>
                     </div>
                )}
            </CardContent>
            {selectedRequest && (
                <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                             <DialogTitle className="font-headline text-2xl">Dossier de candidature</DialogTitle>
                             <DialogDescription>{selectedRequest.userName}</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 grid md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-4">
                            <div className='space-y-4'>
                                <div className='flex items-center gap-4'>
                                    <Avatar className='h-16 w-16'>
                                        <AvatarImage src={usersMap.get(selectedRequest.userId)?.photoURL || ''} />
                                        <AvatarFallback>{selectedRequest.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className='font-bold text-lg'>{selectedRequest.userName}</p>
                                        <p className='text-sm text-muted-foreground'>{selectedRequest.userEmail}</p>
                                    </div>
                                </div>
                                <p><strong>Spécialité :</strong> {selectedRequest.specialite}</p>
                                <div>
                                    <strong>Motivation :</strong>
                                    <blockquote className="mt-2 border-l-2 pl-4 text-sm italic">{selectedRequest.motivation}</blockquote>
                                </div>
                                <div className='space-y-2'>
                                    <strong>Liens :</strong>
                                    <div className='flex items-center gap-2'><Video className='h-4 w-4' /><a href={selectedRequest.videoUrl} target="_blank" rel="noopener noreferrer" className='text-primary hover:underline truncate'>Vidéo de présentation</a></div>
                                    {Object.entries(selectedRequest.socialLinks || {}).map(([key, value]) => value && (
                                        <div key={key} className='flex items-center gap-2'><LinkIcon className='h-4 w-4' /><a href={value as string} target="_blank" rel="noopener noreferrer" className='text-primary hover:underline truncate'>{key.replace('Url', '')}</a></div>
                                    ))}
                                </div>
                            </div>
                            <Card className='bg-muted/50'>
                                <CardHeader>
                                    <CardTitle className='text-lg flex items-center gap-2'><TrendingUp/> Analyse de FormaIA</CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                     <div>
                                        <div className='flex justify-between items-baseline mb-1'>
                                            <span className='font-bold'>Score Final</span>
                                            <span className='text-2xl font-bold text-primary'>{(selectedRequest as any).scoreFinal || 'N/A'}</span>
                                        </div>
                                        <Progress value={(selectedRequest as any).scoreFinal || 0} />
                                     </div>
                                     <div>
                                        <span className='font-bold'>Statut suggéré:</span> {getStatusBadge((selectedRequest as any).statut)}
                                     </div>
                                     <div>
                                        <p className='font-bold'>Feedback de l'IA :</p>
                                        <p className='text-sm text-muted-foreground italic'>“{(selectedRequest as any).feedbackMessage || 'Aucun feedback généré.'}”</p>
                                     </div>
                                      {(selectedRequest as any).badge && (
                                         <div className='flex items-center gap-2 pt-2 border-t'>
                                            <span className='font-bold'>Badges :</span>
                                            <Badge>{(selectedRequest as any).badge}</Badge>
                                         </div>
                                     )}
                                </CardContent>
                            </Card>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setSelectedRequest(null)}>Fermer</Button>
                            <Button variant="destructive" onClick={() => handleDecision(selectedRequest, 'rejected')}><X className='mr-2 h-4 w-4'/> Rejeter</Button>
                            <Button className='bg-green-600 hover:bg-green-700' onClick={() => handleDecision(selectedRequest, 'approved')}><Check className='mr-2 h-4 w-4'/> Approuver</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    )
}
