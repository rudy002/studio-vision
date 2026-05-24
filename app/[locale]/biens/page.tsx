'use client';

import { useEffect, useState, useMemo } from 'react';
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

const PROPERTY_TYPES = ['all', 'villa', 'appartement', 'maison', 'penthouse'] as const;
type PropertyType = (typeof PROPERTY_TYPES)[number];
type StatusFilter = 'all' | 'available' | 'sold';
type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'surface_asc' | 'surface_desc';

interface Filters {
  type: PropertyType;
  city: string;
  status: StatusFilter;
  priceMin: string;
  priceMax: string;
  surfaceMin: string;
  surfaceMax: string;
  bedrooms: number | null;
  sort: SortKey;
}

const DEFAULT_FILTERS: Filters = {
  type: 'all',
  city: 'all',
  status: 'all',
  priceMin: '',
  priceMax: '',
  surfaceMin: '',
  surfaceMax: '',
  bedrooms: null,
  sort: 'newest',
};

export default function BiensPage() {
  const t = useTranslations('properties');
  const locale = useLocale();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
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

  const cities = useMemo(() => {
    const set = new Set(properties.map((p) => p.city).filter(Boolean));
    return Array.from(set).sort();
  }, [properties]);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const hasActiveFilters = useMemo(
    () =>
      filters.type !== 'all' ||
      filters.city !== 'all' ||
      filters.status !== 'all' ||
      filters.priceMin !== '' ||
      filters.priceMax !== '' ||
      filters.surfaceMin !== '' ||
      filters.surfaceMax !== '' ||
      filters.bedrooms !== null ||
      filters.sort !== 'newest',
    [filters]
  );

  const filtered = useMemo(() => {
    const result = properties.filter((p) => {
      if (filters.type !== 'all' && p.type.toLowerCase() !== filters.type) return false;
      if (filters.city !== 'all' && p.city !== filters.city) return false;
      if (filters.status !== 'all' && p.status !== filters.status) return false;
      if (filters.priceMin !== '' && p.price < Number(filters.priceMin)) return false;
      if (filters.priceMax !== '' && p.price > Number(filters.priceMax)) return false;
      if (filters.surfaceMin !== '' && p.surface < Number(filters.surfaceMin)) return false;
      if (filters.surfaceMax !== '' && p.surface > Number(filters.surfaceMax)) return false;
      if (filters.bedrooms !== null && p.bedrooms < filters.bedrooms) return false;
      return true;
    });

    if (filters.sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'surface_asc') result.sort((a, b) => a.surface - b.surface);
    else if (filters.sort === 'surface_desc') result.sort((a, b) => b.surface - a.surface);

    return result;
  }, [properties, filters]);

  const pillClass = (active: boolean) =>
    `text-[11px] tracking-[1.5px] uppercase px-4 py-1.5 rounded-full border transition-all duration-200 cursor-pointer whitespace-nowrap ${
      active
        ? 'bg-[#c39553] border-[#c39553] text-[#0e1612]'
        : 'border-white/30 text-white/60 hover:border-white/55 hover:text-white'
    }`;

  const inputClass =
    'border border-white/20 rounded-lg px-3 py-2 text-white text-[12px] placeholder:text-white/35 focus:outline-none focus:border-[#c39553]/70 transition-colors';

  const selectStyle = { background: '#0a0f1a', colorScheme: 'dark' as const };

  return (
    <main className="min-h-screen">

      {/* Header sombre */}
      <div className="bg-[#0a0f1a] pt-32 md:pt-40 pb-10 px-6 md:px-16">
        <p className="text-[13px] tracking-[4px] text-[#c39553] uppercase mb-4">
          {t('eyebrow')}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-white mb-10">
          {t('title')}
        </h1>

        {/* Filtres type */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setFilter('type', type)}
              className={pillClass(filters.type === type)}
            >
              {t(`filters.${type}`)}
            </button>
          ))}
        </div>

        {/* Filtres avancés */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(195,149,83,0.04)', border: '1px solid rgba(195,149,83,0.12)' }}
        >
          <div className="flex flex-col gap-5">

            {/* Ligne 1 : Ville · Statut · Chambres */}
            <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">

              {/* Ville */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">
                  {t('filters.city')}
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilter('city', e.target.value)}
                  className={inputClass + ' cursor-pointer min-w-40'}
                  style={selectStyle}
                >
                  <option value="all">{t('filters.cityAll')}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Statut */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">
                  {t('filters.status')}
                </label>
                <div className="flex gap-2">
                  {(['all', 'available', 'sold'] as StatusFilter[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilter('status', s)}
                      className={pillClass(filters.status === s)}
                    >
                      {t(`filters.status_${s}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chambres */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">
                  {t('filters.bedrooms')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('bedrooms', null)}
                    className={pillClass(filters.bedrooms === null)}
                  >
                    {t('filters.bedroomsAll')}
                  </button>
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setFilter('bedrooms', n)}
                      className={pillClass(filters.bedrooms === n)}
                    >
                      {n === 4 ? '4+' : String(n)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ligne 2 : Prix · Superficie · Tri · Reset */}
            <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">

              {/* Prix */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">
                  {t('filters.priceRange')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={filters.priceMin}
                    onChange={(e) => setFilter('priceMin', e.target.value)}
                    placeholder={t('filters.min')}
                    className={inputClass}
                    style={{ width: '100px', background: 'rgba(255,255,255,0.08)' }}
                  />
                  <span className="text-white/30 text-sm select-none">—</span>
                  <input
                    type="number"
                    min={0}
                    value={filters.priceMax}
                    onChange={(e) => setFilter('priceMax', e.target.value)}
                    placeholder={t('filters.max')}
                    className={inputClass}
                    style={{ width: '100px', background: 'rgba(255,255,255,0.08)' }}
                  />
                </div>
              </div>

              {/* Superficie */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">
                  {t('filters.surfaceRange')} (m²)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={filters.surfaceMin}
                    onChange={(e) => setFilter('surfaceMin', e.target.value)}
                    placeholder={t('filters.min')}
                    className={inputClass}
                    style={{ width: '85px', background: 'rgba(255,255,255,0.08)' }}
                  />
                  <span className="text-white/30 text-sm select-none">—</span>
                  <input
                    type="number"
                    min={0}
                    value={filters.surfaceMax}
                    onChange={(e) => setFilter('surfaceMax', e.target.value)}
                    placeholder={t('filters.max')}
                    className={inputClass}
                    style={{ width: '85px', background: 'rgba(255,255,255,0.08)' }}
                  />
                </div>
              </div>

              {/* Tri */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">
                  {t('filters.sort')}
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilter('sort', e.target.value as SortKey)}
                  className={inputClass + ' cursor-pointer min-w-42.5'}
                  style={selectStyle}
                >
                  {(['newest', 'price_asc', 'price_desc', 'surface_asc', 'surface_desc'] as SortKey[]).map((s) => (
                    <option key={s} value={s}>{t(`filters.sort_${s}`)}</option>
                  ))}
                </select>
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-[11px] tracking-[1.5px] uppercase text-[#c39553] hover:text-white border border-[#c39553]/40 hover:border-white/40 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer self-end"
                >
                  {t('filters.reset')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Carte */}
      <div className="bg-[#0a0f1a] px-6 md:px-16 pb-16 pt-10">
        <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(195,149,83,0.12)' }}>
          <MapView
            properties={filtered}
            onPropertyClick={(p) => setSelected(p)}
            className="h-87.5 md:h-130"
          />
        </div>
      </div>

      {/* Séparateur doré */}
      <div className="bg-[#0a0f1a] px-6 md:px-16 pb-0">
        <div className="h-px bg-[#c39553]/18" />
      </div>

      {/* Grille */}
      <div className="bg-[#0a0f1a] px-6 md:px-16 py-16 md:py-24">

        {/* Compteur de résultats */}
        {!loading && (
          <p className="text-[11px] tracking-[2px] uppercase text-[#c39553]/45 mb-10">
            {filtered.length} {t('filters.resultsCount')}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-32">
            <div className="w-px h-12 bg-[#c39553]/35 animate-pulse" />
            <div className="w-px h-8 bg-[#c39553]/15 animate-pulse" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-serif text-2xl text-white/30 text-center py-24">
            {t('noResults')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property) => (
              <div key={property.id} className="h-96">
                <PropertyCard
                  property={property}
                  onClick={() => setSelected(property)}
                />
              </div>
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
