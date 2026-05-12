'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import AdminDashboard from '../../components/AdminDashboard';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    }
    setLoading(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-serif text-2xl text-[#1a1410]">...</p>
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
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '0.5px solid rgba(255,255,255,0.5)',
        }}
      >
        <div className="text-center mb-10">
          <p className="font-serif text-2xl font-light text-[#1a1410] tracking-widest uppercase">
            Studio Vision
          </p>
          <p className="text-[9px] tracking-[3px] text-[#8b6914] uppercase mt-2">
            Administration
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] tracking-[2px] text-[#6b5d4a] uppercase">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#8b6914] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#1a1410] text-white text-[11px] tracking-[3px] uppercase py-4 rounded-full hover:bg-[#8b6914] transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? '...' : 'Connexion'}
          </button>
        </form>
      </div>
    </div>
  );
}
