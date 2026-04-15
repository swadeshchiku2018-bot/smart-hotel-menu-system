'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Utensils, Lock } from 'lucide-react';

export default function LoginClient({ hotelName, loginBg }: { hotelName: string, loginBg?: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false
    });
    
    if (res?.error) {
      alert("Invalid login details.");
      setLoading(false);
    } else {
      const session = await getSession();
      if ((session?.user as any)?.role === 'WAITER') {
         window.location.href = '/waiter';
      } else {
         window.location.href = '/admin';
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 z-0">
        {loginBg ? (
          <img src={loginBg} className="w-full h-full object-cover" alt="Background" />
        ) : (
          <div className="w-full h-full bg-slate-900" />
        )}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-10">
        <div className="p-8 pb-6 border-b border-slate-200/50 dark:border-slate-800/50 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{hotelName}</h2>
          <p className="text-slate-500 text-sm mt-1 font-bold">Authorized Personnel Only</p>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                placeholder="admin or waiter ID"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 transition hover:bg-opacity-90 disabled:opacity-50 mt-4 shadow-lg shadow-primary/30"
            >
              <Lock className="w-5 h-5" /> {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
