import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const { name, charge, is_active } = await req.json();
  const updated = DBManager.updateDeliveryArea(parseInt((await params).id), {
    ...(name !== undefined ? { name: name.trim() } : {}),
    ...(charge !== undefined ? { charge: Number(charge) } : {}),
    ...(is_active !== undefined ? { is_active: Boolean(is_active) } : {})
  });

  if (!updated) return NextResponse.json({ error: 'এলাকা পাওয়া যায়নি' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const ok = DBManager.deleteDeliveryArea(parseInt((await params).id));
  return NextResponse.json({ success: ok });
}
