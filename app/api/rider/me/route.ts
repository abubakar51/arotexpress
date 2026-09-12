import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'rider') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const rider = DBManager.findRiderById((authResult.user as any).id);
  if (!rider) return NextResponse.json({ error: 'রাইডার তথ্য পাওয়া যায়নি' }, { status: 404 });

  return NextResponse.json({
    id: rider.id,
    name: rider.name,
    phone: rider.phone,
    vehicle: rider.vehicle,
    area: rider.area,
    address: rider.address,
    is_active: rider.is_active
  });
}
