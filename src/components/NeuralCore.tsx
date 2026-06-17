import React from 'react';
import { motion } from 'framer-motion';

/**
 * The Reactive Neural Core
 * Represents the "Brain" of the ecosystem with 4 high-fidelity states:
 * Dormant, Intake (Pulse), Processing (Bloom), Success (Bloom).
 */
export const NeuralCore = ({ state = 'dormant' }: { state: 'dormant' | 'intake' | 'processing' | 'success' }) => {
  const containerVariants = {
    dormant: { scale: 1, filter: "hue-rotate(0deg) blur(0px)" },
    intake: { scale: [1, 1.2, 1], filter: "hue-rotate(90deg) blur(2px)" },
    processing: { scale: [1, 1.1, 1], filter: "hue-rotate(180deg) blur(0px)" },
    success: { scale: [1, 1.5, 1], filter: "hue-rotate(270deg) blur(0px)" },
  };

  const coreVariants = {
    dormant: { opacity: 0.5, boxShadow: "0 0 20px var(--prism-1)" },
    intake: { opacity: 0.8, boxShadow: "0 0 40px var(--prism-2)" },
    processing: { opacity: 1, boxShadow: "0 0 60px var(--prism-3)" },
    success: { opacity: 1, boxShadow: "0 0 100px var(--prism-4)" },
  };

  return (
    <motion.div 
      className="relative flex items-center justify-center p-6"
      variants={containerVariants}
      animate={state}
      transition={{ 
        duration: state === 'processing' ? 1.5 : 2, 
        repeat: state !== 'dormant' ? Infinity : 0, 
        ease: "easeInOut" 
      }}
    >
      {/* Reactive Glow Layer */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-prism-1 via-prism-2 to-prism-4"
        variants={coreVariants}
        animate={state}
      />
      
      {/* Core Liquid SVG */}
      <svg width="120" height="120" viewBox="0 0 120 120" className="relative z-10">
        <defs>
          <linearGradient id="prismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--prism-1)" />
            <stop offset="100%" stopColor="var(--prism-4)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M60 10 C 20 10, 10 40, 10 60 C 10 80, 20 110, 60 110 C 100 110, 110 80, 110 60 C 110 40, 100 10, 60 10 Z"
          fill="url(#prismGrad)"
          animate={{
            d: state === 'processing' 
              ? "M60 5 C 30 5, 5 30, 5 60 C 5 90, 30 115, 60 115 C 90 115, 115 90, 115 60 C 115 30, 90 5, 60 5 Z"
              : "M60 10 C 20 10, 10 40, 10 60 C 10 80, 20 110, 60 110 C 100 110, 110 80, 110 60 C 110 40, 100 10, 60 10 Z"
          }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        />
      </svg>
    </motion.div>
  );
};
