import React from 'react';
import { Anchor, X, CheckCircle2, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ContextAnchor = ({ data, isOpen, onToggle }: { data: any, isOpen: boolean, onToggle: () => void }) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-[300]"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-black uppercase tracking-widest flex items-center gap-2">
                <Anchor size={14} /> Anchors
              </h2>
              <button onClick={onToggle} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {data ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb size={15} className="mt-0.5 shrink-0 text-amber-400" />
                    <p className="text-slate-200 text-xs leading-relaxed">{data.whyCare || 'Use this anchor to return to the reason this material matters.'}</p>
                  </div>
                  {data.tldr?.slice(0, 3).map((item: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                      <p className="text-slate-300 text-xs leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs">No anchor data available yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button 
          onClick={onToggle}
          className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-blue-300/40 bg-blue-600 shadow-lg hover:scale-110 transition-all z-[300]"
          title="Open context anchor"
          aria-label="Open context anchor"
        >
          <Anchor size={20} className="text-white" />
        </button>
      )}
    </>
  );
};
