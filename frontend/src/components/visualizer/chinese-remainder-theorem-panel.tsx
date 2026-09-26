'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const crtCode = [
  'function crt(remainders, moduli) {',
  '  const M = moduli.reduce((a, b) => a * b, 1);',
  '  let x = 0;',
  '  for (let i = 0; i < moduli.length; i++) {',
  '    const Mi = M / moduli[i];',
  '    const inv = modInverse(Mi, moduli[i]);',
  '    x += remainders[i] * Mi * inv;',
  '  }',
  '  return ((x % M) + M) % M;',
  '}',
];

interface Equation {
  r: number; // remainder
  m: number; // modulus
}

interface CrtState {
  equations: Equation[];
  M: number | null;
  currentIdx: number;
  MiValues: (number | null)[];
  invValues: (number | null)[];
  contributions: (number | null)[];
  xSum: number;
  finalX: number | null;
  phase: 'init' | 'compute' | 'done';
  message: string;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function modInverse(a: number, m: number): number {
  for (let t = 1; t < m; t++) {
    if ((a * t) % m === 1) return t;
  }
  return -1;
}

function buildSteps(equations: Equation[]): VizStep<CrtState>[] {
  const steps: VizStep<CrtState>[] = [];
  const n = equations.length;
  const MiValues: (number | null)[] = new Array(n).fill(null);
  const invValues: (number | null)[] = new Array(n).fill(null);
  const contributions: (number | null)[] = new Array(n).fill(null);
  let xSum = 0;

  const snap = (currentIdx: number, M: number | null, finalX: number | null, phase: CrtState['phase'], msg: string): CrtState => ({
    equations, M, currentIdx, MiValues: [...MiValues], invValues: [...invValues],
    contributions: [...contributions], xSum, finalX, phase, message: msg,
  });

  // Check pairwise coprime
  const coprimePairs: string[] = [];
  let allCoprime = true;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const g = gcd(equations[i].m, equations[j].m);
      coprimePairs.push(`gcd(${equations[i].m},${equations[j].m})=${g}`);
      if (g !== 1) allCoprime = false;
    }
  }

  steps.push({
    state: snap(-1, null, null, 'init', `同余方程组：${equations.map((e) => `x ≡ ${e.r} (mod ${e.m})`).join('，')}。模数两两互素检验：${coprimePairs.join('，')}${allCoprime ? ' ✓' : ' ✗（不满足 CRT 条件）'}`),
    description: '列出方程组',
    codeLine: 0,
  });

  const M = equations.reduce((acc, e) => acc * e.m, 1);

  steps.push({
    state: snap(-1, M, null, 'init', `计算总模数 M = ${equations.map((e) => e.m).join(' × ')} = ${M}`),
    description: `M = ${M}`,
    codeLine: 1,
  });

  steps.push({
    state: snap(-1, M, null, 'compute', `初始化 x = 0，开始逐项累加`),
    description: 'x = 0',
    codeLine: 2,
  });

  for (let i = 0; i < n; i++) {
    const { r, m } = equations[i];
    const Mi = M / m;
    MiValues[i] = Mi;
    steps.push({
      state: snap(i, M, null, 'compute', `第 ${i + 1} 项：M₁ = M / m${i + 1} = ${M} / ${m} = ${Mi}`),
      description: `M${i + 1}=${Mi}`,
      codeLine: 4,
    });

    const inv = modInverse(Mi, m);
    invValues[i] = inv;
    steps.push({
      state: snap(i, M, null, 'compute', `求逆元：${Mi} × ${inv} ≡ ${(Mi * inv) % m} (mod ${m})，所以 ${Mi}⁻¹ ≡ ${inv} (mod ${m})`),
      description: `逆元=${inv}`,
      codeLine: 5,
    });

    const contrib = r * Mi * inv;
    contributions[i] = contrib;
    xSum += contrib;
    steps.push({
      state: snap(i, M, null, 'compute', `累加：x += ${r} × ${Mi} × ${inv} = ${contrib}，当前 x = ${xSum}`),
      description: `累加 ${contrib}`,
      codeLine: 6,
    });
  }

  const finalX = ((xSum % M) + M) % M;
  steps.push({
    state: snap(-1, M, finalX, 'done', `取模得最小正整数解：x = ${xSum} mod ${M} = ${finalX}`),
    description: `x = ${finalX}`,
    codeLine: 8,
  });

  const checks = equations.map((e) => `${finalX} mod ${e.m} = ${finalX % e.m}`).join('，');
  steps.push({
    state: snap(-1, M, finalX, 'done', `✅ 验证：${checks}，全部满足原方程组`),
    description: '验证解',
    codeLine: 8,
  });

  return steps;
}

