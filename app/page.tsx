import React from 'react';
import HomeClientView from '@/src/components/HomeClientView';
import { getDB } from './lib/db';
import { toBengaliNumber } from '@/src/utils/bengali';

// Force dynamic so any update in PostgreSQL or admin panel reflects immediately on server rendering
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let groups: any[] = [];
  let categories: any[] = [];
  let settings: any = {};

  try {
    const DBManager = await getDB();
    groups = DBManager.getGroups() || [];
    categories = DBManager.getCategories() || [];
    settings = DBManager.getSettings() || {};
  } catch (err) {
    console.error('SSR HomePage DB fetch error:', err);
  }

  // Filter active groups and active categories for server HTML pre-rendering
  const activeGroups = groups.filter((g: any) => g.is_active !== false);
  const activeCategories = categories.filter((c: any) => {
    const parentGroup = groups.find((g: any) => g.key === c.group);
    return parentGroup ? parentGroup.is_active !== false : true;
  });

  return (
    <>
      {/* 
        1. Fully Server-Rendered Semantic Content:
        Directly embedded into the initial HTML response from the server.
        Search engines (Google), AI crawlers (Gemini, ChatGPT), and lightweight bots
        can instantly read all products, categories, titles, and descriptions 
        without needing to execute JavaScript!
      */}
      <section className="sr-only" aria-label="সব ক্যাটাগরি ও মুদি পণ্য তালিকা (Server Pre-rendered)">
        <h1>{settings?.header_title || 'মুদি বাজারের পুরো লিস্ট, এক জায়গায়।'}</h1>
        <p>{settings?.header_subtitle || 'চাল-ডাল থেকে মাছ-মসলা — আড়তের মতো দরে, ঘরে বসে অর্ডার করুন।'}</p>
        
        {activeGroups.map((group: any) => {
          const groupCats = activeCategories.filter((cat: any) => cat.group === group.key);
          if (groupCats.length === 0) return null;

          return (
            <article key={`ssr-grp-${group.key}`}>
              <h2>{group.bn} ({group.en})</h2>
              <ul>
                {groupCats.map((cat: any) => (
                  <li key={`ssr-cat-${cat.id}`}>
                    <h3>
                      <a href={`/category/${cat.id}`}>{cat.bn} - {cat.en}</a>
                    </h3>
                    {cat.brands && cat.brands.length > 0 && (
                      <p>
                        ব্র্যান্ড/পণ্য: {cat.brands.map((b: any) => `${b.name} (৳${toBengaliNumber(b.price)} / ${b.unit})`).join(', ')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      {/* 
        2. Dynamic Client Component:
        Handles the interactive animated user interface, cart drawer, live search, 
        smooth scrolling, and real-time client hydration seamlessly.
      */}
      <HomeClientView />
    </>
  );
}
