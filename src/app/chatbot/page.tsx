'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Link as LinkIcon, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { aiTutorChatbot, AiTutorChatbotOutput } from '@/ai/ai-tutor-chatbot';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { TutorFeedback } from '@/lib/types';


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
      text: "Bonjour ! Je suis votre tuteur virtuel IA pour FormaAfrique. Comment puis-je vous aider aujourd'hui ? Posez-moi une question sur vos formations.",
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, userProfile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean>>({});

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

  const handleFeedback = async (message: Message) => {
    if (!user || !db || feedbackSent[message.id]) return;

    setFeedbackSent(prev => ({ ...prev, [message.id]: true }));

    try {
        await addDoc(collection(db, 'tutorFeedbacks'), {
            userId: user.uid,
            formationId: userProfile?.formationId,
            query: messages.find(m => m.id < message.id && m.sender === 'user')?.text || "Requête non trouvée",
            answer: message.text,
            isHelpful: false,
            createdAt: serverTimestamp(),
        } as Omit<TutorFeedback, 'id'>);

        toast({
            title: "Merci pour votre retour !",
            description: "Votre signalement a été enregistré et aidera à améliorer le tuteur.",
        });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        toast({ variant: 'destructive', title: "Erreur lors de l'envoi du feedback." });
        setFeedbackSent(prev => ({ ...prev, [message.id]: false }));
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-primary/5">
      <header className="p-4 border-b text-center bg-card">
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
                    'max-w-md md:max-w-2xl p-4 rounded-lg shadow-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  )}
                >
                  <p className='prose prose-sm max-w-none'>{message.text}</p>
                  {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 border-t pt-3">
                          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Sources</h4>
                          <div className="flex flex-col gap-2">
                              {message.sources.map(source => (
                                  <Button key={source.id} variant="link" asChild className="p-0 h-auto justify-start text-sm">
                                      <Link href={`/courses/${userProfile?.formationId}`}>
                                          <LinkIcon className="mr-2 h-4 w-4"/>
                                          {source.type === 'video' ? 'Vidéo' : 'Module'}: {source.title}
                                      </Link>
                                  </Button>
                              ))}
                          </div>
                      </div>
                  )}
                  {message.sender === 'bot' && message.id !== 'initial-bot-message' && (
                      <div className="mt-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleFeedback(message)} 
                            className="text-muted-foreground hover:text-destructive h-auto p-1 disabled:opacity-50"
                            disabled={feedbackSent[message.id]}
                          >
                               <ThumbsDown className="h-4 w-4" />
                               <span className="sr-only">Signaler une réponse incorrecte</span>
                          </Button>
                      </div>
                  )}
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

      <footer className="p-4 border-t bg-background">
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
