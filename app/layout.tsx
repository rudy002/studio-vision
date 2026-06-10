import { Cormorant_Garamond, Plus_Jakarta_Sans, JetBrains_Mono, Noto_Sans_Hebrew } from 'next/font/google';
import { headers } from 'next/headers';
import NextAuthProvider from '../components/SessionProvider';
import WhatsAppButton from '../components/WhatsAppButton';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jakarta',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const hebrewSans = Noto_Sans_Hebrew({
  subsets: ['hebrew'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-hebrew',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get('x-locale') ?? 'fr';
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${serif.variable} ${jakarta.variable} ${mono.variable} ${hebrewSans.variable}`}
    >
      <body>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
