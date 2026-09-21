import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const body = await req.json();
  const {
    status,
    rider_id,
    rider_name,
    rider_phone,
    rider_vehicle,
    delivery_rider_id,
    delivery_rider_name,
    delivery_rider_phone,
    delivery_rider_vehicle,
    delivery_note
  } = body;

  const rId = rider_id !== undefined ? rider_id : delivery_rider_id;
  const rName = rider_name !== undefined ? rider_name : delivery_rider_name;
  const rPhone = rider_phone !== undefined ? rider_phone : delivery_rider_phone;
  const rVeh = rider_vehicle !== undefined ? rider_vehicle : delivery_rider_vehicle;

  const riderInfo = {
    rider_id: rId !== undefined ? (rId ? Number(rId) : undefined) : undefined,
    rider_name: rName !== undefined ? rName : undefined,
    rider_phone: rPhone !== undefined ? rPhone : undefined,
    rider_vehicle: rVeh !== undefined ? rVeh : undefined,
    delivery_note: delivery_note !== undefined ? delivery_note : undefined
  };

  const id = parseInt((await params).id, 10);
  const updated = await DBManager.updatePackageOrderStatus(id, status, riderInfo);
  if (!updated) return NextResponse.json({ error: 'প্যাকেজ অর্ডার পাওয়া যায়নি' }, { status: 404 });
  return NextResponse.json(updated);
}
