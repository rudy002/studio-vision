import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import PropertyPageWrapper from '../../../../components/PropertyPageWrapper';

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

  const title =
    locale === 'fr' ? property.title_fr
    : locale === 'en' ? property.title_en
    : property.title_he;

  const description =
    locale === 'fr' ? property.description_fr
    : locale === 'en' ? property.description_en
    : property.description_he;

  const image = property.photos?.[0];
  const metaDesc = description || `${property.type} · ${property.city} · ${Number(property.price).toLocaleString()} ₪`;

  return {
    title: `${title} — Studio Vision`,
    description: metaDesc,
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
  const { id } = await params;

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (!property) notFound();

  return (
    <main className="bg-[#0a0f1a] min-h-screen">
      <PropertyPageWrapper property={property} />
    </main>
  );
}
