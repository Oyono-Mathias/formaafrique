'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ShieldAlert, BarChart3, Check, Trash2, UserX, MoreVertical, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminModerationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Console de Modération</h1>
        <p className="text-muted-foreground">
          Gérez les contenus signalés et prenez des mesures de modération.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages à réviser</CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">...</div>
                 <p className="text-xs text-muted-foreground">En attente d'action</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Infractions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Contenu Hors-Sujet</div>
                 <p className="text-xs text-muted-foreground">Motif le plus fréquent</p>
            </CardContent>
        </Card>
         <Card className="border-blue-500 border-2 bg-blue-50">
            <CardHeader>
                <CardTitle className="text-blue-800">En Construction</CardTitle>
                <CardDescription className="text-blue-700">
                    Cette page est en cours de développement. Les données sont des exemples.
                </CardDescription>
            </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File d'attente de modération</CardTitle>
          <CardDescription>
            Messages signalés par l'IA ou les utilisateurs, en attente de votre décision.
          </CardDescription>
          <div className="mt-4 flex gap-4">
              <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher par message ou utilisateur..." className="pl-8" />
              </div>
              <Button variant="outline"><Filter className="mr-2 h-4 w-4"/>Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Auteur</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Example Row 1 */}
                    <TableRow>
                        <TableCell>John Doe</TableCell>
                        <TableCell className="max-w-xs truncate">"Viens sur mon whatsapp +237..."</TableCell>
                        <TableCell><Badge variant="destructive">Contact Externe</Badge></TableCell>
                        <TableCell>Il y a 5 min</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem><Check className="mr-2 h-4 w-4"/>Approuver</DropdownMenuItem>
                                    <DropdownMenuItem><UserX className="mr-2 h-4 w-4"/>Suspendre l'auteur</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Supprimer</DropdownMenuItem>
                                </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                    </TableRow>
                     {/* Example Row 2 */}
                    <TableRow>
                        <TableCell>Jane Smith</TableCell>
                        <TableCell className="max-w-xs truncate">"Quelqu'un pour m'aider avec mon devoir de maths ?"</TableCell>
                        <TableCell><Badge variant="secondary">Hors-Sujet</Badge></TableCell>
                        <TableCell>Il y a 1 heure</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem><Check className="mr-2 h-4 w-4"/>Approuver</DropdownMenuItem>
                                    <DropdownMenuItem><UserX className="mr-2 h-4 w-4"/>Suspendre l'auteur</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Supprimer</DropdownMenuItem>
                                </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}
