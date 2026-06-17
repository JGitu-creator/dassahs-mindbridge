import React from 'react';
import { motion } from 'framer-motion';

/**
 * The Neural Core - SVG Liquid Component
 * Represents the "Brain" of the ecosystem with 4 dynamic states.
 */
export const NeuralCore = ({ state = 'dormant' }: { state: 'dormant' | 'intake' | 'processing' | 'success' }) => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="liquid-refraction">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="25" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <motion.circle
          cx="100" cy="100" r="80"
          className="fill-blue-500/20 stroke-blue-400 stroke-[3px]"
          filter="url(#liquid-refraction)"
          animate={{
            scale: state === 'dormant' ? [1, 1.03, 1] : state === 'processing' ? 1.2 : 1,
            opacity: state === 'dormant' ? 0.6 : 1,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-white font-bold text-sm uppercase tracking-widest">{state}</span>
      </div>
    </div>
  );
};
