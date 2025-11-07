'use client';

import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

// Component for multi-colored progress bar
const MultiProgress = ({ values }: { values: { value: number, color: string }[] }) => {
    let cumulative = 0;
    return (
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            {values.map((item, index) => {
                const start = cumulative;
                cumulative += item.value;
                return (
                    <div
                        key={index}
                        className={`absolute h-full transition-all ${item.color}`}
                        style={{
                            left: `${start}%`,
                            width: `${item.value}%`,
                        }}
                    />
                );
            })}
        </div>
    );
};


export default function DownloadOptionsPage() {

    // Mock data for storage usage
    const storageData = {
        autre: 194.5,
        udemy: 11.8,
        gratuit: 35.1,
        total: 256,
    };
    
    const progressValues = [
        { value: (storageData.autre / storageData.total) * 100, color: "bg-purple-600" },
        { value: (storageData.udemy / storageData.total) * 100, color: "bg-pink-500" },
        { value: ((storageData.total - storageData.autre - storageData.udemy - storageData.gratuit) / storageData.total) * 100, color: "bg-gray-300" } // Represents the free part
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/settings">
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">Options de téléchargement</h1>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="p-4">
                        <button className="flex justify-between items-center w-full">
                            <div>
                                <p className="font-medium">Qualité de téléchargement de la vidéo</p>
                                <p className="text-sm text-muted-foreground">720p</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                    <Separator />
                    <div className="p-4 flex items-center justify-between">
                        <Label htmlFor="wifi-only" className="font-medium">
                            Téléchargement par Wi-Fi uniquement
                        </Label>
                        <Switch id="wifi-only" defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold">Téléphone</h3>
                    <MultiProgress values={progressValues} />
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-purple-600"></div>
                            <p>Autre : {storageData.autre} GB</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-sm bg-pink-500"></div>
                            <p>FormaAfrique : {storageData.udemy} GB</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-sm bg-gray-300"></div>
                            <p>Gratuit : {storageData.gratuit} GB</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
