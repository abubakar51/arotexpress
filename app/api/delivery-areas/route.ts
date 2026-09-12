import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET() {
  const DBManager = await getDB();
  return NextResponse.json({
    areas: DBManager.getDeliveryAreas(),
    default_delivery_fee: DBManager.getSettings().default_delivery_fee || 60
  });
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const { name, charge, is_active } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'এলাকার নাম আবশ্যক' }, { status: 400 });
  }

  const newArea = DBManager.addDeliveryArea({
    name: name.trim(),
    charge: charge !== undefined && charge !== '' ? Number(charge) : undefined,
    is_active: is_active !== undefined ? is_active : true
  });
  return NextResponse.json(newArea);
}
