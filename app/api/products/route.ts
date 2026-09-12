import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

// GET /api/products - Fetch all products or filter by category_id or search keyword
export async function GET(req: NextRequest) {
  const DBManager = await getDB();
  const searchParams = req.nextUrl.searchParams;
  const categoryIdParam = searchParams.get('category_id');
  const searchParam = searchParams.get('search');

  const options: { category_id?: number; search?: string } = {};
  if (categoryIdParam) {
    const parsedId = parseInt(categoryIdParam);
    if (!isNaN(parsedId)) {
      options.category_id = parsedId;
    }
  }
  if (searchParam) {
    options.search = searchParam;
  }

  const products = DBManager.getAllProducts(options);
  return NextResponse.json({
    success: true,
    count: products.length,
    products
  });
}

// POST /api/products - Add a new product (admin only)
export async function POST(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const body = await req.json();

  const categoryId = parseInt(body.category_id || body.categoryId);
  if (isNaN(categoryId)) {
    return NextResponse.json({ error: 'সঠিক ক্যাটাগরি আইডি প্রদান করুন' }, { status: 400 });
  }

  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: 'পণ্যের নাম দেওয়া আবশ্যক' }, { status: 400 });
  }

  const newBrand = await DBManager.addBrandToCategory(categoryId, body);
  if (!newBrand) {
    return NextResponse.json({ error: 'ক্যাটাগরি খুঁজে পাওয়া যায়নি' }, { status: 404 });
  }

  return NextResponse.json(newBrand, { status: 201 });
}
