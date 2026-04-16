import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let orderedIds: number[];
  try {
    const body = await req.json();
    orderedIds = body.orderedIds;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: 'orderedIds must be a non-empty array' }, { status: 400 });
  }
  // Update sort_order sequentially to avoid race conditions
  for (let idx = 0; idx < orderedIds.length; idx++) {
    await pool.query('UPDATE lessons SET sort_order = ? WHERE id = ?', [idx + 1, orderedIds[idx]]);
  }
  return NextResponse.json({ ok: true });
}
