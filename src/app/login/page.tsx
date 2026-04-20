'use client';

import { useState, FormEvent } from 'react';
import { login, register } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const { setUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'login' ? login : register;
      const { user } = await fn(username.trim(), password);
      setUser(user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-stone-900 font-black text-lg">AI</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-100 tracking-tight">NexChat</h1>
          <p className="text-stone-500 text-sm mt-1">AI Chat · RAG · Streaming</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <div className="flex bg-stone-800 rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === m ? 'bg-amber-400 text-stone-900' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {m === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="contoh: budi123"
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400/60 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="minimal 6 karakter"
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400/60 transition-all"
                required
              />
            </div>

            {error && (
              <div className="flex gap-2 items-center bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-xs text-red-400">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:bg-stone-700 disabled:text-stone-500 text-stone-900 font-semibold rounded-xl text-sm transition-all active:scale-[0.98]"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-stone-900/40 border-t-stone-900 rounded-full animate-spin" />
                    {mode === 'login' ? 'Masuk...' : 'Mendaftar...'}
                  </span>
                : mode === 'login' ? 'Masuk' : 'Buat Akun'
              }
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-stone-700 mt-4">Powered by Claude API</p>
      </div>
    </div>
  );
}
