import { getTranslations } from 'next-intl/server';
import { createClient } from '@supabase/supabase-js';
import PropertyCard from '../../components/PropertyCard';
import Link from 'next/link';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('hero');
  const th = await getTranslations('home');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(3);

  const featured = properties?.[0];
  const intlLocale = locale === 'fr' ? 'fr-FR' : locale === 'he' ? 'he-IL' : 'en-US';
  const featuredTitle = featured
    ? (locale === 'fr' ? featured.title_fr : locale === 'en' ? featured.title_en : featured.title_he)
    : null;

  return (
    <main className="bg-[#0a0f1a] min-h-screen">

      {/* Hero plein écran */}
      <section className="relative h-screen min-h-150 flex items-center overflow-hidden">

        {/* Image de fond */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(10,15,26,0.85) 0%, rgba(10,15,26,0.4) 60%, rgba(10,15,26,0.1) 100%)',
          }}
        />

        {/* Texte à gauche */}
        <div className="relative z-10 px-6 md:px-16 max-w-2xl">
          <p className="text-[10px] tracking-[5px] text-[#b08d57] uppercase mb-5">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-white leading-tight mb-5">
            {t('title')} <em className="italic text-[#b08d57]">{t('titleAccent')}</em>
          </h1>
          <p className="text-sm text-white/50 tracking-wide leading-relaxed mb-10">
            {t('subtitle')}
          </p>
          <Link
            href={`/${locale}/biens`}
            className="inline-block text-[11px] tracking-[3px] uppercase text-white bg-[#b08d57] px-8 py-4 hover:bg-[#c9a867] transition-colors"
          >
            {t('cta')} →
          </Link>
        </div>

        {/* Card glassmorphism — bien en vedette */}
        {featured && featuredTitle && (
          <div
            className="absolute bottom-8 right-6 md:right-16 w-72 z-10 rounded-2xl p-6"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="mb-4">
              <span className="text-[9px] tracking-[3px] text-[#b08d57] uppercase bg-[#b08d57]/15 px-3 py-1 rounded-full">
                {th('featured')}
              </span>
            </div>
            <p className="text-[9px] tracking-[2px] text-white/50 uppercase mb-1">{featured.city}</p>
            <h3 className="font-serif text-lg font-light text-white mb-3 leading-snug">
              {featuredTitle}
            </h3>
            <p className="font-serif text-2xl font-light text-[#b08d57] mb-5">
              {featured.price.toLocaleString(intlLocale)} €
            </p>
            <Link
              href={`/${locale}/biens/${featured.id}`}
              className="text-[10px] tracking-[2px] uppercase text-white border-b border-white/30 pb-0.5 hover:border-[#b08d57] hover:text-[#b08d57] transition-colors"
            >
              {th('seeProperty')}
            </Link>
          </div>
        )}
      </section>

      {/* Stats bar */}
      <section className="py-14 px-6 md:px-16" style={{ background: '#0a0f1a' }}>
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { number: th('statSoldNumber'),         label: th('statSoldLabel') },
            { number: th('statExperienceNumber'),   label: th('statExperienceLabel') },
            { number: th('statSatisfactionNumber'), label: th('statSatisfactionLabel') },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-3xl md:text-4xl font-light text-[#b08d57] mb-2">
                {stat.number}
              </p>
              <p className="text-[10px] tracking-[3px] text-white/40 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Biens en vedette */}
      {properties && properties.length > 0 && (
        <section className="px-6 md:px-16 py-16 md:py-24 bg-[#f5f2ec]">
          <p className="text-[10px] tracking-[5px] text-[#b08d57] uppercase mb-5">
            {th('sectionEyebrow')}
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-10 md:mb-12">
            <h2 className="font-serif text-3xl md:text-5xl font-light text-[#1c1917]">
              {th('sectionTitle')}
            </h2>
            <Link
              href={`/${locale}/biens`}
              className="text-[11px] tracking-[3px] uppercase text-[#1c1917] border-b-2 border-[#b08d57] pb-1 hover:text-[#b08d57] transition-colors self-start md:self-auto"
            >
              {th('seeAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {properties.map((property) => (
              <Link key={property.id} href={`/${locale}/biens/${property.id}`} className="block">
                <PropertyCard property={property} />
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
