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
      return NextResponse.json({ packageCart: {} });
    }

    const packageCart = DBManager.getUserPackageCart(userId) || {};
    return NextResponse.json({ packageCart });
  } catch (err: any) {
    console.error('GET /api/package-cart error:', err);
    return NextResponse.json({ error: 'প্যাকেজ কার্ট লোড করা যায়নি', packageCart: {} }, { status: 500 });
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
      return NextResponse.json({ packageCart: {} });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const packageCart = DBManager.saveUserPackageCart(userId, body.packageCart || {});
    return NextResponse.json({ packageCart });
  } catch (err: any) {
    console.error('POST /api/package-cart error:', err);
    return NextResponse.json({ error: 'প্যাকেজ কার্ট সংরক্ষণ করা যায়নি', packageCart: {} }, { status: 500 });
  }
}
