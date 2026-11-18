import React from 'react';

export const BionicText = ({
  text,
  onWordSelect,
}: {
  text: string;
  onWordSelect?: (word: string) => void;
}) => {
  return (
    <span>
      {text.split(' ').map((word, i) => {
        const cleaned = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').trim();
        const canSelect = Boolean(onWordSelect && cleaned.length >= 3 && cleaned.length <= 60);
        const mid = Math.ceil(word.length / 2);

        if (canSelect && onWordSelect) {
          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onWordSelect(cleaned);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onWordSelect(cleaned);
                }
              }}
              title={`Tap to inspect “${cleaned}” in Prism Lens`}
              className="mr-1 inline-block rounded-md px-0.5 -mx-0.5 cursor-pointer transition-colors hover:bg-blue-500/15 active:bg-blue-500/25 focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <span className="font-bold">{word.slice(0, mid)}</span>
              <span className="font-normal">{word.slice(mid)}</span>
            </span>
          );
        }

        return (
          <span key={i} className="mr-1">
            <span className="font-bold">{word.slice(0, mid)}</span>
            <span className="font-normal">{word.slice(mid)}</span>
          </span>
        );
      })}
    </span>
  );
};
