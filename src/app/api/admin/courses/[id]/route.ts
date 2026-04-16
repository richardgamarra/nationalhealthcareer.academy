import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

function isAdmin(session: any) {
  return (session?.user as any)?.role === 'admin';
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ?', [id]);
  const course = rows[0];
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [lessons] = await pool.query<RowDataPacket[]>('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order', [id]);
  return NextResponse.json({ course, lessons });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE courses SET title=?, description=?, category=?, level=?, price=?, prerequisite_id=?, sort_order=?, is_published=?, thumbnail=? WHERE id=?',
    [body.title, body.description ?? null, body.category, body.level, body.price, body.prerequisite_id ?? null, body.sort_order, body.is_published ? 1 : 0, body.thumbnail ?? null, id]
  );
  if (result.affectedRows === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  await pool.query('DELETE FROM courses WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
