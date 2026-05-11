import { createClient } from '@supabase/supabase-js';
import { getTranslations, getLocale } from 'next-intl/server';
import PropertyCard, { Property } from '../../../components/PropertyCard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function BiensPage() {
  const t = await getTranslations('properties');
  const locale = await getLocale();

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error(error);

  return (
    <main className="bg-[#f5f2ec] min-h-screen">

      {/* Header */}
      <div className="pt-40 pb-16 px-16">
        <p className="text-[10px] tracking-[4px] text-[#b08d57] uppercase mb-4">
          {t('eyebrow')}
        </p>
        <h1 className="font-serif text-5xl font-light text-[#1c1917]">
          {t('title')}
        </h1>
      </div>

      {/* Grille de biens */}
      <div className="px-16 pb-24">
        {!properties || properties.length === 0 ? (
          <p className="font-serif text-2xl text-[#8a8078] text-center py-24">
            {t('noResults')}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-7">
            {properties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>

    </main>
  );
}