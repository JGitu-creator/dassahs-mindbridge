import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-8 md:p-24 font-sans leading-relaxed">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-black text-white italic">Terms of Neural Link</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Dassah's-Prism | Effective April 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">1. Acceptance of Mandate</h2>
          <p>By establishing a Neural Link with Dassah's-Prism, you acknowledge that this tool is designed for cognitive optimization and is provided "as-is." You agree to use the Prism for lawful, sovereign purposes.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">2. Neural Boundaries</h2>
          <p>Users are responsible for the data they choose to refract. We strictly advise against inputting highly sensitive personal identifiers (SSNs, passwords). You retain full ownership of your cognitive output.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">3. Sovereignty & Termination</h2>
          <p>You may sever your Neural Link at any time. We reserve the right to recalibrate or suspend access to ensure the stability and safety of the Divine Server for all users.</p>
        </section>

        <footer className="pt-12 border-t border-white/10">
          <a href="/" className="text-blue-400 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">← Return to the Prism</a>
        </footer>
      </div>
    </div>
  );
}
