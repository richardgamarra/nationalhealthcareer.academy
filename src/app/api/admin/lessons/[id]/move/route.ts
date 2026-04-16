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
  let body: { target_course_id: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { target_course_id } = body;
  if (!target_course_id) {
    return NextResponse.json({ error: 'target_course_id is required' }, { status: 400 });
  }

  // 1. Get max sort_order in target course
  const [orderRows] = await pool.query<RowDataPacket[]>(
    'SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM lessons WHERE course_id = ?',
    [target_course_id]
  );
  const newSortOrder = (orderRows[0]?.maxOrder ?? 0) + 1;

  // 2. Move the lesson
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE lessons SET course_id = ?, sort_order = ? WHERE id = ?',
    [target_course_id, newSortOrder, id]
  );

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
