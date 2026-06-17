import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

/**
 * The Neural Core - SVG Liquid Component
 * Represents the "Brain" of the ecosystem with 4 dynamic states.
 */
export const NeuralCore = ({ state = 'dormant' }: { state: 'dormant' | 'intake' | 'processing' | 'success' }) => {
  const variants = {
    dormant: { scale: 1, opacity: 0.6, rotate: 0 },
    intake: { scale: [1, 1.2, 1], opacity: 0.8, rotate: 10 },
    processing: { scale: [1, 1.1, 1], opacity: 1, rotate: 360 },
    success: { scale: [1, 1.3, 1], opacity: 1, rotate: 0 },
  };

  return (
    <motion.div 
      className="relative flex items-center justify-center p-4"
      variants={variants}
      animate={state}
      transition={{ duration: 2, repeat: state !== 'dormant' ? Infinity : 0, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
      <Brain className={`w-16 h-16 md:w-24 md:h-24 ${state === 'success' ? 'text-amber-400' : 'text-blue-400'}`} />
    </motion.div>
  );
};
