'use client';

import { useEffect } from 'react';
import { Property } from './PropertyCard';
import { useLocale, useTranslations } from 'next-intl';

export default function PropertyModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const locale = useLocale();
  const t = useTranslations('properties');

  const title =
    locale === 'fr'
      ? property.title_fr
      : locale === 'en'
        ? property.title_en
        : property.title_he;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-[#1c1917]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-8 bottom-8 z-50 md:inset-x-16 lg:inset-x-32 rounded-3xl overflow-y-auto shadow-2xl" style={{ background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(24px)', border: '0.5px solid rgba(255,255,255,0.5)' }}>
        
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#f5f2ec] transition-colors cursor-pointer"
        >
          <span className="text-[#1c1917] text-lg">✕</span>
        </button>

        {/* Media principale (vidéo > photo > placeholder) */}
        <div className={`relative overflow-hidden rounded-t-3xl ${property.video_url ? 'h-[60vh]' : 'h-[50vh] bg-[#ede8df]'}`}>
          {property.video_url ? (
            <>
              {/* Fond flouté (remplace les bandes noires pour les vidéos verticales) */}
              <video
                src={property.video_url}
                muted
                autoPlay
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-110 opacity-70 blur-[20px]"
              />
              {/* Vidéo principale */}
              <video
                src={property.video_url}
                controls
                className="relative w-full h-full object-contain"
              />
            </>
          ) : property.photos && property.photos.length > 0 ? (
            <img
              src={property.photos[0]}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#ede8df] to-[#f0e8d8]">
              <p className="font-serif text-2xl text-[#b08d57] opacity-40">
                Studio Vision
              </p>
            </div>
          )}

          <div className={`absolute top-5 left-5 text-[9px] tracking-widest uppercase px-3 py-1 rounded-full ${
            property.status === 'available'
              ? 'text-[#b08d57] bg-white/90'
              : 'text-white bg-[#1c1917]/80'
          }`}>
            {property.status === 'available' ? t('available') : t('sold')}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-8 md:p-12">
          
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

          {/* Galerie photos */}
          {property.photos && property.photos.length > (property.video_url ? 0 : 1) && (
            <div className="mb-8">
              <p className="text-[9px] tracking-[3px] text-[#b08d57] uppercase mb-4">Photos</p>
              <div className="grid grid-cols-2 gap-3">
                {(property.video_url ? property.photos : property.photos.slice(1)).map((photo: string, i: number) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`${title} ${i + (property.video_url ? 1 : 2)}`}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}