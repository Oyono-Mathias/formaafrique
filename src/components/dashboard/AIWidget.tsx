'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare } from 'lucide-react';
import Link from 'next/link';

/**
 * @component AIWidget
 * A floating action button that links to the dedicated chatbot page.
 * This provides a persistent entry point to the AI Tutor from anywhere in the dashboard.
 */
export default function AIWidget() {
  return (
    <Button
      asChild
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20 animate-slide-up"
      title="Contacter le Tuteur IA"
    >
      <Link href="/chatbot">
        <Bot className="h-7 w-7" />
        <span className="sr-only">Ouvrir le chatbot</span>
      </Link>
    </Button>
  );
}
