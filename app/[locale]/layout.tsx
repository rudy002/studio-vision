import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Navbar from '../../components/Navbar';
import HtmlLangSync from '../../components/HtmlLangSync';
import { PageTransitionProvider } from '../../components/PageTransitionProvider';
import "../globals.css";

export const metadata: Metadata = {
  title: "Studio Vision",
  description: "Cinématographie immobilière haut de gamme",
  verification: {
    google: "55y59Cdal64HhzYCHY5i-iJa4ROX_jkbCL8B6f9Kj2g",
  },
};

const locales = ['fr', 'en', 'he'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Studio Vision',
    description: 'Cinématographie immobilière — Photographie, Vidéo drone 4K, Visite virtuelle Matterport et simulation d\'ameublement en Israël.',
    url: 'https://www.studiovision.co.il',
    telephone: '+972537084374',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IL',
    },
    priceRange: '₪₪',
    image: 'https://www.studiovision.co.il/lior-photos/IMG_7584.jpg',
    areaServed: {
      '@type': 'Country',
      name: 'Israel',
    },
  };

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLangSync />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <PageTransitionProvider>
        <Navbar />
        {children}
      </PageTransitionProvider>
    </NextIntlClientProvider>
  );
}