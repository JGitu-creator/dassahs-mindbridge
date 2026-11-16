import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const StackedThemeSelector = ({ themes, activeTheme, onThemeSelect }: { 
  themes: any[], 
  activeTheme: string, 
  onThemeSelect: (id: string) => void 
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:hidden">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeSelect(theme.id)}
              aria-pressed={isActive}
              className={`min-h-[44px] px-3 py-2 rounded-2xl apple-glass border transition-all flex items-center gap-2 ${
                isActive ? 'border-blue-500 ring-2 ring-blue-500/40 opacity-100 scale-[1.02]' : 'border-white/10 opacity-75 hover:opacity-100'
              }`}
            >
              <theme.icon size={18} style={{ color: theme.stroke }} />
              <span className="theme-selector-label rounded-lg px-2 py-0.5 text-center text-[9px] font-black uppercase tracking-wide whitespace-nowrap border">
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
      <div className="hidden sm:flex relative h-24 w-full items-center justify-center">
        {themes.map((theme, i) => {
          const isActive = activeTheme === theme.id;
          const offset = i - (themes.indexOf(themes.find(t => t.id === activeTheme)));

          return (
            <motion.button
              key={theme.id}
              type="button"
              onHoverStart={() => setHoveredIdx(i)}
              onHoverEnd={() => setHoveredIdx(null)}
              onClick={() => onThemeSelect(theme.id)}
              className="absolute p-3 rounded-2xl apple-glass border border-white/10 shadow-2xl z-10 transition-all flex min-w-24 flex-col items-center gap-2"
              animate={{
                x: offset * 40,
                scale: hoveredIdx === i ? 1.2 : (isActive ? 1 : 0.8),
                rotate: hoveredIdx === i ? 0 : offset * 5,
                opacity: isActive || hoveredIdx === i ? 1 : 0.6,
              }}
              whileHover={{ y: -20 }}
            >
              <theme.icon size={24} style={{ color: theme.stroke }} />
              <motion.span
                initial={{ opacity: 0.75, y: 4 }}
                animate={{ opacity: hoveredIdx === i || isActive ? 1 : 0.75, y: 0 }}
                className="theme-selector-label rounded-lg px-2 py-1 text-center text-[9px] font-black uppercase tracking-wide whitespace-nowrap border shadow-xl"
              >
                {theme.name}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </>
  );
};
