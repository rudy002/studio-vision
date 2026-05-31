'use client';

import { useEffect, useRef } from 'react';
import './scroll-experience.css';

type Texts = {
  brand?: string;
  brandSub?: string;
  chapters?: string[];
  introEyebrow?: string;
  introTitleLine1?: string;
  introTitleAccent?: string;
  introSubtitle?: string;
  scrollHint?: string;
  droneTag?: string;
  droneTitle?: string;
  droneTitleAccent?: string;
  visiteLead?: string;
  visiteCount?: string;
  rooms?: { num: string; title: string; accent: string; desc: string }[];
  hadmayaTag?: string;
  hadmayaTitle?: string;
  hadmayaTitleAccent?: string;
  hadmayaBefore?: string;
  hadmayaBeforeSub?: string;
  hadmayaAfter?: string;
  hadmayaAfterSub?: string;
  matterportTag?: string;
  matterportTitle?: string;
  matterportTitleAccent?: string;
  matterportDesc?: string;
  matterportStats?: { value: string; label: string }[];
  reelEyebrow?: string;
  reelTitleLine1?: string;
  reelTitleAccent?: string;
  reelTagline?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
};

type Props = {
  videoSrc?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryHref?: string;
  texts?: Texts;
  images?: {
    sky?: string;
    facade?: string;
    interior?: string;
    salon?: string;
    cuisine?: string;
    chambre?: string;
    sdb?: string;
    empty?: string;
    furnished?: string;
    poster?: string;
    visitRooms?: string[];
  };
};

const DEFAULTS = {
  videoSrc: 'https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1',
  images: {
    sky:       'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2200&q=80&auto=format&fit=crop',
    facade:    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2200&q=80&auto=format&fit=crop',
    interior:  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2200&q=80&auto=format&fit=crop',
    salon:     'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2200&q=80&auto=format&fit=crop',
    cuisine:   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2200&q=80&auto=format&fit=crop',
    chambre:   'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=2200&q=80&auto=format&fit=crop',
    sdb:       'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=2200&q=80&auto=format&fit=crop',
    empty:     'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=2200&q=80&auto=format&fit=crop',
    furnished: 'https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=2200&q=80&auto=format&fit=crop',
    poster:    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2200&q=80&auto=format&fit=crop',
    visitRooms: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=2200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=2200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=2200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=2200&q=80&auto=format&fit=crop',
    ],
  },
};

const DEFAULT_TEXTS: Required<Texts> = {
  brand: 'Studio Vision',
  brandSub: 'Cinématographie immobilière',
  chapters: ['01 — Studio Vision', '02 — Vue drone', '03 — Visite', '04 — Hadmaya', '05 — Matterport', '06 — Showreel'],
  introEyebrow: 'Studio Vision · Israël',
  introTitleLine1: "L'art de révéler",
  introTitleAccent: 'chaque espace',
  introSubtitle: 'Photo · Vidéo drone · Matterport · Hadmaya',
  scrollHint: 'Faites défiler',
  droneTag: 'Drone · Vidéo aérienne',
  droneTitle: 'Plans cinématiques en',
  droneTitleAccent: '4K',
  visiteLead: 'Photo · Visite des pièces',
  visiteCount: '04 espaces',
  rooms: [
    { num: '01 / 04 · Salon',         title: 'Lumière',         accent: 'traversante', desc: 'Cadrages larges au 16 mm, exposition équilibrée façade & intérieur — heure dorée privilégiée.' },
    { num: '02 / 04 · Cuisine',       title: 'Détails',         accent: 'matières',    desc: "Plans serrés sur les finitions, marbre, bois, laiton — le grain de l'image fait la différence." },
    { num: '03 / 04 · Chambre',       title: 'Volume &',        accent: 'intimité',    desc: 'Compositions feutrées, draps tendus, contre-jour maîtrisé pour révéler le calme du lieu.' },
    { num: '04 / 04 · Salle de bain', title: 'Architecture du', accent: 'détail',      desc: 'Réflexions, miroirs, robinetterie — un soin maniaque pour transformer une pièce technique en bijou.' },
  ],
  hadmayaTag: 'Hadmaya · Image de synthèse',
  hadmayaTitle: "L'acheteur",
  hadmayaTitleAccent: 'se projette.',
  hadmayaBefore: 'Avant',
  hadmayaBeforeSub: 'Pièce vide',
  hadmayaAfter: 'Après · Hadmaya',
  hadmayaAfterSub: 'Simulation meublée',
  matterportTag: 'Matterport · Visite 360°',
  matterportTitle: 'Une visite',
  matterportTitleAccent: 'immersive, 24h/24.',
  matterportDesc: "Plan 3D précis au centimètre, navigation libre, mesures intégrées. Les acheteurs visitent avant de se déplacer.",
  matterportStats: [
    { value: '·01', label: 'Scan 3D' },
    { value: '·1cm', label: 'Précision' },
    { value: '360°', label: 'Liberté' },
  ],
  reelEyebrow: 'Showreel · Auto-play',
  reelTitleLine1: 'Voir un bien',
  reelTitleAccent: 'autrement.',
  reelTagline: 'Photo · Drone · Matterport · Hadmaya',
  ctaPrimary: 'Découvrir nos tarifs →',
  ctaSecondary: 'Nous contacter',
};

