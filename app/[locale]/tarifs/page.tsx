import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Feature = { label: string; price: string; muted?: boolean };

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b08d57" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-none mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default async function TarifsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('tarifs');

  const packs: {
    icon: string;
    title: string;
    desc: string;
    startingPrice: string;
    popular: boolean;
    features: Feature[];
  }[] = [
    {
      icon: '📸',
      title: t('photoTitle'),
      desc: t('packPhotosDesc'),
      startingPrice: '350 ₪',
      popular: false,
      features: [
        { label: t('appartement'), price: '350 ₪' },
        { label: t('maisonVilla'), price: '400 ₪' },
        { label: t('hautGamme'), price: '500–600 ₪' },
        { label: t('optionDrone'), price: '+100 ₪' },
      ],
    },
    {
      icon: '🎬',
      title: t('packVideoTitle'),
      desc: t('packVideoDesc'),
      startingPrice: '600 ₪',
      popular: true,
      features: [
        { label: `${t('videoBasicTitle')} · ${t('appartement')}`, price: '600 ₪' },
        { label: `${t('videoBasicTitle')} · ${t('villaDuplex')}`, price: '700 ₪' },
        { label: t('optionReels'), price: '+350 ₪' },
        { label: `${t('videoAdvTitle')} · ${t('appartement')}`, price: '1 000 ₪' },
        { label: `${t('videoAdvTitle')} · ${t('villaDuplex')}`, price: '1 150 ₪' },
        { label: t('videoPremiumTitle'), price: '1 500 ₪' },
      ],
    },
    {
      icon: '🏠',
      title: t('packVirtualTitle'),
      desc: t('packVirtualDesc'),
      startingPrice: '160 ₪',
      popular: false,
      features: [
        { label: `${t('matterportTitle')} · ${t('appartement')}`, price: '600 ₪' },
        { label: `${t('matterportTitle')} · ${t('villa')}`, price: t('villaSizeNote'), muted: true },
        { label: t('meubleSimulation'), price: '160 / 320 ₪' },
        { label: t('renovationSimulation'), price: '200 / 400 ₪' },
        { label: t('archPlan'), price: '550 ₪+' },
      ],
    },
  ];

  const addons: { icon: string; title: string; desc?: string; features: Feature[] }[] = [
    {
      icon: '🚁',
      title: t('droneTitle'),
      features: [
        { label: t('droneOnly'), price: '400 ₪' },
        { label: t('oneSimulation'), price: '400 ₪' },
        { label: t('twoSimulations'), price: '600 ₪' },
        { label: t('packVideoSims'), price: '1 100 ₪' },
      ],
    },
    {
      icon: '🏗️',
      title: t('projectVideoTitle'),
      desc: t('projectVideoDesc'),
      features: [
        { label: t('from'), price: '1 800 ₪', muted: false },
        { label: t('urgencyNote'), price: '', muted: true },
      ],
    },
  ];

  return (
    <main className="bg-[#0a0f1a] min-h-screen">

      {/* Header */}
      <section className="pt-36 pb-16 px-6 md:px-16 text-center">
        <p className="text-[10px] tracking-[5px] text-[#b08d57] uppercase mb-5">
          {t('eyebrow')}
        </p>
        <h1 className="font-serif text-4xl md:text-6xl font-light text-white leading-tight mb-5">
          {t('title')}
        </h1>
        <div className="w-12 h-px bg-[#b08d57] mx-auto mb-6" />
        <p className="text-sm text-white/45 max-w-md mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </section>

      {/* 3 main pack cards */}
      <section className="px-6 md:px-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {packs.map((pack) => (
            <div
              key={pack.title}
              className="rounded-2xl flex flex-col relative overflow-hidden"
              style={
                pack.popular
                  ? { background: 'rgba(176,141,87,0.08)', border: '1px solid rgba(176,141,87,0.55)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }
              }
            >
              {/* Popular badge */}
              {pack.popular && (
                <div className="absolute top-5 right-5">
                  <span className="text-[9px] tracking-[2px] uppercase text-[#0a0f1a] bg-[#b08d57] px-3 py-1 rounded-full font-medium">
                    {t('popular')}
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* Icon + title */}
                <div className="mb-6">
                  <span className="text-2xl block mb-3">{pack.icon}</span>
                  <h2 className="font-serif text-xl font-light text-white mb-1">{pack.title}</h2>
                  <p className="text-[11px] text-white/40 leading-snug">{pack.desc}</p>
                </div>

                {/* Price */}
                <div className="mb-7">
                  <p className="text-[10px] tracking-[2px] text-white/35 uppercase mb-1">{t('from')}</p>
                  <p className="font-serif text-4xl font-light text-white">
                    {pack.startingPrice}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href={`/${locale}/contact`}
                  className={`block text-center text-[11px] tracking-[3px] uppercase py-3.5 rounded-full transition-colors duration-200 mb-8 ${
                    pack.popular
                      ? 'bg-[#b08d57] text-white hover:bg-[#c9a867]'
                      : 'border border-white/25 text-white/80 hover:border-[#b08d57] hover:text-[#b08d57]'
                  }`}
                >
                  {t('cta')} →
                </Link>

                {/* Divider + features label */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-[9px] tracking-[3px] text-white/25 uppercase">{t('features')}</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                {/* Feature list */}
                <ul className="flex flex-col gap-3 flex-1">
                  {pack.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 justify-between">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <Check />
                        <span className={`text-[12px] leading-snug ${feat.muted ? 'text-white/30 italic' : 'text-white/60'}`}>
                          {feat.label}
                        </span>
                      </div>
                      {feat.price && (
                        <span className="text-[12px] text-white/90 whitespace-nowrap tabular-nums ml-2">
                          {feat.price}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Addon cards */}
      <section className="px-6 md:px-16 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl mx-auto">
          {addons.map((addon) => (
            <div
              key={addon.title}
              className="rounded-2xl p-7"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="text-xl block mb-3">{addon.icon}</span>
              <h3 className="font-serif text-lg font-light text-white mb-1">{addon.title}</h3>
              {addon.desc && (
                <p className="text-[10px] tracking-[1.5px] text-[#b08d57] uppercase mb-5">{addon.desc}</p>
              )}
              <div className="mt-5 border-t border-white/6 pt-5">
                <ul className="flex flex-col gap-3">
                  {addon.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 justify-between">
                      <div className="flex items-start gap-2.5 flex-1">
                        {!feat.muted && <Check />}
                        <span className={`text-[12px] leading-snug ${feat.muted ? 'text-white/30 italic pl-5' : 'text-white/60'}`}>
                          {feat.label}
                        </span>
                      </div>
                      {feat.price && (
                        <span className="text-[12px] text-white/90 whitespace-nowrap tabular-nums ml-2">
                          {feat.price}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cancellation policy */}
      <section className="px-6 md:px-16 pb-10">
        <div
          className="rounded-2xl p-7 max-w-6xl mx-auto"
          style={{ background: 'rgba(176,141,87,0.06)', border: '1px solid rgba(176,141,87,0.18)' }}
        >
          <h3 className="text-[10px] tracking-[4px] text-[#b08d57] uppercase mb-5">
            {t('cancellationTitle')}
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-white/60">{t('cancel6h')}</span>
              <span className="text-sm text-white/85 whitespace-nowrap">{t('cancel6hFee')}</span>
            </div>
            <div className="border-b border-white/6" />
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-white/60">{t('cancel2h')}</span>
              <span className="text-sm text-white/85 whitespace-nowrap">{t('cancel2hFee')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logo note */}
      <section className="px-6 md:px-16 pb-16 max-w-6xl mx-auto">
        <p className="text-xs text-white/25 leading-relaxed">* {t('logoNote')}</p>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-6 md:px-16 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="font-serif text-3xl md:text-5xl font-light text-white mb-10">
          {t('ctaTitle')}
        </h2>
        <Link
          href={`/${locale}/contact`}
          className="inline-block text-[11px] tracking-[3px] uppercase text-white bg-[#b08d57] px-10 py-4 hover:bg-[#c9a867] transition-colors"
        >
          {t('cta')} →
        </Link>
      </section>

    </main>
  );
}
