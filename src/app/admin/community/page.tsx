'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, BarChart3 } from 'lucide-react';

export default function AdminCommunityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Gestion de la Communauté</h1>
        <p className="text-muted-foreground">
          Modérez les discussions, analysez l'engagement et gérez les membres de la communauté.
        </p>
      </div>

      <Card className="border-blue-500 border-2 bg-blue-50">
        <CardHeader className="flex flex-row items-center gap-4">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <div>
            <CardTitle className="text-blue-800">Page en construction</CardTitle>
            <CardDescription className="text-blue-700">
              Ce module de gestion de la communauté est en cours de développement. Les outils de modération, les statistiques d'engagement et la gestion des utilisateurs seront bientôt disponibles ici.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
      
       {/* Placeholder for future content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nouveaux Messages (24h)</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">...</div>
                 <p className="text-xs text-muted-foreground">Chargement...</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Membres Actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">...</div>
                 <p className="text-xs text-muted-foreground">Chargement...</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux d'Engagement</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">...%</div>
                 <p className="text-xs text-muted-foreground">Chargement...</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Dernières Activités</CardTitle>
             <CardDescription>Les messages et commentaires récents apparaîtront ici pour modération.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="text-center py-12 text-muted-foreground">
                <p>Le flux d'activité de la communauté est en cours de mise en place.</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
