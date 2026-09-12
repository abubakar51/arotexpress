import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  return NextResponse.json(DBManager.getExpenses());
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const DBManager = await getDB();
    const { title, category, amount, expense_date, notes } = await req.json();
    if (!title || !category || amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'খরচের বিবরণ, ক্যাটাগরি এবং টাকার পরিমাণ আবশ্যক' }, { status: 400 });
    }
    const newExp = await DBManager.addExpense({ title, category, amount: Number(amount), expense_date, notes });
    return NextResponse.json(newExp);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
