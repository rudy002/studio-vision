'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { TransitionLink } from './TransitionLink';
import { usePageTransition } from './PageTransitionProvider';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const navigate = usePageTransition();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

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
    setMenuOpen(false);
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    navigate(newPath);
  };

  const navStyle = !isHome
    ? { background: 'rgba(10,15,26,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }
    : { background: 'transparent' };

  const logoClass = 'text-white';
  const linkClass = 'text-white/80 hover:text-white';
  const burgerClass = 'text-white';

  const langClass = (lang: string) => {
    if (locale === lang) return 'text-[#b08d57] border-b border-[#b08d57]';
    return 'text-white/60 hover:text-white';
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-16 py-5 transition-all duration-500 [&.nav-hidden]:md:-translate-y-full [&.nav-hidden]:md:opacity-0 [&.nav-hidden]:md:pointer-events-none"
      style={navStyle}
    >
      {/* Logo */}
      <TransitionLink
        href={`/${locale}`}
        className={`font-serif text-xl tracking-widest uppercase transition-colors ${logoClass}`}
      >
        Studio<span className="text-[#b08d57]">.</span>Vision
        <span className="text-[10px] tracking-wider font-sans font-light opacity-70 ml-2 normal-case">by Lior Haddad</span>
      </TransitionLink>

      {/* Desktop links */}
      <div className="hidden md:flex gap-8 items-center">
        <TransitionLink href={`/${locale}`} className={`text-[13px] tracking-widest uppercase transition-colors ${linkClass}`}>
          {t('home')}
        </TransitionLink>
        <TransitionLink href={`/${locale}/biens`} className={`text-[13px] tracking-widest uppercase transition-colors ${linkClass}`}>
          {t('properties')}
        </TransitionLink>
        <TransitionLink href={`/${locale}/tarifs`} className={`text-[13px] tracking-widest uppercase transition-colors ${linkClass}`}>
          {t('tarifs')}
        </TransitionLink>
        <TransitionLink href={`/${locale}/contact`} className={`text-[13px] tracking-widest uppercase transition-colors ${linkClass}`}>
          {t('contact')}
        </TransitionLink>
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
          <TransitionLink
            href={`/${locale}`}
            onNavigate={() => setMenuOpen(false)}
            className="px-6 py-4 text-[13px] tracking-widest text-white/80 uppercase hover:text-[#b08d57] transition-colors border-b border-white/10"
          >
            {t('home')}
          </TransitionLink>
          <TransitionLink
            href={`/${locale}/biens`}
            onNavigate={() => setMenuOpen(false)}
            className="px-6 py-4 text-[13px] tracking-widest text-white/80 uppercase hover:text-[#b08d57] transition-colors border-b border-white/10"
          >
            {t('properties')}
          </TransitionLink>
          <TransitionLink
            href={`/${locale}/tarifs`}
            onNavigate={() => setMenuOpen(false)}
            className="px-6 py-4 text-[13px] tracking-widest text-white/80 uppercase hover:text-[#b08d57] transition-colors border-b border-white/10"
          >
            {t('tarifs')}
          </TransitionLink>
          <TransitionLink
            href={`/${locale}/contact`}
            onNavigate={() => setMenuOpen(false)}
            className="px-6 py-4 text-[13px] tracking-widest text-white/80 uppercase hover:text-[#b08d57] transition-colors border-b border-white/10"
          >
            {t('contact')}
          </TransitionLink>
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
