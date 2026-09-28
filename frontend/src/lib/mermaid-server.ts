// 服务端 mermaid 预校验：在 React server component 中调用，提前把失败的图表变为纯文本
// 避免客户端闪一下红框再变成"渲染失败"

import 'server-only';

let mermaidModule: typeof import('mermaid').default | null = null;

async function getMermaid() {
  if (mermaidModule) return mermaidModule;
  const domMod = await import('jsdom').catch(() => null);
  const JSDOM = domMod
    ? (domMod as unknown as { JSDOM: new (html: string, opts?: object) => { window: unknown } }).JSDOM
    : null;
  if (JSDOM) {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'http://localhost/',
    });
    const g = globalThis as unknown as Record<string, unknown>;
    const keys = [
      'document',
      'window',
      'HTMLElement',
      'HTMLAnchorElement',
      'Node',
      'NodeFilter',
      'SVGElement',
      'Element',
      'DOMParser',
      'XMLSerializer',
      'CSSStyleSheet',
      'localStorage',
      'getComputedStyle',
      'Image',
      'location',
      'history',
      'HTMLDivElement',
    ];
    const w = dom.window as unknown as Record<string, unknown>;
    for (const k of keys) {
      const v = w[k];
      if (v !== undefined && g[k] === undefined) g[k] = v;
    }
  }
  const mod = await import('mermaid');
  mermaidModule = mod.default;
  mermaidModule.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'strict',
    fontFamily: 'inherit',
  });
  return mermaidModule;
}

const MERMAID_RE = /```mermaid\s*\n([\s\S]*?)```/g;

export interface MermaidBlock {
  fullMatch: string;
  chart: string;
  index: number;
}

/**
 * 提取所有 mermaid 代码块；返回块列表（顺序保留）。
 * 在 server component 中执行是同步的（仅字符串扫描）。
 */
export function extractMermaidBlocks(content: string): MermaidBlock[] {
  const blocks: MermaidBlock[] = [];
  let m: RegExpExecArray | null;
  MERMAID_RE.lastIndex = 0;
  while ((m = MERMAID_RE.exec(content))) {
    blocks.push({ fullMatch: m[0], chart: m[1], index: m.index });
  }
  return blocks;
}

export type PrevalidateResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * 异步预校验单个 mermaid 语法；在 server component 中调用，失败的话客户端
 * 不会再去跑 mermaid.render，而是直接显示源码 + 错误信息。
 */
export async function prevalidateMermaid(chart: string): Promise<PrevalidateResult> {
  try {
    const m = await getMermaid();
    await m.parse(chart.trim());
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
