'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setMenuOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-16 py-5"
      style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(255,255,255,0.4)' }}
    >
      {/* Logo */}
      <Link href={`/${locale}`} className="font-serif text-xl tracking-widest text-[#1c1917] uppercase">
        Studio<span className="text-[#b08d57]">.</span>Vision
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex gap-8 items-center">
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

      {/* Desktop language switcher */}
      <div className="hidden md:flex gap-3 items-center">
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

      {/* Mobile burger */}
      <button
        className="md:hidden text-[#1c1917] text-xl cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 md:hidden flex flex-col"
          style={{ background: 'rgba(245,242,236,0.95)', backdropFilter: 'blur(16px)', borderBottom: '0.5px solid rgba(255,255,255,0.5)' }}
        >
          <Link
            href={`/${locale}`}
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-[10px] tracking-widest text-[#4a4540] uppercase hover:text-[#b08d57] transition-colors border-b border-black/5"
          >
            {t('home')}
          </Link>
          <Link
            href={`/${locale}/biens`}
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-[10px] tracking-widest text-[#4a4540] uppercase hover:text-[#b08d57] transition-colors border-b border-black/5"
          >
            {t('properties')}
          </Link>
          <Link
            href={`/${locale}/contact`}
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-[10px] tracking-widest text-[#4a4540] uppercase hover:text-[#b08d57] transition-colors border-b border-black/5"
          >
            {t('contact')}
          </Link>
          <div className="flex gap-6 px-6 py-4">
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
        </div>
      )}
    </nav>
  );
}
