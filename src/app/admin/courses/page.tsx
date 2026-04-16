export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import Link from 'next/link';
import type { Course } from '@/types';
import { RowDataPacket } from 'mysql2/promise';

async function getCourses(): Promise<Course[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses ORDER BY sort_order, category, created_at');
  return rows as unknown as Course[];
}

export default async function CoursesPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') redirect('/login');
  const courses = await getCourses();

  const byCategory = courses.reduce<Record<string, Course[]>>((acc, c) => {
    const cat = c.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Courses</h1>
        <div className="flex gap-3">
          <Link href="/admin/courses/import"
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors">
            ⬇ Import from Moodle
          </Link>
          <Link href="/admin/courses/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            + New Course
          </Link>
        </div>
      </div>

      {Object.entries(byCategory).map(([category, cats]) => (
        <div key={category} className="mb-10">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map((course) => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover rounded-lg" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{course.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{course.level} · ${Number(course.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Link href={`/admin/courses/${course.id}`}
                    className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {courses.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-4">No courses yet.</p>
          <Link href="/admin/courses/import" className="text-blue-600 hover:underline text-sm">Import from Moodle</Link>
        </div>
      )}
    </div>
  );
}
