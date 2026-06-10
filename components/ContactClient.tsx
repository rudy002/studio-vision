'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function ContactClient() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const isHe = locale === 'he';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', phone: '', role: '', message: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(false);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setSubmitError(true);
      }
    } catch (err) {
      console.error(err);
      setSubmitError(true);
    }
    setLoading(false);
  };

  const inputClass =
    `w-full bg-white border border-[#e0d8ce] rounded-xl px-4 py-3 text-[#1c1917] placeholder:text-[#b8b0a6] outline-none focus:border-[#b08d57] transition-colors ${isHe ? 'text-base' : 'text-sm'}`;

  const labelClass = isHe
    ? 'text-[13px] text-[#8a8078] uppercase mb-1.5 block'
    : 'text-[11px] tracking-[2px] text-[#8a8078] uppercase mb-1.5 block';

  const infoItems = [
    {
      label: t('info.locationLabel'),
      value: t('info.location'),
      ltr: false,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b08d57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      ),
    },
    {
      label: t('info.emailLabel'),
      value: t('info.email'),
      ltr: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b08d57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <polyline points="2,4 12,13 22,4"/>
        </svg>
      ),
    },
    {
      label: t('info.phoneLabel'),
      value: t('info.phone'),
      ltr: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b08d57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.07 2.18 2 2 0 012.05 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
        </svg>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          opacity: 0;
          animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.15s; }
        .fade-up-3 { animation-delay: 0.25s; }
        .fade-up-4 { animation-delay: 0.35s; }
        .fade-up-5 { animation-delay: 0.45s; }
        .fade-up-6 { animation-delay: 0.55s; }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">

        {/* ── Colonne gauche — info ── */}
        <div className={`flex flex-col justify-center px-8 md:px-16 lg:px-20 pt-36 pb-16 ${visible ? '' : 'invisible'}`}>

          <p className={`fade-up fade-up-1 text-[#b08d57] uppercase mb-6 ${isHe ? 'text-sm' : 'text-[11px] tracking-[4px]'}`}>
            {t('eyebrow')}
          </p>

          <h1 className={`fade-up fade-up-2 font-serif font-light text-white leading-tight mb-8 ${isHe ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'}`}>
            {t('title')}
          </h1>

          <div className="fade-up fade-up-3 w-12 h-px bg-[#b08d57] mb-8" />

          <p className={`fade-up fade-up-3 text-white/55 leading-relaxed mb-14 max-w-sm ${isHe ? 'text-base' : 'text-sm'}`}>
            {t('description')}
          </p>

          <div className="flex flex-col gap-7">
            {infoItems.map((item, i) => (
              <div
                key={item.label}
                className={`fade-up fade-up-${i + 4} flex items-center gap-4`}
              >
                <div
                  className="w-10 h-10 rounded-full flex-none flex items-center justify-center"
                  style={{ border: '1px solid rgba(176,141,87,0.3)', background: 'rgba(176,141,87,0.07)' }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className={`text-[#b08d57] uppercase mb-0.5 ${isHe ? 'text-[13px]' : 'text-[11px] tracking-[1.5px]'}`}>{item.label}</p>
                  <p className={`text-white/65 ${isHe ? 'text-base' : 'text-sm'}`} dir={item.ltr ? 'ltr' : undefined}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── Colonne droite — formulaire ── */}
        <div className="bg-[#f5f2ec] flex items-center px-8 md:px-12 lg:px-16 pt-36 pb-16">
          <div className={`w-full max-w-lg ${visible ? '' : 'invisible'}`}>

            {success ? (
              <div className="fade-up fade-up-1 text-center py-16">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-7"
                  style={{ border: '1px solid rgba(176,141,87,0.4)', background: 'rgba(176,141,87,0.08)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b08d57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl font-light text-[#1c1917] mb-3">{t('success.title')}</h2>
                <p className="text-sm text-[#8a8078]">{t('success.message')}</p>
              </div>
            ) : (
              <>
                <p className={`fade-up fade-up-2 text-[#b08d57] uppercase mb-2 ${isHe ? 'text-sm' : 'text-[11px] tracking-[3px]'}`}>{t('form.eyebrow')}</p>
                <h2 className={`fade-up fade-up-3 font-serif font-light text-[#1c1917] mb-8 ${isHe ? 'text-4xl' : 'text-3xl'}`}>
                  {t('form.title')}
                </h2>

                <form onSubmit={handleSubmit} className="fade-up fade-up-4 flex flex-col gap-5">

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('form.firstname')}</label>
                      <input name="firstname" type="text" onChange={handleChange} required
                        placeholder={t('form.firstname')} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('form.lastname')}</label>
                      <input name="lastname" type="text" onChange={handleChange} required
                        placeholder={t('form.lastname')} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>{t('form.email')}</label>
                    <input name="email" type="email" onChange={handleChange} required
                      placeholder={t('form.email')} className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>{t('form.phone')}</label>
                    <input name="phone" type="tel" onChange={handleChange}
                      placeholder={t('form.phone')} className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>{t('form.role')}</label>
                    <div className="flex gap-2 flex-wrap">
                      {(['buyer', 'seller', 'agent'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm({ ...form, role: r })}
                          className={`uppercase px-5 py-2 rounded-full border transition-all duration-200 cursor-pointer ${isHe ? 'text-sm' : 'text-[12px] tracking-[1px]'} ${
                            form.role === r
                              ? 'bg-[#b08d57] border-[#b08d57] text-white'
                              : 'border-[#d4cdc4] text-[#8a8078] hover:border-[#b08d57] hover:text-[#b08d57]'
                          }`}
                        >
                          {t(`form.${r}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>{t('form.message')}</label>
                    <textarea name="message" rows={4} onChange={handleChange} required
                      placeholder={t('form.message')}
                      className={inputClass + ' resize-none'} />
                  </div>

                  {submitError && (
                    <p className={`text-red-400/80 ${isHe ? 'text-sm' : 'text-[11px] tracking-[1px]'}`}>
                      {t('form.error')}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`mt-1 bg-[#0a0f1a] text-white uppercase py-4 rounded-full hover:bg-[#b08d57] transition-colors duration-300 cursor-pointer disabled:opacity-40 ${isHe ? 'text-base' : 'text-[12px] tracking-[3px]'}`}
                  >
                    {loading ? '…' : t('form.submit')}
                  </button>

                </form>
              </>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
