import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { api_url, api_key } = await req.json();

    if (!api_url || !api_url.trim()) {
      return NextResponse.json({ error: 'API URL আবশ্যক' }, { status: 400 });
    }

    if (!api_key || !api_key.trim()) {
      return NextResponse.json({ error: 'x-api-key সিক্রেট কি আবশ্যক' }, { status: 400 });
    }

    const testPayload = {
      trxId: 'TEST_PROBE_' + Date.now().toString().slice(-6),
      sender: 'bkash',
      number: '01700000000',
      amount: 10
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    const startTime = Date.now();
    const res = await fetch(api_url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': api_key.trim()
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal
    });

    clearTimeout(timer);
    const latency = Date.now() - startTime;

    let responseBody: any = null;
    try {
      responseBody = await res.json();
    } catch {
      responseBody = { raw: await res.text() };
    }

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({
        success: false,
        status: res.status,
        latency,
        message: 'সার্ভারে সংযোগ সফল, কিন্তু x-api-key অনুমোদিত নয় (401/403 Unauthorized)',
        response: responseBody
      });
    }

    return NextResponse.json({
      success: true,
      status: res.status,
      latency,
      message: `সার্ভারে সংযোগ সফল! (রেসপন্স সময়: ${latency}ms, কোড: ${responseBody?.code || res.status})`,
      response: responseBody
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.name === 'AbortError' ? 'সার্ভার রেসপন্স টাইমআউট (৭ সেকেন্ডে কোনো উত্তর পাওয়া যায়নি)' : err.message,
      message: 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। URL ও নেটওয়ার্ক চেক করুন।'
    }, { status: 502 });
  }
}
