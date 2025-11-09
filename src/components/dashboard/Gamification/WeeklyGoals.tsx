'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

const mockGoals: Goal[] = [
  { id: 'g1', text: 'Regarder 2 heures de vidéo', completed: true },
  { id: 'g2', text: 'Terminer un module', completed: false },
  { id: 'g3', text: 'Participer à une discussion', completed: false },
];

/**
 * @component WeeklyGoals
 * Affiche les objectifs hebdomadaires de l'utilisateur et leur statut.
 */
export default function WeeklyGoals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Objectifs de la semaine</CardTitle>
        <CardDescription>Restez motivé et suivez vos progrès !</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {mockGoals.map(goal => (
            <li key={goal.id} className="flex items-center gap-3">
              {goal.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={`text-sm ${goal.completed ? 'text-muted-foreground line-through' : ''}`}>
                {goal.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
