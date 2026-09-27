'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const numberTheoryCode = [
  'function fastPow(base, exp, mod) {',
  '  let result = 1;',
  '  base = base % mod;',
  '  while (exp > 0) {',
  '    if (exp & 1) result = (result * base) % mod;',
  '    base = (base * base) % mod;',
  '    exp >>= 1;',
  '  }',
  '  return result;',
  '}',
  'function gcd(a, b) {',
  '  while (b !== 0) {',
  '    [a, b] = [b, a % b];',
  '  }',
  '  return a;',
  '}',
  'function sieve(n) {',
  '  const isPrime = new Array(n + 1).fill(true);',
  '  isPrime[0] = isPrime[1] = false;',
  '  for (let i = 2; i * i <= n; i++) {',
  '    if (!isPrime[i]) continue;',
  '    for (let j = i * i; j <= n; j += i)',
  '      isPrime[j] = false;',
  '  }',
  '  return isPrime.reduce((acc, p, i) => (p ? acc.concat(i) : acc), []);',
  '}',
];

interface NTState {
  phase: 'pow' | 'gcd' | 'sieve' | 'done';
  powBase: number;
  powExp: number;
  powMod: number;
  powResult: number;
  powCurBase: number;
  powExpLeft: number;
  powIter: number;
  gcdA: number;
  gcdB: number;
  gcdHistory: string[];
  gcdResult: number | null;
  sieveN: number;
  sieveIsPrime: boolean[];
  sieveI: number;
  sievePrimes: number[];
  message: string;
}

export function buildSteps(base: number, exp: number, mod: number, gcdA0: number, gcdB0: number, sieveN: number): VizStep<NTState>[] {
  const steps: VizStep<NTState>[] = [];
  if (mod < 1) mod = 1000;

  // ---------- fastPow ----------
  let result = 1;
  let curBase = base % mod;
  let expLeft = exp;
  let iter = 0;

  const powSnap = (msg: string): NTState => ({
    phase: 'pow',
    powBase: base, powExp: exp, powMod: mod,
    powResult: result, powCurBase: curBase, powExpLeft: expLeft, powIter: iter,
    gcdA: gcdA0, gcdB: gcdB0, gcdHistory: [], gcdResult: null,
    sieveN, sieveIsPrime: new Array(sieveN + 1).fill(true), sieveI: -1, sievePrimes: [],
    message: msg,
  });

  steps.push({
    state: powSnap(`计算 ${base}^${exp} mod ${mod}。指数 ${exp} 的二进制 = ${(exp >>> 0).toString(2)}₂，从低位开始扫描`),
    description: '快速幂初始化',
    codeLine: 2,
  });

  while (expLeft > 0) {
    const bit = expLeft & 1;
    if (bit === 1) {
      const oldResult = result;
      result = (result * curBase) % mod;
      steps.push({
        state: powSnap(`第 ${iter} 位（从低到高）为 1：result = ${oldResult} × ${curBase} mod ${mod} = ${result}`),
        description: `位=1 result=${result}`,
        codeLine: 4,
      });
    } else {
      steps.push({
        state: powSnap(`第 ${iter} 位为 0：不更新 result（保持 ${result}）`),
        description: '位=0 跳过',
        codeLine: 4,
      });
    }
    const oldBase = curBase;
    curBase = (curBase * curBase) % mod;
    expLeft >>= 1;
    steps.push({
      state: powSnap(`base = ${oldBase}² mod ${mod} = ${curBase}，指数右移 → ${expLeft}`),
      description: `base=${curBase}`,
      codeLine: 5,
    });
    iter++;
  }

  steps.push({
    state: powSnap(`✅ 快速幂完成：${base}^${exp} mod ${mod} = ${result}`),
    description: `结果 = ${result}`,
    codeLine: 8,
  });

  const powFinal = { powResult: result, powCurBase: curBase, powIter: iter };

  // ---------- gcd ----------
  let a = gcdA0;
  let b = gcdB0;
  const history: string[] = [];

  const gcdSnap = (gcdResult: number | null, msg: string): NTState => ({
    phase: 'gcd',
    powBase: base, powExp: exp, powMod: mod,
    powResult: powFinal.powResult, powCurBase: powFinal.powCurBase, powExpLeft: 0, powIter: powFinal.powIter,
    gcdA: a, gcdB: b, gcdHistory: [...history], gcdResult,
    sieveN, sieveIsPrime: new Array(sieveN + 1).fill(true), sieveI: -1, sievePrimes: [],
    message: msg,
  });

  steps.push({
    state: gcdSnap(null, `辗转相除法求 gcd(${a}, ${b})：gcd(a,b) = gcd(b, a mod b)`),
    description: 'gcd 初始化',
    codeLine: 10,
  });

  while (b !== 0) {
    const q = Math.floor(a / b);
    const r = a % b;
    history.push(`${a} = ${b} × ${q} + ${r}`);
    a = b;
    b = r;
    steps.push({
      state: gcdSnap(null, `${history[history.length - 1]} → 变为 (${a}, ${b})`),
      description: `→ (${a}, ${b})`,
      codeLine: 12,
    });
  }

  steps.push({
    state: gcdSnap(a, `✅ b = 0，gcd(${gcdA0}, ${gcdB0}) = ${a}`),
    description: `gcd = ${a}`,
    codeLine: 14,
  });

  const gcdFinal = a;

  // ---------- sieve ----------
  const isPrime = new Array(sieveN + 1).fill(true) as boolean[];
  isPrime[0] = isPrime[1] = false;
  let sieveI = -1;
  const primes: number[] = [];

  const sieveSnap = (phase: 'sieve' | 'done', sievePrimes: number[], msg: string): NTState => ({
    phase,
    powBase: base, powExp: exp, powMod: mod,
    powResult: powFinal.powResult, powCurBase: powFinal.powCurBase, powExpLeft: 0, powIter: powFinal.powIter,
    gcdA: gcdA0, gcdB: gcdB0, gcdHistory: [...history], gcdResult: gcdFinal,
    sieveN, sieveIsPrime: [...isPrime], sieveI, sievePrimes: [...sievePrimes],
    message: msg,
  });

  steps.push({
    state: sieveSnap('sieve', [], `埃氏筛：n=${sieveN}，初始认为全部是素数，0 和 1 除外`),
    description: '素数筛初始化',
    codeLine: 18,
  });

  for (let i = 2; i * i <= sieveN; i++) {
    sieveI = i;
    if (!isPrime[i]) {
      steps.push({
        state: sieveSnap('sieve', [], `${i} 已被更小的素数筛掉，跳过`),
        description: `${i} 非素数`,
        codeLine: 20,
      });
      continue;
    }
    const crossed: number[] = [];
    for (let j = i * i; j <= sieveN; j += i) {
      if (isPrime[j]) {
        isPrime[j] = false;
        crossed.push(j);
      }
    }
    steps.push({
      state: sieveSnap('sieve', [], `${i} 是素数，从 ${i}×${i}=${i * i} 开始筛掉倍数：${crossed.join(', ')}`),
      description: `筛掉 ${i} 的倍数`,
      codeLine: 22,
    });
  }

  sieveI = -1;
  for (let i = 2; i <= sieveN; i++) if (isPrime[i]) primes.push(i);
  steps.push({
    state: sieveSnap('done', primes, `✅ ${sieveN} 以内的素数：${primes.join(', ')}（共 ${primes.length} 个）`),
    description: `${primes.length} 个素数`,
    codeLine: 24,
  });

  return steps;
}

