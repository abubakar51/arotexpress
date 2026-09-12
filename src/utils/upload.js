/**
 * Uploads an image file or base64 to ImgBB via the secure server-side /api/upload route.
 * Returns the permanent direct image URL (e.g. https://i.ibb.co/...).
 */
export async function uploadImage(fileOrData) {
  if (!fileOrData) return null;

  // If already an online URL, return directly
  if (typeof fileOrData === 'string' && (fileOrData.startsWith('http://') || fileOrData.startsWith('https://'))) {
    return fileOrData;
  }

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

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'ছবি ImgBB-তে আপলোড ব্যর্থ হয়েছে।');
  }

  return data.url;
}
