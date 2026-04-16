import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

function isAdmin(session: any) {
  return (session?.user as any)?.role === 'admin';
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses ORDER BY sort_order, created_at');
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { title, slug, description, category, level, price, prerequisite_id, sort_order, is_published } = await req.json();
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO courses (title, slug, description, category, level, price, prerequisite_id, sort_order, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, slug, description ?? null, category ?? 'healthcare', level ?? 'beginner', price ?? 0, prerequisite_id ?? null, sort_order ?? 0, is_published ? 1 : 0]
  );
  return NextResponse.json({ id: result.insertId }, { status: 201 });
}