const PHASES = [
  { key: 'pow', label: '① 快速幂' },
  { key: 'gcd', label: '② 辗转相除' },
  { key: 'sieve', label: '③ 埃氏筛' },
] as const;

export function NumberTheoryPanel() {
  const [base, setBase] = useState(2);
  const [exp, setExp] = useState(13);
  const [mod, setMod] = useState(1000);
  const [gcdA, setGcdA] = useState(48);
  const [gcdB, setGcdB] = useState(36);
  const [sieveN, setSieveN] = useState(30);

  const steps = useMemo(() => buildSteps(base, exp, mod, gcdA, gcdB, sieveN), [base, exp, mod, gcdA, gcdB, sieveN]);
  const initial: NTState = {
    phase: 'pow',
    powBase: base, powExp: exp, powMod: mod,
    powResult: 1, powCurBase: base % mod, powExpLeft: exp, powIter: 0,
    gcdA: gcdA, gcdB: gcdB, gcdHistory: [], gcdResult: null,
    sieveN, sieveIsPrime: new Array(sieveN + 1).fill(true), sieveI: -1, sievePrimes: [],
    message: '',
  };

  const phaseOrder = { pow: 0, gcd: 1, sieve: 2, done: 3 };

  return (
    <Stepper<NTState>
      steps={steps}
      initialState={initial}
      codeLines={numberTheoryCode}
      codeTitle="数论基础 Number Theory"
      headerActions={
        <>
          <span className="text-sm text-gray-400">底数:</span>
          <input type="number" value={base} min={2} max={50} onChange={(e) => setBase(Math.max(2, Math.min(50, Number(e.target.value) || 2)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
          <span className="text-sm text-gray-400">指数:</span>
          <input type="number" value={exp} min={1} max={30} onChange={(e) => setExp(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
          <span className="text-sm text-gray-400">mod:</span>
          <input type="number" value={mod} min={1} max={99991} onChange={(e) => setMod(Math.max(1, Math.min(99991, Number(e.target.value) || 1000)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16" />
          <span className="text-sm text-gray-400">gcd:</span>
          <input type="number" value={gcdA} min={1} max={999} onChange={(e) => setGcdA(Math.max(1, Math.min(999, Number(e.target.value) || 1)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16" />
          <input type="number" value={gcdB} min={1} max={999} onChange={(e) => setGcdB(Math.max(1, Math.min(999, Number(e.target.value) || 1)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16" />
          <span className="text-sm text-gray-400">筛到:</span>
          <input type="number" value={sieveN} min={10} max={60} onChange={(e) => setSieveN(Math.max(10, Math.min(60, Number(e.target.value) || 10)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          {/* Phase chips */}
          <div className="flex gap-2 justify-center">
            {PHASES.map((p) => {
              const idx = phaseOrder[p.key];
              const cur = phaseOrder[state.phase] > 2 ? 3 : phaseOrder[state.phase as 'pow' | 'gcd' | 'sieve'];
              const status = idx < cur || state.phase === 'done' ? 'done' : idx === cur ? 'active' : 'todo';
              return (
                <span
                  key={p.key}
                  className={clsx(
                    'text-xs px-2 py-0.5 rounded border',
                    status === 'done'
                      ? 'bg-green-900/30 border-green-800 text-green-300'
                      : status === 'active'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200'
                        : 'bg-surface-2 border-edge-2 text-gray-500',
                  )}
                >
                  {p.label}{status === 'done' ? ' ✓' : ''}
                </span>
              );
            })}
          </div>

          {/* fastPow view */}
          {state.phase === 'pow' && (
            <div className="space-y-4">
              <div className="text-center font-mono text-sm text-gray-300">
                {state.powBase}<sup>{state.powExp}</sup> mod {state.powMod} = ?
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">指数二进制（黄色=当前处理位，从低位开始）:</div>
                <div className="flex gap-1 justify-center">
                  {(state.powExp >>> 0).toString(2).split('').map((bit, idx, arr) => {
                    const lsbIdx = arr.length - 1 - idx;
                    const isCur = lsbIdx === state.powIter;
                    const processed = lsbIdx < state.powIter;
                    return (
                      <div
                        key={idx}
                        className={clsx(
                          'w-9 h-9 flex items-center justify-center rounded text-sm font-mono border transition-all',
                          isCur
                            ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                            : processed
                              ? 'bg-surface-2 border-edge-2 text-gray-500'
                              : 'bg-surface-2 border-edge-2 text-gray-300',
                        )}
                      >
                        {bit}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-4 justify-center text-sm font-mono">
                <div className="px-3 py-2 rounded bg-green-900/20 border border-green-800">
                  <span className="text-gray-500 text-xs block">result</span>
                  <span className="text-green-300">{state.powResult}</span>
                </div>
                <div className="px-3 py-2 rounded bg-blue-900/20 border border-blue-800">
                  <span className="text-gray-500 text-xs block">base</span>
                  <span className="text-blue-300">{state.powCurBase}</span>
                </div>
                <div className="px-3 py-2 rounded bg-surface-2 border border-edge-2">
                  <span className="text-gray-500 text-xs block">exp</span>
                  <span className="text-gray-300">{state.powExpLeft}</span>
                </div>
              </div>
            </div>
          )}

          {/* gcd view */}
          {state.phase === 'gcd' && (
            <div className="space-y-4">
              <div className="flex gap-4 justify-center items-center text-sm font-mono">
                <div className="px-4 py-2 rounded bg-yellow-500/20 border border-yellow-500 text-yellow-200">
                  <span className="text-gray-500 text-xs block">a</span>
                  {state.gcdA}
                </div>
                <div className="px-4 py-2 rounded bg-blue-500/20 border border-blue-400 text-blue-200">
                  <span className="text-gray-500 text-xs block">b</span>
                  {state.gcdB}
                </div>
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                {state.gcdHistory.map((h, i) => (
                  <div key={i} className={clsx('text-xs font-mono text-center px-2 py-1 rounded', i === state.gcdHistory.length - 1 ? 'bg-yellow-500/10 text-yellow-200' : 'text-gray-500')}>
                    {h}
                  </div>
                ))}
              </div>
              {state.gcdResult !== null && (
                <div className="text-center p-2 bg-green-900/20 border border-green-800 rounded-lg">
                  <span className="text-green-300 font-mono text-sm">gcd = {state.gcdResult}</span>
                </div>
              )}
            </div>
          )}

          {/* sieve view */}
          {(state.phase === 'sieve' || state.phase === 'done') && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500">
                黄色=当前枚举的 i，灰色=被筛掉的合数，绿色=素数
              </div>
              <div className="flex gap-1 flex-wrap justify-center max-w-xl mx-auto">
                {state.sieveIsPrime.map((p, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'w-8 h-8 flex items-center justify-center rounded text-xs font-mono border transition-all',
                      i === state.sieveI
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                        : !p
                          ? 'bg-bg border-edge text-gray-700 line-through'
                          : state.phase === 'done' || state.sievePrimes.includes(i)
                            ? 'bg-green-500/20 border-green-500 text-green-300'
                            : 'bg-surface-2 border-edge-2 text-gray-300',
                    )}
                  >
                    {i}
                  </div>
                ))}
              </div>
              {state.phase === 'done' && (
                <div className="text-center text-xs text-green-300 font-mono">
                  素数: {state.sievePrimes.join(', ')}
                </div>
              )}
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
