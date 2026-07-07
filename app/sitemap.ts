import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://www.studiovision.co.il';
const locales = ['fr', 'en', 'he'];

const staticRoutes = ['', '/packages', '/contact', '/biens'];

/** Régénère le sitemap au plus une fois par heure pour inclure les nouveaux biens sans redéploiement. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: properties } = await supabase
    .from('properties')
    .select('id, created_at')
    .eq('status', 'available');

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'weekly' : 'monthly',
      priority: route === '' ? 1.0 : 0.8,
    }))
  );

  const propertyEntries: MetadataRoute.Sitemap = (properties ?? []).flatMap((p) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/biens/${p.id}`,
      lastModified: p.created_at ? new Date(p.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }))
  );

  return [...staticEntries, ...propertyEntries];
}
