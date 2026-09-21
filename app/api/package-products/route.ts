import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const DBManager = await getDB();
    const url = new URL(req.url);
    const showAll = url.searchParams.get('all') === '1';

    let products = DBManager.getPackageProducts();
    if (!showAll) {
      products = products.filter((p: any) => p.is_active !== false);
    }
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const DBManager = await getDB();
    const body = await req.json();

    if (!body.product_name || !body.unit || body.regular_price === undefined) {
      return NextResponse.json({ error: 'পণ্যের নাম, ইউনিট এবং নিয়মিত মূল্য আবশ্যক' }, { status: 400 });
    }

    const saved = await DBManager.addOrUpdatePackageProduct(body);
    return NextResponse.json({ success: true, product: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const DBManager = await getDB();
    const url = new URL(req.url);
    const idParam = url.searchParams.get('id');
    let id = idParam ? parseInt(idParam, 10) : null;

    if (!id) {
      const body = await req.json().catch(() => ({}));
      if (body.id) id = parseInt(body.id, 10);
    }

    if (!id) {
      return NextResponse.json({ error: 'পণ্য আইডি আবশ্যক' }, { status: 400 });
    }

    await DBManager.deletePackageProduct(id);
    return NextResponse.json({ success: true, message: 'প্যাকেজ পণ্য সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
