'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

export default function VideoPlaybackPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Options de lecture vidéo</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <Label htmlFor="background-audio" className="font-medium">
              Lecture audio en arrière-plan
            </Label>
            <Switch id="background-audio" defaultChecked />
          </div>
          <Separator />
          <div className="p-4 flex items-center justify-between">
            <Label htmlFor="autoplay" className="font-medium">
              Lire automatiquement la session suivante
            </Label>
            <Switch id="autoplay" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
