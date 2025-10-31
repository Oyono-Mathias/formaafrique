import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/login-form';
import SignupForm from '@/components/auth/signup-form';
import { Logo } from '@/components/icons/logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/5 p-4">
      <Tabs defaultValue="login" className="w-full max-w-md">
        <div className="flex justify-center mb-6">
            <Logo />
        </div>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Connexion</TabsTrigger>
          <TabsTrigger value="signup">Inscription</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Bon retour parmi nous !</CardTitle>
              <CardDescription>
                Connectez-vous pour accéder à votre tableau de bord.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Créez votre compte</CardTitle>
              <CardDescription>
                Rejoignez notre communauté et commencez à apprendre dès aujourd'hui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
