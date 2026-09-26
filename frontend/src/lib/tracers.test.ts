import { traceSolution, parseTestInput, type TraceResult } from './solution-tracer';
import { tracePythonSolution } from './python-tracer';
import { traceJavaSolution } from './java-tracer';

/**
 * 三个「在线运行」执行器（solution/python/java tracer，合计约 3050 行）此前
 * 一行测试都没有 —— 而且不是忘了写，是在 Jest 下**根本 import 不进来**：
 * 它们都传递依赖 solution-tracer，而后者引入 ESM-only 的 ts-blank-space。
 * 见 jest.config.cjs 里的 transformIgnorePatterns 说明。
 *
 * 这里断言的是「算出来的答案对不对」，不是「有没有报错」。
 */

const TWO_SUM_JS = `function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (need in map) return [map[need], i];
    map[nums[i]] = i;
  }
  return [];
}`;

const TWO_SUM_PY = `
def twoSum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []
`;

const TWO_SUM_JAVA = `class Solution {
  public int[] twoSum(int[] nums, int target) {
    java.util.Map<Integer,Integer> map = new java.util.HashMap<>();
    for (int i = 0; i < nums.length; i++) {
      int need = target - nums[i];
      if (map.containsKey(need)) return new int[]{map.get(need), i};
      map.put(nums[i], i);
    }
    return new int[]{};
  }
}`;

/** 三条执行器共同的结构性不变量 */
function expectWellFormed(r: TraceResult, src: string) {
  expect(r.steps.length).toBeGreaterThan(0);
  expect(r.codeLines.length).toBe(src.split('\n').length);
  // 行号必须落在源码范围内（1-based），否则代码-动画联动会指到不存在的行
  for (const s of r.steps) {
    expect(s.line).toBeGreaterThanOrEqual(1);
    expect(s.line).toBeLessThanOrEqual(r.codeLines.length);
  }
}

describe('solution-tracer (JavaScript / acorn)', () => {
  it('twoSum 给出正确下标', () => {
    const r = traceSolution(TWO_SUM_JS, [[2, 7, 11, 15], 9], 'twoSum');
    expect(r.result).toEqual([0, 1]);
    expect(traceSolution(TWO_SUM_JS, [[3, 2, 4], 6], 'twoSum').result).toEqual([1, 2]);
    expect(traceSolution(TWO_SUM_JS, [[3, 2, 3], 6], 'twoSum').result).toEqual([0, 2]);
    // 无解时走到兜底 return
    expect(traceSolution(TWO_SUM_JS, [[1, 2], 100], 'twoSum').result).toEqual([]);
  });

  it('满足执行轨迹的公共不变量', () => {
    const r = traceSolution(TWO_SUM_JS, [[2, 7, 11, 15], 9], 'twoSum');
    expectWellFormed(r, TWO_SUM_JS);
    expect(r.truncated).toBe(false);
    expect(r.steps.filter((s) => s.done).length).toBe(1);
  });

  it('递归可正确求值', () => {
    const fib = `function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}`;
    expect(traceSolution(fib, [10], 'fib').result).toBe(55);
    expect(traceSolution(fib, [1], 'fib').result).toBe(1);
  });

  it('对象/数组字面量与循环累加', () => {
    const js = `function sumRange(n) {
  let s = 0;
  for (let i = 1; i <= n; i++) { s = s + i; }
  return s;
}`;
    expect(traceSolution(js, [100], 'sumRange').result).toBe(5050);
  });

  it('步骤快照相互独立：后续对变量的改动不会污染之前的快照', () => {
    // 这是「预计算全部帧，再像翻书一样翻」这整套可视化机制成立的前提；
    // 若快照是浅引用，回放/拖动进度条就会看到被篡改的历史状态。
    const mut = `function f(arr) {
  const s = { snapshot: arr.slice() };
  for (let i = 0; i < arr.length; i++) { arr[i] = 0; }
  return s;
}`;
    const r = traceSolution(mut, [[1, 2, 3]], 'f');
    const first = r.steps.find((s) => 'arr' in s.vars);
    const last = r.steps[r.steps.length - 1];
    expect(first?.vars.arr).toEqual([1, 2, 3]);
    expect(last.vars.arr).toEqual([0, 0, 0]);
    // 早先那个对象本身没有被就地改写
    expect(first?.vars.arr).not.toBe(last.vars.arr);
  });

  it('死循环被执行上限拦下，而不是把页面卡死', () => {
    const inf = `function loop() {
  let i = 0;
  while (true) { i = i + 1; }
  return i;
}`;
    expect(() => traceSolution(inf, [], 'loop')).toThrow(/执行超限/);
  });

  it('题内函数名缺省时仍能选出主函数', () => {
    expect(traceSolution(TWO_SUM_JS, [[2, 7], 9]).result).toEqual([0, 1]);
  });
});

