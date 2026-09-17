'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import AdminDashboard from '../../components/AdminDashboard';
import { SpinRing } from '../../components/loaders';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Mot de passe incorrect');
      setLoading(false);
    } else {
      setLoading(false);
      setDone(true);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3">
        <SpinRing size="sm" light />
        <span className="text-xs tracking-label uppercase text-[#6b5d4a]/70 font-light">
          Synchronisation des médias
        </span>
      </div>
    );
  }

  if (session) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div
        className="w-full max-w-sm rounded-3xl p-10"
        style={{
          background: '#fff',
          border: '1px solid color-mix(in srgb, var(--ink) 10%, transparent)',
        }}
      >
        <div className="text-center mb-10">
          <p className="font-serif text-2xl font-light text-[#1a1410] tracking-ui uppercase">
            Studio Vision
          </p>
          <p className="text-xs tracking-label text-gold-on-light uppercase mt-2">
            Administration
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-label text-[#6b5d4a] uppercase">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-gold-on-light transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || done}
            className={[
              'mt-2 text-xs tracking-ui uppercase py-4 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-2',
              loading
                ? 'bg-transparent border border-gold-on-light/55 text-gold'
                : done
                ? 'bg-transparent border border-gold-on-light/55 text-gold'
                : 'bg-[#1a1410] text-white hover:bg-gold-on-light disabled:opacity-50',
            ].join(' ')}
          >
            {loading ? (
              <>
                <SpinRing size="sm" />
                Chargement…
              </>
            ) : done ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l5 5L20 7" stroke="var(--gold-on-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Confirmé
              </>
            ) : (
              'Connexion'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
