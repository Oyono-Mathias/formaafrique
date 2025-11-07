'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ShieldAlert } from 'lucide-react';

export default function AdminBehaviorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Comportements & Sécurité</h1>
        <p className="text-muted-foreground">
          Surveillez les activités des utilisateurs et gérez la sécurité de la plateforme.
        </p>
      </div>

      <Card className="border-amber-500 border-2 bg-amber-50">
        <CardHeader className="flex flex-row items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-amber-600" />
          <div>
            <CardTitle className="text-amber-800">Page en construction</CardTitle>
            <CardDescription className="text-amber-700">
              Ce module de surveillance est en cours de développement. Les fonctionnalités de journalisation des activités et de statistiques seront bientôt disponibles ici.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
      
       {/* Placeholder for future content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actions (Aujourd'hui)</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">...</div>
                 <p className="text-xs text-muted-foreground">Chargement...</p>
            </CardContent>
        </Card>
        {/* Other stat cards will go here */}
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Journal d'activité des utilisateurs</CardTitle>
             <CardDescription>Les actions importantes des utilisateurs apparaîtront ici.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="text-center py-12 text-muted-foreground">
                <p>La journalisation des activités est en cours de mise en place.</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
