import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const PrismWeaver = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 700 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[500] pointer-events-none" aria-hidden="true">
      <motion.div
        className="w-12 h-12 rounded-full bg-blue-500/20 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
        style={{ x: springX, y: springY, marginLeft: -24, marginTop: -24 }}
      />
    </div>
  );
};
