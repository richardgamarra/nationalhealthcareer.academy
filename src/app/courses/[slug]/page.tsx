export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import type { Course, Lesson, QuizQuestion, Enrollment } from '@/types';
import { isFreeLesson, canAccessLesson } from '@/lib/access';
import LessonSidebar from '@/components/course/LessonSidebar';
import LessonViewer from '@/components/course/LessonViewer';

async function getData(slug: string, userId: number | null) {
  const [courseRows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE slug = ? LIMIT 1', [slug]);
  const course = (courseRows as Course[])[0];
  if (!course) return null;

  const [allCourses] = await pool.query<RowDataPacket[]>('SELECT id, sort_order FROM courses WHERE is_published = 1');
  const [lessons] = await pool.query<RowDataPacket[]>('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order', [course.id]);
  let enrollments: Enrollment[] = [];
  if (userId) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM enrollments WHERE student_id = ?', [userId]);
    enrollments = rows as Enrollment[];
  }
  return { course, lessons: lessons as Lesson[], allCourses: allCourses as Course[], enrollments };
}

// NOTE: In Next.js 15+, params and searchParams are Promises — check and await if needed
export default async function CourseDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lesson?: string }> }) {
  const { slug } = await params;
  const { lesson: lessonParam } = await searchParams;

  const session = await auth();
  if (!session) redirect('/login');

  const userId = Number((session.user as any).id ?? 0);
  const role = (session.user as any).role as 'admin' | 'instructor' | 'student';

  const data = await getData(slug, userId);
  if (!data) redirect('/courses');

  const { course, lessons, allCourses, enrollments } = data;
  const enrolled = role === 'admin' || role === 'instructor' || enrollments.some((e) => e.course_id === course.id);

  // Determine free lessons
  const freeIds = new Set(
    lessons.filter((l) => isFreeLesson(l, allCourses, lessons)).map((l) => l.id)
  );

  // 1. Find requested lesson
  const requestedId = lessonParam ? parseInt(lessonParam) : null;
  const requestedLesson = requestedId ? lessons.find((l) => l.id === requestedId) ?? null : null;

  // 2. Check access to requested lesson; fall back if locked
  let activeLesson: Lesson | null = null;
  if (requestedLesson && canAccessLesson(requestedLesson, allCourses, lessons, enrollments, role)) {
    activeLesson = requestedLesson;
  } else {
    // Fall back to first accessible lesson
    activeLesson = lessons.find((l) => canAccessLesson(l, allCourses, lessons, enrollments, role)) ?? null;
  }

  // 3. ONLY THEN fetch quiz questions for the validated lesson
  let questions: QuizQuestion[] = [];
  if (activeLesson?.type === 'quiz') {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM quiz_questions WHERE lesson_id = ? ORDER BY sort_order', [activeLesson.id]);
    questions = rows as QuizQuestion[];
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Course header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <p className="text-xs text-blue-600 font-semibold uppercase mb-0.5">{course.category}</p>
        <h1 className="text-lg font-bold text-gray-900">{course.title}</h1>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50">
          <LessonSidebar
            lessons={lessons}
            activeLessonId={activeLesson?.id ?? 0}
            price={Number(course.price)}
            enrolled={enrolled}
            freeIds={freeIds}
            courseSlug={slug}
          />
        </div>

        {/* Lesson content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {activeLesson ? (
            <>
              {freeIds.has(activeLesson.id) && !enrolled && (
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center justify-between">
                  <span className="text-xs text-blue-700 font-medium">✨ Free preview lesson</span>
                  <a href="enroll" className="text-xs text-blue-600 font-semibold hover:underline">Enroll for full access →</a>
                </div>
              )}
              <LessonViewer lesson={activeLesson} questions={questions} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">No lessons available</div>
          )}
        </div>
      </div>
    </div>
  );
}
