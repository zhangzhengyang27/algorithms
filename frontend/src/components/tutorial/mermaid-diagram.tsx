'use client';

import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useSettingsStore } from '@/store';

interface MermaidProps {
  chart: string;
}

// mermaid 把配色烘进生成的 SVG，所以主题必须作为 render 入参，不能只在 CSS 里换
const THEME_VARIABLES = {
  dark: {
    background: '#0a0a0a',
    primaryColor: '#1a1a1a',
    primaryTextColor: '#e5e5e5',
    primaryBorderColor: '#444',
    lineColor: '#888',
    secondaryColor: '#111',
    tertiaryColor: '#0a0a0a',
  },
  light: {
    background: '#ffffff',
    primaryColor: '#eef2ff',
    primaryTextColor: '#111827',
    primaryBorderColor: '#94a3b8',
    lineColor: '#64748b',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#ffffff',
  },
} as const;

type Theme = keyof typeof THEME_VARIABLES;

let initializedTheme: Theme | null = null;
function ensureInitialized(theme: Theme) {
  if (initializedTheme === theme) return;
  // mermaid 11：同一份配置 initialize 一次即可，换主题时要重新 initialize
  mermaid.initialize({
    startOnLoad: false,
    theme: theme === 'light' ? 'default' : 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    themeVariables: THEME_VARIABLES[theme],
  });
  initializedTheme = theme;
}

export function MermaidDiagram({ chart }: MermaidProps) {
  const id = useId().replace(/:/g, '_');
  const theme = useSettingsStore((s) => s.theme);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // mermaid 按 id 缓存节点，换主题重渲染必须换 id，否则拿回旧配色的图
  const seq = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        ensureInitialized(theme);
        const { svg: rendered } = await mermaid.render(`mmd-${id}-${seq.current++}`, chart.trim());
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id, theme]);

  // SSR + 客户端水合初期：直接显示源码（首屏可见，无空白）
  if (svg === null && !error) {
    return (
      <div className="my-6 p-4 bg-surface border border-edge rounded-lg overflow-x-auto">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-ink-3 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
          Mermaid · 渲染中（下方为源码）
        </div>
        <pre className="text-xs font-mono text-ink-2 whitespace-pre-wrap break-all m-0">
          {chart}
        </pre>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-500/5 border border-red-500/30 rounded-lg">
        <div className="text-xs text-err mb-2">Mermaid 渲染失败: {error}</div>
        <pre className="text-[11px] font-mono text-ink-3 whitespace-pre-wrap break-all m-0">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      className="my-6 p-4 bg-surface border border-edge rounded-lg overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg ?? '' }}
    />
  );
}
