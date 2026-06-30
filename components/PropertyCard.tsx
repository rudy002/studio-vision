'use client';

import * as React from 'react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, MapPin, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PACKAGE_KEY } from '@/lib/packages';
import { cityLabel } from '@/lib/city';

export type Property = {
  id: string;
  title_fr?: string;
  title_en?: string;
  title_he?: string;
  type: string;
  price: number;
  surface: number;
  rooms: number;
  bedrooms?: number;
  city: string;
  city_en?: string;
  status: string;
  photos: string[];
  video_url: string;
  description_fr?: string;
  description_en?: string;
  description_he?: string;
  packages?: string[];
  lat?: number;
  lng?: number;
};

const TYPE_COLORS: Record<string, string> = {
  villa:       '38 45% 18%',   // ambre chaud
  penthouse:   '25 38% 16%',   // brun doré
  appartement: '220 35% 16%',  // bleu-marine
  maison:      '215 30% 15%',  // ardoise bleue
};
const DEFAULT_COLOR = '220 30% 12%'; // bleu-marine profond


function PropertyCard({
  property,
  onClick,
  className,
}: {
  property: Property;
  onClick?: () => void;
  className?: string;
}) {
  const t = useTranslations('properties');
  const tPkg = useTranslations('packages');
  const locale = useLocale();

  const intlLocale =
    locale === 'fr' ? 'fr-FR' : locale === 'he' ? 'he-IL' : 'en-US';

  const isAvailable = property.status === 'available';
  const themeColor = TYPE_COLORS[property.type?.toLowerCase()] ?? DEFAULT_COLOR;

  // Tous les médias du bien : photos d'abord, puis la vidéo.
  // (s'il n'y a qu'une vidéo, elle sert aussi d'aperçu via sa première frame)
  const slides = useMemo(() => {
    const arr: { type: 'image' | 'video'; src: string }[] = (property.photos ?? []).map(
      (src) => ({ type: 'image' as const, src }),
    );
    if (property.video_url) arr.push({ type: 'video', src: property.video_url });
    return arr;
  }, [property.photos, property.video_url]);

  const hasVideo = !!property.video_url;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const next = () => setIndex((i) => (i + 1) % slides.length);

  const handleEnter = () => setHovered(true);
  const handleLeave = () => {
    setHovered(false);
    setIndex(0);
    const v = videoRef.current;
    if (v) {
      v.pause();
      // revenir sur la frame d'aperçu
      try { v.currentTime = 0.1; } catch { /* noop */ }
    }
  };

  // Défilement / lecture au survol
  useEffect(() => {
    if (!hovered || slides.length === 0) return;

    const current = slides[index];
    if (current?.type === 'video') {
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
      return; // l'avance est gérée par onEnded
    }
    if (slides.length <= 1) return;
    const t = setTimeout(next, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered, index, slides]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ '--theme-color': themeColor } as React.CSSProperties}
      className={cn('group w-full h-full cursor-pointer', className)}
    >
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden
                   transition-all duration-500 ease-in-out
                   group-hover:scale-[1.03] group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.7)]"
        style={{ boxShadow: `0 0 40px -18px hsl(${themeColor} / 0.5)` }}
      >
        {/* Médias empilés, fondu enchaîné, zoom au survol */}
        <div className="absolute inset-0 transition-transform duration-500 ease-in-out group-hover:scale-110">
          {slides.map((slide, i) =>
            slide.type === 'image' ? (
              <div
                key={i}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out"
                style={{ backgroundImage: `url(${slide.src})`, opacity: i === index ? 1 : 0 }}
              />
            ) : (
              <video
                key={i}
                ref={videoRef}
                // fragment #t : force le navigateur à peindre une frame d'aperçu au repos
                src={slide.src.includes('#') ? slide.src : `${slide.src}#t=0.1`}
                muted
                loop={slides.length === 1}
                playsInline
                preload="metadata"
                onEnded={slides.length > 1 ? next : undefined}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                style={{ opacity: i === index ? 1 : 0 }}
              />
            ),
          )}
        </div>

        {/* Pastille vidéo (affordance, masquée au survol quand ça joue) */}
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none -translate-y-6">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 opacity-80 group-hover:opacity-0 transition-opacity duration-300">
              <Play className="h-4 w-4 text-white translate-x-px" fill="currentColor" />
            </span>
          </div>
        )}

        {/* Indicateurs de médias */}
        {slides.length > 1 && (
          <div className="absolute top-14 left-0 right-0 z-10 flex justify-center gap-1.5 pointer-events-none">
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i === index ? 'w-4 bg-[#c39553]' : 'w-1 bg-white/30',
                )}
              />
            ))}
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top,
              hsl(var(--theme-color) / 0.97) 0%,
              hsl(var(--theme-color) / 0.65) 42%,
              transparent 68%)`,
          }}
        />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <span
            className={`text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full backdrop-blur-sm border ${
              isAvailable
                ? 'text-[#c39553] bg-[#c39553]/10 border-[#c39553]/30'
                : 'text-white/50 bg-black/25 border-white/10'
            }`}
          >
            {isAvailable ? t('available') : t('sold')}
          </span>
          <span className="text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/75">
            {property.type}
          </span>
        </div>

        {/* Bottom content */}
        <div className="relative flex flex-col justify-end h-full p-5 text-white">
          <p className="text-[9px] tracking-[3px] text-[#c39553]/75 uppercase mb-1.5 flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            {cityLabel(property, locale)}
          </p>

          {property.packages && property.packages.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {property.packages.map((pkg) => (
                <span
                  key={pkg}
                  className="text-[7px] tracking-[1.5px] uppercase px-2 py-0.5 rounded-full border border-[#c39553]/25 text-[#c39553]/65"
                  style={{ background: 'rgba(195,149,83,0.07)' }}
                >
                  {PACKAGE_KEY[pkg] ? tPkg(PACKAGE_KEY[pkg]) : pkg}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2.5 text-[10px] text-white/55 mb-4 font-mono">
            {property.surface > 0 && <span>{property.surface} m²</span>}
            {property.surface > 0 && property.rooms > 0 && <span className="opacity-30">·</span>}
            {property.rooms > 0 && <span>{property.rooms} {t('rooms')}</span>}
          </div>

          {/* Price + arrow */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3
                       border transition-all duration-300
                       group-hover:border-[hsl(var(--theme-color)/0.6)]"
            style={{
              background: `hsl(${themeColor} / 0.55)`,
              borderColor: `hsl(${themeColor} / 0.32)`,
            }}
          >
            <span className="font-serif text-lg font-light">
              {property.price > 0 ? `${property.price.toLocaleString(intlLocale)} ₪` : t('priceOnRequest')}
            </span>
            <ArrowRight className="h-4 w-4 text-[#c39553] transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(PropertyCard);
