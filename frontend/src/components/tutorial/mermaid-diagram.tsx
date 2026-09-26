'use client';

import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

let mermaidInitialized = false;
function ensureInitialized() {
  if (mermaidInitialized) return;
  // mermaid 11：相同配置下 initialize 一次即可
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    themeVariables: {
      background: '#0a0a0a',
      primaryColor: '#1a1a1a',
      primaryTextColor: '#e5e5e5',
      primaryBorderColor: '#444',
      lineColor: '#888',
      secondaryColor: '#111',
      tertiaryColor: '#0a0a0a',
    },
  });
  mermaidInitialized = true;
}

export function MermaidDiagram({ chart }: MermaidProps) {
  const id = useId().replace(/:/g, '_');
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        ensureInitialized();
        const { svg: rendered } = await mermaid.render(`mmd-${id}`, chart.trim());
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
  }, [chart, id]);

  // SSR + 客户端水合初期：直接显示源码（首屏可见，无空白）
  if (svg === null && !error) {
    return (
      <div className="my-6 p-4 bg-[#0a0a0a] border border-[#222222] rounded-lg overflow-x-auto">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-500 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
          Mermaid · 渲染中（下方为源码）
        </div>
        <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all m-0">
          {chart}
        </pre>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-500/5 border border-red-500/30 rounded-lg">
        <div className="text-xs text-red-400 mb-2">Mermaid 渲染失败: {error}</div>
        <pre className="text-[11px] font-mono text-gray-400 whitespace-pre-wrap break-all m-0">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      className="my-6 p-4 bg-[#0a0a0a] border border-[#222222] rounded-lg overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg ?? '' }}
    />
  );
}
