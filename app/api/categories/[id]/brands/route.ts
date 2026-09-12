import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const DBManager = await getDB();
  const catId = parseInt((await params).id);
  if (isNaN(catId)) return NextResponse.json({ error: 'অকার্যকর ক্যাটাগরি আইডি' }, { status: 400 });

  const products = DBManager.getAllProducts({ category_id: catId });
  return NextResponse.json({ success: true, count: products.length, products });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const body = await req.json();
  const brand = await DBManager.addBrandToCategory(parseInt((await params).id), body);
  if (!brand) return NextResponse.json({ error: 'ক্যাটাগরি পাওয়া যায়নি' }, { status: 404 });
  return NextResponse.json(brand);
}
