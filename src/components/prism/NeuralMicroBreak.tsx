import React from 'react';
import { motion } from 'framer-motion';

export const NeuralMicroBreak = ({ level, onComplete }: { level: number, onComplete: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-blue-900/90 z-[500] flex flex-col items-center justify-center text-white"
    >
      <h2 className="text-4xl font-black mb-4">Neural Rhythm: Level {level}</h2>
      <button onClick={onComplete} className="px-8 py-3 bg-white text-black font-bold rounded-full">Continue</button>
    </motion.div>
  );
};
