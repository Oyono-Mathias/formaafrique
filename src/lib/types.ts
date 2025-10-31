export interface Course {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  instructor: {
    name: string;
    title: string;
    avatarId: string;
  };
  imageId: string;
  enrollmentCount: number;
  duration: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  whatYouWillLearn: string[];
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  content: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarId: string;
  enrolledCourses: string[]; // array of course IDs
}

export interface Testimonial {
  id: string;
  name: string;
  course: string;
  quote: string;
  imageId: string;
}
