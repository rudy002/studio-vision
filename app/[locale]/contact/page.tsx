'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', phone: '', role: '', message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  return (
    <main className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #e8dfd4 0%, #d4c9b8 50%, #c8b99a 100%)' }}>
      <div className="grid grid-cols-2 min-h-[calc(100vh-80px)]">

        {/* Colonne gauche */}
        <div className="bg-[#1a1410] p-20 flex flex-col justify-center">
          <p className="text-[10px] tracking-[4px] text-[#8b6914] uppercase mb-6">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-5xl font-light text-white leading-tight mb-8">
            {t('title')}
          </h1>
          <p className="text-sm text-white/50 leading-relaxed mb-16">
            {t('description')}
          </p>

          <div className="flex flex-col gap-6">
            {[
              { icon: '📍', label: 'Localisation', value: t('info.location') },
              { icon: '📧', label: 'Email', value: t('info.email') },
              { icon: '📱', label: 'Téléphone', value: t('info.phone') },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#8b6914]/20 flex items-center justify-center text-lg">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[9px] tracking-[2px] text-[#8b6914] uppercase mb-1">{item.label}</p>
                  <p className="text-sm text-white/70">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite */}
        <div className="flex items-center justify-center p-16">
          <div
            className="w-full max-w-lg rounded-3xl p-10"
            style={{
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '0.5px solid rgba(255,255,255,0.5)'
            }}
          >
            {success ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-6">✅</div>
                <h2 className="font-serif text-3xl font-light text-[#1a1410] mb-4">Message envoyé !</h2>
                <p className="text-sm text-[#6b5d4a]">Nous vous répondrons dans les plus brefs délais.</p>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-3xl font-light text-[#1a1410] mb-8">{t('form.role')}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">{t('form.firstname')}</label>
                      <input name="firstname" type="text" onChange={handleChange} required
                        className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914] transition-colors"
                        placeholder={t('form.firstname')} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">{t('form.lastname')}</label>
                      <input name="lastname" type="text" onChange={handleChange} required
                        className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914] transition-colors"
                        placeholder={t('form.lastname')} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">{t('form.email')}</label>
                    <input name="email" type="email" onChange={handleChange} required
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914] transition-colors"
                      placeholder={t('form.email')} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">{t('form.phone')}</label>
                    <input name="phone" type="tel" onChange={handleChange}
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914] transition-colors"
                      placeholder={t('form.phone')} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">{t('form.role')}</label>
                    <select name="role" onChange={handleChange}
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914] transition-colors appearance-none cursor-pointer">
                      <option value="">{t('form.role')}</option>
                      <option value="buyer">{t('form.buyer')}</option>
                      <option value="seller">{t('form.seller')}</option>
                      <option value="agent">{t('form.agent')}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">{t('form.message')}</label>
                    <textarea name="message" rows={4} onChange={handleChange} required
                      className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914] transition-colors resize-none"
                      placeholder={t('form.message')} />
                  </div>

                  <button type="submit" disabled={loading}
                    className="mt-2 bg-[#1a1410] text-white text-[11px] tracking-[3px] uppercase py-4 rounded-full hover:bg-[#8b6914] transition-colors cursor-pointer disabled:opacity-50">
                    {loading ? '...' : t('form.submit')}
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