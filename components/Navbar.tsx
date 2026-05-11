'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-16 py-5 bg-[#f5f2ec]/90 backdrop-blur-md border-b border-[#b08d57]/15">
      
      {/* Logo */}
      <Link href={`/${locale}`} className="font-serif text-xl tracking-widest text-[#1c1917] uppercase">
        Studio<span className="text-[#b08d57]">.</span>Vision
      </Link>

      {/* Links */}
      <div className="flex gap-8 items-center">
        <Link href={`/${locale}`} className="text-[10px] tracking-widest text-[#4a4540] uppercase hover:text-[#b08d57] transition-colors">
          {t('home')}
        </Link>
        <Link href={`/${locale}/biens`} className="text-[10px] tracking-widest text-[#4a4540] uppercase hover:text-[#b08d57] transition-colors">
          {t('properties')}
        </Link>
        <Link href={`/${locale}/contact`} className="text-[10px] tracking-widest text-[#4a4540] uppercase hover:text-[#b08d57] transition-colors">
          {t('contact')}
        </Link>
      </div>

      {/* Language switcher */}
      <div className="flex gap-3 items-center">
        {['fr', 'en', 'he'].map((lang) => (
          <button
            key={lang}
            onClick={() => switchLocale(lang)}
            className={`text-[10px] tracking-widest uppercase transition-colors cursor-pointer ${
              locale === lang 
                ? 'text-[#b08d57] border-b border-[#b08d57]' 
                : 'text-[#8a8078] hover:text-[#b08d57]'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

    </nav>
  );
}