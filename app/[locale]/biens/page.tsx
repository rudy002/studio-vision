'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import PropertyCard, { Property } from '../../../components/PropertyCard';
import PropertyModal from '../../../components/PropertyModal';
import { SpinBar } from '../../../components/loaders';

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

// ── Skeleton card ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/6 h-104 flex flex-col" style={{ background: 'rgba(255,255,255,0.03)' }}>
      {/* Image placeholder — cream background with 2 pulsing gold bars */}
      <div className="relative flex-1 flex flex-col items-center justify-center gap-3 overflow-hidden" style={{ background: '#0f1420' }}>
        <div
          className="h-px origin-left rounded-full"
          style={{
            width: '56px',
            background: '#b08d57',
            animation: 'spin-bar-pulse 1.4s ease-in-out infinite',
          }}
        />
        <div
          className="h-px origin-left rounded-full"
          style={{
            width: '32px',
            background: '#b08d57',
            animation: 'spin-bar-pulse 1.4s ease-in-out infinite',
            animationDelay: '0.3s',
          }}
        />
      </div>
      {/* Text shimmer lines */}
      <div className="p-5 flex flex-col gap-3">
        <div
          className="h-px rounded-full"
          style={{
            width: '80px',
            backgroundImage: 'linear-gradient(90deg, #d4cdc4, #ede8df, #d4cdc4)',
            backgroundSize: '200% 100%',
            animation: 'spin-shimmer 1.6s linear infinite',
          }}
        />
        <div
          className="h-[5px] rounded"
          style={{
            width: '75%',
            backgroundImage: 'linear-gradient(90deg, #d4cdc4, #ede8df, #d4cdc4)',
            backgroundSize: '200% 100%',
            animation: 'spin-shimmer 1.6s linear infinite',
            animationDelay: '0.1s',
          }}
        />
        <div
          className="h-px rounded"
          style={{
            width: '50%',
            backgroundImage: 'linear-gradient(90deg, #d4cdc4, #ede8df, #d4cdc4)',
            backgroundSize: '200% 100%',
            animation: 'spin-shimmer 1.6s linear infinite',
            animationDelay: '0.2s',
          }}
        />
        <div
          className="mt-2 h-12 rounded-xl"
          style={{
            backgroundImage: 'linear-gradient(90deg, rgba(212,205,196,0.08), rgba(237,232,223,0.15), rgba(212,205,196,0.08))',
            backgroundSize: '200% 100%',
            animation: 'spin-shimmer 1.6s linear infinite',
            animationDelay: '0.15s',
          }}
        />
      </div>
    </div>
  );
}

