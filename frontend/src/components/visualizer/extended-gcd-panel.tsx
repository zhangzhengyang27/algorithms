'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const exgcdCode = [
  'function exgcd(a, b) {',
  '  if (b === 0) return { g: a, x: 1, y: 0 };',
  '  const { g, x: x1, y: y1 } = exgcd(b, a % b);',
  '  const x = y1;',
  '  const y = x1 - Math.floor(a / b) * y1;',
  '  return { g, x, y };',
  '}',
];

interface Frame {
  a: number;
  b: number;
  q: number; // floor(a/b)
  x: number | null;
  y: number | null;
  g: number | null;
  resolved: boolean;
}

interface ExgcdState {
  a0: number;
  b0: number;
  frames: Frame[];
  activeDepth: number;
  phase: 'call' | 'base' | 'backtrack' | 'done';
  message: string;
}

export function buildSteps(a0: number, b0: number): VizStep<ExgcdState>[] {
  const steps: VizStep<ExgcdState>[] = [];
  const frames: Frame[] = [];

  const snap = (activeDepth: number, phase: ExgcdState['phase'], msg: string): ExgcdState => ({
    a0, b0, frames: frames.map((f) => ({ ...f })), activeDepth, phase, message: msg,
  });

  // Simulate recursion: build call chain
  let a = a0, b = b0;
  const chain: { a: number; b: number }[] = [];
  while (b !== 0) {
    chain.push({ a, b });
    const r = a % b;
    a = b;
    b = r;
  }
  chain.push({ a, b: 0 }); // base case level

  // Step through calls
  for (let d = 0; d < chain.length; d++) {
    const { a: fa, b: fb } = chain[d];
    frames.push({ a: fa, b: fb, q: fb !== 0 ? Math.floor(fa / fb) : 0, x: null, y: null, g: null, resolved: false });
    if (fb !== 0) {
      steps.push({
        state: snap(d, 'call', `调用 exgcd(${fa}, ${fb})，b=${fb} ≠ 0，递归计算 exgcd(${fb}, ${fa} % ${fb} = ${fa % fb})`),
        description: `调用 exgcd(${fa},${fb})`,
        codeLine: 2,
      });
    } else {
      frames[d].x = 1;
      frames[d].y = 0;
      frames[d].g = fa;
      frames[d].resolved = true;
      steps.push({
        state: snap(d, 'base', `b = 0，到达递归基：gcd = ${fa}，x = 1，y = 0（因为 ${fa}×1 + 0×0 = ${fa}）`),
        description: '递归基 b=0',
        codeLine: 1,
      });
    }
  }

  // Backtrack
  const g = frames[frames.length - 1].g!;
  for (let d = chain.length - 2; d >= 0; d--) {
    const child = frames[d + 1];
    const x1 = child.x!;
    const y1 = child.y!;
    const fa = frames[d].a;
    const fb = frames[d].b;
    const q = frames[d].q;

    frames[d].x = y1;
    steps.push({
      state: snap(d, 'backtrack', `回溯到 exgcd(${fa}, ${fb})：子问题返回 x₁=${x1}, y₁=${y1}，当前 x = y₁ = ${y1}`),
      description: `第${d}层 x=y₁=${y1}`,
      codeLine: 3,
    });

    frames[d].y = x1 - q * y1;
    steps.push({
      state: snap(d, 'backtrack', `y = x₁ - ⌊a/b⌋×y₁ = ${x1} - ${q}×${y1} = ${x1 - q * y1}`),
      description: `第${d}层 y=${x1 - q * y1}`,
      codeLine: 4,
    });

    frames[d].g = g;
    frames[d].resolved = true;
    steps.push({
      state: snap(d, 'backtrack', `返回 { g: ${g}, x: ${frames[d].x}, y: ${frames[d].y} }，验证：${fa}×${frames[d].x} + ${fb}×${frames[d].y} = ${fa * frames[d].x! + fb * frames[d].y!}`),
      description: `第${d}层返回`,
      codeLine: 5,
    });
  }

  const fx = frames[0].x!;
  const fy = frames[0].y!;
  steps.push({
    state: snap(0, 'done', `✅ 贝祖等式验证：${a0}×(${fx}) + ${b0}×(${fy}) = ${a0 * fx + b0 * fy} = gcd(${a0}, ${b0})`),
    description: '验证贝祖等式',
    codeLine: 5,
  });

  return steps;
}

export function ExtendedGcdPanel() {
  const [inputA, setInputA] = useState(240);
  const [inputB, setInputB] = useState(46);

  const steps = useMemo(() => buildSteps(inputA, inputB), [inputA, inputB]);
  const initial: ExgcdState = {
    a0: inputA, b0: inputB, frames: [], activeDepth: -1, phase: 'call', message: '',
  };

  return (
    <Stepper<ExgcdState>
      steps={steps}
      initialState={initial}
      codeLines={exgcdCode}
      codeTitle="扩展欧几里得 Extended GCD"
      headerActions={
        <>
          <span className="text-sm text-gray-400">a:</span>
          <input
            type="number"
            value={inputA}
            onChange={(e) => setInputA(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-20"
          />
          <span className="text-sm text-gray-400">b:</span>
          <input
            type="number"
            value={inputB}
            onChange={(e) => setInputB(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-20"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前递归层，绿色=已求解出系数，蓝色=递归基
          </div>

          {/* Target equation */}
          <div className="text-center text-sm font-mono text-gray-300">
            求 {state.a0}·x + {state.b0}·y = gcd({state.a0}, {state.b0})
          </div>

          {/* Recursion stack */}
          <div className="space-y-2">
            {state.frames.map((f, d) => (
              <div
                key={d}
                className={clsx(
                  'rounded-lg border p-3 transition-all',
                  d === state.activeDepth
                    ? 'border-yellow-400 bg-yellow-500/10'
                    : f.resolved
                      ? 'border-green-700 bg-green-900/10'
                      : 'border-edge-2 bg-surface-2',
                )}
                style={{ marginLeft: d * 24 }}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-500">深度 {d}</span>
                  <span className="font-mono text-sm text-gray-200">
                    exgcd({f.a}, {f.b})
                  </span>
                  {f.b !== 0 && (
                    <span className="text-xs font-mono text-gray-500">q = ⌊{f.a}/{f.b}⌋ = {f.q}</span>
                  )}
                  <span className="ml-auto flex gap-2 font-mono text-sm">
                    {f.x !== null ? (
                      <>
                        <span className="text-green-300">x={f.x}</span>
                        <span className="text-green-300">y={f.y}</span>
                        <span className="text-blue-300">g={f.g}</span>
                      </>
                    ) : (
                      <span className="text-gray-600">x=? y=?</span>
                    )}
                  </span>
                </div>
                {f.resolved && (
                  <div className="mt-1 text-xs font-mono text-gray-500">
                    验证: {f.a}×({f.x}) + {f.b}×({f.y}) = {f.a * f.x! + f.b * f.y!}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final result */}
          {state.phase === 'done' && state.frames.length > 0 && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                gcd({state.a0}, {state.b0}) = {state.frames[0].g}，x = {state.frames[0].x}，y = {state.frames[0].y}
              </span>
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
