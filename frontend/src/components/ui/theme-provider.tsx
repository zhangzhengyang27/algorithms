'use client';

import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store';

/**
 * Syncs the persisted theme setting to <html> class so CSS variables switch,
 * and dynamically loads the matching highlight.js code-block theme.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const hljsLinkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const isLight = theme === 'light';
    root.classList.toggle('light', isLight);

    // ── Swap highlight.js theme stylesheet (local, no CDN dependency) ──
    const href = isLight
      ? '/hljs/github.css'
      : '/hljs/github-dark.css';

    if (hljsLinkRef.current) {
      hljsLinkRef.current.href = href;
    } else {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.id = 'hljs-theme';
      document.head.appendChild(link);
      hljsLinkRef.current = link;
    }
  }, [theme]);

  return <>{children}</>;
}
