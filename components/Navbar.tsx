'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const isLight = false;

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onScroll = () => {
      const y = window.scrollY;

      // Scrolled state — fond visible hors homepage
      if (!isHome) {
        nav.classList.toggle('nav-scrolled', y > 40);
      }

      // Hide/show — manipulation DOM directe, zéro re-render React
      if (y > 80) {
        nav.classList.toggle('nav-hidden', y > lastScrollY.current);
      } else {
        nav.classList.remove('nav-hidden');
      }

      lastScrollY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setMenuOpen(false);
  };

  const navStyle = !isHome
    ? { background: 'rgba(10,15,26,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }
    : { background: 'transparent' };

  const logoClass = isLight ? 'text-[#1c1917]' : 'text-white';
  const linkClass = isLight ? 'text-[#4a4540] hover:text-[#b08d57]' : 'text-white/80 hover:text-white';
  const burgerClass = isLight ? 'text-[#1c1917]' : 'text-white';

  const langClass = (lang: string) => {
    if (locale === lang) return 'text-[#b08d57] border-b border-[#b08d57]';
    return isLight ? 'text-[#8a8078] hover:text-[#b08d57]' : 'text-white/60 hover:text-white';
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-16 py-5 transition-all duration-500 [&.nav-hidden]:md:-translate-y-full [&.nav-hidden]:md:opacity-0 [&.nav-hidden]:md:pointer-events-none"
      style={navStyle}
    >
      {/* Logo */}
      <Link
        href={`/${locale}`}
        className={`font-serif text-xl tracking-widest uppercase transition-colors ${logoClass}`}
      >
        Studio<span className="text-[#b08d57]">.</span>Vision
        <span className="text-[10px] tracking-wider font-sans font-light opacity-70 ml-2 normal-case">by Lior Haddad</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex gap-8 items-center">
        <Link href={`/${locale}`} className={`text-[13px] tracking-widest uppercase transition-colors ${linkClass}`}>
          {t('home')}
        </Link>
        <Link href={`/${locale}/biens`} className={`text-[13px] tracking-widest uppercase transition-colors ${linkClass}`}>
          {t('properties')}
        </Link>
        <Link href={`/${locale}/tarifs`} className={`text-[13px] tracking-widest uppercase transition-colors ${linkClass}`}>
          {t('tarifs')}
        </Link>
        <Link href={`/${locale}/contact`} className={`text-[13px] tracking-widest uppercase transition-colors ${linkClass}`}>
          {t('contact')}
        </Link>
      </div>

      {/* Desktop language switcher */}
      <div className="hidden md:flex gap-3 items-center">
        {['fr', 'en', 'he'].map((lang) => (
          <button
            key={lang}
            onClick={() => switchLocale(lang)}
            className={`text-[13px] tracking-widest uppercase transition-colors cursor-pointer ${langClass(lang)}`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Mobile burger */}
      <button
        className={`md:hidden text-xl cursor-pointer transition-colors ${burgerClass}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 md:hidden flex flex-col"
          style={{
            background: 'rgba(10,15,26,0.95)',
            backdropFilter: 'blur(16px)',
            borderBottom: '0.5px solid rgba(255,255,255,0.1)',
          }}
        >
          <Link
            href={`/${locale}`}
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-[13px] tracking-widest text-white/80 uppercase hover:text-[#b08d57] transition-colors border-b border-white/10"
          >
            {t('home')}
          </Link>
          <Link
            href={`/${locale}/biens`}
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-[13px] tracking-widest text-white/80 uppercase hover:text-[#b08d57] transition-colors border-b border-white/10"
          >
            {t('properties')}
          </Link>
          <Link
            href={`/${locale}/tarifs`}
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-[13px] tracking-widest text-white/80 uppercase hover:text-[#b08d57] transition-colors border-b border-white/10"
          >
            {t('tarifs')}
          </Link>
          <Link
            href={`/${locale}/contact`}
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-[13px] tracking-widest text-white/80 uppercase hover:text-[#b08d57] transition-colors border-b border-white/10"
          >
            {t('contact')}
          </Link>
          <div className="flex gap-6 px-6 py-4">
            {['fr', 'en', 'he'].map((lang) => (
              <button
                key={lang}
                onClick={() => switchLocale(lang)}
                className={`text-[13px] tracking-widest uppercase transition-colors cursor-pointer ${langClass(lang)}`}
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
