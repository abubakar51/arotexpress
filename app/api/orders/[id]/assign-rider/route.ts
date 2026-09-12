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
  const { rider_id, delivery_rider_id } = body;
  const targetRiderId = rider_id || delivery_rider_id;

  if (!targetRiderId) return NextResponse.json({ error: 'ডেলিভারিম্যান নির্বাচন করুন' }, { status: 400 });

  const updated = DBManager.assignRiderToOrder(parseInt((await params).id), parseInt(targetRiderId));
  if (!updated) return NextResponse.json({ error: 'অর্ডার বা ডেলিভারিম্যান পাওয়া যায়নি' }, { status: 404 });
  return NextResponse.json(updated);
}
