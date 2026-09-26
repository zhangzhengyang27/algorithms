'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import clsx from 'clsx';

interface CodePanelProps {
  /** Array of code lines (0-indexed internally, displayed 1-indexed) */
  codeLines: string[];
  /** Currently highlighted line number (1-based) */
  highlightLine: number;
  /** Description text shown next to the highlight indicator */
  description?: string;
  /** Title for the panel */
  title?: string;
}

export function CodePanel({
  codeLines,
  highlightLine,
  description = '',
  title = '算法代码',
}: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep highlighted line visible
  useEffect(() => {
    if (highlightRef.current && codeRef.current) {
      const container = codeRef.current;
      const line = highlightRef.current;
      const containerRect = container.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();

      if (lineRect.top < containerRect.top || lineRect.bottom > containerRect.bottom) {
        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightLine]);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl border border-edge overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-surface-2 border border-edge text-ink-3 hover:text-ink hover:border-edge-2 transition-colors"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? '已复制' : '复制代码'}
        </button>
      </div>

      {/* Highlight info */}
      <div className="px-4 py-2 text-xs text-ink-3 border-b border-edge">
        <span className="text-ink-3">当前高亮行: </span>
        <span className="text-brand font-mono">{highlightLine}</span>
        {description && (
          <span className="ml-2 text-ink-3">({description})</span>
        )}
      </div>

      {/* Code area */}
      <div
        ref={codeRef}
        className="flex-1 overflow-auto py-2 font-mono text-[13px] leading-[1.7]"
      >
        {codeLines.map((line, idx) => {
          const lineNum = idx + 1;
          const isHighlighted = lineNum === highlightLine;
          return (
            <div
              key={idx}
              ref={isHighlighted ? highlightRef : undefined}
              className={clsx(
                'flex px-4 transition-colors duration-150',
                isHighlighted
                  ? 'bg-brand/15 border-l-2 border-brand'
                  : 'border-l-2 border-transparent hover:bg-ink/[0.03]'
              )}
            >
              {/* Line number */}
              <span
                className={clsx(
                  'select-none w-8 text-right mr-4 shrink-0',
                  isHighlighted ? 'text-brand' : 'text-ink-3'
                )}
              >
                {lineNum}
              </span>
              {/* Code content */}
              <span
                className={clsx(
                  'whitespace-pre',
                  isHighlighted ? 'text-ink' : 'text-ink-2'
                )}
              >
                <HighlightedCode code={line} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Simple syntax highlighting for JavaScript keywords */
function HighlightedCode({ code }: { code: string }) {
  if (!code.trim()) return <>{' '}</>;

  // Simple token-based highlighting
  const tokens = tokenize(code);
  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} className={token.className}>{token.text}</span>
      ))}
    </>
  );
}

interface Token {
  text: string;
  className: string;
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  // Regex to match JS keywords, strings, comments, numbers
  const regex = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:function|const|let|var|if|else|for|while|return|break|continue|new|this|typeof|instanceof|true|false|null|undefined)\b)|(\b\d+\.?\d*\b)/gm;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      tokens.push({ text: code.slice(lastIndex, match.index), className: '' });
    }

    if (match[1]) {
      // Comment
      tokens.push({ text: match[1], className: 'text-gray-500 italic' });
    } else if (match[2]) {
      // String
      tokens.push({ text: match[2], className: 'text-green-400' });
    } else if (match[3]) {
      // Keyword
      tokens.push({ text: match[3], className: 'text-purple-400' });
    } else if (match[4]) {
      // Number
      tokens.push({ text: match[4], className: 'text-orange-400' });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < code.length) {
    tokens.push({ text: code.slice(lastIndex), className: '' });
  }

  return tokens.length > 0 ? tokens : [{ text: code, className: '' }];
}
