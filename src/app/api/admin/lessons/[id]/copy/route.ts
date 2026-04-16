import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  let body: { target_course_id: number; section_title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { target_course_id, section_title } = body;
  if (!target_course_id) {
    return NextResponse.json({ error: 'target_course_id is required' }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Fetch source lesson
    const [lessonRows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM lessons WHERE id = ?',
      [id]
    );
    const source = lessonRows[0];
    if (!source) {
      await conn.rollback();
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // 2. Get max sort_order in target course
    const [orderRows] = await conn.query<RowDataPacket[]>(
      'SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM lessons WHERE course_id = ?',
      [target_course_id]
    );
    const newSortOrder = (orderRows[0]?.maxOrder ?? 0) + 1;

    // 3. Generate new slug
    const slugBase = source.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180);
    const newSlug = `${slugBase}-${Date.now()}`;

    // 4. Insert new lesson
    const [insertResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO lessons (course_id, title, slug, content, type, file_path, video_url, sort_order, section_title)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        target_course_id,
        source.title,
        newSlug,
        source.content,
        source.type,
        source.file_path,
        source.video_url,
        newSortOrder,
        section_title ?? source.section_title,
      ]
    );
    const newLessonId = insertResult.insertId;

    // 5. Copy quiz questions if any
    const [qRows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM quiz_questions WHERE lesson_id = ? ORDER BY sort_order',
      [id]
    );
    for (const q of qRows as any[]) {
      await conn.query(
        `INSERT INTO quiz_questions (lesson_id, type, question, options, correct_answer, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newLessonId, q.type, q.question, q.options, q.correct_answer, q.sort_order]
      );
    }

    await conn.commit();
    return NextResponse.json({ lessonId: newLessonId });
  } catch (err: any) {
    await conn.rollback();
    return NextResponse.json({ error: `Failed to copy lesson: ${err.message}` }, { status: 500 });
  } finally {
    conn.release();
  }
}
