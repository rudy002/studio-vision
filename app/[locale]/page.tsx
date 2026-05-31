import { getTranslations } from 'next-intl/server';
import { createClient } from '@supabase/supabase-js';
import ScrollExperience from '../../components/blocks/ScrollExperience';
import { FocusRail, FocusRailItem } from '../../components/ui/focus-rail';
import SplashScreen from '../../components/SplashScreen';
import Link from 'next/link';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const th = await getTranslations('home');
  const tse = await getTranslations('scrollExperience');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(5);

  const fallbackImg = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';

  return (
    <main className="bg-[#0a0f1a] min-h-screen">
      <SplashScreen />

      <ScrollExperience
        ctaPrimaryHref={`/${locale}/tarifs`}
        ctaSecondaryHref={`/${locale}/contact`}
        images={{
          // ACT 2 — Drone (couches sky → façade → intérieur)
          sky:       '/lior-photos/IMG_7579.JPEG', // salle à manger panoramique vue mer
          facade:    '/lior-photos/IMG_7586.JPEG', // grand living parquet chevrons
          interior:  '/lior-photos/IMG_7574.PNG',  // salon chaleureux vue skyline
          // ACT 3 — Visite des pièces
          salon:     '/lior-photos/IMG_7584.JPEG', // salon artistique vue mer
          cuisine:   '/lior-photos/IMG_7587.JPEG', // cuisine marbre parquet
          chambre:   '/lior-photos/IMG_7577.JPEG', // séjour lumineux vue mer
          sdb:       '/lior-photos/IMG_7581.JPEG', // bibliothèque design vue mer
          // ACT 4 — Hadmaya avant / après
          empty:     '/before-after/before2.JPEG',
          furnished: '/before-after/after2.PNG',
          // ACT 5 — Visite immersive (after* sauf after2)
          visitRooms: [
            '/before-after/after1.PNG',
            '/before-after/after3.PNG',
            '/before-after/after4.PNG',
            '/before-after/after5.PNG',
            '/before-after/after6.PNG',
            '/before-after/after7.PNG',
            '/before-after/after8.PNG',
            '/before-after/after9.PNG',
          ],
          // ACT 6 — Poster vidéo showreel
          poster:    '/lior-photos/IMG_7583.JPEG', // cuisine dramatique vue mer
        }}
        texts={{
          chapters:            tse.raw('chapters') as string[],
          introEyebrow:        tse('introEyebrow'),
          introTitleLine1:     tse('introTitleLine1'),
          introTitleAccent:    tse('introTitleAccent'),
          introSubtitle:       tse('introSubtitle'),
          scrollHint:          tse('scrollHint'),
          droneTag:            tse('droneTag'),
          droneTitle:          tse('droneTitle'),
          droneTitleAccent:    tse('droneTitleAccent'),
          visiteLead:          tse('visiteLead'),
          visiteCount:         tse('visiteCount'),
          rooms:               tse.raw('rooms') as { num: string; title: string; accent: string; desc: string }[],
          hadmayaTag:          tse('hadmayaTag'),
          hadmayaTitle:        tse('hadmayaTitle'),
          hadmayaTitleAccent:  tse('hadmayaTitleAccent'),
          hadmayaBefore:       tse('hadmayaBefore'),
          hadmayaBeforeSub:    tse('hadmayaBeforeSub'),
          hadmayaAfter:        tse('hadmayaAfter'),
          hadmayaAfterSub:     tse('hadmayaAfterSub'),
          matterportTag:       tse('matterportTag'),
          matterportTitle:     tse('matterportTitle'),
          matterportTitleAccent: tse('matterportTitleAccent'),
          matterportDesc:      tse('matterportDesc'),
          matterportStats:     tse.raw('matterportStats') as { value: string; label: string }[],
          reelEyebrow:         tse('reelEyebrow'),
          reelTitleLine1:      tse('reelTitleLine1'),
          reelTitleAccent:     tse('reelTitleAccent'),
          reelTagline:         tse('reelTagline'),
          ctaPrimary:          tse('ctaPrimary'),
          ctaSecondary:        tse('ctaSecondary'),
          brand:               tse('brand'),
          brandSub:            tse('brandSub'),
        }}
      />

      {/* Biens en vedette */}
      {properties && properties.length > 0 && (
        <section data-sv-chapter="7" className="px-6 md:px-16 py-16 md:pt-10 md:pb-24 bg-[#0a0f1a] min-h-screen">
          <style>{`@media (max-width: 767px) { .fp-header { margin-top: 80px; } }`}</style>
          <div className="fp-header flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-10 md:mb-12">
            <div>
              <p className="text-[10px] tracking-[5px] text-[#c39553] uppercase mb-1">
                {th('sectionEyebrow')}
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-light text-white">
                {th('sectionTitle')}
              </h2>
            </div>
            <Link
              href={`/${locale}/biens`}
              className="text-[11px] tracking-[3px] uppercase text-white border-b-2 border-[#c39553] pb-1 hover:text-[#c39553] transition-colors self-start md:self-auto"
            >
              {th('seeAll')}
            </Link>
          </div>

          <FocusRail
            items={properties.map((p): FocusRailItem => ({
              id:          p.id,
              title:       locale === 'fr' ? p.title_fr : locale === 'en' ? p.title_en : p.title_he,
              imageSrc:    p.photos?.[0] ?? fallbackImg,
              href:        `/${locale}/biens/${p.id}`,
              meta:        [p.city, p.type].filter(Boolean).join(' · '),
              description: [p.surface && `${p.surface} m²`, p.rooms && `${p.rooms} pièces`, p.price && `${Number(p.price).toLocaleString('fr-FR')} ₪`].filter(Boolean).join('  ·  '),
            }))}
            ctaLabel={th('seeProperty')}
            loop
          />
        </section>
      )}

    </main>
  );
}
