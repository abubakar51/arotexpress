/**
 * Uploads an image file or base64 to ImgBB.
 * Strategy:
 * 1. First tries server-side proxy (/api/upload).
 * 2. If Render cloud IP receives 403 Forbidden / Cloudflare block ("You have been forbidden to use this website"),
 *    it automatically falls back to uploading directly from the user's browser client using ImgBB API.
 *    Since the client has a real residential/mobile IP and real browser environment, ImgBB will never block it!
 */
export async function uploadImage(fileOrData) {
  if (!fileOrData) return null;

  // If already an online URL, return directly
  if (typeof fileOrData === 'string' && (fileOrData.startsWith('http://') || fileOrData.startsWith('https://'))) {
    return fileOrData;
  }

  // Attempt 1: Server-side route
  try {
    let body;
    const headers = {};

    if (fileOrData instanceof File || fileOrData instanceof Blob) {
      const formData = new FormData();
      formData.append('image', fileOrData);
      body = formData;
    } else if (typeof fileOrData === 'string') {
      body = JSON.stringify({ image: fileOrData });
      headers['Content-Type'] = 'application/json';
    } else {
      return null;
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body
    });

    const data = await res.json();

    if (res.ok && data.success && data.url) {
      return data.url;
    }

    // If server failed (e.g. Render IP forbidden / cloud block)
    const errText = data?.error || '';
    console.warn('Server upload returned error, trying direct browser fallback:', errText);
    
    // Attempt 2: Direct browser client upload fallback
    return await uploadDirectFromBrowser(fileOrData);
  } catch (err) {
    console.warn('Server upload exception, trying direct browser fallback:', err);
    return await uploadDirectFromBrowser(fileOrData);
  }
}

/**
 * Fallback: Upload directly from the user's browser client to ImgBB.
 * Bypasses Render/Cloud IP bot blocks.
 */
async function uploadDirectFromBrowser(fileOrData) {
  // Fetch API key from config endpoint
  let apiKey = '';
  try {
    const configRes = await fetch('/api/upload/config');
    if (configRes.ok) {
      const configData = await configRes.json();
      apiKey = configData.apiKey || '';
    }
  } catch (e) {
    console.warn('Could not fetch upload config:', e);
  }

  if (!apiKey) {
    throw new Error('ImgBB API Key পাওয়া যায়নি! Render Environment Variables-এ IMGBB_API যুক্ত করুন।');
  }

  const formData = new FormData();

  if (fileOrData instanceof File || fileOrData instanceof Blob) {
    formData.append('image', fileOrData);
  } else if (typeof fileOrData === 'string') {
    let cleanBase64 = fileOrData;
    if (cleanBase64.includes('base64,')) {
      cleanBase64 = cleanBase64.split('base64,')[1];
    }
    formData.append('image', cleanBase64);
  } else {
    throw new Error('অকার্যকর ইমেজ ফাইল');
  }

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    body: formData
  });

  const resText = await response.text();
  let jsonRes;
  try {
    jsonRes = JSON.parse(resText);
  } catch (e) {
    if (resText.includes('forbidden')) {
      throw new Error('ImgBB থেকে ব্রাউজারকেও ব্লক দেখাচ্ছে। অন্য কোনো ছবি অথবা সরাসরি অনলাইন ইমেজ লিঙ্ক ব্যবহার করুন।');
    }
    throw new Error(`ImgBB আপলোড ব্যর্থ হয়েছে (${response.status})`);
  }

  if (!response.ok || !jsonRes.success) {
    throw new Error(jsonRes?.error?.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
  }

  return jsonRes.data?.url || jsonRes.data?.display_url;
}
