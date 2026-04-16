import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { scanMoodleCourses, scanMoodleLessons, scanMoodleQuestions } from '@/lib/moodle';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fix C2: wrap req.json() in try/catch and validate input
  let selectedMoodleIds: number[];
  try {
    const body = await req.json();
    selectedMoodleIds = body.selectedMoodleIds;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!Array.isArray(selectedMoodleIds) || selectedMoodleIds.length === 0) {
    return NextResponse.json({ error: 'selectedMoodleIds must be a non-empty array' }, { status: 400 });
  }

  const results: { title: string; status: 'imported' | 'skipped' | 'error'; error?: string }[] = [];

  const allCourses = await scanMoodleCourses();
  const toImport = allCourses.filter((c) => selectedMoodleIds.includes(c.id));

  for (let i = 0; i < toImport.length; i++) {
    const mc = toImport[i];
    // Fix m1: empty slug fallback
    const slug = (mc.shortname.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || `course-${mc.id}`;

    // Fix C1: use a DB transaction so a failed lesson insert doesn't orphan the course row
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Skip if already exists
      const [existing] = await conn.query<RowDataPacket[]>('SELECT id FROM courses WHERE slug = ?', [slug]);
      if (existing.length > 0) {
        await conn.rollback();
        conn.release();
        results.push({ title: mc.fullname, status: 'skipped' });
        continue;
      }

      // Insert course
      const [courseResult] = await conn.query<ResultSetHeader>(
        'INSERT INTO courses (title, slug, description, is_published, sort_order) VALUES (?, ?, ?, 0, ?)',
        [mc.fullname, slug, mc.summary || null, i + 1]
      );
      const courseId = courseResult.insertId;

      // Insert lessons
      const moodleLessons = await scanMoodleLessons(mc.id);
      for (let j = 0; j < moodleLessons.length; j++) {
        const ml = moodleLessons[j];
        // Fix m1: empty lesson slug fallback
        const lessonSlug = (ml.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${j}`) || `lesson-${j}`;
        const lessonType = ml.modType === 'page' ? 'text' : 'quiz';
        const lessonContent = ml.modType === 'page' ? ml.content : null;
        const [lessonResult] = await conn.query<ResultSetHeader>(
          'INSERT INTO lessons (course_id, section_title, title, slug, content, type, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [courseId, ml.sectionName || null, ml.name, lessonSlug, lessonContent, lessonType, j + 1]
        );
        const lessonId = lessonResult.insertId;

        if (ml.modType === 'quiz') {
          const questions = await scanMoodleQuestions(ml.id);
          for (let k = 0; k < questions.length; k++) {
            const q = questions[k];
            const correctIdx = q.answers.findIndex((a) => a.fraction > 0);
            const type =
              q.qtype === 'multichoice' ? 'multiple_choice'
              : q.qtype === 'truefalse' ? 'true_false'
              : 'short_answer';
            await conn.query(
              'INSERT INTO quiz_questions (lesson_id, type, question, options, correct_answer, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
              [lessonId, type, q.questionText, JSON.stringify(q.answers.map((a) => a.text)), correctIdx >= 0 ? String(correctIdx) : null, k + 1]
            );
          }
        }
      }

      await conn.commit();
      results.push({ title: mc.fullname, status: 'imported' });
    } catch (err: any) {
      await conn.rollback();
      results.push({ title: mc.fullname, status: 'error', error: err.message });
    } finally {
      conn.release();
    }
  }

  return NextResponse.json({ results });
}
