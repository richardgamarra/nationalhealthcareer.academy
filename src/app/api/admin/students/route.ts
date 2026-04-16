import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, email, role, is_active, created_at FROM students WHERE role = 'student' ORDER BY created_at DESC"
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 12);
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO students (name, email, password_hash, role) VALUES (?, ?, ?, 'student')",
      [name, email, hash]
    );
    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    throw err;
  }
}
