import React from 'react';

export const BionicText = ({
  text,
  onWordSelect,
}: {
  text: string;
  onWordSelect?: (word: string) => void;
}) => {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className="break-words [overflow-wrap:anywhere]">
      {words.map((word, i) => {
        const cleaned = word.replace(/^[^a-zA-Z0-9\u00C0-\u024F]+|[^a-zA-Z0-9\u00C0-\u024F]+$/g, '').trim();
        const canSelect = Boolean(onWordSelect && cleaned.length >= 3 && cleaned.length <= 60);
        const mid = Math.ceil(word.length / 2);
        const trailingSpace = i < words.length - 1 ? ' ' : '';

        if (canSelect && onWordSelect) {
          return (
            <React.Fragment key={i}>
              <span
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
                className="inline rounded-md px-0.5 cursor-pointer transition-colors hover:bg-blue-500/15 active:bg-blue-500/25 focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <span className="font-bold">{word.slice(0, mid)}</span>
                <span className="font-normal">{word.slice(mid)}</span>
              </span>
              {trailingSpace}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={i}>
            <span className="inline">
              <span className="font-bold">{word.slice(0, mid)}</span>
              <span className="font-normal">{word.slice(mid)}</span>
            </span>
            {trailingSpace}
          </React.Fragment>
        );
      })}
    </span>
  );
};
