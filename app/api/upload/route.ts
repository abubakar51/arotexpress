import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/app/lib/auth';
import { checkRateLimit } from '@/app/lib/rateLimit';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.error || (authResult.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'শুধুমাত্র অ্যাডমিন ছবি আপলোড করতে পারবেন।' }, { status: 401 });
    }

    const rateCheck = checkRateLimit(req, 'upload_image', 25, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `অনেক বেশি আপলোড রিকোয়েস্ট পাঠানো হয়েছে। দয়া করে ${rateCheck.resetInSeconds} সেকেন্ড অপেক্ষা করুন।` },
        { status: 429 }
      );
    }

    const apiKey = (process.env.IMGBB_API || process.env.IMGBB_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'ImgBB API Key পাওয়া যায়নি! দয়া করে .env ফাইলে IMGBB_API="your_api_key" যুক্ত করুন।'
        },
        { status: 400 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let optimizedBuffer: Buffer;

    if (contentType.includes('multipart/form-data')) {
      const incomingForm = await req.formData();
      const file = incomingForm.get('image') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'কোনো ইমেজ ফাইল পাওয়া যায়নি।' },
          { status: 400 }
        );
      }

      // Max 10MB input check
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'ইমেজ ফাইল সাইজ সর্বোচ্চ 10MB হতে পারবে।' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      // Optimize image with sharp: resize if > 1600px, convert to high-efficiency WebP
      optimizedBuffer = await sharp(inputBuffer)
        .rotate() // Auto-rotate according to EXIF
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();
    } else {
      const body = await req.json();
      if (!body.image) {
        return NextResponse.json(
          { error: 'কোনো ইমেজ পাওয়া যায়নি।' },
          { status: 400 }
        );
      }

      let imgData = body.image;
      if (typeof imgData === 'string' && imgData.includes('base64,')) {
        imgData = imgData.split('base64,')[1];
      }
      const inputBuffer = Buffer.from(imgData, 'base64');

      optimizedBuffer = await sharp(inputBuffer)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();
    }

    const imgbbBody = new FormData();
    const webpBlob = new Blob([new Uint8Array(optimizedBuffer)], { type: 'image/webp' });
    imgbbBody.append('image', webpBlob, 'optimized_image.webp');

    // Send request to ImgBB API with User-Agent header
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      },
      body: imgbbBody
    });

    const responseText = await response.text();
    let resData: any = null;
    try {
      resData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('ImgBB non-JSON response from Render/Host:', responseText);
      if (responseText.includes('forbidden') || response.status === 403) {
        return NextResponse.json(
          {
            error: 'ImgBB ক্লাউড হোস্টিং রিকোয়েস্ট সাময়িক ব্লক করেছে। অনুগ্রহ করে ব্রাউজার থেকে সরাসরি ImgBB আপলোড ব্যবহার করুন অথবা ছবিটির অনলাইন লিংক ইনপুট বক্সে বসান।'
          },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: `ImgBB রেসপন্স পড়তে সমস্যা হয়েছে (${response.status})` },
        { status: 502 }
      );
    }

    if (!response.ok || !resData.success) {
      const errorMsg = resData?.error?.message || 'ImgBB তে ছবি আপলোড করতে ব্যর্থ হয়েছে';
      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

    const directUrl = resData.data?.url || resData.data?.display_url;

    return NextResponse.json({
      success: true,
      url: directUrl,
      display_url: resData.data?.display_url || directUrl,
      thumb_url: resData.data?.thumb?.url || null,
      delete_url: resData.data?.delete_url || null
    });
  } catch (err: any) {
    console.error('ImgBB Upload Error:', err);
    return NextResponse.json(
      { error: err.message || 'সার্ভারে ইমেজ অপ্টিমাইজ ও আপলোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
