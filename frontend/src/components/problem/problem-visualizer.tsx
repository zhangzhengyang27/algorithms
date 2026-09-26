'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { SolutionStepper } from '@/components/problem/solution-stepper';

/**
 * 题目可视化：直接执行当前题目的题解代码，逐行展示算法运行过程。
 * 支持 JavaScript / Java / Python 三种语言，可切换查看各自题解的执行可视化。
 */

/** 可被追踪器解释执行的语言（按优先级排序） */
const TRACEABLE_LANGS = ['javascript', 'java', 'python'] as const;

const LANG_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  java: 'Java',
  python: 'Python',
};

interface ProblemVisualizerProps {
  /** 题解代码映射 { javascript: '...', java: '...', python: '...' } */
  solutions: Record<string, string>;
  /** 测试用例 */
  testCases: { input: string; expected: string }[];
  /** 题目标题（用于展示） */
  title?: string;
}

export function ProblemVisualizer({ solutions, testCases, title }: ProblemVisualizerProps) {
  // 可用的可追踪语言（javascript 兼容 js 别名）
  const normalized: Record<string, string> = { ...(solutions ?? {}) };
  if (!normalized.javascript && normalized.js) normalized.javascript = normalized.js;

  const available = TRACEABLE_LANGS.filter(l => normalized[l]);
  const [lang, setLang] = useState<string>(available[0] ?? '');

  if (available.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-ink-3 text-sm mb-2">该题目暂无可可视化执行的题解（JavaScript / Java / Python）</div>
        <div className="text-ink-3/60 text-xs">
          已有题解语言：{Object.keys(solutions ?? {}).join(' / ') || '无'}
        </div>
      </div>
    );
  }

  const code = normalized[lang] ?? '';

  return (
    <div className="anim-fade-in space-y-3">
      {/* 语言选择器 */}
      <div className="flex gap-1 flex-wrap border-b border-edge">
        {available.map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={clsx(
              'px-3 py-1.5 text-[11px] font-mono transition-colors cursor-pointer border-b-2 -mb-px',
              lang === l
                ? 'border-brand text-brand'
                : 'border-transparent text-ink-3 hover:text-ink',
            )}
          >
            {LANG_LABELS[l] ?? l}
          </button>
        ))}
      </div>

      <SolutionStepper
        key={lang}
        code={code}
        language={lang}
        testCases={testCases}
        title={title}
      />
    </div>
  );
}
