import type { Metadata } from 'next';
import ContactClient from '../../../components/ContactClient';
import { buildAlternates } from '../../../lib/seo';

type Params = Promise<{ locale: string }>;

const seo = {
  fr: {
    title: 'Contact | Studio Vision',
    description: 'Contactez Studio Vision pour un devis personnalisé en photographie, vidéo drone et visite virtuelle immobilière en Israël.',
  },
  en: {
    title: 'Contact | Studio Vision',
    description: 'Contact Studio Vision for a custom quote on real estate photography, drone video and virtual tours in Israel.',
  },
  he: {
    title: 'צור קשר | סטודיו ויז\'ן',
    description: 'צרו קשר עם סטודיו ויז\'ן לקבלת הצעת מחיר לצילום נדל"ן, וידאו רחפן וסיור וירטואלי בישראל.',
  },
} as const;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const meta = seo[locale as keyof typeof seo] ?? seo.fr;

  return {
    title: meta.title,
    description: meta.description,
    alternates: buildAlternates('/contact'),
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
