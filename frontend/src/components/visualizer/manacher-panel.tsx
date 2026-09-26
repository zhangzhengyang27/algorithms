'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const manacherCode = [
  'function manacher(s) {',
  "  const t = '#' + s.split('').join('#') + '#';",
  '  const p = new Array(t.length).fill(0);',
  '  let c = 0, r = 0; // 最右回文的中心与右边界',
  '  for (let i = 1; i < t.length - 1; i++) {',
  '    const mirror = 2 * c - i;',
  '    if (i < r) p[i] = Math.min(r - i, p[mirror]); // 利用对称',
  '    while (t[i + p[i] + 1] === t[i - p[i] - 1]) p[i]++; // 中心扩展',
  '    if (i + p[i] > r) { c = i; r = i + p[i]; } // 更新最右',
  '  }',
  '  return Math.max(...p); // 最长回文长度',
  '}',
];

interface ManacherState {
  s: string;
  t: string[];
  p: number[];
  i: number;
  c: number;
  r: number;
  mirror: number;
  palindromeRange: [number, number] | null;
  maxLen: number;
  bestCenter: number;
  phase: 'init' | 'compute' | 'result';
  message: string;
}

function buildSteps(s: string): VizStep<ManacherState>[] {
  const steps: VizStep<ManacherState>[] = [];
  const t = ('#' + s.split('').join('#') + '#').split('');
  const n = t.length;
  const p = new Array(n).fill(0);
  let c = 0;
  let r = 0;
  let maxLen = 0;
  let bestCenter = 0;

  const snap = (
    i: number,
    cc: number,
    rr: number,
    mirror: number,
    range: [number, number] | null,
    mLen: number,
    bCenter: number,
    phase: 'init' | 'compute' | 'result',
    msg: string,
  ): ManacherState => ({
    s,
    t: [...t],
    p: [...p],
    i,
    c: cc,
    r: rr,
    mirror,
    palindromeRange: range,
    maxLen: mLen,
    bestCenter: bCenter,
    phase,
    message: msg,
  });

  steps.push({
    state: snap(-1, 0, 0, -1, null, 0, 0, 'init', `预处理：插入分隔符 # 得到 t="${t.join('')}"（统一奇偶回文），p[] 初始为 0`),
    description: '预处理 t',
    codeLine: 2,
  });

  for (let i = 1; i < n - 1; i++) {
    const mirror = 2 * c - i;
    if (i < r) {
      p[i] = Math.min(r - i, p[mirror]);
      steps.push({
        state: snap(i, c, r, mirror, null, maxLen, bestCenter, 'compute',
          `i=${i} < r=${r}：对称点 mirror=${mirror}，p[${i}] = min(r-i=${r - i}, p[${mirror}]=${p[mirror]}) = ${p[i]}${p[i] === r - i ? '（受右边界限制，需尝试扩展）' : '（镜像完全在范围内，无需扩展）'}`),
        description: `p[${i}] 初始=${p[i]}`,
        codeLine: 7,
      });
    }

    let expanded = false;
    while (i + p[i] + 1 < n && i - p[i] - 1 >= 0 && t[i + p[i] + 1] === t[i - p[i] - 1]) {
      p[i]++;
      expanded = true;
      steps.push({
        state: snap(i, c, r, mirror, [i - p[i], i + p[i]], maxLen, bestCenter, 'compute',
          `中心扩展：t[${i + p[i]}]='${t[i + p[i]]}' = t[${i - p[i]}]='${t[i - p[i]]}'，半径 p[${i}] → ${p[i]}`),
        description: `扩展 p[${i}]=${p[i]}`,
        codeLine: 8,
      });
    }

    const updated = i + p[i] > r;
    if (updated) {
      c = i;
      r = i + p[i];
    }
    if (p[i] > maxLen) {
      maxLen = p[i];
      bestCenter = i;
    }
    if (expanded || updated || i >= 1) {
      steps.push({
        state: snap(i, c, r, mirror, [i - p[i], i + p[i]], maxLen, bestCenter, 'compute',
          `p[${i}]=${p[i]} 确定（回文 t[${i - p[i]}..${i + p[i]}]）${updated ? `，更新中心 c=${c}、右边界 r=${r}` : ''}`),
        description: `p[${i}]=${p[i]}`,
        codeLine: 9,
      });
    }
  }

  const start = (bestCenter - maxLen) / 2;
  const longest = s.substring(start, start + maxLen);
  steps.push({
    state: snap(-1, c, r, -1, [bestCenter - maxLen, bestCenter + maxLen], maxLen, bestCenter, 'result',
      `✅ 最长回文子串："${longest}"，长度 = ${maxLen}（中心 t[${bestCenter}]，半径 ${maxLen}）`),
    description: `最长回文 = "${longest}"`,
    codeLine: 11,
  });

  return steps;
}

