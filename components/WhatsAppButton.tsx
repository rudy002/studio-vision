'use client';

import { useEffect, useState, useRef } from 'react';

const WA_MESSAGES: Record<string, string> = {
  fr: 'Bonjour, je suis intéressé(e) par vos services de photographie et vidéo immobilière. Seriez-vous disponible pour en discuter ?',
  en: 'Hello, I am interested in your real estate photography and video services. Would you be available to discuss my project?',
  he: 'שלום, אני מעוניין/ת בשירותי הצילום והוידאו שלכם לנדל"ן. האם תוכלו ליצור איתי קשר?',
};

export default function WhatsAppButton() {
  const [url, setUrl] = useState('https://wa.me/972537084374');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const locale = document.documentElement.lang || 'fr';
    const message = WA_MESSAGES[locale] ?? WA_MESSAGES.fr;
    setUrl(`https://wa.me/972537084374?text=${encodeURIComponent(message)}`);
  }, []);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setVisible(false);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(true), 1500);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes wa-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .wa-float { animation: wa-float 3s ease-in-out infinite; }
        .wa-float:hover { animation: none; transform: scale(1.08) !important; transition: transform 0.2s; }
        .wa-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          width: 48px;
          height: 48px;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .wa-btn.hidden {
          opacity: 0;
          transform: translateY(12px);
          pointer-events: none;
        }
        @media (min-width: 768px) {
          .wa-btn {
            width: 56px;
            height: 56px;
            bottom: 28px;
            right: 28px;
          }
        }
      `}</style>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className={`wa-btn${visible ? '' : ' hidden'}`}
      >
        <span
          className="wa-float"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
            cursor: 'pointer',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            width="26"
            height="26"
            fill="white"
            style={{ display: 'block', flexShrink: 0 }}
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        </span>
      </a>
    </>
  );
}
