import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function PUT(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'rider') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const DBManager = await getDB();
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'বর্তমান ও নতুন পাসওয়ার্ড আবশ্যক' }, { status: 400 });
    }
    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' }, { status: 400 });
    }
    await DBManager.updateRiderPassword((authResult.user as any).id, currentPassword, newPassword);
    return NextResponse.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'পাসওয়ার্ড পরিবর্তনে ত্রুটি' }, { status: 400 });
  }
}
