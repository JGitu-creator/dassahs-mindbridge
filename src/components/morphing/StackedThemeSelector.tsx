import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const StackedThemeSelector = ({ themes, activeTheme, onThemeSelect }: { 
  themes: any[], 
  activeTheme: string, 
  onThemeSelect: (id: string) => void 
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="relative h-24 w-full flex items-center justify-center">
      {themes.map((theme, i) => {
        const isActive = activeTheme === theme.id;
        const offset = i - (themes.indexOf(themes.find(t => t.id === activeTheme)));
        
        return (
          <motion.button
            key={theme.id}
            onHoverStart={() => setHoveredIdx(i)}
            onHoverEnd={() => setHoveredIdx(null)}
            onClick={() => onThemeSelect(theme.id)}
            className="absolute p-4 rounded-3xl apple-glass border border-white/10 shadow-2xl z-10 transition-all flex flex-col items-center gap-2"
            animate={{
              x: offset * 40,
              scale: hoveredIdx === i ? 1.2 : (isActive ? 1 : 0.8),
              rotate: hoveredIdx === i ? 0 : offset * 5,
              opacity: isActive || hoveredIdx === i ? 1 : 0.6,
            }}
            whileHover={{ y: -20 }}
          >
            <theme.icon size={24} style={{ color: theme.stroke }} />
            { (hoveredIdx === i || isActive) && (
              <motion.span 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="theme-selector-label absolute -top-10 bg-black/80 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded-md whitespace-nowrap border border-white/10 shadow-xl"
              >
                {theme.name}
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
