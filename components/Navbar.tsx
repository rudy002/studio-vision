'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { TransitionLink } from './TransitionLink';
import { usePageTransition } from './PageTransitionProvider';

export default function Navbar() {
  const t = useTranslations('nav');
  const tA11y = useTranslations('a11y');
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
    if (locale === lang) return 'text-gold border-b border-gold';
    return 'text-white/60 hover:text-white';
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center gap-4 px-6 md:px-8 lg:px-16 py-5 transition-all duration-500 [&.nav-hidden]:md:-translate-y-full [&.nav-hidden]:md:opacity-0 [&.nav-hidden]:md:pointer-events-none"
      style={navStyle}
    >
      {/* Logo */}
      <TransitionLink
        href={`/${locale}`}
        className={`brand-wordmark font-serif text-xl tracking-ui uppercase whitespace-nowrap shrink-0 transition-colors ${logoClass}`}
      >
        Studio<span className="text-gold">.</span>Vision
        <span className="inline text-xs tracking-normal font-sans font-light opacity-70 ms-2 normal-case">by Lior Haddad</span>
      </TransitionLink>

      {/* Desktop links */}
      <div className="hidden md:flex gap-4 lg:gap-8 items-center shrink-0">
        <TransitionLink href={`/${locale}`} className={`text-xs lg:text-sm tracking-ui uppercase transition-colors ${linkClass}`}>
          {t('home')}
        </TransitionLink>
        <TransitionLink href={`/${locale}/biens`} className={`text-xs lg:text-sm tracking-ui uppercase transition-colors ${linkClass}`}>
          {t('properties')}
        </TransitionLink>
        <TransitionLink href={`/${locale}/packages`} className={`text-xs lg:text-sm tracking-ui uppercase transition-colors ${linkClass}`}>
          {t('packages')}
        </TransitionLink>
        <TransitionLink href={`/${locale}/contact`} className={`text-xs lg:text-sm tracking-ui uppercase transition-colors ${linkClass}`}>
          {t('contact')}
        </TransitionLink>
      </div>

      {/* Desktop language switcher */}
      <div className="hidden md:flex gap-3 items-center shrink-0">
        {['fr', 'en', 'he'].map((lang) => (
          <button
            key={lang}
            onClick={() => switchLocale(lang)}
            className={`text-xs lg:text-sm tracking-ui uppercase transition-colors cursor-pointer ${langClass(lang)}`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Mobile burger */}
      <button
        className={`md:hidden text-xl cursor-pointer transition-colors p-3 -m-3 ${burgerClass}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={tA11y('menu')}
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
            className="px-6 py-4 text-sm tracking-ui text-white/80 uppercase hover:text-gold transition-colors border-b border-white/10"
          >
            {t('home')}
          </TransitionLink>
          <TransitionLink
            href={`/${locale}/biens`}
            onNavigate={() => setMenuOpen(false)}
            className="px-6 py-4 text-sm tracking-ui text-white/80 uppercase hover:text-gold transition-colors border-b border-white/10"
          >
            {t('properties')}
          </TransitionLink>
          <TransitionLink
            href={`/${locale}/packages`}
            onNavigate={() => setMenuOpen(false)}
            className="px-6 py-4 text-sm tracking-ui text-white/80 uppercase hover:text-gold transition-colors border-b border-white/10"
          >
            {t('packages')}
          </TransitionLink>
          <TransitionLink
            href={`/${locale}/contact`}
            onNavigate={() => setMenuOpen(false)}
            className="px-6 py-4 text-sm tracking-ui text-white/80 uppercase hover:text-gold transition-colors border-b border-white/10"
          >
            {t('contact')}
          </TransitionLink>
          <div className="flex gap-6 px-6 py-4">
            {['fr', 'en', 'he'].map((lang) => (
              <button
                key={lang}
                onClick={() => switchLocale(lang)}
                className={`text-sm tracking-ui uppercase transition-colors cursor-pointer ${langClass(lang)}`}
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
