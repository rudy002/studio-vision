'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { X, MapPin, Maximize2, Share2 } from 'lucide-react';
import { Property } from './PropertyCard';
import { MediaCarousel, type CarouselMediaItem } from './ui/carousel-1';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';

export default function PropertyModal({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations('properties');
  const [copied, setCopied] = useState(false);

  const title =
    locale === 'fr' ? property.title_fr
    : locale === 'en' ? property.title_en
    : property.title_he;

  const intlLocale = locale === 'fr' ? 'fr-FR' : locale === 'he' ? 'he-IL' : 'en-US';
  const isAvailable = property.status === 'available';

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${locale}/biens/${property.id}`
    : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} — Studio Vision`, url: shareUrl });
      } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch { /* clipboard non dispo */ }
    }
  };

  const mediaItems: CarouselMediaItem[] = [
    ...(property.video_url ? [{ type: 'video' as const, url: property.video_url, alt: title }] : []),
    ...(property.photos && property.photos.length > 0
      ? property.photos.map((url: string, i: number) => ({ type: 'photo' as const, url, alt: `${title} — photo ${i + 1}` }))
      : [{ type: 'photo' as const, url: PLACEHOLDER, alt: title }]),
  ];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-1000 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal shell — centered dialog, explicit height so h-full chain works */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-1001 w-[95vw] max-w-325 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        style={{ background: '#05080c', height: 'min(90vh, 660px)' }}
      >

        {/* ── LEFT: Carousel ── */}
        <div className="relative h-[52%] shrink-0 md:h-full md:flex-1 flex flex-col">
          <MediaCarousel items={mediaItems} className="flex-1" />

          {/* Close button — sits over the carousel top-right */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/15 active:scale-95 focus:outline-none"
            style={{
              background: 'rgba(5,8,12,0.72)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <X className="h-4 w-4 text-white" strokeWidth={2} />
          </button>
        </div>

        {/* ── RIGHT: Details panel ── */}
        <div
          className="flex-1 md:flex-none md:w-76 lg:w-88 xl:w-96 overflow-y-auto flex flex-col"
          style={{ background: '#0a0f1a', borderLeft: '1px solid rgba(195,149,83,0.1)' }}
        >

          {/* Header */}
          <div className="px-5 pt-5 pb-4 md:px-7 md:pt-8 md:pb-5">
            {/* Status */}
            <span
              className={`inline-flex items-center text-[9px] tracking-[3px] uppercase px-3 py-1.5 rounded-full mb-3 md:mb-6 ${
                isAvailable
                  ? 'text-[#c39553] border border-[#c39553]/30'
                  : 'text-white/35 border border-white/15'
              }`}
              style={{ background: isAvailable ? 'rgba(195,149,83,0.08)' : 'rgba(255,255,255,0.04)' }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-2 ${isAvailable ? 'bg-[#c39553]' : 'bg-white/30'}`}
              />
              {isAvailable ? t('available') : t('sold')}
            </span>

            {/* City + type */}
            <p className="flex items-center gap-1.5 text-[10px] tracking-[2.5px] text-white/55 uppercase mb-3">
              <MapPin className="h-2.5 w-2.5 shrink-0 text-[#c39553]/50" />
              {property.city}
              {property.type && (
                <>
                  <span className="opacity-30">·</span>
                  <span>{property.type}</span>
                </>
              )}
            </p>

            {/* Title */}
            <h2
              className="text-xl md:text-2xl lg:text-3xl font-light text-white leading-snug mb-3 md:mb-6"
              style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)' }}
            >
              {title}
            </h2>

            {/* Price */}
            <p
              className="text-3xl font-light text-[#c39553]"
              style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)' }}
            >
              {property.price.toLocaleString(intlLocale)}&nbsp;₪
            </p>
          </div>

          {/* Divider */}
          <div className="mx-7 h-px" style={{ background: 'rgba(195,149,83,0.12)' }} />

          {/* Specs */}
          <div className="px-5 py-4 md:px-7 md:py-6 grid grid-cols-3">
            <div className="text-center">
              <p
                className="text-2xl font-light text-white mb-1"
                style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)' }}
              >
                {property.surface}
              </p>
              <p className="text-[9px] tracking-[2px] text-white/50 uppercase">{t('surface')}</p>
            </div>
            <div
              className="text-center"
              style={{ borderLeft: '1px solid rgba(195,149,83,0.1)', borderRight: '1px solid rgba(195,149,83,0.1)' }}
            >
              <p
                className="text-2xl font-light text-white mb-1"
                style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)' }}
              >
                {property.rooms}
              </p>
              <p className="text-[9px] tracking-[2px] text-white/50 uppercase">{t('rooms')}</p>
            </div>
            <div className="text-center">
              <p
                className="text-2xl font-light text-white mb-1"
                style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)' }}
              >
                {property.bedrooms}
              </p>
              <p className="text-[9px] tracking-[2px] text-white/50 uppercase">{t('bedrooms')}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-7 h-px" style={{ background: 'rgba(195,149,83,0.12)' }} />

          {/* Description */}
          {(() => {
            const desc =
              locale === 'fr' ? property.description_fr
              : locale === 'en' ? property.description_en
              : property.description_he;
            return desc ? (
              <div className="px-5 py-4 md:px-7 md:py-5">
                <p className="text-[9px] tracking-[3px] text-[#c39553]/60 uppercase mb-2">
                  {t('description')}
                </p>
                <p className="text-sm text-white/55 leading-relaxed">
                  {desc}
                </p>
              </div>
            ) : null;
          })()}

          {/* Media count hint */}
          {mediaItems.length > 1 && (
            <div className="px-5 pt-3 pb-0 md:px-7 md:pt-5">
              <p className="text-[9px] tracking-[3px] text-white/50 uppercase flex items-center gap-2">
                <Maximize2 className="h-3 w-3 text-[#c39553]/40" />
                {mediaItems.length} média{mediaItems.length > 1 ? 's' : ''} disponible{mediaItems.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Share */}
          <div className="px-5 pb-5 pt-4 md:px-7 md:pb-7">
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[11px] tracking-[2px] uppercase transition-all duration-200 cursor-pointer"
              style={{
                background: copied ? 'rgba(176,141,87,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${copied ? 'rgba(176,141,87,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: copied ? '#b08d57' : 'rgba(255,255,255,0.5)',
              }}
            >
              <Share2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              {copied ? t('shareCopied') : t('share')}
            </button>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    </>
  );
}
