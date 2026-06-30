import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@supabase/supabase-js';
import ScrollExperience from '../../components/blocks/ScrollExperience';
import { BASE_URL, buildAlternates } from '../../lib/seo';
import { cityLabel } from '../../lib/city';

const OG_IMAGE = {
  url: `${BASE_URL}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: 'Studio Vision — Cinématographie immobilière',
};

const seo = {
  fr: {
    title: 'Studio Vision | Photographie & Vidéo Immobilière en Israël',
    description:
      "Photo professionnelle, vidéo drone 4K, visite virtuelle Matterport et simulation d'ameublement pour valoriser votre bien immobilier en Israël.",
  },
  en: {
    title: 'Studio Vision | Real Estate Photography & Video in Israel',
    description:
      'Professional photography, 4K drone video, Matterport virtual tours and furniture simulation to showcase your property in Israel.',
  },
  he: {
    title: 'סטודיו ויז\'ן | צילום ווידאו נדל"ן בישראל',
    description:
      'צילום מקצועי, וידאו רחפן 4K, סיור וירטואלי Matterport וסימולציית ריהוט לשיווק נכסי נדל"ן בישראל.',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = seo[locale as keyof typeof seo] ?? seo.fr;

  return {
    title: meta.title,
    description: meta.description,
    alternates: buildAlternates('', locale),
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [OG_IMAGE.url],
    },
  };
}
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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(5);

  const propertiesWithMedia = (properties || []).filter((p) => !!p.photos?.[0]);

  return (
    <main className="bg-[#0a0f1a] min-h-screen">
      <SplashScreen />

      <ScrollExperience
        videoSrc="/video-act6.mp4"
        videoSrcMobile="/video-vertical.mp4"
        ctaPrimaryHref={`/${locale}/packages`}
        ctaSecondaryHref={`/${locale}/contact`}
        images={{
          // ACT 2 — Drone (couches sky → façade → intérieur)
          sky: '/lior-photos/IMG_7579.jpg', // salle à manger panoramique vue mer
          skyMobile: '/vertical-photos/IMG_7587.jpg', // version verticale pour mobile
          facade: '/lior-photos/IMG_7586.jpg', // grand living parquet chevrons
          interior: '/lior-photos/IMG_7574.jpg', // salon chaleureux vue skyline
          // ACT 3 — Visite des pièces
          salon: '/act3/IMG_7584.jpg', // salon artistique vue mer
          cuisine: '/act3/IMG_7580.jpg', // cuisine marbre parquet
          chambre: '/act3/act3%20-%20chambre.webp', // chambre
          sdb: '/act3/act3-salledebain.jpeg', // salle de bain
          // ACT 4 — Hadmaya avant / après
          empty: '/before-after/before2.jpg',
          furnished: '/before-after/after2.jpg',
          // ACT 5 — Visite immersive (after* sauf after2)
          visitRooms: [
            '/before-after/after1.jpg',
            '/before-after/after3.jpg',
            '/before-after/after4.jpg',
            '/before-after/after5.jpg',
            '/before-after/after6.jpg',
            '/before-after/after7.jpg',
            '/before-after/after8.jpg',
            '/before-after/after9.jpg',
          ],
          // ACT 6 — Poster vidéo showreel
          poster: '/lior-photos/IMG_7583.jpg', // cuisine dramatique vue mer
        }}
        texts={{
          seoTitle: tse('seoTitle'),
          chapters: tse.raw('chapters') as string[],
          introEyebrow: tse('introEyebrow'),
          introTitleLine1: tse('introTitleLine1'),
          introTitleAccent: tse('introTitleAccent'),
          introSubtitle: tse('introSubtitle'),
          scrollHint: tse('scrollHint'),
          droneTag: tse('droneTag'),
          droneTitle: tse('droneTitle'),
          droneTitleAccent: tse('droneTitleAccent'),
          visiteLead: tse('visiteLead'),
          visiteCount: tse('visiteCount'),
          rooms: tse.raw('rooms') as {
            num: string;
            title: string;
            accent: string;
            desc: string;
          }[],
          hadmayaTag: tse('hadmayaTag'),
          hadmayaTitle: tse('hadmayaTitle'),
          hadmayaTitleAccent: tse('hadmayaTitleAccent'),
          hadmayaBefore: tse('hadmayaBefore'),
          hadmayaBeforeSub: tse('hadmayaBeforeSub'),
          hadmayaAfter: tse('hadmayaAfter'),
          hadmayaAfterSub: tse('hadmayaAfterSub'),
          hadmayaWord: tse('hadmayaWord'),
          matterportTag: tse('matterportTag'),
          matterportTitle: tse('matterportTitle'),
          matterportTitleAccent: tse('matterportTitleAccent'),
          matterportDesc: tse('matterportDesc'),
          matterportStats: tse.raw('matterportStats') as {
            value: string;
            label: string;
          }[],
          reelEyebrow: tse('reelEyebrow'),
          reelTitleLine1: tse('reelTitleLine1'),
          reelTitleAccent: tse('reelTitleAccent'),
          reelTagline: tse('reelTagline'),
          ctaPrimary: tse('ctaPrimary'),
          ctaSecondary: tse('ctaSecondary'),
          brand: tse('brand'),
          brandSub: tse('brandSub'),
        }}
      />

      {/* Biens en vedette */}
      {propertiesWithMedia.length > 0 && (
        <section
          data-sv-chapter="7"
          className="px-6 md:px-16 py-16 md:pt-10 md:pb-24 bg-[#0a0f1a] min-h-screen"
        >
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
            items={propertiesWithMedia.map(
              (p): FocusRailItem => ({
                id: p.id,
                imageSrc: p.photos[0],
                href: `/${locale}/biens/${p.id}`,
                meta: [cityLabel(p, locale), p.type]
                  .filter(Boolean)
                  .join(' · '),
                description: [
                  p.surface && `${p.surface} m²`,
                  p.rooms && `${p.rooms} pièces`,
                  p.price && `${Number(p.price).toLocaleString('fr-FR')} ₪`,
                ]
                  .filter(Boolean)
                  .join('  ·  '),
              }),
            )}
            ctaLabel={th('seeProperty')}
            loop
          />
        </section>
      )}
    </main>
  );
}
