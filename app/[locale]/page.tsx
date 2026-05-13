import { getTranslations } from 'next-intl/server';
import { createClient } from '@supabase/supabase-js';
import HeroCanvas from '../../components/HeroCanvas';
import PropertyCard from '../../components/PropertyCard';
import Link from 'next/link';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('hero');

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

  return (
    <main className="bg-[#f5f2ec] min-h-screen">

      {/* Hero */}
      <section className="relative h-screen min-h-150 flex items-center overflow-hidden">
        <HeroCanvas />

        <div className="relative z-10 px-6 md:px-16 max-w-2xl">
          <p className="text-[10px] tracking-[5px] text-[#b08d57] uppercase mb-5 animate-fade-up">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-[#1c1917] leading-tight mb-5">
            {t('title')} <em className="italic text-[#b08d57]">{t('titleAccent')}</em>
          </h1>
          <p className="text-sm text-[#8a8078] tracking-wide leading-relaxed mb-10">
            {t('subtitle')}
          </p>
          <Link
            href={`/${locale}/biens`}
            className="inline-block text-[11px] tracking-[3px] uppercase text-[#1c1917] border-b-2 border-[#b08d57] pb-1 hover:text-[#b08d57] transition-colors"
          >
            {t('cta')} →
          </Link>
        </div>

        {/* Scroll indicator — caché sur mobile */}
        <div className="hidden md:flex absolute bottom-10 left-16 items-center gap-3 z-10">
          <div className="w-10 h-px bg-[#b08d57]"></div>
          <span className="text-[9px] tracking-[3px] text-[#8a8078] uppercase">Scroll</span>
        </div>
      </section>

      {/* Biens en vedette */}
      {properties && properties.length > 0 && (
        <section className="px-6 md:px-16 py-16 md:py-24">
          <p className="text-[10px] tracking-[5px] text-[#b08d57] uppercase mb-5">
            Biens en vedette
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-10 md:mb-12">
            <h2 className="font-serif text-3xl md:text-5xl font-light text-[#1c1917]">
              Propriétés d&apos;exception
            </h2>
            <Link
              href={`/${locale}/biens`}
              className="text-[11px] tracking-[3px] uppercase text-[#1c1917] border-b-2 border-[#b08d57] pb-1 hover:text-[#b08d57] transition-colors self-start md:self-auto"
            >
              Voir tous les biens →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {properties.map((property) => (
              <Link key={property.id} href={`/${locale}/biens`} className="block">
                <PropertyCard property={property} />
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
