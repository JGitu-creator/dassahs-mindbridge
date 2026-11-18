import React from 'react';

export const ProgressPrism = ({ progress, label }: { progress: number; label?: string }) => {
  const safeProgress = Math.max(0, Math.min(1, progress));
  return (
    <div className="w-full" aria-label={label || `Progress ${Math.round(safeProgress * 100)} percent`}>
      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
      <div 
        className="bg-blue-500 h-full transition-all duration-300"
        style={{ width: `${safeProgress * 100}%` }}
      />
      </div>
      {label && <p className="mt-2 text-center text-[9px] font-black uppercase tracking-[0.2em] text-[var(--fg)]/60">{label}</p>}
    </div>
  );
};
