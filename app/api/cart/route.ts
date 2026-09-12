import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    const DBManager = await getDB();
    const userId = (authResult.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ cart: {} });
    }

    const cart = DBManager.getUserCart(userId) || {};
    return NextResponse.json({ cart });
  } catch (err: any) {
    console.error('GET /api/cart error:', err);
    return NextResponse.json({ error: 'কার্ট লোড করা যায়নি', cart: {} }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    const DBManager = await getDB();
    const userId = (authResult.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ cart: {} });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const cart = DBManager.saveUserCart(userId, body.cart || {});
    return NextResponse.json({ cart });
  } catch (err: any) {
    console.error('POST /api/cart error:', err);
    return NextResponse.json({ error: 'কার্ট সংরক্ষণ করা যায়নি', cart: {} }, { status: 500 });
  }
}