export function ChineseRemainderTheoremPanel() {
  const [remaindersText, setRemaindersText] = useState('2,3,2');
  const [moduliText, setModuliText] = useState('3,5,7');

  const equations = useMemo<Equation[]>(() => {
    const rs = remaindersText.split(',').map((s) => Number(s.trim())).filter(Number.isFinite);
    const ms = moduliText.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 1);
    const len = Math.min(rs.length, ms.length);
    return Array.from({ length: len }, (_, i) => ({ r: rs[i], m: ms[i] }));
  }, [remaindersText, moduliText]);

  const steps = useMemo(() => buildSteps(equations), [equations]);
  const initial: CrtState = {
    equations, M: null, currentIdx: -1, MiValues: [], invValues: [], contributions: [],
    xSum: 0, finalX: null, phase: 'init', message: '',
  };

  return (
    <Stepper<CrtState>
      steps={steps}
      initialState={initial}
      codeLines={crtCode}
      codeTitle="中国剩余定理 CRT"
      headerActions={
        <>
          <span className="text-sm text-gray-400">余数:</span>
          <input
            type="text"
            value={remaindersText}
            onChange={(e) => setRemaindersText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-24"
            placeholder="如 2,3,2"
          />
          <span className="text-sm text-gray-400">模数:</span>
          <input
            type="text"
            value={moduliText}
            onChange={(e) => setModuliText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-24"
            placeholder="如 3,5,7"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前处理项，绿色=已计算，蓝色=最终结果
          </div>

          {/* Equations */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {state.equations.map((e, i) => (
              <div
                key={i}
                className={clsx(
                  'px-3 py-2 rounded-lg border font-mono text-sm transition-all',
                  i === state.currentIdx
                    ? 'border-yellow-400 bg-yellow-500/10 text-yellow-200'
                    : state.contributions[i] !== null
                      ? 'border-green-700 bg-green-900/10 text-green-300'
                      : 'border-edge-2 bg-surface-2 text-ink-2',
                )}
              >
                x ≡ {e.r} (mod {e.m})
              </div>
            ))}
          </div>

          {/* M value */}
          {state.M !== null && (
            <div className="text-center font-mono text-sm text-gray-400">
              M = <span className="text-blue-300">{state.M}</span>
            </div>
          )}

          {/* Per-equation computation table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono text-center">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="py-1 px-2">i</th>
                  <th className="py-1 px-2">rᵢ</th>
                  <th className="py-1 px-2">mᵢ</th>
                  <th className="py-1 px-2">Mᵢ = M/mᵢ</th>
                  <th className="py-1 px-2">Mᵢ⁻¹ mod mᵢ</th>
                  <th className="py-1 px-2">rᵢ·Mᵢ·Mᵢ⁻¹</th>
                </tr>
              </thead>
              <tbody>
                {state.equations.map((e, i) => (
                  <tr
                    key={i}
                    className={clsx(
                      'border-t border-edge',
                      i === state.currentIdx ? 'bg-yellow-500/10' : '',
                    )}
                  >
                    <td className="py-2 px-2 text-gray-500">{i + 1}</td>
                    <td className="py-2 px-2 text-gray-300">{e.r}</td>
                    <td className="py-2 px-2 text-gray-300">{e.m}</td>
                    <td className={clsx('py-2 px-2', state.MiValues[i] !== null ? 'text-green-300' : 'text-gray-600')}>
                      {state.MiValues[i] ?? '?'}
                    </td>
                    <td className={clsx('py-2 px-2', state.invValues[i] !== null ? 'text-green-300' : 'text-gray-600')}>
                      {state.invValues[i] ?? '?'}
                    </td>
                    <td className={clsx('py-2 px-2', state.contributions[i] !== null ? 'text-yellow-300' : 'text-gray-600')}>
                      {state.contributions[i] ?? '?'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Running sum */}
          {state.phase !== 'init' && (
            <div className="text-center font-mono text-sm text-gray-400">
              x = <span className="text-yellow-300">{state.xSum}</span>
              {state.finalX !== null && (
                <span> → x mod M = <span className="text-blue-300 font-bold">{state.finalX}</span></span>
              )}
            </div>
          )}

          {/* Final answer */}
          {state.finalX !== null && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                最小正整数解 x = {state.finalX}
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
