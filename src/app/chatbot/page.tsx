'use client';

import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { users } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour ! Je suis votre formateur virtuel IA. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur un cours, un concept spécifique, ou même des exercices.",
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const user = users[0];
  const userAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);

  const handleSend = () => {
    if (input.trim() === '') return;

    const newMessages: Message[] = [
      ...messages,
      { id: Date.now(), text: input, sender: 'user' },
    ];
    setMessages(newMessages);
    setInput('');

    // Mock bot response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          id: Date.now() + 1,
          text: `C'est une excellente question sur "${input}". Laissez-moi vous expliquer... (réponse de l'IA à venir)`,
          sender: 'bot',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-primary/5">
      <header className="p-4 border-b text-center">
        <h1 className="text-2xl font-bold font-headline text-primary">Formateur Virtuel IA</h1>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 md:p-8 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-4',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'bot' && (
                  <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md p-4 rounded-lg shadow',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  )}
                >
                  <p>{message.text}</p>
                </div>
                 {message.sender === 'user' && (
                  <Avatar>
                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} />}
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <footer className="p-4 border-t bg-background">
        <div className="flex items-center gap-4 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez votre question ici..."
            className="flex-1 h-12"
          />
          <Button onClick={handleSend} size="icon" className="h-12 w-12 flex-shrink-0">
            <Send />
            <span className="sr-only">Envoyer</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
