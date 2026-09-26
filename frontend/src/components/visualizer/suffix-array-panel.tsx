'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const suffixArrayCode = [
  'function buildSuffixArray(s) {',
  '  const n = s.length;',
  '  let rank = [...s].map((c) => c.charCodeAt(0));',
  '  let sa = [...Array(n).keys()].sort((a, b) => rank[a] - rank[b] || a - b);',
  '  const tmp = new Array(n).fill(0);',
  '  for (let k = 1; k < n; k *= 2) {',
  '    const rk = (i) => (i < n ? rank[i] : -1);',
  '    sa.sort((a, b) => rk(a) - rk(b) || rk(a + k) - rk(b + k));',
  '    tmp[sa[0]] = 0;',
  '    for (let i = 1; i < n; i++)',
  '      tmp[sa[i]] = tmp[sa[i - 1]] + (rk(sa[i]) !== rk(sa[i - 1]) || rk(sa[i] + k) !== rk(sa[i - 1] + k) ? 1 : 0);',
  '    rank = [...tmp];',
  '    if (rank[sa[n - 1]] === n - 1) break;',
  '  }',
  '  return sa;',
  '}',
  'function buildHeight(s, sa) {',
  '  const n = s.length;',
  '  const rank = new Array(n);',
  '  sa.forEach((v, i) => (rank[v] = i));',
  '  const height = new Array(n).fill(0);',
  '  let h = 0;',
  '  for (let i = 0; i < n; i++) {',
  '    if (rank[i] === 0) { h = 0; continue; }',
  '    const j = sa[rank[i] - 1];',
  '    while (s[i + h] === s[j + h]) h++;',
  '    height[rank[i]] = h;',
  '    if (h > 0) h--;',
  '  }',
  '  return height;',
  '}',
];

interface SAState {
  s: string;
  sa: number[];
  rank: number[];
  height: number[];
  k: number;
  phase: 'init' | 'sort' | 'height' | 'done';
  activeIdx: number;
  message: string;
}

function buildSteps(s: string): VizStep<SAState>[] {
  const steps: VizStep<SAState>[] = [];
  const n = s.length;
  let rank = [...s].map((c) => c.charCodeAt(0));
  let sa = [...Array(n).keys()].sort((a, b) => rank[a] - rank[b] || a - b);
  const tmp = new Array(n).fill(0);
  const height = new Array(n).fill(0);

  const snap = (k: number, phase: SAState['phase'], activeIdx: number, msg: string): SAState => ({
    s, sa: [...sa], rank: [...rank], height: [...height], k, phase, activeIdx, message: msg,
  });

  steps.push({
    state: snap(1, 'init', -1, `字符串 "${s}"，n=${n}。初始 rank 为字符 ASCII 码，sa 按首字符排序`),
    description: '初始排序',
    codeLine: 3,
  });

  for (let k = 1; k < n; k *= 2) {
    const rk = (i: number) => (i < n ? rank[i] : -1);
    sa.sort((a, b) => rk(a) - rk(b) || rk(a + k) - rk(b + k));
    steps.push({
      state: snap(k, 'sort', -1, `k=${k}：按 (rank[i], rank[i+${k}]) 双关键字排序，第二关键字越界视为 -1`),
      description: `k=${k} 排序`,
      codeLine: 7,
    });
    tmp[sa[0]] = 0;
    for (let i = 1; i < n; i++)
      tmp[sa[i]] = tmp[sa[i - 1]] + (rk(sa[i]) !== rk(sa[i - 1]) || rk(sa[i] + k) !== rk(sa[i - 1] + k) ? 1 : 0);
    rank = [...tmp];
    const allDistinct = rank[sa[n - 1]] === n - 1;
    steps.push({
      state: snap(k, 'sort', -1, `更新 rank：最大排名 ${rank[sa[n - 1]]}${allDistinct ? ' = n-1，所有后缀已可区分，提前结束' : ' < n-1，继续倍增'}`),
      description: `更新 rank${allDistinct ? '（完成）' : ''}`,
      codeLine: 12,
    });
    if (allDistinct) break;
  }

  steps.push({
    state: snap(0, 'sort', -1, `后缀数组构建完成：sa = [${sa.join(', ')}]`),
    description: 'sa 完成',
    codeLine: 14,
  });

  // height via Kasai
  const rankPos = new Array(n).fill(0);
  sa.forEach((v, i) => (rankPos[v] = i));
  let h = 0;
  steps.push({
    state: snap(0, 'height', -1, '开始用 Kasai 算法计算 height[]：height[r] = LCP(sa[r-1], sa[r])'),
    description: '计算 height',
    codeLine: 20,
  });
  for (let i = 0; i < n; i++) {
    if (rankPos[i] === 0) {
      h = 0;
      steps.push({
        state: snap(0, 'height', i, `后缀 ${i} ("${s.slice(i)}") 排名第 0，height[0]=0`),
        description: `height[0]=0`,
        codeLine: 23,
      });
      continue;
    }
    const j = sa[rankPos[i] - 1];
    while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;
    height[rankPos[i]] = h;
    steps.push({
      state: snap(0, 'height', i, `后缀 ${i} ("${s.slice(i)}") 与前一后缀 ${j} ("${s.slice(j)}") 的 LCP = ${h}，height[${rankPos[i]}]=${h}`),
      description: `height[${rankPos[i]}]=${h}`,
      codeLine: 26,
    });
    if (h > 0) h--;
  }

  steps.push({
    state: snap(0, 'done', -1, `✅ 完成：sa=[${sa.join(',')}], height=[${height.join(',')}]`),
    description: '全部完成',
    codeLine: 29,
  });

  return steps;
}

