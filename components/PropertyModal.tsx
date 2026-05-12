'use client';

import { useEffect, useState } from 'react';
import { Property } from './PropertyCard';
import { useLocale, useTranslations } from 'next-intl';

type MediaItem = { type: 'video'; url: string } | { type: 'photo'; url: string };

export default function PropertyModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const locale = useLocale();
  const t = useTranslations('properties');
  const [activeIndex, setActiveIndex] = useState(0);

  const title =
    locale === 'fr'
      ? property.title_fr
      : locale === 'en'
        ? property.title_en
        : property.title_he;

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

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-[#1c1917]/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="fixed inset-x-4 top-8 bottom-8 z-50 md:inset-x-16 lg:inset-x-32 rounded-3xl overflow-y-auto shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(24px)', border: '0.5px solid rgba(255,255,255,0.5)' }}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#f5f2ec] transition-colors cursor-pointer"
        >
          <span className="text-[#1c1917] text-lg">✕</span>
        </button>

        {/* Media principale */}
        <div className={`relative overflow-hidden rounded-t-3xl ${isVideo ? 'h-[60vh]' : 'h-[50vh] bg-[#ede8df]'}`}>
          {isVideo ? (
            <>
              <video
                key={active.url}
                src={active.url}
                muted
                autoPlay
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-110 opacity-70 blur-[20px]"
              />
              <video
                key={`main-${active.url}`}
                src={active.url}
                controls
                className="relative w-full h-full object-contain"
              />
            </>
          ) : active?.type === 'photo' ? (
            <>
              <img src={active.url} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 opacity-60 blur-[20px]" />
              <img src={active.url} alt={title} className="relative w-full h-full object-contain transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#ede8df] to-[#f0e8d8]">
              <p className="font-serif text-2xl text-[#b08d57] opacity-40">Studio Vision</p>
            </div>
          )}

          {/* Badge statut */}
          <div className={`absolute top-5 left-5 text-[9px] tracking-widest uppercase px-3 py-1 rounded-full ${
            property.status === 'available'
              ? 'text-[#b08d57] bg-white/90'
              : 'text-white bg-[#1c1917]/80'
          }`}>
            {property.status === 'available' ? t('available') : t('sold')}
          </div>

          {/* Compteur */}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] tracking-[2px] text-white uppercase bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full pointer-events-none">
              {activeIndex + 1} / {total}
            </div>
          )}

          {/* Flèches */}
          {total > 1 && (
            <>
              <button
                onClick={() => setActiveIndex(i => (i - 1 + total) % total)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={() => setActiveIndex(i => (i + 1) % total)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Contenu */}
        <div className="p-8 md:p-12">

          {/* Thumbnails */}
          {total > 1 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] tracking-[3px] text-[#b08d57] uppercase">Médias</p>
                <p className="text-[9px] tracking-[2px] text-[#8a8078] uppercase">{total} médias</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {mediaItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative flex-none w-24 h-16 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                      i === activeIndex
                        ? 'ring-2 ring-[#b08d57] opacity-100 scale-100'
                        : 'opacity-50 hover:opacity-85 hover:scale-[1.02]'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <>
                        <video src={item.url} muted className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
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

          {/* Titre et prix */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[9px] tracking-[3px] text-[#8a8078] uppercase mb-2">
                {property.city} · {property.type}
              </p>
              <h2 className="font-serif text-4xl font-light text-[#1c1917]">
                {title}
              </h2>
            </div>
            <div className="text-right">
              <p className="font-serif text-3xl font-light text-[#1c1917]">
                ₪ {property.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 text-center border border-[#b08d57]/10">
              <p className="font-serif text-3xl font-light text-[#1c1917]">{property.surface}</p>
              <p className="text-[9px] tracking-[2px] text-[#8a8078] uppercase mt-1">{t('surface')}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center border border-[#b08d57]/10">
              <p className="font-serif text-3xl font-light text-[#1c1917]">{property.rooms}</p>
              <p className="text-[9px] tracking-[2px] text-[#8a8078] uppercase mt-1">{t('rooms')}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center border border-[#b08d57]/10">
              <p className="font-serif text-3xl font-light text-[#1c1917]">{property.bedrooms}</p>
              <p className="text-[9px] tracking-[2px] text-[#8a8078] uppercase mt-1">{t('bedrooms')}</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
