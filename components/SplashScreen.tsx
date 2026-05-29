'use client';

import { useEffect, useRef, useState } from 'react';

const STUDIO = ['S', 't', 'u', 'd', 'i', 'o'] as const;
const VISION = ['V', 'i', 's', 'i', 'o', 'n'] as const;
const LD = (i: number) => `${(0.55 + i * 0.055).toFixed(3)}s`;
const TICK_DELAY = '1.430s';

// Module-level flag: false on hard refresh, true after the splash has played
// once in the current tab session. Never set server-side.
let splashHasPlayed = false;

export default function SplashScreen() {
  // On SPA return-navigation splashHasPlayed is already true → skip entirely
  const [alive, setAlive] = useState(!splashHasPlayed);
  const [show,  setShow]  = useState(!splashHasPlayed);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || splashHasPlayed) return;
    ran.current = true;
    splashHasPlayed = true;

    const t1 = window.setTimeout(() => setShow(false), 3400);
    const t2 = window.setTimeout(() => setAlive(false), 4300);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);

  if (!alive) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#0a0f1a]"
      style={{
        opacity: show ? 1 : 0,
        pointerEvents: show ? undefined : 'none',
        transition: 'opacity 0.9s ease-out',
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
      <div className="relative z-1 flex flex-col items-center" style={{ gap: '28px' }}>

        {/* Eyebrow */}
        <p
          className="text-[14px] md:text-[20px] uppercase text-[#b08d57] text-center px-4"
          style={{
            fontFamily: 'var(--font-jakarta), sans-serif',
            letterSpacing: '0.28em',
            opacity: 0,
            animation: 'sp-fade-in 0.7s ease-out 0.2s forwards',
          }}
        >
          Real estate cinematography
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
            <span
              key={`s${i}`}
              aria-hidden="true"
              style={{
                display: 'inline-block',
                opacity: 0,
                transform: 'translateY(10px)',
                filter: 'blur(4px)',
                animation: `sp-letter 0.6s cubic-bezier(.2,.7,.2,1) ${LD(i)} forwards`,
              }}
            >
              {char}
            </span>
          ))}

          {/* Gold dot */}
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              position: 'relative',
              color: '#b08d57',
              opacity: 0,
              transform: 'translateY(-32px)',
              animation: `sp-dot-drop 0.55s cubic-bezier(.5,.05,.4,1) ${LD(6)} forwards`,
            }}
          >
            .
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
          </span>

          {VISION.map((char, i) => (
            <span
              key={`v${i}`}
              aria-hidden="true"
              style={{
                display: 'inline-block',
                opacity: 0,
                transform: 'translateY(10px)',
                filter: 'blur(4px)',
                animation: `sp-letter 0.6s cubic-bezier(.2,.7,.2,1) ${LD(i + 7)} forwards`,
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Hairline divider */}
        <div
          aria-hidden="true"
          style={{
            width: 0,
            height: '1px',
            background: '#b08d57',
            animation: 'sp-div 0.9s cubic-bezier(.4,0,.2,1) 1.5s forwards',
          }}
        />

        {/* Baseline */}
        <p
          className="text-[22px] uppercase"
          style={{
            fontFamily: 'var(--font-jakarta), sans-serif',
            letterSpacing: '0.35em',
            color: 'rgba(255,255,255,0.40)',
            opacity: 0,
            animation: 'sp-fade-in 0.7s ease-out 1.85s forwards',
          }}
        >
          by Lior Haddad
        </p>
      </div>
    </div>
  );
}
