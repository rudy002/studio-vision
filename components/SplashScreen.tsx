'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const STUDIO = ['S', 't', 'u', 'd', 'i', 'o'] as const;
const VISION = ['V', 'i', 's', 'i', 'o', 'n'] as const;

// Delay for letter at position i in the full wordmark array (dot included at idx 6)
const LD = (i: number) => `${(0.55 + i * 0.055).toFixed(3)}s`;

// Dot lands at 0.880s + 0.550s drop = 1.430s → tick fires then
const TICK_DELAY = '1.430s';

export default function SplashScreen() {
  const t = useTranslations('splash');

  const [phase, setPhase] = useState<'playing' | 'fading' | 'gone'>(() => {
    if (typeof window === 'undefined') return 'playing';
    return sessionStorage.getItem('sv-splash-played') ? 'gone' : 'playing';
  });

  const [reducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (phase !== 'playing') return;
    sessionStorage.setItem('sv-splash-played', '1');
    document.body.setAttribute('aria-busy', 'true');

    // Standard speed: sequence ends ~2.55s, 1s hold → fade at 3.55s, remove at 4.45s
    // Reduced motion: 400ms fade-in, 250ms hold → fade at 650ms, remove at 1.55s
    const fadeAt = reducedMotion ? 650 : 3550;
    const removeAt = fadeAt + 900;

    const t1 = setTimeout(() => setPhase('fading'), fadeAt);
    const t2 = setTimeout(() => {
      setPhase('gone');
      document.body.removeAttribute('aria-busy');
    }, removeAt);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, reducedMotion]);

  if (phase === 'gone') return null;

  const rm = reducedMotion;
  const fading = phase === 'fading';

  const letterStyle = (idx: number): React.CSSProperties =>
    rm
      ? { display: 'inline-block' }
      : {
          display: 'inline-block',
          opacity: 0,
          transform: 'translateY(10px)',
          filter: 'blur(4px)',
          animation: `sp-letter 0.6s cubic-bezier(.2,.7,.2,1) ${LD(idx)} forwards`,
        };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0f1a]"
      style={{
        opacity: fading ? 0 : 1,
        visibility: fading ? 'hidden' : 'visible',
        pointerEvents: fading ? 'none' : undefined,
        transition: 'opacity 0.9s ease-out, visibility 0.9s ease-out',
      }}
    >
      {/* Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Stack */}
      <div
        className="relative z-[1] flex flex-col items-center"
        style={
          rm
            ? { gap: '28px', opacity: 0, animation: 'sp-fade-in 0.4s ease-out forwards' }
            : { gap: '28px' }
        }
      >
        {/* Eyebrow */}
        <p
          className="text-[11px] uppercase text-[#b08d57]"
          style={{
            fontFamily: 'var(--font-jakarta), sans-serif',
            letterSpacing: '0.36em',
            ...(rm
              ? {}
              : { opacity: 0, animation: 'sp-fade-in 0.7s ease-out 0.2s forwards' }),
          }}
        >
          {t('eyebrow')}
        </p>

        {/* Wordmark */}
        <div
          aria-label="Studio.Vision"
          className="flex whitespace-nowrap"
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontWeight: 300,
            fontSize: 'clamp(56px, 7vw, 88px)',
            lineHeight: 1,
            letterSpacing: '-0.015em',
            color: '#ffffff',
          }}
        >
          {STUDIO.map((char, i) => (
            <span key={`s${i}`} aria-hidden="true" style={letterStyle(i)}>
              {char}
            </span>
          ))}

          {/* Gold dot — drops from above, triggers tick ring */}
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              position: 'relative',
              color: '#b08d57',
              ...(rm
                ? {}
                : {
                    opacity: 0,
                    transform: 'translateY(-32px)',
                    animation: `sp-dot-drop 0.55s cubic-bezier(.5,.05,.4,1) ${LD(6)} forwards`,
                  }),
            }}
          >
            .
            {!rm && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: '1px solid #b08d57',
                  opacity: 0,
                  animation: `sp-tick 0.7s ease-out ${TICK_DELAY} forwards`,
                }}
              />
            )}
          </span>

          {VISION.map((char, i) => (
            <span key={`v${i}`} aria-hidden="true" style={letterStyle(i + 7)}>
              {char}
            </span>
          ))}
        </div>

        {/* Gold hairline divider */}
        <div
          aria-hidden="true"
          style={
            rm
              ? { width: '96px', height: '1px', background: '#b08d57' }
              : {
                  width: 0,
                  height: '1px',
                  background: '#b08d57',
                  animation: 'sp-div 0.9s cubic-bezier(.4,0,.2,1) 1.5s forwards',
                }
          }
        />

        {/* Baseline */}
        <p
          className="text-[13px] uppercase"
          style={{
            fontFamily: 'var(--font-jakarta), sans-serif',
            letterSpacing: '0.35em',
            color: 'rgba(255,255,255,0.40)',
            ...(rm
              ? {}
              : { opacity: 0, animation: 'sp-fade-in 0.7s ease-out 1.85s forwards' }),
          }}
        >
          {t('baseline')}
        </p>
      </div>
    </div>
  );
}
