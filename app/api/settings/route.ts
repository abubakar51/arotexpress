import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  const DBManager = await getDB();
  const settings = { ...DBManager.getSettings() };

  // Never leak payment verification API endpoint or secret key to public clients
  const authResult = await authenticateToken(req);
  const isAdmin = !authResult.error && (authResult.user as any)?.role === 'admin';
  if (!isAdmin) {
    delete (settings as any).payment_verify_api_key;
    delete (settings as any).payment_verify_api_url;
  }

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DBManager = await getDB();
  const body = await req.json();
  const updated = DBManager.updateSettings(body);
  return NextResponse.json(updated);
}
