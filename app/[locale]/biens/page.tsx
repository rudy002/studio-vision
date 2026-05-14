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

const FILTER_TYPES = ['all', 'villa', 'appartement', 'maison', 'penthouse'] as const;
type FilterType = (typeof FILTER_TYPES)[number];

export default function BiensPage() {
  const t = useTranslations('properties');
  const locale = useLocale();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProperties(data || []);
        setLoading(false);
      });
  }, []);

  const filtered =
    filter === 'all'
      ? properties
      : properties.filter((p) => p.type.toLowerCase() === filter);

  return (
    <main className="min-h-screen">

      {/* Header sombre */}
      <div className="bg-[#0a0f1a] pt-32 md:pt-40 pb-16 px-6 md:px-16">
        <p className="text-[13px] tracking-[4px] text-[#b08d57] uppercase mb-4">
          {t('eyebrow')}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-white mb-10">
          {t('title')}
        </h1>

        {/* Filtres pill */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`text-[12px] tracking-[2px] uppercase px-5 py-2 rounded-full border transition-all duration-200 cursor-pointer ${
                filter === type
                  ? 'bg-[#b08d57] border-[#b08d57] text-white'
                  : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
              }`}
            >
              {t(`filters.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Carte */}
      <div className="bg-[#0a0f1a] px-6 md:px-16 pb-16">
        <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <MapView
            properties={properties}
            onPropertyClick={(p) => setSelected(p)}
            className="h-87.5 md:h-130"
          />
        </div>
      </div>

      {/* Séparateur doré */}
      <div className="bg-[#0a0f1a] px-6 md:px-16 pb-0">
        <div className="h-px bg-[#b08d57]/20" />
      </div>

      {/* Grille */}
      <div className="bg-[#f5f2ec] px-6 md:px-16 py-16 md:py-24">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-32">
            <div className="w-px h-12 bg-[#b08d57]/40 animate-pulse" />
            <div className="w-px h-8 bg-[#b08d57]/20 animate-pulse" />
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <p className="font-serif text-2xl text-[#8a8078] text-center py-24">
            {t('noResults')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((property) => (
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
