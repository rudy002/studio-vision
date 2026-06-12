import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import PropertyPageWrapper from '../../../../components/PropertyPageWrapper';
import { BASE_URL } from '../../../../lib/seo';
import { cityLabel } from '../../../../lib/city';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Params = Promise<{ id: string; locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id, locale } = await params;

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (!property) return {};

  // Les titres ne sont plus saisis dans l'admin — fallback type · ville
  const city = cityLabel(property, locale);
  const title =
    (locale === 'fr' ? property.title_fr
    : locale === 'en' ? property.title_en
    : property.title_he)
    || [property.type, city].filter(Boolean).join(' · ');

  const description =
    locale === 'fr' ? property.description_fr
    : locale === 'en' ? property.description_en
    : property.description_he;

  const image = property.photos?.[0];
  const metaDesc = description || `${property.type} · ${city} · ${Number(property.price).toLocaleString()} ₪`;

  return {
    title: `${title} — Studio Vision`,
    description: metaDesc,
    alternates: {
      canonical: `${BASE_URL}/fr/biens/${id}`,
      languages: {
        fr: `${BASE_URL}/fr/biens/${id}`,
        en: `${BASE_URL}/en/biens/${id}`,
        he: `${BASE_URL}/he/biens/${id}`,
        'x-default': `${BASE_URL}/en/biens/${id}`,
      },
    },
    openGraph: {
      title: `${title} — Studio Vision`,
      description: metaDesc,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Studio Vision`,
      description: metaDesc,
      images: image ? [image] : [],
    },
  };
}

export default async function BienPage({ params }: { params: Params }) {
  const { id, locale } = await params;

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (!property) notFound();

  const city = cityLabel(property, locale);
  const title =
    (locale === 'fr' ? property.title_fr
    : locale === 'en' ? property.title_en
    : property.title_he)
    || [property.type, city].filter(Boolean).join(' · ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    url: `${BASE_URL}/${locale}/biens/${id}`,
    ...(property.photos?.[0] && { image: property.photos[0] }),
    ...(property.description_fr && { description: property.description_fr }),
    ...(property.price && {
      offers: {
        '@type': 'Offer',
        price: String(property.price),
        priceCurrency: 'ILS',
      },
    }),
    ...(property.surface && {
      floorSize: {
        '@type': 'QuantitativeValue',
        value: property.surface,
        unitCode: 'MTK',
      },
    }),
    ...(city && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: city,
        addressCountry: 'IL',
      },
    }),
  };

  return (
    <main className="bg-[#0a0f1a] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyPageWrapper property={property} />
    </main>
  );
}
