'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';
import { PACKAGES, PACKAGE_KEY } from '../../../lib/packages';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MapPin, X } from 'lucide-react';
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
  rooms: number | null;
  packages: string[];
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
  rooms: null,
  packages: [],
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
          className="h-1.25 rounded"
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
  const tPkg = useTranslations('packages');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [fetchTick, setFetchTick] = useState(0);
  const [filters, setFilters] = useState<Filters>(() => ({
    type: (searchParams.get('type') as PropertyType) || 'all',
    city: searchParams.get('city') || 'all',
    status: (searchParams.get('status') as StatusFilter) || 'all',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    surfaceMin: searchParams.get('surfaceMin') || '',
    surfaceMax: searchParams.get('surfaceMax') || '',
    rooms: searchParams.get('rooms') ? Number(searchParams.get('rooms')) : null,
    packages: searchParams.get('packages')?.split(',').filter(Boolean) ?? [],
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
  const [mapOpen, setMapOpen] = useState(false);

  // ── Fetch Supabase ──────────────────────────────────────────
  useEffect(() => {
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
  }, [fetchTick]);

  // ── Sync filtres → URL ──────────────────────────────────────
  useEffect(() => {
    if (selected) return; // modal ouvert → ne pas toucher l'URL
    const params = new URLSearchParams();
    if (filters.type !== 'all')    params.set('type', filters.type);
    if (filters.city !== 'all')    params.set('city', filters.city);
    if (filters.status !== 'all')  params.set('status', filters.status);
    if (filters.priceMin)          params.set('priceMin', filters.priceMin);
    if (filters.priceMax)          params.set('priceMax', filters.priceMax);
    if (filters.surfaceMin)        params.set('surfaceMin', filters.surfaceMin);
    if (filters.surfaceMax)        params.set('surfaceMax', filters.surfaceMax);
    if (filters.rooms !== null) params.set('rooms', String(filters.rooms));
    if (filters.packages.length > 0) params.set('packages', filters.packages.join(','));
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filters, pathname, router, selected]);

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

  // null = bouton "Tous" (vide la sélection) ; sinon toggle du package
  const togglePackageWithTransition = useCallback((pkg: string | null) => {
    if (tabTimerRef.current) clearTimeout(tabTimerRef.current);
    setTabLoading(true);
    setFilters((prev) => ({
      ...prev,
      packages: pkg === null
        ? []
        : prev.packages.includes(pkg)
          ? prev.packages.filter((x) => x !== pkg)
          : [...prev.packages, pkg],
    }));
    tabTimerRef.current = setTimeout(() => setTabLoading(false), 380);
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      filters.type !== 'all' ||
      filters.city !== 'all' ||
      filters.status !== 'all' ||
      filters.priceMin !== '' ||
      filters.priceMax !== '' ||
      filters.surfaceMin !== '' ||
      filters.surfaceMax !== '' ||
      filters.rooms !== null ||
      filters.packages.length > 0 ||
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
      if (filters.rooms !== null && p.rooms < filters.rooms) return false;
      // ET : le bien doit avoir tous les packages sélectionnés
      if (filters.packages.length > 0 && !filters.packages.every((pkg) => (p.packages || []).includes(pkg))) return false;
      return true;
    });
    if (filters.sort === 'price_asc')    result.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price_desc')   result.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'surface_asc')  result.sort((a, b) => a.surface - b.surface);
    else if (filters.sort === 'surface_desc') result.sort((a, b) => b.surface - a.surface);
    return result;
  }, [properties, filters]);

  const geoCount = useMemo(
    () => filtered.filter((p) => p.lat != null && p.lng != null).length,
    [filtered]
  );

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

        {/* Filtres packages pills (multi-sélection) */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => togglePackageWithTransition(null)} className={pillClass(filters.packages.length === 0)}>
            {t('filters.packagesAll')}
          </button>
          {PACKAGES.map((pkg) => (
            <button key={pkg} onClick={() => togglePackageWithTransition(pkg)} className={pillClass(filters.packages.includes(pkg))}>
              {PACKAGE_KEY[pkg] ? tPkg(PACKAGE_KEY[pkg]) : pkg}
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
                <label className="text-[10px] tracking-[2px] uppercase text-white/60">{t('filters.rooms')}</label>
                <div className="flex gap-2">
                  <button onClick={() => setFilter('rooms', null)} className={pillClass(filters.rooms === null)}>
                    {t('filters.roomsAll')}
                  </button>
                  {[1, 2, 3, 4].map((n) => (
                    <button key={n} onClick={() => setFilter('rooms', n)} className={pillClass(filters.rooms === n)}>
                      {n === 4 ? '4+' : String(n)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ligne 2 : Type de bien */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[2px] uppercase text-white/60">{t('filters.type')}</label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <button key={type} onClick={() => setFilter('type', type)} className={pillClass(filters.type === type)}>
                    {t(`filters.${type}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Ligne 3 : Prix · Surface · Tri · Reset */}
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

      {/* ── Carte (bandeau teaser repliable) ── */}
      <div className="px-6 md:px-16 pb-16 pt-2">
        {!mapOpen ? (
          <button
            onClick={() => setMapOpen(true)}
            className="group relative w-full h-32 md:h-36 rounded-3xl overflow-hidden cursor-pointer transition-colors duration-300 hover:border-[#c39553]/40"
            style={{ border: '1px solid rgba(195,149,83,0.15)', background: '#0c1220' }}
          >
            {/* Fond façon plan cadastral */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                background: `
                  repeating-linear-gradient(90deg, rgba(195,149,83,0.06) 0 1px, transparent 1px 56px),
                  repeating-linear-gradient(0deg, rgba(195,149,83,0.06) 0 1px, transparent 1px 56px),
                  repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 90px)`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center, transparent 25%, rgba(10,15,26,0.85) 100%)' }}
            />
            <div className="relative flex flex-col items-center justify-center gap-2 h-full">
              <span className="relative flex items-center justify-center w-8 h-8">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#c39553] opacity-15 animate-ping" />
                <MapPin className="relative h-5 w-5 text-[#c39553]" strokeWidth={1.5} />
              </span>
              <span className="text-[11px] tracking-[3px] uppercase text-white/80 group-hover:text-[#c39553] transition-colors">
                {t('filters.exploreMap')}
              </span>
              <span className="text-[9px] tracking-[2px] uppercase text-white/35">
                {t('filters.mapCount', { count: geoCount })}
              </span>
            </div>
          </button>
        ) : (
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(195,149,83,0.12)', animation: 'sp-fade-in 0.35s ease forwards', opacity: 0 }}
          >
            <MapView
              properties={filtered}
              onPropertyClick={(p) => setSelected(p)}
              className="h-87.5 md:h-130"
            />
            <button
              onClick={() => setMapOpen(false)}
              className="absolute top-4 right-4 z-1001 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] tracking-[2px] uppercase text-white/80 hover:text-white cursor-pointer transition-colors"
              style={{
                background: 'rgba(5,8,12,0.72)',
                border: '1px solid rgba(255,255,255,0.16)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <X className="h-3 w-3" strokeWidth={2} />
              {t('filters.hideMap')}
            </button>
          </div>
        )}
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
              onClick={() => { setLoading(true); setError(null); setFetchTick((n) => n + 1); }}
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
            <p className="text-[11px] tracking-[2px] uppercase text-white/50">{t('loading')}</p>
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
