export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  price: number;
  prerequisite_id: number | null;
  sort_order: number;
  lang: 'en' | 'es';
  paired_course_id: number | null;
  created_at: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  content: string | null;
  type: 'text' | 'document' | 'presentation' | 'quiz' | 'link';
  file_path: string | null;
  video_url: string | null;
  sort_order: number;
  section_title: string | null;
}

export interface QuizQuestion {
  id: number;
  lesson_id: number;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options: string[] | null;
  correct_answer: string | null;
  sort_order: number;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  role: 'student' | 'instructor' | 'admin';
  created_at: string;
}

export interface Enrollment {
  student_id: number;
  course_id: number;
  progress_pct: number;
  granted_by_admin: boolean;
  enrolled_at: string;
}

export interface LiveClass {
  id: number;
  title: string;
  description: string | null;
  zoom_link: string;
  zoom_meeting_id: string | null;
  starts_at: string;
  duration_min: number;
  instructor: string;
}
