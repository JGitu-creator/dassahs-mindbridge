import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-8 md:p-24 font-sans leading-relaxed">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-black text-white italic">Privacy Policy</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Dassah's Prism | Effective April 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">1. Cognitive Sovereignty</h2>
          <p>Dassah's Prism is built on the principle that your thoughts and data are your own. We do not sell, rent, or trade your neural profiles or refracted data to third parties.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">2. Data Processing</h2>
          <p>We use Google Gemini AI models to process your inputs. This data is handled according to Google's standard enterprise data protection protocols. We only store history if you choose to "Anchor to Vault" by signing in.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">3. User Rights</h2>
          <p>You have the absolute right to erasure. You can request the deletion of your account and all associated history at any time through the "Neural Identity" settings.</p>
        </section>

        <footer className="pt-12 border-t border-white/10">
          <a href="/" className="text-blue-400 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">← Return to the Prism</a>
        </footer>
      </div>
    </div>
  );
}
