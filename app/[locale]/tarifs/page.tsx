import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Feature = { label: string; subtitle?: string; muted?: boolean };

export default async function TarifsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('tarifs');

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

  const addons: {
    icon: string;
    name: string;
    desc?: string;
    features: Feature[];
  }[] = [
    {
      icon: '🚁',
      name: t('droneTitle'),
      features: [
        { label: t('droneOnly') },
        { label: t('oneSimulation') },
        { label: t('twoSimulations') },
        { label: t('packVideoSims') },
      ],
    },
    {
      icon: '🏗️',
      name: t('projectVideoTitle'),
      desc: t('projectVideoDesc'),
      features: [
        { label: t('allTypes') },
        { label: t('urgencyNote'), muted: true },
      ],
    },
  ];

  return (
    <section className="py-14 relative bg-[#0a0f1a] min-h-screen">

      {/* Radial gold glow — same position as the prompt's indigo gradient */}
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

        {/* ── Plans — 3-column grid (exact prompt structure) ── */}
        <div className="mt-16 justify-center gap-6 sm:grid sm:grid-cols-2 sm:space-y-0 lg:grid-cols-3">
          {plans.map((item, idx) => (
            <div
              key={idx}
              className="relative flex-1 flex items-stretch flex-col rounded-xl mt-6 sm:mt-0 transform-gpu [border:1px_solid_rgba(255,255,255,0.1)] [box-shadow:0_-20px_80px_-20px_rgba(176,141,87,0.1)_inset]"
            >
              {/* Popular badge */}
              {item.isMostPop && (
                <span className="w-36 absolute -top-5 left-0 right-0 mx-auto px-3 py-2 rounded-full border border-[#b08d57]/40 shadow-md bg-[#b08d57] bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(232,201,126,0.5),rgba(176,141,87,0))] animate-background-shine text-center text-[#0a0f1a] text-sm font-semibold">
                  {t('popular')}
                </span>
              )}

              {/* Card header — name + desc + CTA */}
              <div
                className={cn(
                  'animate-background-shine p-8 space-y-5 border-b border-white/8',
                  idx === 2
                    ? 'bg-[linear-gradient(110deg,transparent,45%,rgba(176,141,87,0.07),55%,transparent)] bg-size-[200%_100%] transition-colors rounded-t-xl'
                    : ''
                )}
              >
                {/* Icon + name */}
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{item.icon}</span>
                  <span className="text-[#b08d57] font-serif text-3xl font-light tracking-tight">
                    {item.name}
                  </span>
                </div>

                {/* Description */}
                <p className="text-white/55 text-base leading-relaxed">
                  {item.desc}
                </p>

                {/* CTA button */}
                <Link
                  href={`/${locale}/contact`}
                  className={cn(
                    'w-full text-center rounded-lg text-base tracking-[2px] uppercase px-4 py-4 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2',
                    item.isMostPop
                      ? 'bg-linear-to-br from-[#b08d57] to-[#c9a867] text-[#0a0f1a] font-semibold'
                      : 'border border-white/20 text-white/70 hover:border-[#b08d57] hover:text-[#b08d57]'
                  )}
                >
                  {t('cta')} →
                </Link>
              </div>

              {/* Features list */}
              <ul className="p-8 space-y-5">
                <li className="text-white/60 pb-1 font-medium text-lg">
                  {t('features')}
                </li>
                {item.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-[#b08d57] flex-none mt-0.5"
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
                      <span className={cn('text-base leading-snug', feat.muted ? 'text-white/30 italic' : 'text-white/75')}>
                        {feat.label}
                      </span>
                      {feat.subtitle && (
                        <span className="text-sm text-white/35 mt-1">
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

        {/* ── Addons — same card style, 2-col ── */}
        <div className="mt-10">
          <p className="text-sm tracking-[5px] text-white/25 uppercase mb-6">
            Compléments
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addons.map((addon, idx) => (
              <div
                key={idx}
                className="relative flex flex-col rounded-xl transform-gpu [border:1px_solid_rgba(255,255,255,0.07)] [box-shadow:0_-20px_80px_-20px_rgba(176,141,87,0.06)_inset]"
              >
                {/* Addon header */}
                <div className="p-8 space-y-3 border-b border-white/8">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{addon.icon}</span>
                    <div>
                      <p className="font-serif text-2xl font-light text-white">
                        {addon.name}
                      </p>
                      {addon.desc && (
                        <p className="text-sm tracking-[2px] text-[#b08d57] uppercase mt-0.5">
                          {addon.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Addon features */}
                <ul className="p-8 space-y-5">
                  {addon.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-4">
                      {!feat.muted ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-[#b08d57] flex-none"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="h-6 w-6 flex-none" />
                      )}
                      <span className={cn('text-base', feat.muted ? 'text-white/30 italic' : 'text-white/70')}>
                        {feat.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cancellation policy ── */}
        <div className="mt-8 rounded-xl p-8 [border:1px_solid_rgba(176,141,87,0.18)] bg-[rgba(176,141,87,0.04)]">
          <p className="text-sm tracking-[4px] text-[#b08d57] uppercase mb-5">
            {t('cancellationTitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#b08d57] flex-none" />
              <span className="text-base text-white/60">{t('cancel6h')}</span>
            </div>
            <div className="hidden sm:block w-px bg-white/8" />
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#b08d57] flex-none" />
              <span className="text-base text-white/60">{t('cancel2h')}</span>
            </div>
          </div>
        </div>

        {/* ── Logo note ── */}
        <p className="mt-6 mb-12 text-sm text-white/25 leading-relaxed">
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
