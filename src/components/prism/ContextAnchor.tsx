import React from 'react';
import { Anchor, Zap, Shield, Heart } from 'lucide-react';

export const ContextAnchor = ({ data, isOpen, onToggle }: { data: any, isOpen: boolean, onToggle: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-slate-900/90 backdrop-blur-xl border-l border-white/10 p-6 z-[300] overflow-y-auto">
      <h2 className="text-white font-black uppercase tracking-widest flex items-center gap-2 mb-6">
        <Anchor size={16} /> Neural Anchors
      </h2>
      {/* Anchors content based on data */}
    </div>
  );
};