export function ManacherPanel() {
  const [seed, setSeed] = useState('abacaba');

  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: ManacherState = {
    s: seed,
    t: ('#' + seed.split('').join('#') + '#').split(''),
    p: new Array(seed.length * 2 + 3).fill(0),
    i: -1,
    c: 0,
    r: 0,
    mirror: -1,
    palindromeRange: null,
    maxLen: 0,
    bestCenter: 0,
    phase: 'init',
    message: '',
  };

  return (
    <Stepper<ManacherState>
      steps={steps}
      initialState={initial}
      codeLines={manacherCode}
      codeTitle="Manacher 算法"
      headerActions={
        <>
          <span className="text-sm text-gray-400">字符串:</span>
          <input
            type="text"
            value={seed}
            onChange={(e) => { if (e.target.value.length >= 1 && e.target.value.length <= 12) setSeed(e.target.value); }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-36"
            placeholder="字符串"
          />
        </>
      }
      render={(state) => {
        const inRange = (idx: number) =>
          state.palindromeRange !== null && idx >= state.palindromeRange[0] && idx <= state.palindromeRange[1];
        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-500">
              黄色=中心 c，蓝色=当前 i，紫色=对称点 mirror，红色=右边界 r，绿色=当前回文范围
            </div>

            {/* t string */}
            <div className="space-y-1">
              <div className="text-xs text-gray-500">t[] (插入 # 分隔):</div>
              <div className="flex gap-1 flex-wrap">
                {state.t.map((ch, idx) => {
                  const isC = idx === state.c && state.phase !== 'init';
                  const isI = idx === state.i;
                  const isMirror = idx === state.mirror && state.mirror >= 0;
                  const isR = idx === state.r && state.r > 0;
                  const inPal = inRange(idx);
                  return (
                    <div
                      key={idx}
                      className={clsx(
                        'w-7 h-9 flex items-center justify-center rounded text-sm font-mono border transition-all',
                        isI
                          ? 'bg-blue-500/30 border-blue-400 text-blue-200 scale-110'
                          : isC
                            ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200'
                            : isMirror
                              ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                              : isR
                                ? 'bg-red-500/30 border-red-400 text-red-200'
                                : inPal
                                  ? 'bg-green-500/20 border-green-500 text-green-300'
                                  : ch === '#'
                                    ? 'bg-surface border-edge text-gray-600'
                                    : 'bg-surface-2 border-edge-2 text-gray-300',
                      )}
                    >
                      {ch}
                    </div>
                  );
                })}
              </div>
              {/* p array */}
              <div className="flex gap-1 flex-wrap">
                {state.t.map((_, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      'w-7 h-7 flex items-center justify-center rounded text-[10px] font-mono border',
                      idx === state.i
                        ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                        : 'bg-surface border-edge text-gray-500',
                    )}
                  >
                    {state.p[idx]}
                  </div>
                ))}
              </div>
              <div className="text-[9px] text-gray-600">p[] (回文半径)</div>
            </div>

            {/* Result */}
            {state.phase === 'result' && (
              <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <span className="text-green-300 font-mono text-sm">
                  最长回文子串 = &quot;{state.s.substring((state.bestCenter - state.maxLen) / 2, (state.bestCenter - state.maxLen) / 2 + state.maxLen)}&quot;，长度 = {state.maxLen}
                </span>
              </div>
            )}

            {state.message && (
              <div className="text-center text-sm text-gray-300">{state.message}</div>
            )}
          </div>
        );
      }}
    />
  );
}