function ArrayRow({ label, values, activeIdx, color }: { label: string; values: (number | string)[]; activeIdx: number; color: 'blue' | 'green' | 'purple' }) {
  const colorMap = {
    blue: 'bg-blue-500/20 border-blue-400 text-blue-200',
    green: 'bg-green-500/20 border-green-500 text-green-300',
    purple: 'bg-purple-500/20 border-purple-400 text-purple-200',
  };
  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="flex gap-1 flex-wrap">
        {values.map((v, i) => (
          <div
            key={i}
            className={clsx(
              'w-10 h-9 flex items-center justify-center rounded text-xs font-mono border transition-all',
              i === activeIdx ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105' : v === '' || v === -1 ? 'bg-bg border-edge text-gray-700' : `bg-surface-2 border-edge-2 text-gray-300 ${colorMap[color].split(' ')[2]}`,
            )}
          >
            {v === '' ? '·' : v}
          </div>
        ))}
      </div>
      <div className="flex gap-1 flex-wrap">
        {values.map((_, i) => (
          <div key={i} className="w-10 text-center text-[9px] text-gray-600">{i}</div>
        ))}
      </div>
    </div>
  );
}

export function SuffixArrayPanel() {
  const [text, setText] = useState('banana');

  const s = useMemo(() => text.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12) || 'banana', [text]);
  const steps = useMemo(() => buildSteps(s), [s]);
  const initial: SAState = {
    s,
    sa: [...Array(s.length).keys()],
    rank: [...s].map((c) => c.charCodeAt(0)),
    height: new Array(s.length).fill(0),
    k: 1,
    phase: 'init',
    activeIdx: -1,
    message: '',
  };

  return (
    <Stepper<SAState>
      steps={steps}
      initialState={initial}
      codeLines={suffixArrayCode}
      codeTitle="后缀数组 Suffix Array"
      headerActions={
        <>
          <span className="text-sm text-gray-400">字符串:</span>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-32"
            placeholder="小写字母"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="text-xs text-gray-500">
            倍增法：每轮按前 k 个字符的排名双关键字排序。黄色=当前处理位置
          </div>

          {/* String with indices */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">字符串 s{state.phase === 'sort' && state.k > 0 ? `（当前倍增 k=${state.k}）` : ''}:</div>
            <div className="flex gap-1">
              {state.s.split('').map((ch, i) => (
                <div key={i} className="w-10 flex flex-col items-center">
                  <div className="w-9 h-9 flex items-center justify-center rounded text-sm font-mono bg-surface-2 border border-edge-2 text-gray-200">{ch}</div>
                  <div className="text-[9px] text-gray-600">{i}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sorted suffixes */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">当前排序结果（按 sa 顺序显示后缀）:</div>
            <div className="flex gap-2 flex-wrap">
              {state.sa.map((start, r) => (
                <div
                  key={r}
                  className={clsx(
                    'px-2 py-1 rounded text-xs font-mono border transition-all',
                    state.phase === 'height' && state.activeIdx === start
                      ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200'
                      : 'bg-surface-2 border-edge-2 text-gray-300',
                  )}
                >
                  <span className="text-gray-600 mr-1">{r}:</span>
                  {state.s.slice(start)}
                  <span className="text-gray-600 ml-1">({start})</span>
                </div>
              ))}
            </div>
          </div>

          <ArrayRow label="sa[]（排名第 r 的后缀起点）" values={state.sa} activeIdx={-1} color="blue" />
          <ArrayRow label="rank[]（后缀 i 的排名）" values={state.rank} activeIdx={state.phase === 'height' ? state.activeIdx : -1} color="purple" />
          <ArrayRow
            label="height[]（相邻后缀 LCP 长度）"
            values={state.phase === 'height' || state.phase === 'done' ? state.height : state.height.map(() => '')}
            activeIdx={-1}
            color="green"
          />

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
