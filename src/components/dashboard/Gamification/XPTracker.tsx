'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * @component XPTracker
 * Affiche la barre d'expérience (XP) de l'utilisateur et son niveau.
 * @param {{ xp: number }} props - Le nombre de points d'expérience de l'utilisateur.
 */
export default function XPTracker({ xp = 0 }: { xp: number }) {
  const level = Math.floor(xp / 1000);
  const xpInLevel = xp % 1000;
  const progressPercentage = (xpInLevel / 1000) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Niveau {level}</span>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-right text-xs text-muted-foreground mt-2">{xpInLevel} / 1000 XP</p>
      </CardContent>
    </Card>
  );
}
