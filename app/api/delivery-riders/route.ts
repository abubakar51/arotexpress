import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  return NextResponse.json(DBManager.getDeliveryRiders());
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const DBManager = await getDB();
    const { name, phone, password, vehicle, area, address, is_active } = await req.json();
    if (!name || !phone) {
      return NextResponse.json({ error: 'রাইডারের নাম এবং মোবাইল নম্বর আবশ্যক' }, { status: 400 });
    }
    const rider = await DBManager.addDeliveryRider({ name, phone, password, vehicle, area, address, is_active });
    return NextResponse.json(rider);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
