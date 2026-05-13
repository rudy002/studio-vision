'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { useTranslations, useLocale } from 'next-intl';
import PropertyCard, { Property } from '../../../components/PropertyCard';
import PropertyModal from '../../../components/PropertyModal';

const MapView = dynamic(() => import('../../../components/MapView'), { ssr: false });

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
      <div className="pt-32 md:pt-40 pb-10 md:pb-16 px-6 md:px-16">
        <p className="text-[10px] tracking-[4px] text-[#b08d57] uppercase mb-4">
          {t('eyebrow')}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-[#1c1917]">
          {t('title')}
        </h1>
      </div>

      {/* Carte */}
      <div className="px-6 md:px-16 pb-12">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(16px)', border: '0.5px solid rgba(255,255,255,0.5)' }}
        >
          <MapView
            properties={properties}
            onPropertyClick={(p) => setSelected(p)}
            className="h-87.5 md:h-130"
          />
        </div>
      </div>

      {/* Grille */}
      <div className="px-6 md:px-16 pb-24">
        {loading ? (
          <p className="font-serif text-2xl text-[#8a8078] text-center py-24">...</p>
        ) : !properties || properties.length === 0 ? (
          <p className="font-serif text-2xl text-[#8a8078] text-center py-24">
            {t('noResults')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
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
