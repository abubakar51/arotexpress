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

  const orderId = parseInt((await params).id);
  const existingOrder = DBManager.data.orders.find((o: any) => o.id === orderId);
  if (existingOrder && (existingOrder.status === 'delivered' || existingOrder.status === 'ডেলিভার্ড' || existingOrder.status === 'সম্পন্ন')) {
    return NextResponse.json({ error: 'ডেলিভার্ড সম্পন্ন হওয়া অর্ডারে রাইডার অ্যাসাইন বা পরিবর্তন করা সম্ভব নয়' }, { status: 400 });
  }

  const updated = DBManager.assignRiderToOrder(orderId, parseInt(targetRiderId));
  if (!updated) return NextResponse.json({ error: 'অর্ডার বা ডেলিভারিম্যান পাওয়া যায়নি অথবা অর্ডারটি ইতিমধ্যে ডেলিভার্ড হয়ে গেছে' }, { status: 400 });
  return NextResponse.json(updated);
}
