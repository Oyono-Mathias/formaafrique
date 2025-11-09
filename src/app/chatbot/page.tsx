'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { aiTutorChatbot, AiTutorChatbotOutput } from '@/ai/ai-tutor-chatbot';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  sources?: AiTutorChatbotOutput['sources'];
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-bot-message',
      text: "Bonjour ! Je suis Mathias, votre tuteur virtuel pour FormaAfrique. Comment puis-je vous aider aujourd'hui ? Posez-moi une question sur vos formations.",
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, userProfile } = useUser();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const userImage = user?.photoURL || userAvatar?.imageUrl;

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiTutorChatbot({
        question: currentQuery,
        formationId: userProfile?.formationId,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        sender: 'bot',
        sources: response.sources,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error with AI tutor:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur du chatbot',
        description: "Désolé, je n'ai pas pu répondre. Veuillez réessayer.",
      });
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-primary/5">
      <header className="p-4 border-b text-center bg-card z-10">
        <h1 className="text-2xl font-bold font-headline text-primary">Tuteur Virtuel FormaAfrique 🤖</h1>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
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
                    'max-w-md md:max-w-lg p-4 rounded-lg shadow-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  )}
                >
                  <p>{message.text}</p>
                </div>
                 {message.sender === 'user' && user && (
                  <Avatar>
                    {userImage && <AvatarImage src={userImage} />}
                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4 justify-start">
                  <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                  <div className="max-w-md p-4 rounded-lg shadow bg-card">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <footer className="p-4 border-t bg-background z-10">
        <div className="flex items-center gap-4 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez votre question ici..."
            className="flex-1 h-12"
            disabled={isLoading}
          />
          <Button onClick={handleSend} size="icon" className="h-12 w-12 flex-shrink-0" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            <span className="sr-only">Envoyer</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
