import React, { useState } from 'react';
import { Anchor, X, Maximize2 } from 'lucide-react';

export const ContextAnchor = ({ data, isOpen, onToggle }: { data: any, isOpen: boolean, onToggle: () => void }) => {
  if (!isOpen) {
    return (
      <button 
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-blue-600 p-3 rounded-full shadow-lg hover:scale-110 transition-all z-[300]"
        title="Open Neural Anchors"
      >
        <Anchor size={20} className="text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-72 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-[300]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-black uppercase tracking-widest flex items-center gap-2">
          <Anchor size={14} /> Anchors
        </h2>
        <button onClick={onToggle} className="text-slate-400 hover:text-white">
          <X size={16} />
        </button>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {/* Anchors content based on data */}
        <p className="text-slate-400 text-xs">Anchor content here...</p>
      </div>
    </div>
  );
};
