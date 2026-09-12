import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';
import { verifyPaymentWithRetry, normalizePaymentSender } from '@/server/paymentVerification';

export async function POST(req: NextRequest) {
  // Only authenticated users can verify payments
  const authResult = await authenticateToken(req);
  if (authResult.error) {
    return NextResponse.json({ error: 'পেমেন্ট যাচাই করতে প্রথমে লগইন করুন।' }, { status: 401 });
  }

  try {
    const DBManager = await getDB();
    const settings = DBManager.getSettings();

    // Check if auto verification is enabled
    if (!settings.payment_verify_enabled || !settings.payment_verify_api_url || !settings.payment_verify_api_key) {
      return NextResponse.json({
        enabled: false,
        verified: false,
        message: 'স্বয়ংক্রিয় পেমেন্ট যাচাই গেটওয়ে বর্তমানে সক্রিয় নেই।'
      }, { status: 200 });
    }

    const { trx_id, sender_number, payment_method, amount } = await req.json();

    if (!trx_id || !trx_id.trim()) {
      return NextResponse.json({
        verified: false,
        code: 'MISSING_TRX_ID',
        message: 'অনুগ্রহ করে TrxID প্রদান করুন।'
      }, { status: 400 });
    }

    if (!sender_number || !sender_number.trim()) {
      return NextResponse.json({
        verified: false,
        code: 'MISSING_NUMBER',
        message: 'যে নম্বর থেকে টাকা পাঠিয়েছেন তা প্রদান করুন।'
      }, { status: 400 });
    }

    const senderKey = normalizePaymentSender(payment_method || 'bkash');

    const result = await verifyPaymentWithRetry({
      apiUrl: settings.payment_verify_api_url,
      apiKey: settings.payment_verify_api_key,
      trxId: trx_id.trim(),
      sender: senderKey,
      number: sender_number.trim(),
      amount: Number(amount) || 0
    });

    if (!result.verified) {
      return NextResponse.json({
        success: false,
        verified: false,
        code: result.code,
        message: result.message,
        details: result.data || result.raw,
        attemptsMade: result.attemptsMade
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      code: result.code,
      message: result.message,
      data: result.data,
      attemptsMade: result.attemptsMade
    });
  } catch (err: any) {
    console.error('Payment verify route error:', err);
    return NextResponse.json({
      success: false,
      verified: false,
      code: 'SERVER_ERROR',
      message: 'পেমেন্ট যাচাইয়ের সময় সার্ভার সমস্যা হয়েছে: ' + err.message
    }, { status: 500 });
  }
}
