'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, FlaskConical } from 'lucide-react';
import { Stepper, type VizStep } from '@/components/visualizer/stepper';
import { traceSolution, parseTestInput } from '@/lib/solution-tracer';
import { tracePythonSolution } from '@/lib/python-tracer';
import { traceJavaSolution } from '@/lib/java-tracer';

// ─── 语言标签 ────────────────────────────────────────────────────────────────

const LANG_LABEL: Record<string, string> = {
  javascript: 'JavaScript',
  java: 'Java',
  python: 'Python',
};

// ─── 指针配色 ───────────────────────────────────────────────────────────────

const POINTER_COLORS = [
  { cell: 'bg-yellow-500/30 border-yellow-400 text-yellow-200', badge: 'bg-yellow-500 text-black' },
  { cell: 'bg-blue-500/30 border-blue-400 text-blue-200', badge: 'bg-blue-500 text-white' },
  { cell: 'bg-green-500/30 border-green-400 text-green-200', badge: 'bg-green-500 text-black' },
  { cell: 'bg-purple-500/30 border-purple-400 text-purple-200', badge: 'bg-purple-500 text-white' },
  { cell: 'bg-pink-500/30 border-pink-400 text-pink-200', badge: 'bg-pink-500 text-white' },
  { cell: 'bg-orange-500/30 border-orange-400 text-orange-200', badge: 'bg-orange-500 text-black' },
];

// ─── 类型 ───────────────────────────────────────────────────────────────────

interface SolState {
  vars: Record<string, any>;
  desc: string;
  done?: boolean;
}

interface SolutionStepperProps {
  code: string;
  /** 题解语言：javascript / java / python（决定用哪个追踪器） */
  language: string;
  testCases: { input: string; expected: string }[];
  title?: string;
}

// ─── 辅助分析 ───────────────────────────────────────────────────────────────

/** 判断是否为"可展示的数字数组" */
function isNumberArray(v: any): v is number[] {
  return Array.isArray(v) && v.length >= 2 && v.every(x => typeof x === 'number');
}

/** 从源码中检测数组的指针变量名（如 nums[i]、nums[L]） */
function detectPointerNames(code: string, arrayName: string): string[] {
  const re = new RegExp(`${arrayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[([A-Za-z_$][\\w$]*)\\]`, 'g');
  const names = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) names.add(m[1]);
  return [...names];
}

/** 格式化变量值为字符串 */
function fmt(v: any, maxLen = 48): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return JSON.stringify(v);
  try {
    const s = JSON.stringify(v);
    return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s;
  } catch { return String(v); }
}

// ─── 组件 ───────────────────────────────────────────────────────────────────