export default function BiensPage() {
  const t = useTranslations('properties');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<Filters>(() => ({
    type: (searchParams.get('type') as PropertyType) || 'all',
    city: searchParams.get('city') || 'all',
    status: (searchParams.get('status') as StatusFilter) || 'all',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    surfaceMin: searchParams.get('surfaceMin') || '',
    surfaceMax: searchParams.get('surfaceMax') || '',
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : null,
    sort: (searchParams.get('sort') as SortKey) || 'newest',
  }));

  // Valeurs locales des inputs avec debounce
  const [priceMinInput, setPriceMinInput] = useState(filters.priceMin);
  const [priceMaxInput, setPriceMaxInput] = useState(filters.priceMax);
  const [surfaceMinInput, setSurfaceMinInput] = useState(filters.surfaceMin);
  const [surfaceMaxInput, setSurfaceMaxInput] = useState(filters.surfaceMax);

  const [selected, setSelected] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const tabTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ── Fetch Supabase ──────────────────────────────────────────
  useEffect(() => {
    setError(null);
    supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: sbError }) => {
        if (sbError) {
          setError(sbError.message);
        } else {
          setProperties(data || []);
        }
        setLoading(false);
      });
  }, []);

  // ── URL du modal → partage depuis la liste ─────────────────
  useEffect(() => {
    if (selected) {
      window.history.replaceState(null, '', `/${locale}/biens/${selected.id}`);
    } else {
      window.history.replaceState(null, '', `/${locale}/biens`);
    }
  }, [selected, locale]);

  // ── Sync filtres → URL ──────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.type !== 'all')    params.set('type', filters.type);
    if (filters.city !== 'all')    params.set('city', filters.city);
    if (filters.status !== 'all')  params.set('status', filters.status);
    if (filters.priceMin)          params.set('priceMin', filters.priceMin);
    if (filters.priceMax)          params.set('priceMax', filters.priceMax);
    if (filters.surfaceMin)        params.set('surfaceMin', filters.surfaceMin);
    if (filters.surfaceMax)        params.set('surfaceMax', filters.surfaceMax);
    if (filters.bedrooms !== null) params.set('bedrooms', String(filters.bedrooms));
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filters, pathname, router]);

  // ── Debounce inputs numériques (300 ms) ────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceSet = useCallback(
    (key: 'priceMin' | 'priceMax' | 'surfaceMin' | 'surfaceMax', val: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilters((prev) => ({ ...prev, [key]: val }));
      }, 300);
    },
    []
  );

  const cities = useMemo(() => {
    const set = new Set(properties.map((p) => p.city).filter(Boolean));
    return Array.from(set).sort();
  }, [properties]);

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value })), []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPriceMinInput('');
    setPriceMaxInput('');
    setSurfaceMinInput('');
    setSurfaceMaxInput('');
  }, []);

  const setTypeWithTransition = useCallback((type: PropertyType) => {
    if (tabTimerRef.current) clearTimeout(tabTimerRef.current);
    setTabLoading(true);
    setFilter('type', type);
    tabTimerRef.current = setTimeout(() => setTabLoading(false), 380);
  }, [setFilter]);

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

  // ── Map properties mémoïsées séparément ────────────────────
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
    if (filters.sort === 'price_asc')    result.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price_desc')   result.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'surface_asc')  result.sort((a, b) => a.surface - b.surface);
    else if (filters.sort === 'surface_desc') result.sort((a, b) => b.surface - a.surface);
    return result;
  }, [properties, filters]);

  const pillClass = (active: boolean) =>
    `text-[11px] tracking-[1.5px] uppercase px-4 py-1.5 rounded-full border transition-all duration-200 cursor-pointer whitespace-nowrap ${
      active
        ? 'bg-[#c39553] border-[#c39553] text-[#0a0f1a]'
        : 'border-white/30 text-white/60 hover:border-white/55 hover:text-white'
    }`;

  const inputClass =
    'border border-white/20 rounded-lg px-3 py-2 text-white text-[12px] placeholder:text-white/35 focus:outline-none focus:border-[#c39553]/70 transition-colors bg-white/8';

  const selectStyle = { background: '#0a0f1a', colorScheme: 'dark' as const };

  return (
    <main className="min-h-screen bg-[#0a0f1a]">

      {/* ── Header ── */}
      <div className="pt-32 md:pt-40 pb-10 px-6 md:px-16">
        <p className="text-[13px] tracking-[4px] text-[#c39553] uppercase mb-4">
          {t('eyebrow')}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-white mb-10">
          {t('title')}
        </h1>

        {/* Filtres type pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PROPERTY_TYPES.map((type) => (
            <button key={type} onClick={() => setTypeWithTransition(type)} className={pillClass(filters.type === type)}>
              {t(`filters.${type}`)}
            </button>
          ))}
        </div>

        {/* Toggle filtres avancés (mobile) */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="md:hidden flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-white/50 hover:text-[#c39553] transition-colors mb-4 cursor-pointer"
        >
          <span>{filtersOpen ? '↑' : '↓'}</span>
          {t('filters.advanced')}
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#c39553] inline-block" />}
        </button>

        {/* Filtres avancés */}
        <div
          className={`rounded-2xl p-6 transition-all duration-300 overflow-hidden ${
            filtersOpen ? 'block' : 'hidden md:block'
          }`}
          style={{ background: 'rgba(195,149,83,0.04)', border: '1px solid rgba(195,149,83,0.12)' }}
        >
          <div className="flex flex-col gap-5">

            {/* Ligne 1 : Ville · Statut · Chambres */}
            <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">{t('filters.city')}</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilter('city', e.target.value)}
                  className={inputClass + ' cursor-pointer min-w-40'}
                  style={selectStyle}
                >
                  <option value="all">{t('filters.cityAll')}</option>
                  {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">{t('filters.status')}</label>
                <div className="flex gap-2">
                  {(['all', 'available', 'sold'] as StatusFilter[]).map((s) => (
                    <button key={s} onClick={() => setFilter('status', s)} className={pillClass(filters.status === s)}>
                      {t(`filters.status_${s}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">{t('filters.bedrooms')}</label>
                <div className="flex gap-2">
                  <button onClick={() => setFilter('bedrooms', null)} className={pillClass(filters.bedrooms === null)}>
                    {t('filters.bedroomsAll')}
                  </button>
                  {[1, 2, 3, 4].map((n) => (
                    <button key={n} onClick={() => setFilter('bedrooms', n)} className={pillClass(filters.bedrooms === n)}>
                      {n === 4 ? '4+' : String(n)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ligne 2 : Prix · Surface · Tri · Reset */}
            <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">{t('filters.priceRange')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={0}
                    value={priceMinInput}
                    onChange={(e) => { setPriceMinInput(e.target.value); debounceSet('priceMin', e.target.value); }}
                    placeholder={t('filters.min')}
                    className={inputClass}
                    style={{ width: '100px' }}
                  />
                  <span className="text-white/30 text-sm select-none">—</span>
                  <input
                    type="number" min={0}
                    value={priceMaxInput}
                    onChange={(e) => { setPriceMaxInput(e.target.value); debounceSet('priceMax', e.target.value); }}
                    placeholder={t('filters.max')}
                    className={inputClass}
                    style={{ width: '100px' }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">{t('filters.surfaceRange')} (m²)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={0}
                    value={surfaceMinInput}
                    onChange={(e) => { setSurfaceMinInput(e.target.value); debounceSet('surfaceMin', e.target.value); }}
                    placeholder={t('filters.min')}
                    className={inputClass}
                    style={{ width: '85px' }}
                  />
                  <span className="text-white/30 text-sm select-none">—</span>
                  <input
                    type="number" min={0}
                    value={surfaceMaxInput}
                    onChange={(e) => { setSurfaceMaxInput(e.target.value); debounceSet('surfaceMax', e.target.value); }}
                    placeholder={t('filters.max')}
                    className={inputClass}
                    style={{ width: '85px' }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">{t('filters.sort')}</label>
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

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] tracking-[1.5px] uppercase text-[#c39553] hover:text-white border border-[#c39553]/40 hover:border-white/40 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer self-end"
                >
                  {t('filters.reset')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Carte ── */}
      <div className="px-6 md:px-16 pb-16 pt-2">
        <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(195,149,83,0.12)' }}>
          <MapView
            properties={filtered}
            onPropertyClick={(p) => setSelected(p)}
            className="h-87.5 md:h-130"
          />
        </div>
      </div>

      {/* ── Séparateur ── */}
      <div className="px-6 md:px-16">
        <div className="h-px bg-[#c39553]/18" />
      </div>

      {/* ── Grille ── */}
      <div className="px-6 md:px-16 py-16 md:py-24">

        {!loading && !error && (
          <p className="text-[11px] tracking-[2px] uppercase text-[#c39553]/45 mb-10">
            {filtered.length} {t('filters.resultsCount')}
          </p>
        )}

        {/* Erreur */}
        {error && (
          <div className="flex flex-col items-center gap-4 py-32 text-center">
            <p className="font-serif text-2xl text-white/40">{t('errorTitle')}</p>
            <p className="text-sm text-white/25 max-w-xs">{error}</p>
            <button
              onClick={() => { setLoading(true); setError(null); }}
              className="mt-4 text-[11px] tracking-[2px] uppercase text-[#c39553] border border-[#c39553]/40 px-6 py-2 rounded-lg hover:bg-[#c39553]/10 transition-colors cursor-pointer"
            >
              {t('retry')}
            </button>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Tab transition overlay */}
        {!loading && !error && tabLoading && (
          <div className="flex flex-col items-center gap-4 py-24">
            <SpinBar />
            <p className="text-[11px] tracking-[2px] uppercase text-white/50">Chargement</p>
          </div>
        )}

        {/* Grille de cards */}
        {!loading && !error && !tabLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property, idx) => (
              <div
                key={property.id}
                className="h-104"
                style={{
                  animation: 'sp-fade-in 0.35s ease forwards',
                  animationDelay: `${Math.min(idx, 5) * 0.07}s`,
                  opacity: 0,
                }}
              >
                <PropertyCard
                  property={property}
                  onClick={() => setSelected(property)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pas de résultats après tab switch */}
        {!loading && !error && !tabLoading && filtered.length === 0 && (
          <p className="font-serif text-2xl text-white/30 text-center py-24">
            {t('noResults')}
          </p>
        )}
      </div>

      {/* ── Modal ── */}
      {selected && (
        <PropertyModal
          property={selected}
          onClose={() => setSelected(null)}
        />
      )}

    </main>
  );
}
