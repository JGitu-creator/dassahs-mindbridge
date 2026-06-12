import React from 'react';

export const ProgressPrism = ({ progress }: { progress: number }) => {
  return (
    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
      <div 
        className="bg-blue-500 h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
