'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTranslations, useLocale } from 'next-intl';
import PropertyCard, { Property } from '../../../components/PropertyCard';
import PropertyModal from '../../../components/PropertyModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BiensPage() {
  const t = useTranslations('properties');
  const locale = useLocale();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      setProperties(data || []);
      setLoading(false);
    };
    fetchProperties();
  }, []);

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

      {/* Grille */}
      <div className="px-16 pb-24">
        {loading ? (
          <p className="font-serif text-2xl text-[#8a8078] text-center py-24">...</p>
        ) : !properties || properties.length === 0 ? (
          <p className="font-serif text-2xl text-[#8a8078] text-center py-24">
            {t('noResults')}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-7">
            {properties.map((property: Property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => setSelected(property)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <PropertyModal
          property={selected}
          onClose={() => setSelected(null)}
        />
      )}

    </main>
  );
}