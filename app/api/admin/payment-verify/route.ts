import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const settings = DBManager.getSettings();

  return NextResponse.json({
    enabled: Boolean(settings.payment_verify_enabled),
    api_url: settings.payment_verify_api_url || '',
    api_key: settings.payment_verify_api_key || '',
    is_configured: Boolean(settings.payment_verify_api_url && settings.payment_verify_api_key)
  });
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const body = await req.json();
  const { enabled, api_url, api_key } = body;

  const updatedSettings = DBManager.updateSettings({
    payment_verify_enabled: Boolean(enabled),
    payment_verify_api_url: (api_url || '').trim(),
    payment_verify_api_key: (api_key || '').trim()
  });

  return NextResponse.json({
    success: true,
    message: 'পেমেন্ট ভেরিফিকেশন API কনফিগারেশন সংরক্ষিত হয়েছে',
    config: {
      enabled: Boolean(updatedSettings.payment_verify_enabled),
      api_url: updatedSettings.payment_verify_api_url || '',
      api_key: updatedSettings.payment_verify_api_key || '',
      is_configured: Boolean(updatedSettings.payment_verify_api_url && updatedSettings.payment_verify_api_key)
    }
  });
}
