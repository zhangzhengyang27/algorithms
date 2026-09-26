'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const compressionCode = [
  'function compress(coords) {',
  '  const sorted = [...new Set(coords)].sort((a, b) => a - b);',
  '  return coords.map((v) => lowerBound(sorted, v));',
  '}',
  'function lowerBound(arr, target) {',
  '  let lo = 0, hi = arr.length;',
  '  while (lo < hi) {',
  '    const mid = (lo + hi) >> 1;',
  '    if (arr[mid] < target) lo = mid + 1;',
  '    else hi = mid;',
  '  }',
  '  return lo;',
  '}',
];

interface CompState {
  original: number[];
  sorted: number[];
  currentIdx: number;
  mapped: (number | null)[];
  lbLo: number;
  lbHi: number;
  lbMid: number;
  phase: 'sort' | 'map' | 'done';
  message: string;
}

function buildSteps(original: number[]): VizStep<CompState>[] {
  const steps: VizStep<CompState>[] = [];
  const sorted = [...new Set(original)].sort((a, b) => a - b);
  const mapped: (number | null)[] = new Array(original.length).fill(null);

  const snap = (currentIdx: number, lbLo: number, lbHi: number, lbMid: number, phase: CompState['phase'], msg: string): CompState => ({
    original, sorted, currentIdx, mapped: [...mapped], lbLo, lbHi, lbMid, phase, message: msg,
  });

  const dupCount = original.length - sorted.length;
  steps.push({
    state: snap(-1, -1, -1, -1, 'sort', `原始坐标 [${original.join(', ')}]，值域范围 [${Math.min(...original)}, ${Math.max(...original)}]，需要离散化压缩`),
    description: '原始坐标',
    codeLine: 0,
  });

  steps.push({
    state: snap(-1, -1, -1, -1, 'sort', `排序并去重：[${sorted.join(', ')}]（去除 ${dupCount} 个重复值），共 ${sorted.length} 个不同值`),
    description: '排序去重',
    codeLine: 1,
  });

  // Map each element with binary search visualization
  for (let i = 0; i < original.length; i++) {
    const target = original[i];
    steps.push({
      state: snap(i, 0, sorted.length, -1, 'map', `映射 coords[${i}] = ${target}，在 sorted 中二分查找 lowerBound(${target})`),
      description: `查找 ${target}`,
      codeLine: 2,
    });

    let lo = 0, hi = sorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sorted[mid] < target) {
        steps.push({
          state: snap(i, lo, hi, mid, 'map', `sorted[${mid}]=${sorted[mid]} < ${target} → lo = ${mid + 1}`),
          description: `lb: lo→${mid + 1}`,
          codeLine: 8,
        });
        lo = mid + 1;
      } else {
        steps.push({
          state: snap(i, lo, hi, mid, 'map', `sorted[${mid}]=${sorted[mid]} ≥ ${target} → hi = ${mid}`),
          description: `lb: hi→${mid}`,
          codeLine: 9,
        });
        hi = mid;
      }
    }

    mapped[i] = lo;
    steps.push({
      state: snap(i, lo, hi, -1, 'map', `找到：lowerBound(${target}) = ${lo}，即 ${target} 映射为 ${lo}`),
      description: `${target}→${lo}`,
      codeLine: 11,
    });
  }

  steps.push({
    state: snap(-1, -1, -1, -1, 'done', `✅ 离散化完成：[${original.join(', ')}] → [${mapped.join(', ')}]，值域从 ${Math.max(...original) - Math.min(...original) + 1} 压缩到 ${sorted.length}`),
    description: '完成',
    codeLine: 2,
  });

  return steps;
}

export function CoordinateCompressionPanel() {
  const [coordsText, setCoordsText] = useState('999999,5,1000000,5,42');

  const coords = useMemo(() => {
    return coordsText.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
  }, [coordsText]);

  const steps = useMemo(() => buildSteps(coords), [coords]);
  const initial: CompState = {
    original: coords, sorted: [], currentIdx: -1, mapped: [], lbLo: -1, lbHi: -1, lbMid: -1, phase: 'sort', message: '',
  };

  return (
    <Stepper<CompState>
      steps={steps}
      initialState={initial}
      codeLines={compressionCode}
      codeTitle="坐标离散化 Coordinate Compression"
      headerActions={
        <>
          <span className="text-sm text-gray-400">坐标:</span>
          <input
            type="text"
            value={coordsText}
            onChange={(e) => setCoordsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-64"
            placeholder="逗号分隔，如 999999,5,1000000"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前映射元素，蓝色=二分查找区间，绿色=映射结果
          </div>

          {/* Original array */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">原始坐标 coords[]:</div>
            <div className="flex gap-1 flex-wrap">
              {state.original.map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div
                    className={clsx(
                      'min-w-[4.5rem] h-10 px-2 flex items-center justify-center rounded text-sm font-mono border transition-all',
                      i === state.currentIdx
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                        : state.mapped[i] !== null
                          ? 'bg-green-500/10 border-green-800 text-gray-300'
                          : 'bg-surface-2 border-edge-2 text-ink-2',
                    )}
                  >
                    {v}
                  </div>
                  <div className={clsx('h-5 text-xs font-mono', state.mapped[i] !== null ? 'text-green-300' : 'text-transparent')}>
                    {state.mapped[i] !== null ? `→ ${state.mapped[i]}` : '·'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sorted unique array with binary search pointers */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">sorted[]（排序去重后）:</div>
            <div className="flex gap-1 flex-wrap">
              {state.sorted.map((v, i) => {
                const inRange = state.lbLo >= 0 && i >= state.lbLo && i < state.lbHi;
                const isMid = i === state.lbMid;
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div
                      className={clsx(
                        'min-w-[4.5rem] h-10 px-2 flex items-center justify-center rounded text-sm font-mono border transition-all',
                        isMid
                          ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200'
                          : inRange
                            ? 'bg-blue-500/10 border-blue-700 text-blue-300'
                            : 'bg-surface-2 border-edge-2 text-ink-3',
                      )}
                    >
                      {v}
                    </div>
                    <div className="h-4 text-[9px] font-mono text-gray-600 flex gap-1">
                      {i === state.lbLo && <span className="text-blue-400">lo</span>}
                      {i === state.lbMid && <span className="text-yellow-400">mid</span>}
                      {i === state.lbHi && <span className="text-blue-400">hi</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 flex-wrap">
              {state.sorted.map((_, i) => (
                <div key={i} className="min-w-[4.5rem] px-2 text-center text-[9px] text-gray-600">索引 {i}</div>
              ))}
            </div>
          </div>

          {/* Result comparison */}
          {state.phase === 'done' && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg space-y-1">
              <div className="text-green-300 font-mono text-sm">
                [{state.original.join(', ')}] → [{state.mapped.join(', ')}]
              </div>
              <div className="text-xs text-gray-400">
                值域大小：{Math.max(...state.original) - Math.min(...state.original) + 1} → {state.sorted.length}
              </div>
            </div>
          )}

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
