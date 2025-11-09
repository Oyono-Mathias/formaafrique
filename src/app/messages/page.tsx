'use client';

import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
    return (
        <div className="h-full hidden md:flex flex-col items-center justify-center bg-muted">
            <MessageSquare className="w-16 h-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Vos messages</h2>
            <p className="text-muted-foreground mt-2">
                Sélectionnez une conversation pour commencer à discuter.
            </p>
        </div>
    )
}
