import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'rider') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const DBManager = await getDB();
    const { status, note } = await req.json();
    if (!status) {
      return NextResponse.json({ error: 'স্ট্যাটাস আবশ্যক' }, { status: 400 });
    }
    const order = await DBManager.updateRiderOrderStatus((authResult.user as any).id, parseInt((await params).id), status, note);
    if (!order) return NextResponse.json({ error: 'অর্ডার পাওয়া যায়নি' }, { status: 404 });
    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'অর্ডার আপডেট ব্যর্থ' }, { status: 400 });
  }
}
