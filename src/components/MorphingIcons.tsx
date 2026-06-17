import React from 'react';
import { motion } from 'framer-motion';

interface MorphingIconProps {
  isToggled: boolean;
  onClick?: () => void;
  className?: string;
  size?: number;
}

/**
 * 1. Morphing Sun & Moon Icon
 */
export const MorphingSunMoon: React.FC<MorphingIconProps> = ({
  isToggled,
  onClick,
  className = '',
  size = 24
}) => {
  const sunPath = "M12,4 A8,8 0 1,1 11.99,4 M12,2 Z";
  const moonPath = "M12,4 A8,8 0 0,0 20,12 A8,8 0 1,1 12,4 Z";

  return (
    <button onClick={onClick} className={`p-2 rounded-xl transition-all ${className}`}>
      <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <motion.path animate={{ d: isToggled ? sunPath : moonPath }} transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 15 }} />
      </motion.svg>
    </button>
  );
};

/**
 * 2. Morphing Compass (for Neural Command)
 */
export const MorphingCompass: React.FC<MorphingIconProps> = ({ isToggled, onClick, className = '', size = 24 }) => {
  const compassPath = "M12 2L2 12l10 10 10-10L12 2zm0 18l-8-8 8-8 8 8-8 8z";
  const activePath = "M12 2l4 4-4 4-4-4 4-4zm0 16l4-4-4-4-4 4 4 4z"; // Example of geometric morph

  return (
    <button onClick={onClick} className={className}>
       <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <motion.path animate={{ d: isToggled ? activePath : compassPath }} transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 15 }} />
      </motion.svg>
    </button>
  );
};
