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
  let initialData: any = null;

  try {
    const DBManager = await getDB();
    const rawSettings: any = DBManager.getSettings() || {};
    const settings: any = { ...rawSettings };
    // Strictly remove private API keys and verification secrets from SSR client payload
    delete settings.payment_verify_api_key;
    delete settings.payment_verify_api_url;

    if (settings.logo_type === 'image' && settings.logo_image_url?.trim()) {
      faviconUrl = settings.logo_image_url.trim();
    }

    // Prepare complete initial state for Server-Side Rendering (SSR)
    const rawGroups = DBManager.getGroups() || [];
    const rawCategories = DBManager.getCategories() || [];
    const rawPaymentMethods = DBManager.getPaymentMethods() || [];
    const rawDeliveryAreas = DBManager.getDeliveryAreas() || [];

    initialData = {
      groups: JSON.parse(JSON.stringify(rawGroups)),
      categories: JSON.parse(JSON.stringify(rawCategories)),
      settings: JSON.parse(JSON.stringify(settings)),
      paymentMethods: JSON.parse(JSON.stringify(rawPaymentMethods)),
      deliveryAreas: JSON.parse(JSON.stringify(rawDeliveryAreas)),
      defaultDeliveryFee: typeof settings.default_delivery_fee === 'number' ? settings.default_delivery_fee : 60
    };
  } catch (e) {
    // fallback gracefully if database initialization encounters any transient issue
  }

  // Generate Schema.org JSON-LD structured data for Google, Gemini and AI web crawlers
  const siteUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://arot-express.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: initialData?.settings?.site_name || 'Arot Express',
    description: initialData?.settings?.header_subtitle || 'মুদি বাজারের পুরো লিস্ট, এক জায়গায়। তাজা পাইকারি ও খুচরা মুদি বাজার।',
    url: siteUrl,
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash on Delivery, bKash, Nagad, Rocket',
    priceRange: '৳৳',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'মুদি পণ্যের তালিকা (Grocery Catalog)',
      itemListElement: (initialData?.categories || []).map((cat: any, idx: number) => ({
        '@type': 'OfferCatalog',
        name: `${cat.bn} (${cat.en})`,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: (cat.brands || []).length,
        itemListElement: (cat.brands || []).map((b: any, bIdx: number) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: b.name,
            category: cat.bn,
            offers: {
              '@type': 'Offer',
              price: b.price,
              priceCurrency: 'BDT',
              availability: (b.stock === undefined || b.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              unitText: b.unit
            }
          }
        }))
      }))
    }
  };

  return (
    <html lang="bn" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div id="root">
          <Providers initialData={initialData}>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
