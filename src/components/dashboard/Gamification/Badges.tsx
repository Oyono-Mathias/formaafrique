'use client';

import React from 'react';
import { Award, Star, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const mockBadges: BadgeItem[] = [
  { id: 'b1', name: 'Apprenant Sérieux', description: 'Terminer votre première formation', icon: Award },
  { id: 'b2', name: 'Curieux', description: 'Commencer 3 formations différentes', icon: BookOpen },
  { id: 'b3', name: 'Expert', description: 'Obtenir 100% dans une formation', icon: Star },
];

/**
 * @component Badges
 * Affiche les badges obtenus par l'utilisateur.
 * @param {{ badges: string[] }} props - La liste des IDs des badges de l'utilisateur.
 */
export default function Badges({ badges = [] }: { badges: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Badges</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex gap-4">
            {mockBadges.map((badge) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div className={`p-3 rounded-full ${badges.includes(badge.id) ? 'bg-amber-400 text-white' : 'bg-muted text-muted-foreground'}`}>
                    <badge.icon className="h-6 w-6" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">{badge.name}</p>
                  <p>{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
