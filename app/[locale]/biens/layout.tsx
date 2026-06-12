import type { Metadata } from 'next';
import { buildAlternates } from '../../../lib/seo';

// La page /biens est un composant client (filtres interactifs) et ne peut
// pas exporter generateMetadata — ce layout serveur porte son SEO.
const seo = {
  fr: {
    title: 'Biens immobiliers en Israël | Studio Vision',
    description:
      'Découvrez notre sélection de biens immobiliers mis en valeur par Studio Vision : photographie professionnelle, vidéo drone 4K et visites virtuelles en Israël.',
  },
  en: {
    title: 'Properties in Israel | Studio Vision',
    description:
      'Discover our selection of properties showcased by Studio Vision: professional photography, 4K drone video and virtual tours in Israel.',
  },
  he: {
    title: 'נכסים בישראל | סטודיו ויז\'ן',
    description:
      'גלו את מבחר הנכסים שלנו: צילום מקצועי, וידאו רחפן 4K וסיורים וירטואליים בישראל.',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = seo[locale as keyof typeof seo] ?? seo.fr;

  return {
    title: meta.title,
    description: meta.description,
    alternates: buildAlternates('/biens'),
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function BiensLayout({ children }: { children: React.ReactNode }) {
  return children;
}