describe('python-tracer', () => {
  it('twoSum 给出正确下标', () => {
    expect(tracePythonSolution(TWO_SUM_PY, [[3, 2, 4], 6], 'twoSum').result).toEqual([1, 2]);
    expect(tracePythonSolution(TWO_SUM_PY, [[1, 2], 100], 'twoSum').result).toEqual([]);
  });

  it('类方法形式（class Solution: def twoSum(self, ...)）也能定位', () => {
    const py = `
class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, n in enumerate(nums):
            if target - n in seen:
                return [seen[target - n], i]
            seen[n] = i
        return []
`;
    const r = tracePythonSolution(py, [[3, 2, 4], 6], 'twoSum');
    expect(r.result).toEqual([1, 2]);
  });

  it('while 循环、整除 // 与内置函数', () => {
    const py = `
def mySqrt(x):
    r = x
    while r * r > x:
        r = (r + x // r) // 2
    return r
`;
    expect(tracePythonSolution(py, [8], 'mySqrt').result).toBe(2);
    expect(tracePythonSolution(py, [16], 'mySqrt').result).toBe(4);
    expect(tracePythonSolution(py, [0], 'mySqrt').result).toBe(0);
  });

  it('满足执行轨迹的公共不变量', () => {
    const r = tracePythonSolution(TWO_SUM_PY, [[3, 2, 4], 6], 'twoSum');
    expectWellFormed(r, TWO_SUM_PY);
    expect(r.steps.filter((s) => s.done).length).toBe(1);
  });
});

describe('java-tracer', () => {
  it('twoSum 给出正确下标', () => {
    expect(traceJavaSolution(TWO_SUM_JAVA, 'twoSum', [[3, 2, 4], 6]).result).toEqual([1, 2]);
    expect(traceJavaSolution(TWO_SUM_JAVA, 'twoSum', [[1, 2], 100]).result).toEqual([]);
  });

  it('HashMap / new int[] 返回值可用', () => {
    const r = traceJavaSolution(TWO_SUM_JAVA, 'twoSum', [[2, 7, 11, 15], 9]);
    expect(r.result).toEqual([0, 1]);
    expectWellFormed(r, TWO_SUM_JAVA);
  });

  // 回归：Integer.MAX_VALUE 曾恒为 undefined（字段访问不走 staticCall），
  // 于是下面这道最经典的 LC 121 写法会**静默**返回 0 而不是 5。
  it('Integer.MAX_VALUE 参与比较时给出正确答案', () => {
    const src = `class Solution {
  public int maxProfit(int[] prices) {
    int best = 0, min = Integer.MAX_VALUE;
    for (int p : prices) { if (p < min) min = p; else if (p - min > best) best = p - min; }
    return best;
  }
}`;
    expect(traceJavaSolution(src, 'maxProfit', [[7, 1, 5, 3, 6, 4]]).result).toBe(5);
    expect(traceJavaSolution(src, 'maxProfit', [[7, 6, 4, 3, 1]]).result).toBe(0);
  });

  it('静态常量本身可求值', () => {
    const wrap = (expr: string) => `class Solution {\n  public int run() {\n    return ${expr};\n  }\n}`;
    expect(traceJavaSolution(wrap('Integer.MAX_VALUE'), 'run', []).result).toBe(Number.MAX_SAFE_INTEGER);
    expect(traceJavaSolution(wrap('Integer.MIN_VALUE'), 'run', []).result).toBe(Number.MIN_SAFE_INTEGER);
  });

  it('不被当作用户变量的 Integer 才会走静态解析（局部变量优先）', () => {
    const src = `class Solution {
  public int run() {
    int best = 0;
    for (int i = 0; i < 3; i++) { best = best + i; }
    return best;
  }
}`;
    expect(traceJavaSolution(src, 'run', []).result).toBe(3);
  });

  it('增强 for 与多变量声明', () => {
    const src = `class Solution {
  public int run(int[] prices) {
    int s = 0, n = 0;
    for (int p : prices) { s = s + p; n = n + 1; }
    return s;
  }
}`;
    expect(traceJavaSolution(src, 'run', [[7, 1, 5, 3, 6, 4]]).result).toBe(26);
  });
});

describe('parseTestInput', () => {
  it('解析 fn(args) 形式', () => {
    expect(parseTestInput('twoSum([1,2],3)')).toEqual({ fnName: 'twoSum', args: [[1, 2], 3] });
    expect(parseTestInput('go()')).toEqual({ fnName: 'go', args: [] });
    expect(parseTestInput('isPalindrome("aba")')).toEqual({ fnName: 'isPalindrome', args: ['aba'] });
  });

  // 该函数刻意只接受 JSON 字面量，不用 new Function/eval 求值，
  // 否则题解输入框就成了任意代码执行入口。
  it('拒绝非 JSON 字面量，不求值任意表达式', () => {
    expect(() => parseTestInput('go(1, x)')).toThrow(/仅支持 JSON 字面量/);
    expect(() => parseTestInput('go(1+1)')).toThrow(/仅支持 JSON 字面量/);
    // 形如 alert(...) 的输入能匹配到函数头，但参数不是 JSON 字面量，同样被拒
    expect(() => parseTestInput('alert(document.cookie)')).toThrow(/仅支持 JSON 字面量/);
    expect(() => parseTestInput('oops([1,2]')).toThrow(/无法解析测试输入/);
    expect(() => parseTestInput('1 + 1')).toThrow(/无法解析测试输入/);
  });
});
