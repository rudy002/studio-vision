'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PACKAGE_KEY } from '@/lib/packages';
import { X, MapPin, Maximize2, Share2, Link, Check } from 'lucide-react';
import { Property } from './PropertyCard';
import { MediaCarousel, type CarouselMediaItem } from './ui/carousel-1';

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const FbIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IgIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default function PropertyModal({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations('properties');
  const tPkg = useTranslations('packages');
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const intlLocale = locale === 'fr' ? 'fr-FR' : locale === 'he' ? 'he-IL' : 'en-US';
  const propertyLabel = [property.type, property.city].filter(Boolean).join(' · ');
  const isAvailable = property.status === 'available';

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${locale}/biens/${property.id}`
    : '';

  const copyLink = () => {
    const doSet = () => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2200); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(doSet).catch(() => {
        try {
          const ta = document.createElement('textarea');
          ta.value = shareUrl;
          ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta);
          ta.focus(); ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          doSet();
        } catch { /* silent */ }
      });
    }
  };

  const WA_PROPERTY_MSG: Record<string, string> = {
    fr: `Bonjour, je suis intéressé(e) par ce bien immobilier : ${shareUrl}`,
    en: `Hello, I am interested in this property: ${shareUrl}`,
    he: `שלום, אני מעוניין/ת בנכס הזה: ${shareUrl}`,
  };

  const shareWhatsApp = () => {
    const text = WA_PROPERTY_MSG[locale] ?? WA_PROPERTY_MSG.fr;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener');
  };

  // On mobile opens native share sheet → user can pick Instagram, Instagram Story, etc.
  // On desktop (no navigator.share) falls back to copy
  const shareInstagram = () => {
    if (navigator.share) {
      navigator.share({ title: `${propertyLabel} — Studio Vision`, url: shareUrl }).catch(() => {});
    } else {
      copyLink();
    }
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: `${propertyLabel} — Studio Vision`, url: shareUrl }).catch(() => {});
    }
  };

  const mediaItems: CarouselMediaItem[] = [
    ...(property.video_url ? [{ type: 'video' as const, url: property.video_url, alt: propertyLabel }] : []),
    ...(property.photos && property.photos.length > 0
      ? property.photos.map((url: string, i: number) => ({ type: 'photo' as const, url, alt: `${propertyLabel} — photo ${i + 1}` }))
      : []),
  ];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSharePanel) setShowSharePanel(false);
        else onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, showSharePanel]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-1000 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal shell */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-1001 w-[95vw] max-w-325 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        style={{ background: '#05080c', height: 'min(90vh, 660px)' }}
      >

        {/* ── LEFT: Carousel ── */}
        <div className="relative h-[52%] shrink-0 md:h-full md:flex-1 flex flex-col">
          {mediaItems.length > 0
            ? <MediaCarousel items={mediaItems} className="flex-1" />
            : <div className="flex-1 flex items-center justify-center" style={{ background: '#0a0f1a' }}>
                <p className="text-[10px] tracking-[3px] uppercase text-white/20">Aucun média</p>
              </div>
          }

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
            <span
              className={`inline-flex items-center text-[9px] tracking-[3px] uppercase px-3 py-1.5 rounded-full mb-3 md:mb-6 ${
                isAvailable
                  ? 'text-[#c39553] border border-[#c39553]/30'
                  : 'text-white/35 border border-white/15'
              }`}
              style={{ background: isAvailable ? 'rgba(195,149,83,0.08)' : 'rgba(255,255,255,0.04)' }}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isAvailable ? 'bg-[#c39553]' : 'bg-white/30'}`} />
              {isAvailable ? t('available') : t('sold')}
            </span>

            <p className="flex items-center gap-1.5 text-[10px] tracking-[2.5px] text-white/55 uppercase mb-3">
              <MapPin className="h-2.5 w-2.5 shrink-0 text-[#c39553]/50" />
              {property.city}
              {property.type && (
                <><span className="opacity-30">·</span><span>{property.type}</span></>
              )}
            </p>

            {property.price > 0 && (
              <p className="text-3xl font-light text-[#c39553]" style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)' }}>
                {property.price.toLocaleString(intlLocale)}&nbsp;₪
              </p>
            )}
          </div>

          <div className="mx-7 h-px" style={{ background: 'rgba(195,149,83,0.12)' }} />

          {/* Specs */}
          <div className="px-5 py-4 md:px-7 md:py-6 grid grid-cols-2">
            {property.surface > 0 && (
              <div className="text-center">
                <p className="text-2xl font-light text-white mb-1" style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)' }}>{property.surface}</p>
                <p className="text-[9px] tracking-[2px] text-white/50 uppercase">{t('surface')}</p>
              </div>
            )}
            {property.rooms > 0 && (
              <div className="text-center" style={property.surface > 0 ? { borderLeft: '1px solid rgba(195,149,83,0.1)' } : undefined}>
                <p className="text-2xl font-light text-white mb-1" style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)' }}>{property.rooms}</p>
                <p className="text-[9px] tracking-[2px] text-white/50 uppercase">{t('rooms')}</p>
              </div>
            )}
          </div>

          <div className="mx-7 h-px" style={{ background: 'rgba(195,149,83,0.12)' }} />

          {/* Description */}
          {(() => {
            const desc = locale === 'fr' ? property.description_fr : locale === 'en' ? property.description_en : property.description_he;
            return desc ? (
              <div className="px-5 py-4 md:px-7 md:py-5">
                <p className="text-[9px] tracking-[3px] text-[#c39553]/60 uppercase mb-2">{t('description')}</p>
                <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
              </div>
            ) : null;
          })()}

          {/* Packages */}
          {property.packages && property.packages.length > 0 && (
            <>
              <div className="mx-7 h-px" style={{ background: 'rgba(195,149,83,0.12)' }} />
              <div className="px-5 py-4 md:px-7 md:py-5">
                <p className="text-[9px] tracking-[3px] text-[#c39553]/60 uppercase mb-3">Packages</p>
                <div className="flex flex-wrap gap-2">
                  {property.packages.map((pkg) => (
                    <span key={pkg} className="text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 rounded-full border border-[#c39553]/25 text-[#c39553]/70" style={{ background: 'rgba(195,149,83,0.06)' }}>
                      {PACKAGE_KEY[pkg] ? tPkg(PACKAGE_KEY[pkg]) : pkg}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Media count hint */}
          {mediaItems.length > 1 && (
            <div className="px-5 pt-3 pb-0 md:px-7 md:pt-5">
              <p className="text-[9px] tracking-[3px] text-white/50 uppercase flex items-center gap-2">
                <Maximize2 className="h-3 w-3 text-[#c39553]/40" />
                {mediaItems.length} média{mediaItems.length > 1 ? 's' : ''} disponible{mediaItems.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Share button */}
          <div className="px-5 pb-5 pt-4 md:px-7 md:pb-7">
            <button
              type="button"
              onClick={() => setShowSharePanel(true)}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[11px] tracking-[2px] uppercase transition-all duration-200 cursor-pointer hover:border-white/25 hover:text-white/75"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            >
              <Share2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              {t('share')}
            </button>
          </div>

          <div className="flex-1" />
        </div>
      </div>

      {/* ── Share panel ── */}
      {showSharePanel && (
        <>
          {/* Backdrop (closes panel) */}
          <div className="fixed inset-0 z-1050" onClick={() => setShowSharePanel(false)} />

          {/* Bottom sheet */}
          <div
            className="fixed bottom-0 inset-x-0 z-1051 rounded-t-3xl px-6 pt-5 pb-10"
            style={{ background: '#0d1421', borderTop: '1px solid rgba(195,149,83,0.2)', borderLeft: '1px solid rgba(195,149,83,0.1)', borderRight: '1px solid rgba(195,149,83,0.1)', maxWidth: '520px', margin: '0 auto' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] tracking-[4px] uppercase text-[#c39553]/60">{t('share')}</p>
              <button type="button" onClick={() => setShowSharePanel(false)} className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* URL preview */}
            <p className="mb-5 px-3 py-2 rounded-lg text-[10px] text-white/30 truncate" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {shareUrl}
            </p>

            {/* Share options */}
            <div className="grid grid-cols-4 gap-3 mb-5">

              {/* WhatsApp */}
              <button type="button" onClick={shareWhatsApp} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-150 group-active:scale-90 group-hover:scale-105" style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)' }}>
                  <WaIcon />
                </div>
                <span className="text-[9px] text-white/45 text-center leading-tight">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button type="button" onClick={shareFacebook} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-150 group-active:scale-90 group-hover:scale-105" style={{ background: 'rgba(24,119,242,0.1)', border: '1px solid rgba(24,119,242,0.2)' }}>
                  <FbIcon />
                </div>
                <span className="text-[9px] text-white/45 text-center leading-tight">Facebook</span>
              </button>

              {/* Instagram & Story (opens native share on mobile) */}
              <button type="button" onClick={shareInstagram} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-150 group-active:scale-90 group-hover:scale-105" style={{ background: 'rgba(220,39,67,0.1)', border: '1px solid rgba(220,39,67,0.2)' }}>
                  <IgIcon />
                </div>
                <span className="text-[9px] text-white/45 text-center leading-tight">Instagram</span>
              </button>

              {/* Copy link */}
              <button type="button" onClick={copyLink} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-150 group-active:scale-90 group-hover:scale-105"
                  style={{ background: linkCopied ? 'rgba(176,141,87,0.2)' : 'rgba(176,141,87,0.08)', border: `1px solid ${linkCopied ? 'rgba(176,141,87,0.5)' : 'rgba(176,141,87,0.2)'}` }}
                >
                  {linkCopied
                    ? <Check className="w-6 h-6 text-[#b08d57]" strokeWidth={2} />
                    : <Link className="w-5 h-5 text-[#b08d57]" strokeWidth={1.5} />
                  }
                </div>
                <span className="text-[9px] text-white/45 text-center leading-tight">{linkCopied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            {/* Native share — shown only when available (mobile) */}
            {typeof navigator !== 'undefined' && !!navigator.share && (
              <button
                type="button"
                onClick={shareNative}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[11px] tracking-[2px] uppercase cursor-pointer transition-all duration-200 hover:border-white/25 hover:text-white/60"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
              >
                <Share2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                Autres applications...
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
