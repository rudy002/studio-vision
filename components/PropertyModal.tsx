'use client';

import { useEffect, useState } from 'react';
import { Property } from './PropertyCard';
import { useLocale, useTranslations } from 'next-intl';

type MediaItem = { type: 'video'; url: string } | { type: 'photo'; url: string };

const PLACEHOLDER = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';

export default function PropertyModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const locale = useLocale();
  const t = useTranslations('properties');
  const [activeIndex, setActiveIndex] = useState(0);

  const title =
    locale === 'fr' ? property.title_fr
    : locale === 'en' ? property.title_en
    : property.title_he;

  const intlLocale = locale === 'fr' ? 'fr-FR' : locale === 'he' ? 'he-IL' : 'en-US';

  const mediaItems: MediaItem[] = [
    ...(property.video_url ? [{ type: 'video' as const, url: property.video_url }] : []),
    ...(property.photos ?? []).map((url: string) => ({ type: 'photo' as const, url })),
  ];
  const total = mediaItems.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setActiveIndex(i => (i - 1 + total) % total);
      if (e.key === 'ArrowRight') setActiveIndex(i => (i + 1) % total);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, total]);

  const active = mediaItems[activeIndex];
  const isVideo = active?.type === 'video';
  const isAvailable = property.status === 'available';

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-1001 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div
        className="fixed inset-x-2 top-4 bottom-4 z-1001 md:inset-x-12 lg:inset-x-24 xl:inset-x-36 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: '#0d1118' }}
      >

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/10"
          style={{ border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(13,17,24,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ── Zone média ── */}
        <div className="relative flex-none h-[45vh] md:h-[54vh] overflow-hidden">

          {/* Image / vidéo */}
          {isVideo ? (
            <>
              <video key={active.url} src={active.url} muted autoPlay loop playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-40 blur-2xl scale-110" />
              <video key={`main-${active.url}`} src={active.url} controls
                className="relative w-full h-full object-contain" />
            </>
          ) : active?.type === 'photo' ? (
            <img src={active.url} alt={title} className="w-full h-full object-cover transition-opacity duration-300" />
          ) : (
            <img src={PLACEHOLDER} alt="Bien immobilier" className="w-full h-full object-cover" />
          )}

          {/* Gradient bas — titre/prix en overlay */}
          <div
            className="absolute inset-x-0 bottom-0 h-3/4 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(13,17,24,1) 0%, rgba(13,17,24,0.65) 45%, transparent 100%)' }}
          />

          {/* Badge statut */}
          <div className={`absolute top-5 left-5 z-10 text-[9px] tracking-[3px] uppercase px-3 py-1.5 rounded-full backdrop-blur-sm ${
            isAvailable
              ? 'text-[#b08d57] border border-[#b08d57]/40'
              : 'text-white/60 border border-white/20'
          }`} style={{ background: isAvailable ? 'rgba(176,141,87,0.12)' : 'rgba(255,255,255,0.06)' }}>
            {isAvailable ? t('available') : t('sold')}
          </div>

          {/* Titre + prix sur l'image */}
          <div className="absolute bottom-0 inset-x-0 px-7 pb-6 z-10">
            <p className="text-[10px] tracking-[3px] text-white/45 uppercase mb-2">
              {property.city} · {property.type}
            </p>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="font-serif text-2xl md:text-3xl font-light text-white leading-snug">
                {title}
              </h2>
              <p className="font-serif text-2xl md:text-3xl font-light text-[#b08d57] whitespace-nowrap">
                {property.price.toLocaleString(intlLocale)} ₪
              </p>
            </div>
          </div>

          {/* Flèches */}
          {total > 1 && (
            <>
              <button
                onClick={() => setActiveIndex(i => (i - 1 + total) % total)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(13,17,24,0.55)', backdropFilter: 'blur(8px)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={() => setActiveIndex(i => (i + 1) % total)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(13,17,24,0.55)', backdropFilter: 'blur(8px)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Compteur */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[9px] tracking-[2px] text-white/35 uppercase pointer-events-none tabular-nums">
                {activeIndex + 1} / {total}
              </div>
            </>
          )}
        </div>

        {/* ── Contenu ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Specs */}
          <div
            className="grid grid-cols-3 mx-7 my-6 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(176,141,87,0.18)', background: 'rgba(176,141,87,0.04)' }}
          >
            <div className="py-5 text-center" style={{ borderRight: '1px solid rgba(176,141,87,0.18)' }}>
              <p className="font-serif text-3xl font-light text-[#b08d57]">{property.surface}</p>
              <p className="text-[9px] tracking-[2.5px] text-white/35 uppercase mt-1.5">{t('surface')}</p>
            </div>
            <div className="py-5 text-center" style={{ borderRight: '1px solid rgba(176,141,87,0.18)' }}>
              <p className="font-serif text-3xl font-light text-[#b08d57]">{property.rooms}</p>
              <p className="text-[9px] tracking-[2.5px] text-white/35 uppercase mt-1.5">{t('rooms')}</p>
            </div>
            <div className="py-5 text-center">
              <p className="font-serif text-3xl font-light text-[#b08d57]">{property.bedrooms}</p>
              <p className="text-[9px] tracking-[2.5px] text-white/35 uppercase mt-1.5">{t('bedrooms')}</p>
            </div>
          </div>

          {/* Séparateur doré */}
          <div className="mx-7 h-px" style={{ background: 'rgba(176,141,87,0.12)' }} />

          {/* Thumbnails */}
          {total > 1 && (
            <div className="px-7 pt-5 pb-6">
              <p className="text-[9px] tracking-[3px] text-white/25 uppercase mb-3">
                Médias · {total}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {mediaItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className="relative flex-none w-20 h-13 rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
                    style={
                      i === activeIndex
                        ? { boxShadow: '0 0 0 2px #b08d57', opacity: 1 }
                        : { opacity: 0.35 }
                    }
                  >
                    {item.type === 'video' ? (
                      <>
                        <video src={item.url} muted className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
