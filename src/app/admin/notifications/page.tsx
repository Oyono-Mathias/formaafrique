'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Notifications</h1>
        <p className="text-muted-foreground">
          Historique de toutes les activités importantes de la plateforme.
        </p>
      </div>

      <Card className="border-sky-500 border-2 bg-sky-50">
        <CardHeader className="flex flex-row items-center gap-4">
          <Bell className="w-8 h-8 text-sky-600" />
          <div>
            <CardTitle className="text-sky-800">Page en construction</CardTitle>
            <CardDescription className="text-sky-700">
              Ce centre de notifications est en cours de développement. Les notifications en temps réel et l'historique complet seront bientôt disponibles ici.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
      
       {/* Placeholder for future content */}
      <Card>
        <CardHeader>
            <CardTitle>Historique des notifications</CardTitle>
             <CardDescription>Les notifications passées apparaîtront ici.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="text-center py-12 text-muted-foreground">
                <p>Le système de notifications est en cours de mise en place.</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
