import Link from 'next/link';
import { ArrowRight, BookCopy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { users, courses } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyCoursesPage() {
  const user = users[0];
  const enrolledCourses = courses.filter(course => user.enrolledCourses.includes(course.id));
  const inProgressCourses = enrolledCourses.slice(0, 1);
  const completedCourses = enrolledCourses.slice(1, 2);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Mes Formations</h1>
          <p className="text-muted-foreground">
            Suivez votre progression et reprenez là où vous vous êtes arrêté.
          </p>
        </div>
        <Button asChild>
          <Link href="/courses">Explorer de nouvelles formations</Link>
        </Button>
      </div>

      <Tabs defaultValue="in-progress">
        <TabsList>
          <TabsTrigger value="in-progress">En cours</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
        </TabsList>
        <TabsContent value="in-progress" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className='leading-tight'>{course.title}</CardTitle>
                  <CardDescription>{course.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Progress value={66} className="flex-grow" />
                    <span className="text-sm font-medium">66%</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="default" className="w-full">
                    <Link href={`/courses/${course.id}/modules/${course.modules[0].id}`}>
                      Continuer <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className='leading-tight'>{course.title}</CardTitle>
                  <CardDescription>{course.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Progress value={100} className="flex-grow" />
                    <span className="text-sm font-medium">100%</span>
                  </div>
                </CardContent>
                <CardFooter>
                   <Button asChild variant="outline" className="w-full">
                    <Link href={`/dashboard/certificate/${course.id}`}>
                      Voir le certificat
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