export default function ScrollExperience({
  videoSrc = DEFAULTS.videoSrc,
  ctaPrimaryHref = '/tarifs',
  ctaSecondaryHref = '/contact',
  texts: textsOverride,
  images: imagesOverride,
}: Props) {
  const t: Required<Texts> = { ...DEFAULT_TEXTS, ...(textsOverride || {}) };
  const imgs = { ...DEFAULTS.images, ...(imagesOverride || {}) };

  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-act]'));
    const chapterButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-chapter]'));
    const chaptersEl = root.querySelector<HTMLElement>('.sv-chapters');
    const video = videoRef.current;

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    const update = () => {
      const vh = window.innerHeight;
      let activeIndex = 0;
      let bestScore = -Infinity;

      const rootRect = root.getBoundingClientRect();
      const rootInView = rootRect.bottom > 0 && rootRect.top < vh;
      if (chaptersEl) {
        chaptersEl.style.opacity = rootInView ? '' : '0';
        chaptersEl.style.pointerEvents = rootInView ? '' : 'none';
      }

      sections.forEach((s, i) => {
        const rect = s.getBoundingClientRect();
        const total = s.offsetHeight - vh;
        const raw = total > 0 ? -rect.top / total : 0;
        const p = clamp(raw, 0, 1);
        s.style.setProperty('--p', String(p));

        if (s.dataset.act === '2') {
          s.style.setProperty('--p2a', String(clamp(p / 0.4, 0, 1)));
          s.style.setProperty('--p2b', String(clamp((p - 0.25) / 0.4, 0, 1)));
          s.style.setProperty('--p2c', String(clamp((p - 0.65) / 0.35, 0, 1)));
        }
        if (s.dataset.act === '4') {
          s.style.setProperty('--p4', String(clamp((p - 0.1) / 0.8, 0, 1)));
        }
        if (s.dataset.act === '5') {
          s.style.setProperty('--p5', String(clamp((p - 0.05) / 0.85, 0, 1)));
        }

        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(vh, rect.bottom);
        const visible = Math.max(0, visibleBottom - visibleTop);
        if (visible > bestScore) { bestScore = visible; activeIndex = i; }
      });

      chapterButtons.forEach((b, i) => {
        b.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
      });

      if (video) {
        const act6 = sections.find(s => s.dataset.act === '6');
        if (act6) {
          const rect = act6.getBoundingClientRect();
          if (rect.top < vh * 0.6 && rect.bottom > 0 && video.paused) {
            video.play().catch(() => {});
          } else if ((rect.bottom <= 0 || rect.top >= vh) && !video.paused) {
            video.pause();
          }
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { update(); ticking = false; });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    const chapterHandlers: Array<() => void> = [];
    chapterButtons.forEach((b, i) => {
      const fn = () => sections[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      b.addEventListener('click', fn);
      chapterHandlers.push(() => b.removeEventListener('click', fn));
    });

    // Gold dust particles
    const dust = root.querySelector('.sv-act-1 .sv-dust');
    if (dust && !dust.hasChildNodes()) {
      for (let i = 0; i < 28; i++) {
        const s = document.createElement('span');
        const x = Math.random() * 100;
        const dx = (Math.random() - 0.5) * 200;
        const delay = Math.random() * 8;
        const duration = 6 + Math.random() * 6;
        s.style.left = x + '%';
        s.style.setProperty('--dx', String(dx));
        s.style.animationDelay = -delay + 's';
        s.style.animationDuration = duration + 's';
        dust.appendChild(s);
      }
    }

    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      chapterHandlers.forEach(fn => fn());
    };
  }, []);

  return (
    <div className="sv-root" ref={rootRef}>
      {/* Chapter indicator */}
      <aside className="sv-chapters" aria-label="Chapitres">
        {t.chapters.map((label, i) => (
          <button key={i} data-chapter={i + 1} aria-current={i === 0 ? 'true' : 'false'}>
            <span className="sv-label">{label}</span>
            <span className="sv-dot" />
          </button>
        ))}
      </aside>

      {/* ACT 1 — INTRO */}
      <section className="sv-act-1" data-act="1">
        <div className="sv-stage">
          <div className="sv-grain" />
          <div className="sv-dust" />
          <div className="sv-frame" />
          <div className="sv-center">
            <div className="sv-eyebrow sv-eyebrow-3d">{t.introEyebrow}</div>
            <div className="sv-title-stack">
              <div className="sv-layer sv-shadow">{t.introTitleLine1}<br /><em>{t.introTitleAccent}</em></div>
              <div className="sv-layer sv-mid">{t.introTitleLine1}<br /><em>{t.introTitleAccent}</em></div>
              <div className="sv-layer sv-front">{t.introTitleLine1}<br /><em>{t.introTitleAccent}</em></div>
            </div>
            <div className="sv-subtitle">{t.introSubtitle}</div>
          </div>
          <div className="sv-scroll-cue"><div className="sv-line" />{t.scrollHint}</div>
        </div>
      </section>

      {/* ACT 2 — DRONE */}
      <section className="sv-act-2" data-act="2">
        <div className="sv-stage">
          <div className="sv-sky"      style={{ backgroundImage: `linear-gradient(180deg, rgba(10,15,26,0) 0%, rgba(10,15,26,0.55) 100%), url(${imgs.sky})` }} />
          <div className="sv-facade"   style={{ backgroundImage: `linear-gradient(180deg, rgba(10,15,26,0.45) 0%, rgba(10,15,26,0.15) 35%, rgba(10,15,26,0.55) 100%), url(${imgs.facade})` }} />
          <div className="sv-interior" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,15,26,0.30) 0%, rgba(10,15,26,0.45) 100%), url(${imgs.interior})` }} />
          <div className="sv-vignette" />
          <div className="sv-hud">
            <div className="sv-crosshair">
              <span className="sv-tl" /><span className="sv-tr" /><span className="sv-bl" /><span className="sv-br" />
            </div>
            <div className="sv-corner sv-bl"><span>32°5′N · 34°7′E</span></div>
            <div className="sv-corner sv-bc"><span>● REC · 23.976 fps · 4K</span></div>
            <div className="sv-corner sv-br"><span>F/4 · 1/100 · ISO 200</span></div>
          </div>
          <div className="sv-caption">
            <span className="sv-service-tag">{t.droneTag}</span>
            <h2 className="sv-h">{t.droneTitle} <em>{t.droneTitleAccent}</em></h2>
          </div>
        </div>
      </section>

      {/* ACT 3 — HORIZONTAL ROOMS */}
      <section className="sv-act-3" data-act="3">
        <div className="sv-stage">
          <div className="sv-strip">
            <span className="sv-lead">{t.visiteLead}</span>
            <span className="sv-count">{t.visiteCount}</span>
          </div>
          <div className="sv-rail">
            {[imgs.salon, imgs.cuisine, imgs.chambre, imgs.sdb].map((src, i) => (
              <article
                key={i}
                className={`sv-room sv-r${i + 1}`}
                style={{ backgroundImage: `linear-gradient(180deg, rgba(10,15,26,0), rgba(10,15,26,0.45)), url(${src})` }}
              >
                <div className="sv-info">
                  <div className="sv-num">{t.rooms[i].num}</div>
                  <h3>{t.rooms[i].title} <em>{t.rooms[i].accent}</em></h3>
                  <p>{t.rooms[i].desc}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="sv-progress" />
        </div>
      </section>

      {/* ACT 4 — AVANT / APRÈS */}
      <section className="sv-act-4" data-act="4">
        <div className="sv-stage">
          <div className="sv-img sv-empty"    style={{ backgroundImage: `linear-gradient(180deg, rgba(10,15,26,0.1), rgba(10,15,26,0.45)), url(${imgs.empty})` }} />
          <div className="sv-img sv-furnished" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,15,26,0.1), rgba(10,15,26,0.35)), url(${imgs.furnished})` }} />
          <div className="sv-divider" />
          <div className="sv-label sv-before">{t.hadmayaBefore}<span className="sv-v">{t.hadmayaBeforeSub}</span></div>
          <div className="sv-label sv-after">{t.hadmayaAfter}<span className="sv-v">{t.hadmayaAfterSub}</span></div>
          <div className="sv-caption">
            <span className="sv-service-tag">{t.hadmayaTag}</span>
            <h2>{t.hadmayaTitle} <em>{t.hadmayaTitleAccent}</em></h2>
          </div>
        </div>
      </section>

      {/* ACT 5 — MATTERPORT WALKTHROUGH */}
      <section className="sv-act-5" data-act="5">
        <div className="sv-stage">

          {/* CSS 3D perspective corridor */}
          <div className="sv-wt-perspective">
            <div className="sv-wt-scene">
              {(imgs.visitRooms ?? []).map((src, i, arr) => {
                const isDestination = i === arr.length - 1;
                const num = String(arr.length - i).padStart(2, '0');
                const fadeStart = (i * 0.9 / (arr.length - 1)).toFixed(2);
                return (
                  <div
                    key={i}
                    className={`sv-wt-room${isDestination ? ' sv-wt-dest' : ''}`}
                    style={{
                      transform: `translateZ(${-i * 260}px)`,
                      ...(!isDestination && { ['--rfade' as string]: fadeStart }),
                    }}
                  >
                    <div className="sv-wt-photo" style={{ backgroundImage: `url(${src})` }} />
                    <div className="sv-wt-vignette" />
                    <span className="sv-wt-rlabel"><i>{num}</i>Hadmaya</span>
                    {isDestination && <div className="sv-wt-reticle" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation latérale — fil de pièces */}
          <nav className="sv-wt-nav" aria-label="Pièces visitées">
            {(imgs.visitRooms ?? []).map((_, i, arr) => (
              <div key={i} className="sv-wt-nav-item">
                <div className="sv-wt-nav-dot" />
                <span className="sv-wt-nav-lbl">{String(arr.length - i).padStart(2, '0')}</span>
              </div>
            ))}
          </nav>

          <div className="sv-caption">
            <span className="sv-service-tag">{t.matterportTag}</span>
            <h2>{t.matterportTitle} <em>{t.matterportTitleAccent}</em></h2>
            <p>{t.matterportDesc}</p>
          </div>
          <div className="sv-stats">
            {t.matterportStats.map((s, i) => (
              <div key={i} className="sv-stat"><span className="sv-v">{s.value}</span>{s.label}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ACT 6 — SHOWREEL */}
      <section className="sv-act-6" data-act="6">
        <div className="sv-stage">
          <video ref={videoRef} muted playsInline loop preload="metadata" poster={imgs.poster}>
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className="sv-overlay" />
          <div className="sv-reel-frame" />
          <div className="sv-reel-info"><span className="sv-rec" />REC</div>
          <div className="sv-reel-meta"><strong>{t.brand}</strong>{t.brandSub}</div>
          <div className="sv-center-block">
            <span className="sv-eyebrow">{t.reelEyebrow}</span>
            <h2>{t.reelTitleLine1}<br /><em>{t.reelTitleAccent}</em></h2>
            <div className="sv-tagline">{t.reelTagline}</div>
          </div>
          <div className="sv-cta-row">
            <a href={ctaPrimaryHref} className="sv-btn-primary">{t.ctaPrimary}</a>
            <a href={ctaSecondaryHref} className="sv-btn-ghost">{t.ctaSecondary}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
