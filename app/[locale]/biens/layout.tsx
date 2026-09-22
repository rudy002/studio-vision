import type { Metadata } from 'next';
import { buildAlternates } from '../../../lib/seo';

// La page /biens est un composant client (filtres interactifs) et ne peut
// pas exporter generateMetadata — ce layout serveur porte son SEO.
const seo = {
  fr: {
    title: 'Nos réalisations immobilières en Israël | Studio Vision',
    description:
      'Découvrez nos réalisations : biens immobiliers mis en valeur par Studio Vision en photographie professionnelle, vidéo drone 4K et visites virtuelles en Israël.',
  },
  en: {
    title: 'Our real estate work in Israel | Studio Vision',
    description:
      'Discover our work: properties showcased by Studio Vision with professional photography, 4K drone video and virtual tours in Israel.',
  },
  he: {
    title: 'העבודות שלנו בנדל"ן בישראל | סטודיו ויז\'ן',
    description:
      'גלו את העבודות שלנו: נכסים שצילמנו בצילום מקצועי, וידאו רחפן 4K וסיורים וירטואליים בישראל.',
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
    alternates: buildAlternates('/biens', locale),
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
