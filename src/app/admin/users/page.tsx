'use client';

import { useCollection } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Loader2, ShieldAlert, ShieldCheck, User } from 'lucide-react';
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
} from "@/components/ui/select"
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';


export default function AdminUsersPage() {
  const { data: users, loading, error } = useCollection<UserProfile & { id: string }>('users');
  const db = useFirestore();
  const { toast } = useToast();

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'etudiant') => {
    if (!db) return;
    
    const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, { role: newRole });
      toast({
        title: "Rôle mis à jour",
        description: `L'utilisateur est maintenant ${newRole === 'admin' ? 'un administrateur' : 'un étudiant'}.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: "Erreur lors de la mise à jour",
        description: "Le rôle n'a pas pu être modifié. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">
          Gérez les rôles et les accès des utilisateurs de la plateforme.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            Changez le rôle d'un utilisateur pour lui donner ou retirer les droits d'administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
             {loading && (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className='ml-2'>Chargement des utilisateurs...</p>
                </div>
             )}
             {error && (
                <div className="text-destructive text-center">Erreur de chargement des utilisateurs.</div>
             )}
             {!loading && !error && (
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead className='text-right'>Rôle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                           <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                                <TableCell className="text-right">
                                     <Select
                                        defaultValue={user.role}
                                        onValueChange={(value: 'admin' | 'etudiant') => handleRoleChange(user.id, value)}
                                    >
                                        <SelectTrigger className="w-[180px] float-right">
                                            <SelectValue placeholder="Changer le rôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="etudiant">
                                                <div className='flex items-center gap-2'>
                                                    <User className='h-4 w-4'/>
                                                    Étudiant
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                 <div className='flex items-center gap-2'>
                                                    <ShieldCheck className='h-4 w-4'/>
                                                    Administrateur
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                 </Table>
             )}
        </CardContent>
       </Card>
    </div>
  );
}
