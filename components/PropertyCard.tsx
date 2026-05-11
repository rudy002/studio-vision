'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export type Property = {
  id: string;
  title_fr: string;
  title_en: string;
  title_he: string;
  type: string;
  price: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  city: string;
  status: string;
  photos: string[];
  video_url: string;
};

export default function PropertyCard({ property }: { property: Property }) {
  const t = useTranslations('properties');
  const locale = useLocale();

  const title = locale === 'fr' ? property.title_fr : locale === 'en' ? property.title_en : property.title_he;
  const isAvailable = property.status === 'available';

  return (
    <Link
      href={`/${locale}/biens/${property.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-[#b08d57]/15 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-[#ede8df]">
        {property.photos && property.photos.length > 0 ? (
          <img
            src={property.photos[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-content-center bg-linear-to-br from-[#ede8df] to-[#f0e8d8]">
            <div className="w-12 h-12 border border-[#b08d57]/30 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-14 border-l-[#b08d57] ml-1"></div>
            </div>
          </div>
        )}

        {/* Badge statut */}
        <div className={`absolute top-3 left-3 text-[9px] tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-sm ${
          isAvailable
            ? 'text-[#b08d57] bg-white/90'
            : 'text-white bg-[#1c1917]/80'
        }`}>
          {isAvailable ? t('available') : t('sold')}
        </div>

        {/* Badge type */}
        <div className="absolute top-3 right-3 text-[9px] tracking-widest uppercase px-3 py-1 rounded-full bg-white/90 text-[#4a4540]">
          {property.type}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        <p className="text-[9px] tracking-[3px] text-[#8a8078] uppercase mb-1">{property.city}</p>
        <h3 className="font-serif text-xl font-light text-[#1c1917] mb-4">{title}</h3>

        <div className="h-px bg-[#b08d57]/15 mb-4"></div>

        <div className="flex justify-between items-center">
          <p className="font-serif text-2xl font-light text-[#1c1917]">
            {property.price.toLocaleString()} €
          </p>
          <div className="flex gap-3">
            <span className="text-[11px] text-[#8a8078]">{property.surface} {t('surface')}</span>
            <span className="text-[11px] text-[#8a8078]">{property.rooms} {t('rooms')}</span>
            <span className="text-[11px] text-[#8a8078]">{property.bedrooms} {t('bedrooms')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}