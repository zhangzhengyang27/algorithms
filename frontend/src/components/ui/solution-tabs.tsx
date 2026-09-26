'use client';

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('sql', sql);

const LANG_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  python: 'Python',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  rust: 'Rust',
  sql: 'SQL',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  pgsql: 'PostgreSQL',
};

interface SolutionTabsProps {
  solutions: Record<string, string>;
}

export function SolutionTabs({ solutions }: SolutionTabsProps) {
  const langs = Object.keys(solutions).filter((k) => solutions[k]);
  const [active, setActive] = useState<string>(langs[0] ?? 'javascript');
  const codeRef = useRef<HTMLElement>(null);

  // 切换语言或内容变化时重新高亮
  useEffect(() => {
    const el = codeRef.current;
    if (!el) return;
    delete el.dataset.highlighted;
    el.className = `language-${active} hljs`;
    el.textContent = solutions[active] ?? '';
    try {
      hljs.highlightElement(el);
    } catch {
      el.textContent = solutions[active] ?? '';
    }
  }, [active, solutions]);

  if (langs.length === 0) return null;

  return (
    <div className="mt-3 anim-fade-in">
      {/* Tab bar */}
      <div className="flex gap-1 mb-0 flex-wrap border-b border-edge">
        {langs.map((lang) => (
          <button
            key={lang}
            onClick={() => setActive(lang)}
            className={clsx(
              'px-3 py-1.5 text-[11px] font-mono transition-colors cursor-pointer border-b-2 -mb-px',
              active === lang
                ? 'border-brand text-brand'
                : 'border-transparent text-ink-3 hover:text-ink'
            )}
          >
            {LANG_LABELS[lang] ?? lang}
          </button>
        ))}
      </div>

      {/* Code block with syntax highlighting */}
      <pre className="p-4 bg-surface rounded-b-md border border-t-0 border-edge overflow-x-auto max-h-[550px] overflow-y-auto">
        <code ref={codeRef} className={`language-${active} text-[13px] font-mono`}>
          {solutions[active]}
        </code>
      </pre>

      <button
        onClick={() => navigator.clipboard.writeText(solutions[active])}
        className="mt-2 px-2.5 py-1 text-[11px] text-ink-3 hover:text-ink bg-surface-2 rounded transition-colors cursor-pointer"
      >
        复制代码
      </button>
    </div>
  );
}
