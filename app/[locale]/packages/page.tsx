import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buildAlternates } from '@/lib/seo';

type Params = Promise<{ locale: string }>;

const seo = {
  fr: {
    title: 'Packages & Prestations | Studio Vision',
    description: 'Packs photo, vidéo cinématique et visite virtuelle 360° pour valoriser votre bien immobilier en Israël. Devis sur mesure.',
  },
  en: {
    title: 'Packages & Services | Studio Vision',
    description: 'Photo, cinematic video and 360° virtual tour packages for real estate in Israel. Custom quotes available.',
  },
  he: {
    title: 'חבילות ושירותים | סטודיו ויז\'ן',
    description: 'חבילות צילום, וידאו קולנועי וסיור וירטואלי 360° לנדל"ן בישראל. הצעות מחיר מותאמות אישית.',
  },
} as const;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const meta = seo[locale as keyof typeof seo] ?? seo.fr;

  return {
    title: meta.title,
    description: meta.description,
    alternates: buildAlternates('/packages', locale),
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: meta.title,
      description: meta.description,
    },
  };
}

type Feature = { label: string; subtitle?: string };

export default async function PackagesPage({
  params,
}: {
  params: Params;
}) {
  const { locale } = await params;
  const t = await getTranslations('packagesPage');

  const serviceList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('title'),
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Service',
          name: t('photoTitle'),
          description: t('packPhotosDesc'),
          provider: { '@type': 'LocalBusiness', name: 'Studio Vision' },
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Service',
          name: t('packVideoTitle'),
          description: t('packVideoDesc'),
          provider: { '@type': 'LocalBusiness', name: 'Studio Vision' },
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Service',
          name: t('packVirtualTitle'),
          description: t('packVirtualDesc'),
          provider: { '@type': 'LocalBusiness', name: 'Studio Vision' },
        },
      },
    ],
  };

  const plans: {
    icon: string;
    name: string;
    desc: string;
    isMostPop: boolean;
    features: Feature[];
  }[] = [
    {
      icon: '📸',
      name: t('photoTitle'),
      desc: t('packPhotosDesc'),
      isMostPop: false,
      features: [
        { label: t('appartement') },
        { label: t('maisonVilla') },
        { label: t('hautGamme') },
        { label: t('optionDrone') },
      ],
    },
    {
      icon: '🎬',
      name: t('packVideoTitle'),
      desc: t('packVideoDesc'),
      isMostPop: true,
      features: [
        { label: t('videoBasicTitle'), subtitle: t('videoBasicDesc') },
        { label: t('optionReels') },
        { label: t('videoAdvTitle'), subtitle: t('videoAdvDesc') },
        { label: t('videoPremiumTitle'), subtitle: t('videoPremiumDesc') },
      ],
    },
    {
      icon: '🏠',
      name: t('packVirtualTitle'),
      desc: t('packVirtualDesc'),
      isMostPop: false,
      features: [
        { label: t('matterportTitle'), subtitle: t('matterportDesc') },
        { label: t('meubleSimulation') },
        { label: t('renovationSimulation') },
        { label: t('archPlan') },
      ],
    },
  ];

  const droneFeatures: Feature[] = [
    { label: t('droneOnly') },
    { label: t('oneSimulation') },
    { label: t('twoSimulations') },
    { label: t('packVideoSims') },
  ];

  return (
    <section className="py-14 relative bg-[#0a0f1a] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceList) }}
      />

      <div className="absolute top-0 z-0 min-h-full w-full bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(176,141,87,0.22),rgba(255,255,255,0))]" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 min-h-full">

        {/* ── Header ── */}
        <div className="relative max-w-xl mx-auto sm:text-center pt-28 pb-2">
          <p className="text-sm tracking-[5px] text-[#b08d57] uppercase mb-4">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-transparent bg-clip-text bg-linear-to-r from-[#b08d57] to-[#e8c97e] text-5xl font-light sm:text-7xl py-1 sm:py-2 leading-tight">
            {t('title')}
          </h1>
          <div className="mt-5 text-white/40 text-lg">
            <p>{t('subtitle')}</p>
          </div>
        </div>

        {/* ── Plans — 3-column grid ── */}
        <div className="mt-16 justify-center gap-6 sm:grid sm:grid-cols-2 sm:space-y-0 lg:grid-cols-3">
          {plans.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                'relative flex-1 flex items-stretch flex-col rounded-xl mt-6 sm:mt-0 transform-gpu transition-shadow duration-300',
                item.isMostPop
                  ? '[border:1px_solid_rgba(176,141,87,0.4)] [box-shadow:0_0_0_1px_rgba(176,141,87,0.08),0_-24px_80px_-16px_rgba(176,141,87,0.22)_inset]'
                  : '[border:1px_solid_rgba(255,255,255,0.07)] [box-shadow:0_-20px_60px_-20px_rgba(176,141,87,0.05)_inset]'
              )}
            >
              {/* Popular badge */}
              {item.isMostPop && (
                <span className="w-36 absolute -top-5 left-0 right-0 mx-auto px-3 py-2 rounded-full border border-[#b08d57]/40 shadow-md bg-[#b08d57] bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(232,201,126,0.5),rgba(176,141,87,0))] animate-background-shine text-center text-[#0a0f1a] text-sm font-semibold">
                  {t('popular')}
                </span>
              )}

              {/* Card header */}
              <div
                className={cn(
                  'p-8 space-y-5 border-b rounded-t-xl',
                  item.isMostPop
                    ? 'border-white/10 bg-[linear-gradient(135deg,rgba(176,141,87,0.09),transparent_55%)]'
                    : 'border-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{item.icon}</span>
                  <span
                    className={cn(
                      'font-serif text-3xl font-light tracking-tight',
                      item.isMostPop ? 'text-[#b08d57]' : 'text-white/70'
                    )}
                  >
                    {item.name}
                  </span>
                </div>

                <p className="text-white/50 text-base leading-relaxed">
                  {item.desc}
                </p>

                <Link
                  href={`/${locale}/contact`}
                  className={cn(
                    'w-full text-center rounded-lg text-sm tracking-[2px] uppercase px-4 py-3.5 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2',
                    item.isMostPop
                      ? 'bg-linear-to-br from-[#b08d57] to-[#c9a867] text-[#0a0f1a] font-semibold'
                      : 'border border-white/12 text-white/50 hover:border-[#b08d57]/50 hover:text-[#b08d57]'
                  )}
                >
                  {t('cta')} →
                </Link>
              </div>

              {/* Features list */}
              <ul className="p-8 space-y-4">
                <li className="text-[10px] tracking-[4px] text-white/30 uppercase pb-1">
                  {t('features')}
                </li>
                {item.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={cn(
                        'h-5 w-5 flex-none mt-0.5',
                        item.isMostPop ? 'text-[#b08d57]' : 'text-[#b08d57]/50'
                      )}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex flex-col">
                      <span className={cn('text-base leading-snug', item.isMostPop ? 'text-white/80' : 'text-white/55')}>
                        {feat.label}
                      </span>
                      {feat.subtitle && (
                        <span className="text-sm text-white/30 mt-0.5">
                          {feat.subtitle}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Drone — full-width horizontal strip ── */}
        <div className="mt-8 rounded-xl overflow-hidden [border:1px_solid_rgba(255,255,255,0.06)] [box-shadow:0_-16px_60px_-20px_rgba(176,141,87,0.05)_inset]">
          <div className="flex flex-col md:flex-row">

            {/* Left: identity */}
            <div className="p-7 md:w-60 flex-none flex items-center gap-4 border-b md:border-b-0 md:border-r border-white/5">
              <span className="text-3xl">🚁</span>
              <div>
                <p className="font-serif text-xl font-light text-white/80">{t('droneTitle')}</p>
                <p className="text-[10px] tracking-[3px] text-[#b08d57] uppercase mt-1">{t('droneComplement')}</p>
              </div>
            </div>

            {/* Right: features */}
            <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-5 p-7 flex-1 items-center">
              {droneFeatures.map((feat, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#b08d57]/50 flex-none"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-white/55">{feat.label}</span>
                </li>
              ))}
            </ul>

          </div>
        </div>

        {/* ── Logo note ── */}
        <p className="mt-5 mb-14 text-xs text-white/20 leading-relaxed">
          * {t('logoNote')}
        </p>

      </div>

      {/* ── Final CTA ── */}
      <div className="border-t border-white/6 py-24 px-6 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light text-white mb-10">
          {t('ctaTitle')}
        </h2>
        <Link
          href={`/${locale}/contact`}
          className="inline-block text-sm tracking-[3px] uppercase text-[#0a0f1a] bg-linear-to-br from-[#b08d57] to-[#c9a867] px-12 py-4 rounded-lg font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          {t('cta')} →
        </Link>
      </div>

    </section>
  );
}
