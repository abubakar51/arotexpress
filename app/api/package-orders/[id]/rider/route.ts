import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const body = await req.json();
  const rider_id = body.rider_id || body.riderId;

  if (!rider_id) {
    return NextResponse.json({ error: 'রাইডার নির্বাচন করুন' }, { status: 400 });
  }

  const id = parseInt((await params).id, 10);
  const updated = await DBManager.assignRiderToPackageOrder(id, parseInt(rider_id, 10));
  if (!updated) return NextResponse.json({ error: 'প্যাকেজ অর্ডার বা রাইডার পাওয়া যায়নি' }, { status: 404 });
  return NextResponse.json(updated);
}
