import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = (process.env.IMGBB_API || process.env.IMGBB_API_KEY || '').trim();
  return NextResponse.json({
    configured: Boolean(apiKey),
    apiKey: apiKey || null
  });
}
