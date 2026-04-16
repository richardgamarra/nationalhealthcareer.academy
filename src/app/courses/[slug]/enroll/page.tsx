export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import Link from 'next/link';

export default async function EnrollPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const session = await auth();
  if (!session) redirect('/login');

  const [rows] = await pool.query<RowDataPacket[]>('SELECT title, price FROM courses WHERE slug = ? LIMIT 1', [slug]);
  const course = (rows as any[])[0];
  if (!course) redirect('/courses');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-2">${Number(course.price).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-6">One-time enrollment — full course access</p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 mb-6">
            <strong>Payment coming soon.</strong> To enroll now, please contact us directly.
          </div>

          <a href="mailto:admin@nationalhealthcareer.com"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3">
            Contact Us to Enroll
          </a>
          <Link href={`/courses/${slug}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to course
          </Link>
        </div>
      </div>
    </div>
  );
}
