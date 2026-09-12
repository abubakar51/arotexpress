import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET() {
  const DBManager = await getDB();
  return NextResponse.json({
    groups: DBManager.getGroups(),
    categories: DBManager.getCategories()
  });
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const body = await req.json();
  const newCat = await DBManager.addCategory(body);
  return NextResponse.json(newCat);
}
