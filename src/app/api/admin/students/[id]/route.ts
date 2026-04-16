import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcryptjs';

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
  if (body.password) {
    const hash = await bcrypt.hash(body.password, 12);
    await pool.query('UPDATE students SET password_hash = ? WHERE id = ?', [hash, id]);
  }
  if (body.is_active !== undefined) {
    await pool.query('UPDATE students SET is_active = ? WHERE id = ?', [body.is_active ? 1 : 0, id]);
  }
  if (body.name || body.email) {
    await pool.query(
      'UPDATE students SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
      [body.name ?? null, body.email ?? null, id]
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM students WHERE id = ? AND role = 'student'",
    [id]
  );
  if (result.affectedRows === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
