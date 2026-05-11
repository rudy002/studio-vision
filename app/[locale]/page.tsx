import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import HeroCanvas from '../../components/HeroCanvas';
import Link from 'next/link';

export default function Home() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <main className="bg-[#f5f2ec] min-h-screen">
      
      {/* Hero */}
      <section className="relative h-screen min-h-150 flex items-center overflow-hidden">
        <HeroCanvas />
        
        <div className="relative z-10 px-16 max-w-2xl">
          <p className="text-[10px] tracking-[5px] text-[#b08d57] uppercase mb-5 animate-fade-up">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-6xl font-light text-[#1c1917] leading-tight mb-5">
            {t('title')} <em className="italic text-[#b08d57]">{t('titleAccent')}</em>
          </h1>
          <p className="text-sm text-[#8a8078] tracking-wide leading-relaxed mb-10">
            {t('subtitle')}
          </p>
          <Link 
            href={`/${locale}/biens`}
            className="inline-block text-[11px] tracking-[3px] uppercase text-[#1c1917] border-b-2 border-[#b08d57] pb-1 hover:text-[#b08d57] transition-colors"
          >
            {t('cta')} →
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-16 flex items-center gap-3 z-10">
          <div className="w-10 h-px bg-[#b08d57]"></div>
          <span className="text-[9px] tracking-[3px] text-[#8a8078] uppercase">Scroll</span>
        </div>
      </section>

    </main>
  );
}