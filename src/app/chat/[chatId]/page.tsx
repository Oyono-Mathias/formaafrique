'use client';

import { useUser } from '@/firebase';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ChatPage() {
    const { chatId } = useParams();
    const { user, loading: userLoading } = useUser();
    const router = useRouter();

    if (userLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!user) {
        notFound();
    }

    return (
        <div className="flex flex-col h-screen bg-muted">
            <CardHeader className="flex-shrink-0 bg-background border-b flex flex-row items-center justify-between">
                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5"/>
                </Button>
                <div>
                    <h1 className="text-xl font-bold">Chat</h1>
                    <p className="text-xs text-muted-foreground">ID: {chatId}</p>
                </div>
                 <div className="w-8"/>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto">
                {/* Messages will go here */}
                <div className="text-center text-muted-foreground py-8">
                    <p>L'interface de messagerie est en cours de construction.</p>
                    <p>Bientôt, vous pourrez envoyer et recevoir des messages ici.</p>
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t bg-background">
                <div className="flex items-center gap-2 w-full">
                    <Input placeholder="Écrire un message..." />
                    <Button size="icon"><Send/></Button>
                </div>
            </CardFooter>
        </div>
    )
}
