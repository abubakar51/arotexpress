import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
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
    let imgbbBody = new FormData();

    if (contentType.includes('multipart/form-data')) {
      const incomingForm = await req.formData();
      const file = incomingForm.get('image');

      if (!file) {
        return NextResponse.json(
          { error: 'কোনো ইমেজ ফাইল পাওয়া যায়নি।' },
          { status: 400 }
        );
      }

      imgbbBody.append('image', file);
    } else {
      const body = await req.json();
      if (!body.image) {
        return NextResponse.json(
          { error: 'কোনো ইমেজ পাওয়া যায়নি।' },
          { status: 400 }
        );
      }

      // If base64 with data URL prefix, strip data:image/...;base64,
      let imgData = body.image;
      if (typeof imgData === 'string' && imgData.includes('base64,')) {
        imgData = imgData.split('base64,')[1];
      }
      imgbbBody.append('image', imgData);
    }

    // Send request to ImgBB API
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      body: imgbbBody
    });

    const resData = await response.json();

    if (!response.ok || !resData.success) {
      const errorMsg = resData?.error?.message || 'ImgBB তে ছবি আপলোড করতে ব্যর্থ হয়েছে';
      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

    // Return the direct permanent URL
    // data.url: e.g. https://i.ibb.co/.../image.png
    // data.display_url: display view
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
      { error: err.message || 'সার্ভারে ইমেজ আপলোড করতে অপ্রত্যাশিত সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
