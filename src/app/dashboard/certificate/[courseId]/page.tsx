import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Download } from 'lucide-react';

import { courses, users } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { Separator } from '@/components/ui/separator';

type CertificatePageProps = {
  params: {
    courseId: string;
  };
};

export default function CertificatePage({ params }: CertificatePageProps) {
  const course = courses.find((c) => c.id === params.courseId);
  const user = users[0];

  if (!course) {
    notFound();
  }

  const bgImage = PlaceHolderImages.find((img) => img.id === 'certificate-bg');
  const instructor = courses.find(c => c.id === params.courseId)?.instructor;
  const instructorAvatar = PlaceHolderImages.find(img => img.id === instructor?.avatarId);

  return (
    <div className="bg-primary/5 p-4 md:p-8">
      <div className="flex justify-end mb-4">
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Télécharger en PDF
        </Button>
      </div>
      <div className="max-w-4xl mx-auto bg-card shadow-2xl aspect-[1.414/1] p-8 relative overflow-hidden">
        {bgImage && (
            <Image
                src={bgImage.imageUrl}
                alt={bgImage.description}
                fill
                className="object-cover z-0 opacity-10"
                data-ai-hint={bgImage.imageHint}
            />
        )}
        <div className="relative z-10 flex flex-col h-full text-center items-center justify-between">
            <header className="w-full">
                <div className='flex justify-center items-center gap-4'>
                    <Logo />
                </div>
                <h1 className="text-4xl font-bold font-headline text-primary mt-4 tracking-wider">
                    CERTIFICAT DE RÉUSSITE
                </h1>
                <p className="text-muted-foreground mt-2">Ce certificat est fièrement présenté à</p>
            </header>
            
            <section>
                <h2 className="text-5xl font-bold font-headline" style={{fontFamily: 'serif'}}>{user.name}</h2>
                <Separator className="my-4 w-2/3 mx-auto" />
                <p className="text-muted-foreground">pour avoir terminé avec succès la formation</p>
                <h3 className="text-3xl font-semibold font-headline text-primary mt-2">{course.title}</h3>
            </section>
            
            <footer className="w-full">
                <div className="flex justify-around items-center">
                    <div className='text-center'>
                         {instructorAvatar && (
                            <Image 
                                src={instructorAvatar.imageUrl}
                                alt={instructor?.name || 'Instructor'}
                                width={40}
                                height={40}
                                className='rounded-full mx-auto mb-2'
                            />
                        )}
                        <p className="font-semibold">{instructor?.name}</p>
                        <Separator className='my-1'/>
                        <p className="text-xs text-muted-foreground">{instructor?.title}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Date d'émission</p>
                        <Separator className='my-1'/>
                        <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
            </footer>
        </div>
      </div>
    </div>
  );
}
