'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCheckoutUrl } from '@/lib/lemon-squeezy';

type Provider = 'openrouter' | 'abacus';

export default function SelectProviderPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsVisible, setCreditsVisible] = useState(false);
  const [selected, setSelected] = useState<Provider>('openrouter');
  const [pendingDoc, setPendingDoc] = useState<string | null>(null);

  useEffect(() => {
    const visible = localStorage.getItem('prism_credits_visible') === 'true';
    setCreditsVisible(visible);
    const doc = sessionStorage.getItem('prism_pending_document');
    setPendingDoc(doc);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/credits', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((d) => setCredits(d.balance ?? null))
      .catch(() => {});
  }, [user]);

  const toggleCreditsVisible = () => {
    const next = !creditsVisible;
    setCreditsVisible(next);
    localStorage.setItem('prism_credits_visible', String(next));
  };

  const handleContinue = () => {
    sessionStorage.setItem('prism_selected_provider', selected);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1009] text-amber-200">
        <p className="text-lg">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#1a1009] text-amber-200 p-8">
        <h1 className="text-3xl font-bold text-amber-400">Dassah&apos;s Prism</h1>
        <p className="text-center max-w-md text-amber-200/80">
          Sign in to choose your AI provider and track your credits.
        </p>
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/select-provider` },
            })
          }
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-8 py-3 rounded-xl transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1009] text-amber-200 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-amber-400">Choose Your Mind</h1>
          <p className="text-amber-200/70 text-sm">
            Select the AI provider for this session.
            {pendingDoc && <span className="block mt-1 text-amber-300/60">📎 Document ready to send.</span>}
          </p>
        </div>

        {/* Credits Bar */}
        <div className="flex items-center justify-between bg-[#2a1a0a] border border-amber-900/40 rounded-xl px-5 py-3">
          <span className="text-sm text-amber-300">Your Credits</span>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-amber-400">
              {creditsVisible ? (credits !== null ? credits : '—') : '••••'}
            </span>
            <button
              onClick={toggleCreditsVisible}
              aria-label={creditsVisible ? 'Hide credits' : 'Show credits'}
              className="text-amber-500/60 hover:text-amber-400 transition text-sm"
            >
              {creditsVisible ? '🙈' : '👁️'}
            </button>
            <a
              href={getCheckoutUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-amber-600 hover:bg-amber-500 text-black font-semibold px-3 py-1.5 rounded-lg transition"
            >
              Top Up
            </a>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* OpenRouter Card */}
          <button
            onClick={() => setSelected('openrouter')}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
              selected === 'openrouter'
                ? 'border-amber-500 bg-amber-900/30'
                : 'border-amber-900/30 bg-[#1f1208] hover:border-amber-700/60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-amber-300">OpenRouter</span>
                  <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full border border-green-800/50">
                    Free
                  </span>
                </div>
                <p className="text-sm text-amber-200/60">Llama 3.3 70B · Community tier · Uses credits</p>
              </div>
              {selected === 'openrouter' && <span className="text-amber-400 text-xl">✓</span>}
            </div>
          </button>

          {/* Abacus Card */}
          <button
            onClick={() => setSelected('abacus')}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
              selected === 'abacus'
                ? 'border-amber-500 bg-amber-900/30'
                : 'border-amber-900/30 bg-[#1f1208] hover:border-amber-700/60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-amber-300">Abacus.AI RouteLLM</span>
                  <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded-full border border-amber-800/50">
                    Premium
                  </span>
                </div>
                <p className="text-sm text-amber-200/60">Optimized routing · Higher quality · Uses credits</p>
              </div>
              {selected === 'abacus' && <span className="text-amber-400 text-xl">✓</span>}
            </div>
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-2xl text-lg transition"
        >
          Continue with {selected === 'openrouter' ? 'OpenRouter' : 'Abacus.AI'}
        </button>

        <p className="text-center text-xs text-amber-200/30">
          Signed in as {user.email}
        </p>
      </div>
    </div>
  );
}
