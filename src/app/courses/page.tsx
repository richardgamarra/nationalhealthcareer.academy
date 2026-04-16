export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import pool from '@/lib/db';
import Link from 'next/link';
import type { Course, Enrollment } from '@/types';
import { RowDataPacket } from 'mysql2/promise';

async function getData(userId: number | null) {
  const [courses] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE is_published = 1 ORDER BY sort_order');
  let enrollments: Enrollment[] = [];
  if (userId) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM enrollments WHERE student_id = ?', [userId]);
    enrollments = rows as Enrollment[];
  }
  return { courses: courses as Course[], enrollments };
}

export default async function CoursesPage() {
  const session = await auth();
  const userId = session ? Number((session.user as any).id ?? 0) : null;
  const { courses, enrollments } = await getData(userId);

  const enrolledIds = new Set(enrollments.map((e) => e.course_id));
  const minSortOrder = courses.length ? Math.min(...courses.map((c) => c.sort_order)) : 0;
  const firstCourseId = courses.find((c) => c.sort_order === minSortOrder)?.id;

  const byCategory = courses.reduce<Record<string, Course[]>>((acc, c) => {
    const cat = c.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Course Catalog</h1>
      <p className="text-gray-500 mb-8 text-sm">Health career courses — enroll to get started</p>

      {Object.entries(byCategory).map(([category, cats]) => (
        <div key={category} className="mb-10">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map((course) => {
              const enrolled = enrolledIds.has(course.id);
              const isFree = course.id === firstCourseId;
              return (
                <Link key={course.id} href={`/courses/${course.slug}`}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <span className="text-4xl">📚</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">{course.title}</h3>
                      {!enrolled && !isFree && <span className="text-gray-400 text-lg flex-shrink-0">🔒</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {enrolled ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Enrolled</span>
                      ) : isFree ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Preview Free</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">${Number(course.price).toFixed(2)}</span>
                      )}
                      <span className="text-xs text-gray-400 capitalize">{course.level}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
