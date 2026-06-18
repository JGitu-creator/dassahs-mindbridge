import React from 'react';
import { motion } from 'framer-motion';

type IconProps = { className?: string; size?: number };

// Category A: Draw & Refract (Fish)
export const MorphFish = ({ className = "", size = 24 }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path
      d="M2 12c4-8 14-8 19 0l3 3M2 12c4 8 14 8 19 0l3-3"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      whileHover={{ pathLength: 1, opacity: 1, filter: "drop-shadow(0 0 8px currentColor)" }}
      transition={{ duration: 1, ease: "easeInOut" }}
    />
  </motion.svg>
);

// Category B: Primitive to Complex (Brain)
export const MorphBrain = ({ className = "", size = 24 }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
      stroke="currentColor"
      strokeWidth="2"
      whileHover={{ 
        d: "M9.5 2C5.91 2 3 4.91 3 8.5v7c0 3.59 2.91 6.5 6.5 6.5h5c3.59 0 6.5-2.91 6.5-6.5v-7C21 4.91 18.09 2 14.5 2h-5zM12 5v14m-3-7h6",
        strokeWidth: "2"
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
  </motion.svg>
);

// Category C: Expansion & Rotation
export const MorphRocket = ({ className = "", size = 24 }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path
      d="M12 2l7 10-7-2-7 2 7-10z"
      stroke="currentColor"
      strokeWidth="2"
      whileHover={{ 
        d: "M12 2v20M6 16l6 6 6-6M6 10l6 6 6-6",
        scale: 1.1
      }}
      transition={{ duration: 0.3 }}
    />
  </motion.svg>
);

export const MorphZap = ({ className = "", size = 24 }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      whileHover={{ pathLength: 1, filter: "drop-shadow(0 0 8px currentColor)" }}
      transition={{ duration: 0.5 }}
    />
  </motion.svg>
);

export const MorphEye = ({ className = "", size = 24 }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path
      d="M2 12h20"
      stroke="currentColor"
      strokeWidth="2"
      whileHover={{ 
        d: "M2 12c4-8 14-8 19 0l-19 0zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
        scale: 1.1
      }}
      transition={{ duration: 0.3 }}
    />
  </motion.svg>
);

export const MorphSettings = ({ className = "", size = 24 }: IconProps) => (
  <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    <motion.path
      d="M12 12"
      stroke="currentColor"
      strokeWidth="2"
      whileHover={{ 
        d: "M12 2v2M12 22v-2M2 12h2M22 12h-2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41",
        rotate: 90
      }}
      transition={{ duration: 0.4 }}
    />
  </motion.svg>
);
