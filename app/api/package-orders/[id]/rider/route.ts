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
  const existingOrder = DBManager.data.package_orders?.find((o: any) => o.id === id);
  if (existingOrder && (existingOrder.status === 'delivered' || existingOrder.status === 'ডেলিভার্ড' || existingOrder.status === 'সম্পন্ন')) {
    return NextResponse.json({ error: 'ডেলিভার্ড সম্পন্ন হওয়া প্যাকেজ অর্ডারে রাইডার অ্যাসাইন বা পরিবর্তন করা সম্ভব নয়' }, { status: 400 });
  }

  const updated = await DBManager.assignRiderToPackageOrder(id, parseInt(rider_id, 10));
  if (!updated) return NextResponse.json({ error: 'প্যাকেজ অর্ডার বা রাইডার পাওয়া যায়নি অথবা অর্ডারটি ইতিমধ্যে ডেলিভার্ড হয়ে গেছে' }, { status: 400 });
  return NextResponse.json(updated);
}
