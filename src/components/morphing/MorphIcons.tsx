import React from 'react';
import { motion } from 'framer-motion';

type IconProps = { className?: string; size?: number; morphing?: boolean; stage?: 'fish' | 'prism' | 'crown' };

const FISH_PATH = "M2 12c4-8 14-8 19 0l3 3M2 12c4 8 14 8 19 0l3-3";
const PRISM_PATH = "M12 3L3 20h18L12 3zM12 3v17";
const CROWN_PATH = "M3 18h18l-2-10-5 4-2-6-2 6-5-4-2 10z";

// Category A: Draw & Refract (Fish -> Prism -> Crown)
export const MorphFish = ({ className = "", size = 24, morphing = false, stage = 'fish' }: IconProps) => {
  const pathD = stage === 'prism' ? PRISM_PATH : stage === 'crown' ? CROWN_PATH : FISH_PATH;
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      whileHover={{
        scale: 1.18,
        rotate: [0, -7, 7, -4, 0],
        y: [0, -2, 2, 0],
        filter: "drop-shadow(0 0 10px currentColor)",
      }}
      transition={{ duration: 0.75, ease: "easeInOut" }}
    >
      <motion.path
        d={pathD}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{
          d: pathD,
          pathLength: morphing ? [0.2, 1] : 1,
          opacity: morphing ? [0.65, 1] : 1,
        }}
        transition={{ duration: 0.65, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

// Category B: Primitive to Complex (Brain)
export const MorphBrain = ({ className = "", size = 24, morphing = false }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
      stroke="currentColor"
      strokeWidth="2"
      animate={{ 
        d: morphing ? "M9.5 2C5.91 2 3 4.91 3 8.5v7c0 3.59 2.91 6.5 6.5 6.5h5c3.59 0 6.5-2.91 6.5-6.5v-7C21 4.91 18.09 2 14.5 2h-5zM12 5v14m-3-7h6" : "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      whileHover={{ scale: 1.1 }}
    />
  </motion.svg>
);

// Category C: Expansion & Rotation
export const MorphRocket = ({ className = "", size = 24, morphing = false }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path
      d="M12 2l7 10-7-2-7 2 7-10z"
      stroke="currentColor"
      strokeWidth="2"
      animate={{ 
        d: morphing ? "M12 2v20M6 16l6 6 6-6M6 10l6 6 6-6" : "M12 2l7 10-7-2-7 2 7-10z"
      }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.1 }}
    />
  </motion.svg>
);

export const MorphZap = ({ className = "", size = 24, morphing = false }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ pathLength: morphing ? [0, 1] : 1 }}
      whileHover={{ filter: "drop-shadow(0 0 8px currentColor)" }}
      transition={{ duration: 0.5 }}
    />
  </motion.svg>
);

export const MorphEye = ({ className = "", size = 24, morphing = false }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path
      d="M2 12h20"
      stroke="currentColor"
      strokeWidth="2"
      animate={{ 
        d: morphing ? "M2 12c4-8 14-8 19 0l-19 0zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" : "M2 12h20"
      }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.1 }}
    />
  </motion.svg>
);

export const MorphSettings = ({ className = "", size = 24, morphing = false }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    <motion.path
      d="M12 12"
      stroke="currentColor"
      strokeWidth="2"
      animate={{ 
        d: morphing ? "M12 2v2M12 22v-2M2 12h2M22 12h-2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" : "M12 12"
      }}
      transition={{ duration: 0.4 }}
      whileHover={{ rotate: 90 }}
    />
  </motion.svg>
);
