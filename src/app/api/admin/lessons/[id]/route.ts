import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

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
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE lessons SET title=?, section_title=?, type=?, content=?, file_path=?, sort_order=? WHERE id=?',
    [body.title, body.section_title ?? null, body.type, body.content ?? null, body.file_path ?? null, body.sort_order, id]
  );
  if (result.affectedRows === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (body.questions !== undefined) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM quiz_questions WHERE lesson_id = ?', [id]);
      for (let i = 0; i < body.questions.length; i++) {
        const q = body.questions[i];
        await conn.query(
          'INSERT INTO quiz_questions (lesson_id, type, question, options, correct_answer, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          [id, q.type, q.question, q.options ? JSON.stringify(q.options) : null, q.correct_answer ?? null, i + 1]
        );
      }
      await conn.commit();
    } catch (err: any) {
      await conn.rollback();
      return NextResponse.json({ error: `Failed to update quiz questions: ${err.message}` }, { status: 500 });
    } finally {
      conn.release();
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
