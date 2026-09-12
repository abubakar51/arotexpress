import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function PUT(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'rider') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const DBManager = await getDB();
    const { name, vehicle, address } = await req.json();
    const updated = await DBManager.updateDeliveryRider((authResult.user as any).id, { name, vehicle, address });
    if (!updated) return NextResponse.json({ error: 'রাইডার পাওয়া যায়নি' }, { status: 404 });
    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      vehicle: updated.vehicle,
      area: updated.area,
      address: updated.address,
      is_active: updated.is_active
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
