import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { scanMoodleCourses, scanMoodleLessons, scanMoodleQuestions } from '@/lib/moodle';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const courses = await scanMoodleCourses();

    // Get existing slugs to flag duplicates
    const [existingRows] = await pool.query<RowDataPacket[]>('SELECT slug FROM courses');
    const existingSlugs = new Set(existingRows.map((r) => r.slug as string));

    const preview = await Promise.all(courses.map(async (c) => {
      const slug = c.shortname.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const lessons = await scanMoodleLessons(c.id);
      const quizLessons = lessons.filter((l) => l.modType === 'quiz');
      let questionCount = 0;
      for (const ql of quizLessons) {
        const qs = await scanMoodleQuestions(ql.id);
        questionCount += qs.length;
      }
      return {
        moodleId: c.id,
        title: c.fullname,
        slug,
        lessonCount: lessons.length,
        questionCount,
        alreadyImported: existingSlugs.has(slug),
      };
    }));

    return NextResponse.json({ courses: preview });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
