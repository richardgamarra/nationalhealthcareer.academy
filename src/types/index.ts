export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  created_at: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  content: string;
  video_url: string | null;
  sort_order: number;
  section_title: string | null;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  enrolled_at: string;
}

export interface Enrollment {
  student_id: number;
  course_id: number;
  progress_pct: number;
  last_lesson_id: number | null;
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
