import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  let body: { course_id?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body.course_id) {
    return NextResponse.json({ error: 'course_id is required' }, { status: 400 });
  }
  await pool.query(
    'INSERT INTO enrollments (student_id, course_id, granted_by_admin) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE granted_by_admin = 1',
    [id, body.course_id]
  );
  return NextResponse.json({ ok: true });
}
