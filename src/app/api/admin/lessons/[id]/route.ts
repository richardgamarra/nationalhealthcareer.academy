import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM lessons WHERE id = ?', [id]);
  const lesson = rows[0];
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [questions] = await pool.query<RowDataPacket[]>('SELECT * FROM quiz_questions WHERE lesson_id = ? ORDER BY sort_order', [id]);
  return NextResponse.json({ lesson, questions });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  await pool.query(
    'UPDATE lessons SET title=?, section_title=?, type=?, content=?, file_path=?, sort_order=? WHERE id=?',
    [body.title, body.section_title ?? null, body.type, body.content ?? null, body.file_path ?? null, body.sort_order, id]
  );
  if (body.questions !== undefined) {
    await pool.query('DELETE FROM quiz_questions WHERE lesson_id = ?', [id]);
    for (let i = 0; i < body.questions.length; i++) {
      const q = body.questions[i];
      await pool.query(
        'INSERT INTO quiz_questions (lesson_id, type, question, options, correct_answer, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [id, q.type, q.question, q.options ? JSON.stringify(q.options) : null, q.correct_answer ?? null, i + 1]
      );
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  await pool.query('DELETE FROM lessons WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
