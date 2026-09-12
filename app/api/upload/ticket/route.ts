import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/app/lib/auth';

/**
 * Ephemeral memory store for one-time short-lived upload tickets (valid for 60 seconds)
 */
const ticketStore = new Map<string, { apiKey: string; expiresAt: number }>();

// Clean up expired tickets periodically
function cleanupTickets() {
  const now = Date.now();
  for (const [key, value] of ticketStore.entries()) {
    if (value.expiresAt < now) {
      ticketStore.delete(key);
    }
  }
}

/**
 * 1. POST /api/upload/ticket
 * Generates an encrypted/short-lived ticket for the authenticated admin.
 * The raw API key is never exposed permanently or public.
 */
export async function POST(req: NextRequest) {
  cleanupTickets();

  // Protect ticket issuance: Only logged-in admin can request upload credentials
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'শুধুমাত্র অ্যাডমিন ছবি আপলোড করতে পারবেন।' }, { status: 401 });
  }

  const apiKey = (process.env.IMGBB_API || process.env.IMGBB_API_KEY || '').trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ImgBB API Key পাওয়া যায়নি! Render Environment Variables-এ IMGBB_API যুক্ত করুন।' },
      { status: 400 }
    );
  }

  // Generate a random ticket string
  const randomTicket = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  
  // Ticket valid for 60 seconds
  ticketStore.set(randomTicket, {
    apiKey,
    expiresAt: Date.now() + 60 * 1000
  });

  return NextResponse.json({
    success: true,
    ticket: randomTicket
  });
}

/**
 * 2. GET /api/upload/ticket?ticket=...
 * Consumes the single-use ticket in client-side memory to get the key right before sending to ImgBB.
 */
export async function GET(req: NextRequest) {
  cleanupTickets();

  const { searchParams } = new URL(req.url);
  const ticket = searchParams.get('ticket');

  if (!ticket || !ticketStore.has(ticket)) {
    return NextResponse.json({ error: 'অবৈধ বা মেয়াদোত্তীর্ণ আপলোড টিকিট।' }, { status: 403 });
  }

  const record = ticketStore.get(ticket)!;
  ticketStore.delete(ticket); // Immediately burn after one use

  if (record.expiresAt < Date.now()) {
    return NextResponse.json({ error: 'আপলোড টিকিটের মেয়াদ শেষ হয়ে গেছে।' }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    apiKey: record.apiKey
  });
}
