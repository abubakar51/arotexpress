import React from 'react';
import type { Metadata } from 'next';
import CategoryDetailClientView from '@/src/components/CategoryDetailClientView';
import { getDB } from '@/app/lib/db';
import { toBengaliNumber } from '@/src/utils/bengali';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const catId = parseInt(resolvedParams.id, 10);

  try {
    const DBManager = await getDB();
    const categories = DBManager.getCategories() || [];
    const settings: any = DBManager.getSettings() || {};
    const cat = categories.find((c: any) => c.id === catId || String(c.id) === String(resolvedParams.id));

    if (cat) {
      const title = `${cat.bn} (${cat.en}) — ${settings.site_name || 'Arot Express'}`;
      const brandNames = (cat.brands || []).map((b: any) => b.name).join(', ');
      const description = brandNames
        ? `${cat.bn} এর উপলব্ধ ব্র্যান্ড ও পণ্য: ${brandNames}। আড়ত দরে অনলাইনে অর্ডার করুন।`
        : `${cat.bn} (${cat.en}) পণ্য আড়ত দরে ঘরে বসে অর্ডার করুন।`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'website'
        },
        twitter: {
          card: 'summary',
          title,
          description
        }
      };
    }
  } catch (e) {
    // fallback
  }

  return {
    title: 'ক্যাটাগরি বিস্তারিত — Arot Express',
    description: 'তাজা পাইকারি ও খুচরা মুদি বাজার'
  };
}

export default async function CategoryDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const categoryIdParam = resolvedParams.id;
  const numId = parseInt(categoryIdParam, 10);

  let category: any = null;
  try {
    const DBManager = await getDB();
    const categories = DBManager.getCategories() || [];
    category = categories.find((c: any) => c.id === numId || String(c.id) === String(categoryIdParam));
  } catch (err) {
    console.error('SSR Category fetch error:', err);
  }

  return (
    <>
      {/* 
        Server-Pre-rendered SEO semantic information:
        Instant crawlability for Gemini, Google, and bots
      */}
      {category && (
        <section className="sr-only" aria-label={`${category.bn} পণ্য তালিকা`}>
          <h1>{category.bn} - {category.en}</h1>
          {category.brands && category.brands.length > 0 && (
            <ul>
              {category.brands.map((b: any, idx: number) => (
                <li key={`cat-brand-${idx}`}>
                  <strong>{b.name}</strong> - ৳{toBengaliNumber(b.price)} প্রতি {b.unit}
                  {b.stock !== undefined && ` (স্টক: ${toBengaliNumber(b.stock)})`}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Interactive client component */}
      <CategoryDetailClientView categoryIdParam={categoryIdParam} />
    </>
  );
}
