import { MetadataRoute } from 'next';
import { getDB } from './lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://arot-express.com';
  let categories: any[] = [];

  try {
    const DBManager = await getDB();
    categories = DBManager.getCategories() || [];
  } catch (e) {
    // fallback
  }

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1.0,
    },
    ...categoryUrls,
  ];
}
