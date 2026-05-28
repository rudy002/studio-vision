import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Navbar from '../../components/Navbar';
import SplashScreen from '../../components/SplashScreen';
import "../globals.css";

export const metadata: Metadata = {
  title: "Studio Vision",
  description: "Cinématographie immobilière haut de gamme",
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
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <NextIntlClientProvider messages={messages}>
      <SplashScreen />
      <Navbar />
      {children}
    </NextIntlClientProvider>
  );
}