import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

// GET /api/products/[id] - Fetch single product by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const DBManager = await getDB();
  const productId = parseInt((await params).id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: 'অকার্যকর পণ্য আইডি' }, { status: 400 });
  }

  const product = DBManager.getBrandById(productId);
  if (!product) {
    return NextResponse.json({ error: 'পণ্য খুঁজে পাওয়া যায়নি' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const body = await req.json();
  const productId = parseInt((await params).id);
  
  if (isNaN(productId)) {
    return NextResponse.json({ error: 'অকার্যকর পণ্য আইডি' }, { status: 400 });
  }

  const updated = DBManager.updateBrandById(productId, body);
  if (!updated) {
    return NextResponse.json({ error: 'পণ্য খুঁজে পাওয়া যায়নি' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const productId = parseInt((await params).id);
  
  if (isNaN(productId)) {
    return NextResponse.json({ error: 'অকার্যকর পণ্য আইডি' }, { status: 400 });
  }

  const ok = DBManager.deleteBrandById(productId);
  return NextResponse.json({ success: ok });
}