export function SolutionStepper({ code, language, testCases, title }: SolutionStepperProps) {
  const [caseIdx, setCaseIdx] = useState(0);

  // 解析测试用例
  const parsedCases = useMemo(() => {
    return testCases.map(tc => {
      try {
        return { ...tc, parsed: parseTestInput(tc.input), error: null as string | null };
      } catch (e) {
        return { ...tc, parsed: null, error: e instanceof Error ? e.message : String(e) };
      }
    }).filter(c => c.parsed !== null);
  }, [testCases]);

  // 执行追踪（按语言分发到对应追踪器）
  const trace = useMemo(() => {
    const c = parsedCases[caseIdx];
    if (!c?.parsed) return null;
    try {
      if (language === 'java') return traceJavaSolution(code, c.parsed.fnName, c.parsed.args);
      if (language === 'python') return tracePythonSolution(code, c.parsed.args, c.parsed.fnName);
      return traceSolution(code, c.parsed.args, c.parsed.fnName);
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [code, language, parsedCases, caseIdx]);

  // 指针检测（基于源码中的 arr[var] 模式）
  const pointerInfo = useMemo(() => {
    if (!trace || 'error' in trace) return { arrayName: null, pointers: [] as string[] };
    // 找主数组：步骤快照中第一个数字数组
    let arrayName: string | null = null;
    for (const step of trace.steps) {
      for (const [k, v] of Object.entries(step.vars)) {
        if (isNumberArray(v)) { arrayName = k; break; }
      }
      if (arrayName) break;
    }
    if (!arrayName) return { arrayName: null, pointers: [] };
    const pointers = detectPointerNames(code, arrayName);
    return { arrayName, pointers };
  }, [trace, code]);

  // 错误 / 空状态
  if (parsedCases.length === 0) {
    return <EmptyState msg="该题目暂无可运行的测试用例" />;
  }
  if (!trace) return <EmptyState msg="加载中…" />;
  if ('error' in trace) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <AlertTriangle size={28} className="text-amber-500" />
        <div className="text-ink-2 text-sm">题解代码暂不支持可视化执行</div>
        <div className="text-ink-3 text-xs font-mono max-w-md">{(trace as any).error}</div>
      </div>
    );
  }

  const { steps, result, codeLines, truncated } = trace;
  const { arrayName, pointers } = pointerInfo;

  // 映射为 Stepper 步骤
  const vizSteps: VizStep<SolState>[] = steps.map(s => ({
    state: { vars: s.vars, desc: s.desc, done: s.done },
    description: s.desc,
    codeLine: s.line,
  }));

  const initialState: SolState = { vars: {}, desc: '' };

  // 指针颜色分配
  const pointerColor = (name: string) => {
    const idx = pointers.indexOf(name);
    return POINTER_COLORS[idx % POINTER_COLORS.length];
  };

  const renderState = (state: SolState) => {
    const { vars } = state;
    const arr = arrayName ? vars[arrayName] : null;

    // 初始步骤（尚无变量）：展示函数调用信息
    if (Object.keys(vars).length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <FlaskConical size={24} className="text-brand/60" />
          <div className="text-sm text-ink-2 font-mono">{state.desc}</div>
          <div className="text-xs text-ink-3">点击“下一步”或播放按钮，逐行查看题解执行过程</div>
        </div>
      );
    }

    // 当前步骤指向主数组的指针
    const activePointers = pointers
      .filter(p => Number.isInteger(vars[p]))
      .map(p => ({ name: p, idx: vars[p] as number }));

    // 标量变量（非数组、非指针）
    const scalars = Object.entries(vars).filter(
      ([k, v]) => k !== arrayName && !Array.isArray(v) && !pointers.includes(k) && typeof v !== 'object',
    );
    // 次要数组（如 ans）
    const secondaryArrays = Object.entries(vars).filter(
      ([k, v]) => k !== arrayName && Array.isArray(v),
    );

    return (
      <div className="space-y-5">
        {/* 图例 */}
        {activePointers.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center text-xs">
            {activePointers.map(p => (
              <span key={p.name} className={clsx('px-1.5 py-0.5 rounded font-mono text-[10px]', pointerColor(p.name).badge)}>
                {p.name} = {p.idx}
              </span>
            ))}
          </div>
        )}

        {/* 主数组 */}
        {Array.isArray(arr) && (
          <div className="space-y-1">
            <div className="text-xs text-ink-3 font-mono">{arrayName}[]</div>
            <div className="flex gap-1 flex-wrap justify-center">
              {arr.map((v: number, i: number) => {
                const ptrsHere = activePointers.filter(p => p.idx === i);
                const color = ptrsHere.length > 0 ? pointerColor(ptrsHere[0].name) : null;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={clsx(
                        'w-10 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                        color
                          ? clsx(color.cell, 'border scale-110 shadow-lg')
                          : 'bg-surface-2 border-edge-2 text-ink-2',
                      )}
                    >
                      {v}
                    </div>
                    <div className="text-[9px] text-ink-3 font-mono">{i}</div>
                    {/* 指针徽章 */}
                    <div className="flex gap-0.5 min-h-[16px]">
                      {ptrsHere.map(p => (
                        <span key={p.name} className={clsx('px-1 rounded text-[9px] font-mono leading-4', pointerColor(p.name).badge)}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 标量变量监视 */}
        {scalars.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {scalars.map(([k, v]) => (
              <span key={k} className="px-2 py-1 rounded bg-surface-2 border border-edge text-xs font-mono text-ink-2">
                <span className="text-ink-3">{k}</span> = <span className="text-brand">{fmt(v, 24)}</span>
              </span>
            ))}
          </div>
        )}

        {/* 次要数组（如结果集 ans） */}
        {secondaryArrays.map(([k, v]) => (
          <div key={k} className="space-y-1">
            <div className="text-xs text-ink-3 font-mono">{k} <span className="text-ink-3/60">({(v as any[]).length})</span></div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {(v as any[]).length === 0
                ? <span className="text-xs text-ink-3/60">空</span>
                : (v as any[]).map((item, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-green-500/15 border border-green-500/40 text-xs font-mono text-green-300">
                    {fmt(item, 32)}
                  </span>
                ))}
            </div>
          </div>
        ))}

        {/* 最终结果 */}
        {state.done && (
          <div className="text-center p-3 bg-green-500/10 border border-green-500/40 rounded-lg">
            <span className="text-green-300 font-mono text-sm">✅ 返回 {fmt(result)}</span>
          </div>
        )}

        {/* 截断提示 */}
        {truncated && state.done && (
          <div className="text-center text-xs text-amber-400">步骤过多，仅展示前 {steps.length} 步</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* 测试用例选择 */}
      <div className="flex flex-wrap items-center gap-3">
        <FlaskConical size={15} className="text-ink-3" />
        <span className="text-sm text-ink-3">测试用例:</span>
        <select
          value={caseIdx}
          onChange={e => setCaseIdx(Number(e.target.value))}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm font-mono max-w-full"
        >
          {parsedCases.map((c, i) => (
            <option key={i} value={i}>{c.input}</option>
          ))}
        </select>
        {title && <span className="text-xs text-ink-3/60">{title}</span>}
      </div>

      <Stepper<SolState>
        steps={vizSteps}
        initialState={initialState}
        codeLines={codeLines}
        codeTitle={`题解代码 · ${LANG_LABEL[language] ?? language}`}
        render={renderState}
      />
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-ink-3 text-sm">
      {msg}
    </div>
  );
}
