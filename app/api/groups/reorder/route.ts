import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function PUT(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const DBManager = await getDB();
    const { orderedKeys } = await req.json();
    if (!Array.isArray(orderedKeys)) {
      return NextResponse.json({ error: 'orderedKeys অ্যারে আবশ্যক' }, { status: 400 });
    }
    const groups = DBManager.reorderGroups(orderedKeys);
    return NextResponse.json(groups);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
