'use client';

import Image from 'next/image';

/**
 * PhotoGallery — section portfolio sur la page d'accueil.
 * Affiche les 15 réalisations de Lior en grille responsive 1→2→3 colonnes.
 * Utilise next/image + fill avec ratio fixe 3/2 pour une présentation uniforme.
 */

type Photo = {
  src: string;
  alt: string;
};

const PHOTOS: Photo[] = [
  { src: '/lior-photos/IMG_7579.JPEG', alt: 'Salle à manger panoramique avec vue sur la Méditerranée' },
  { src: '/lior-photos/IMG_7574.PNG',  alt: 'Salon luxueux avec vue sur la skyline' },
  { src: '/lior-photos/IMG_7583.JPEG', alt: 'Cuisine design sombre avec vue mer et terrasse' },
  { src: '/lior-photos/IMG_7586.JPEG', alt: 'Grand séjour en parquet chevrons avec vue mer' },
  { src: '/lior-photos/IMG_7580.JPEG', alt: "Appartement ouvert sur la mer — plan cuisine/salon" },
  { src: '/lior-photos/IMG_7587.JPEG', alt: 'Cuisine avec îlot en marbre et parquet chevrons' },
  { src: '/lior-photos/IMG_7575.JPEG', alt: 'Séjour élégant ouvert avec éclairage chaleureux' },
  { src: '/lior-photos/IMG_7577.JPEG', alt: 'Salon lumineux avec panorama sur la mer' },
  { src: '/lior-photos/IMG_7576.JPEG', alt: 'Cuisine blanche avec îlot bois et suspensions laiton' },
  { src: '/lior-photos/IMG_7584.JPEG', alt: "Salon artistique avec triptyque et vue mer" },
  { src: '/lior-photos/IMG_7588.JPEG', alt: 'Cuisine sombre avec double îlot en marbre exotique' },
  { src: '/lior-photos/IMG_7578.JPEG', alt: 'Cuisine minimaliste gris clair avec vue mer' },
  { src: '/lior-photos/IMG_7581.JPEG', alt: 'Bibliothèque design en métal bronze avec vue mer' },
  { src: '/lior-photos/IMG_7582.JPEG', alt: 'Évier en pierre naturelle avec double plan de travail' },
  { src: '/lior-photos/IMG_7585.JPEG', alt: 'Grand séjour ouvert avec vue méditerranéenne' },
];

export default function PhotoGallery() {
  return (
    <section className="bg-[#070b09] pt-20 pb-0">

      {/* ── En-tête ── */}
      <div className="px-6 md:px-16 mb-12">
        <p className="text-[10px] tracking-[5px] text-[#c39553] uppercase mb-5">
          Portfolio · Réalisations
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white leading-tight">
            Chaque espace,{' '}
            <em className="not-italic" style={{ color: '#c39553' }}>révélé.</em>
          </h2>
          <p className="text-[11px] tracking-[2px] text-white/40 uppercase md:text-right">
            Photo · Drone · Hadmaya · Matterport
          </p>
        </div>
      </div>

      {/* ── Grille photos ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px]">
        {PHOTOS.map((photo, i) => (
          <div
            key={i}
            className="relative overflow-hidden group"
            style={{ aspectRatio: '3 / 2' }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              loading={i < 6 ? 'eager' : 'lazy'}
            />
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-[#0e1612]/0 group-hover:bg-[#0e1612]/30 transition-colors duration-500 pointer-events-none" />
            {/* Bordure dorée hover */}
            <div className="absolute inset-0 border border-transparent group-hover:border-[#c39553]/50 transition-all duration-500 pointer-events-none" />
          </div>
        ))}
      </div>
    </section>
  );
}
