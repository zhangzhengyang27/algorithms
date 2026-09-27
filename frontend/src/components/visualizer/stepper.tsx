'use client';

import { Play, Pause, SkipBack, SkipForward, RotateCcw, Plus, Minus } from 'lucide-react';
import clsx from 'clsx';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { CodePanel } from './code-panel';
import { useSettingsStore } from '@/store';

export interface VizStep<TState> {
  state: TState;
  description: string;
  highlights?: string[];
  codeLine?: number;
}

interface BaseProps<TState> {
  steps: VizStep<TState>[];
  /** 可选：缺省时回退到 steps[0].state */
  initialState?: TState;
  render: (state: TState, step: VizStep<TState>) => ReactNode;
  headerActions?: ReactNode;
  /** Optional code lines for dual-column code sync */
  codeLines?: string[];
  /** Optional title for the code panel */
  codeTitle?: string;
}

export function Stepper<TState>({
  steps,
  initialState,
  render,
  headerActions,
  codeLines,
  codeTitle,
}: BaseProps<TState>) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // 设置页的「动画速度」是基准间隔，面板下拉是在它之上乘倍率
  const baseSpeed = useSettingsStore((s) => s.animationSpeed);
  const [multiplier, setMultiplier] = useState(1);
  const speed = Math.max(40, Math.round(baseSpeed / multiplier));
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    if (current >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    ref.current = setTimeout(() => setCurrent((c) => c + 1), speed);
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, [isPlaying, current, speed, steps.length]);

  // 当步骤序列变短时（例如用户修改输入），重置播放位置，避免索引越界
  useEffect(() => {
    if (steps.length === 0) {
      setIsPlaying(false);
      setCurrent(0);
      return;
    }
    if (current > steps.length - 1) {
      setIsPlaying(false);
      setCurrent(0);
    }
  }, [steps.length, current]);

  // 当步骤序列内容变化（如切换算法/模式/输入）时，重置播放位置到开头并暂停，
  // 避免切换后残留上一序列的中间帧。steps 经 useMemo 缓存，仅在输入变化时引用改变，
  // 播放推进时 steps 不变，因此不会锁死播放头。
  useEffect(() => {
    setIsPlaying(false);
    setCurrent(0);
  }, [steps]);

  const step = current >= 0 && current < steps.length ? steps[current] : null;
  const fallbackState = (initialState ?? steps[0]?.state) as TState;
  const state = step?.state ?? fallbackState;
  const currentCodeLine = step?.codeLine ?? 1;
  const currentDescription = step?.description ?? '';

  const controls = (
    <>
      <div className="flex flex-wrap gap-4 items-center">
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
            className={clsx(
              'p-3 rounded-full transition-colors',
              isPlaying ? 'bg-warn text-black' : 'bg-brand text-on-brand',
            )}
          aria-label={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setCurrent(0);
          }}
          className="p-2 text-ink-3 hover:text-ink"
          aria-label="重置"
        >
          <RotateCcw size={18} />
        </button>
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="p-2 text-ink-3 hover:text-ink disabled:opacity-40"
          aria-label="上一步"
        >
          <SkipBack size={18} />
        </button>
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
          disabled={current >= steps.length - 1}
          className="p-2 text-ink-3 hover:text-ink disabled:opacity-40"
          aria-label="下一步"
        >
          <SkipForward size={18} />
        </button>

        <div className="flex items-center gap-2 ml-2 text-sm text-ink-3">
          速度:
          <select
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="bg-surface-2 border border-edge rounded px-2 py-1"
            aria-label="播放倍率"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
          <span className="font-mono text-xs text-ink-3">{speed}ms</span>
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">{headerActions}</div>
      </div>

      <div className="bg-surface rounded-xl border border-edge p-6 min-h-[120px]">
        {render(state, step ?? { state: fallbackState, description: '' })}
      </div>

      <div className="px-4">
        <input
          type="range"
          min={0}
          max={Math.max(0, steps.length - 1)}
          value={current}
          onChange={(e) => setCurrent(Number(e.target.value))}
          className="w-full accent-brand"
          aria-label="步骤滑动条"
        />
        <div className="flex justify-between text-xs text-ink-3 mt-1">
          <span>步骤 {current + 1} / {steps.length}</span>
          <span>{steps[current]?.description ?? ''}</span>
        </div>
      </div>
    </>
  );

  // If codeLines provided, render dual-column layout
  if (codeLines && codeLines.length > 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: '480px' }}>
        {/* min-w-0：grid 子项默认 min-width:auto，代码面板里的长行会把整列撑破页面 */}
        <div className="lg:col-span-3 min-w-0 space-y-4">
          {controls}
        </div>
        <div className="lg:col-span-2 min-w-0 min-h-[480px]">
          <CodePanel
            codeLines={codeLines}
            highlightLine={currentCodeLine}
            description={currentDescription}
            title={codeTitle || '算法代码'}
          />
        </div>
      </div>
    );
  }

  // Default single-column layout
  return (
    <div className="space-y-6">
      {controls}
    </div>
  );
}

interface PlusMinusInputProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}

export function PlusMinusInput({ value, onChange, min = 1, max = 99, ariaLabel }: PlusMinusInputProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="p-1 rounded bg-surface-2 hover:bg-edge"
        aria-label={`${ariaLabel ?? '减少'}`}
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="p-1 rounded bg-surface-2 hover:bg-edge"
        aria-label={`${ariaLabel ?? '增加'}`}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
