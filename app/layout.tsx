import type { Metadata } from 'next';
import '../src/index.css';
import Providers from './providers';
import { getDB } from './lib/db';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const DBManager = await getDB();
    const settings: any = DBManager.getSettings() || {};

    const siteName = (settings.site_name || 'Arot Express').trim();
    const siteTagline = (settings.site_tagline || 'তাজা পাইকারি ও খুচরা মুদি বাজার').trim();
    const title = siteTagline || siteName;
    const description = (settings.header_subtitle || settings.site_tagline || 'তাজা পাইকারি ও খুচরা মুদি বাজার').trim();
    const bannerUrl = (settings.banner_url || settings.logo_image_url || '').trim();

    const openGraphImages = bannerUrl ? [{ url: bannerUrl, alt: siteName }] : [];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: openGraphImages,
      },
      twitter: {
        card: bannerUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        images: bannerUrl ? [bannerUrl] : [],
      },
    };
  } catch (e) {
    return {
      title: 'Arot Express',
      description: 'তাজা পাইকারি ও খুচরা মুদি বাজার',
      openGraph: {
        title: 'Arot Express',
        description: 'তাজা পাইকারি ও খুচরা মুদি বাজার',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Arot Express',
        description: 'তাজা পাইকারি ও খুচরা মুদি বাজার',
      },
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let faviconUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23006C4C'/%3E%3Ctext x='32' y='35' text-anchor='middle' dominant-baseline='central' fill='%23FFFFFF' font-family='sans-serif' font-weight='900' font-size='34'%3EAE%3C/text%3E%3C/svg%3E";

  try {
    const DBManager = await getDB();
    const settings: any = DBManager.getSettings() || {};
    if (settings.logo_type === 'image' && settings.logo_image_url?.trim()) {
      faviconUrl = settings.logo_image_url.trim();
    }
  } catch (e) {
    // fallback to default svg
  }

  return (
    <html lang="bn" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="root">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
