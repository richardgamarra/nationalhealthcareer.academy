import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body.title || !body.course_id) {
    return NextResponse.json({ error: 'title and course_id are required' }, { status: 400 });
  }
  const { course_id, section_title, title, type, sort_order } = body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO lessons (course_id, section_title, title, slug, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    [course_id, section_title ?? null, title, slug, type ?? 'text', sort_order ?? 0]
  );
  return NextResponse.json({ id: result.insertId, slug }, { status: 201 });
}
