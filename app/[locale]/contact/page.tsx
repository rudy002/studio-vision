'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', phone: '', role: '', message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const inputClass =
    'w-full bg-white border border-[#e0d8ce] rounded-xl px-4 py-3 text-sm text-[#1c1917] placeholder:text-[#b8b0a6] outline-none focus:border-[#b08d57] transition-colors';

  const labelClass = 'text-[9px] tracking-[2.5px] text-[#8a8078] uppercase mb-1.5 block';

  const infoItems = [
    {
      label: 'Localisation',
      value: t('info.location'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b08d57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      ),
    },
    {
      label: 'Email',
      value: t('info.email'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b08d57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <polyline points="2,4 12,13 22,4"/>
        </svg>
      ),
    },
    {
      label: 'Téléphone',
      value: t('info.phone'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b08d57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.07 2.18 2 2 0 012.05 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
        </svg>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">

        {/* ── Colonne gauche — info ── */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-20 pt-36 pb-16">

          <p className="text-[10px] tracking-[5px] text-[#b08d57] uppercase mb-6">
            {t('eyebrow')}
          </p>

          <h1 className="font-serif text-4xl md:text-5xl font-light text-white leading-tight mb-8">
            {t('title')}
          </h1>

          {/* Ligne dorée */}
          <div className="w-12 h-px bg-[#b08d57] mb-8" />

          <p className="text-sm text-white/55 leading-relaxed mb-14 max-w-sm">
            {t('description')}
          </p>

          {/* Info items */}
          <div className="flex flex-col gap-7">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex-none flex items-center justify-center"
                  style={{ border: '1px solid rgba(176,141,87,0.3)', background: 'rgba(176,141,87,0.07)' }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-[9px] tracking-[2px] text-[#b08d57] uppercase mb-0.5">{item.label}</p>
                  <p className="text-sm text-white/65">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── Colonne droite — formulaire ── */}
        <div className="bg-[#f5f2ec] flex items-center px-8 md:px-12 lg:px-16 pt-36 pb-16">
          <div className="w-full max-w-lg">

            {success ? (
              <div className="text-center py-16">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-7"
                  style={{ border: '1px solid rgba(176,141,87,0.4)', background: 'rgba(176,141,87,0.08)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b08d57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl font-light text-[#1c1917] mb-3">Message envoyé</h2>
                <p className="text-sm text-[#8a8078]">Nous vous répondrons dans les plus brefs délais.</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] tracking-[4px] text-[#b08d57] uppercase mb-2">Formulaire</p>
                <h2 className="font-serif text-3xl font-light text-[#1c1917] mb-8">
                  Votre message
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  {/* Prénom / Nom */}
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

                  {/* Email */}
                  <div>
                    <label className={labelClass}>{t('form.email')}</label>
                    <input name="email" type="email" onChange={handleChange} required
                      placeholder={t('form.email')} className={inputClass} />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className={labelClass}>{t('form.phone')}</label>
                    <input name="phone" type="tel" onChange={handleChange}
                      placeholder={t('form.phone')} className={inputClass} />
                  </div>

                  {/* Rôle — pills */}
                  <div>
                    <label className={labelClass}>{t('form.role')}</label>
                    <div className="flex gap-2 flex-wrap">
                      {(['buyer', 'seller', 'agent'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm({ ...form, role: r })}
                          className={`text-[11px] tracking-[1.5px] uppercase px-5 py-2 rounded-full border transition-all duration-200 cursor-pointer ${
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

                  {/* Message */}
                  <div>
                    <label className={labelClass}>{t('form.message')}</label>
                    <textarea name="message" rows={4} onChange={handleChange} required
                      placeholder={t('form.message')}
                      className={inputClass + ' resize-none'} />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 bg-[#0a0f1a] text-white text-[11px] tracking-[3px] uppercase py-4 rounded-full hover:bg-[#b08d57] transition-colors duration-300 cursor-pointer disabled:opacity-40"
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
