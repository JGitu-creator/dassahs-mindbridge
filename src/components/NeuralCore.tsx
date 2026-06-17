import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

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
      
      {/* Brain Icon Core */}
      <div className="relative z-10 p-4 bg-[var(--color-bg)] rounded-full">
         <Brain size={48} className="text-[var(--prism-1)]" />
      </div>
    </motion.div>
  );
};
