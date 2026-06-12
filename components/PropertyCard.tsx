'use client';

import * as React from 'react';
import { memo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, MapPin } from 'lucide-react';
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
  const imageUrl = property.photos?.[0];

  return (
    <div
      onClick={onClick}
      style={{ '--theme-color': themeColor } as React.CSSProperties}
      className={cn('group w-full h-full cursor-pointer', className)}
    >
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden
                   transition-all duration-500 ease-in-out
                   group-hover:scale-[1.03] group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.7)]"
        style={{ boxShadow: `0 0 40px -18px hsl(${themeColor} / 0.5)` }}
      >
        {/* Background image with zoom on hover */}
        {imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center
                       transition-transform duration-500 ease-in-out group-hover:scale-110"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
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
