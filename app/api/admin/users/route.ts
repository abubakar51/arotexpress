import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const users = DBManager.getUsers();
  
  const usersWithStats = users.map((u: any) => ({
    ...u,
    orders_count: DBManager.getOrdersByUserId(u.id).length
  }));
  
  return NextResponse.json(usersWithStats);
}
