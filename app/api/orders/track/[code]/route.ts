import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const DBManager = await getDB();
  const order = DBManager.findOrderByCode((await params).code);
  if (!order) {
    return NextResponse.json({ error: 'অর্ডার কোডটি সঠিক নয় অথবা কোনো অর্ডার পাওয়া যায়নি' }, { status: 404 });
  }
  return NextResponse.json(order);
}
