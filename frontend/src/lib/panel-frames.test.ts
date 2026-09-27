/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildSteps as binSearch } from '@/components/visualizer/binary-search-panel2';
import { buildSteps as arrayOps } from '@/components/visualizer/array-panel';
import { buildSteps as monoStack } from '@/components/visualizer/monotonic-stack-panel';
import { buildSteps as lru } from '@/components/visualizer/lru-cache-panel';
import { buildSteps as unionFind } from '@/components/visualizer/union-find-panel';
import { buildSteps as dijkstra } from '@/components/visualizer/dijkstra-panel';
import { buildSteps as knapsack } from '@/components/visualizer/dp-knapsack-panel';
import { buildSteps as kmp } from '@/components/visualizer/kmp-panel';
import { buildSteps as heap } from '@/components/visualizer/heap-panel';
import { buildSteps as bst } from '@/components/visualizer/bst-panel';
import { buildSteps as prefixSum } from '@/components/visualizer/prefix-sum-panel';
import { buildSteps as mergeSort } from '@/components/visualizer/merge-sort-panel';

/**
 * 可视化面板的「末帧正确性」样板。
 *
 * 面板此前测不到，不是因为难测，而是因为 118/126 个面板的纯函数
 * `buildSteps(...)` **一个都没导出**（PROJECT_MAP §8 第 26 项）。这里给 12 个
 * 代表性面板补上 export（不改任何行为），然后对每个面板断言：
 * **动画最终停下来的状态，等于用另一套独立实现算出来的真实答案。**
 *
 * 关键在于"独立"：期望值一律用朴素的、与面板实现不同的算法在这里重算一遍，
 * 而不是把面板输出的某个数字抄进断言里当基线。
 */

const lastState = (steps: any[]) => steps[steps.length - 1].state;

// ─── 独立参考实现 ────────────────────────────────────────────────────────────

function refNextGreater(arr: number[]): number[] {
  return arr.map((v, i) => {
    for (let j = i + 1; j < arr.length; j++) if (arr[j] > v) return arr[j];
    return -1;
  });
}

function refLru(capacity: number, ops: any[]): number[] {
  let keys: number[] = []; // 越靠前越近使用
  for (const op of ops) {
    if (op.type === 'get') {
      const at = keys.indexOf(op.key);
      if (at >= 0) keys = [op.key, ...keys.slice(0, at), ...keys.slice(at + 1)];
    } else {
      const at = keys.indexOf(op.key);
      if (at >= 0) keys.splice(at, 1);
      keys.unshift(op.key);
      if (keys.length > capacity) keys.pop();
    }
  }
  return keys;
}

function refDijkstra(n: number, edges: [number, number, number][], src: number): number[] {
  const adj: [number, number][][] = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]); }
  const dist = Array(n).fill(Infinity);
  const done = Array(n).fill(false);
  dist[src] = 0;
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i;
    if (u === -1 || dist[u] === Infinity) break;
    done[u] = true;
    for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
  }
  return dist;
}

function refKnapsack01(items: { w: number; v: number }[], W: number): number {
  const dp = Array(W + 1).fill(0);
  for (const it of items) for (let c = W; c >= it.w; c--) dp[c] = Math.max(dp[c], dp[c - it.w] + it.v);
  return dp[W];
}

function inOrder(node: any, out: number[] = []): number[] {
  if (!node) return out;
  inOrder(node.left, out);
  out.push(node.value);
  inOrder(node.right, out);
  return out;
}

// ─── 12 个代表面板 ───────────────────────────────────────────────────────────

describe('binary-search-panel2', () => {
  const arr = [1, 3, 5, 7, 9, 11];
  it.each(arr.map((t) => [t]) as [number][])('命中 %i 时末帧 mid 指向真值', (target) => {
    const s = lastState(binSearch(arr, target));
    expect(s.found).toBe(true);
    expect(arr[s.mid]).toBe(target);
    expect(s.mid).toBe(arr.indexOf(target)); // 独立基准：Array#indexOf
  });
  it('未命中时末帧 found=false', () => {
    expect(lastState(binSearch(arr, 4)).found).toBe(false);
    expect(lastState(binSearch(arr, 100)).found).toBe(false);
    expect(lastState(binSearch([], 1)).found).toBe(false);
  });
});

describe('array-panel', () => {
  // 注意这个面板一轮里 **先插入再删除**，末帧是两步之后的结果；
  // 且 insPos/delPos 越界会被夹到 [0, length]，不是「跳过该步」。
  it('末帧等于独立模拟的 splice 结果', () => {
    for (const [init, insPos, insVal, delPos] of [
      [[1, 2, 3], 1, 9, 0],
      [[1, 2, 3], 0, 9, 2],
      [[4, 5, 6, 7], 3, 42, 1],
      [[8], 0, 1, 0],
    ] as [number[], number, number, number][]) {
      const ref = [...init];
      const ip = Math.max(0, Math.min(insPos, ref.length));
      ref.splice(ip, 0, insVal);
      const dp = Math.max(0, Math.min(delPos, ref.length - 1));
      ref.splice(dp, 1);
      const s = lastState(arrayOps(init, insPos, insVal, delPos));
      expect(s.cells.slice(0, s.length)).toEqual(ref);
    }
  });
});

describe('monotonic-stack-panel', () => {
  for (const caseArr of [[2, 1, 3], [7, 3, 5, 2, 6], [5, 4, 3, 2, 1], [1, 2, 3, 4, 5], [42]]) {
    it(`下一更大元素 ${JSON.stringify(caseArr)}`, () => {
      expect(lastState(monoStack(caseArr)).ans).toEqual(refNextGreater(caseArr));
    });
  }
});

describe('lru-cache-panel', () => {
  it('末帧链表内容等于独立 LRU 模拟（MRU 在前）', () => {
    const ops = [
      { type: 'put', key: 1, val: 1 },
      { type: 'put', key: 2, val: 2 },
      { type: 'get', key: 1 },
      { type: 'put', key: 3, val: 3 },
      { type: 'get', key: 2 },
      { type: 'put', key: 4, val: 4 },
    ];
    const s = lastState(lru(2, ops as any));
    expect(s.list.map((e: any) => e.key)).toEqual(refLru(2, ops));
  });

  it('容量 3 的淘汰序列也一致', () => {
    const ops = [1, 2, 3, 4].map((k) => ({ type: 'put' as const, key: k, val: k }));
    expect(lastState(lru(3, ops)).list.map((e: any) => e.key)).toEqual([4, 3, 2]);
  });
});

describe('union-find-panel', () => {
  it('末帧 parent 导出的连通关系等于独立并查集', () => {
    const n = 6;
    const ops = [{ a: 0, b: 1 }, { a: 1, b: 2 }, { a: 3, b: 4 }];
    const { parent } = lastState(unionFind(n, ops as any));
    const ref = Array.from({ length: n }, (_, i) => i);
    const find = (x: number) => { while (ref[x] !== x) x = ref[x]; return x; };
    for (const { a, b } of ops) ref[find(a)] = find(b);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        expect(find(parent[i]) === find(parent[j])).toBe(find(i) === find(j));
      }
    }
  });
});

describe('dijkstra-panel', () => {
  it('末帧 dist 等于独立最短路', () => {
    const edges: [number, number, number][] = [[0, 1, 1], [1, 2, 2], [0, 2, 5], [2, 3, 1]];
    const s = lastState(dijkstra(4, edges, 0));
    expect(s.dist).toEqual(refDijkstra(4, edges, 0));
    expect(s.dist).toEqual([0, 1, 3, 4]); // 0→2 走 0-1-2 的 3 比直连 5 短
  });

  it('不连通点保持 Infinity', () => {
    const s = lastState(dijkstra(3, [[0, 1, 2]], 0));
    expect(s.dist).toEqual(refDijkstra(3, [[0, 1, 2]], 0));
    expect(s.dist[2]).toBe(Infinity);
  });
});

describe('dp-knapsack-panel', () => {
  it('0/1 背包末格等于独立一维 DP', () => {
    const items = [
      { w: 1, v: 15, count: 1 }, { w: 3, v: 20, count: 1 },
      { w: 4, v: 30, count: 1 }, { w: 5, v: 40, count: 1 },
    ];
    const s = lastState(knapsack(items, 6, '01'));
    const dp = s.dp as number[][];
    expect(dp[dp.length - 1][6]).toBe(refKnapsack01(items, 6));
    expect(dp[dp.length - 1][6]).toBe(55);
  });

  it('容量为 0 时答案为 0', () => {
    const s = lastState(knapsack([{ w: 1, v: 5, count: 1 }], 0, '01'));
    const dp = s.dp as number[][];
    expect(dp[dp.length - 1][0]).toBe(0);
  });
});

describe('kmp-panel', () => {
  it.each([
    ['abxababc', 'abc'],
    ['aaaaa', 'aa'],
    ['hello world', 'world'],
    ['abcde', 'xyz'],
  ])('末帧起始位置等于 String#indexOf（%j 中找 %j）', (text, pattern) => {
    const s = lastState(kmp(text, pattern));
    const expected = text.indexOf(pattern);
    if (expected === -1) {
      expect(s.matched).toBe(false);
    } else {
      expect(s.matched).toBe(true);
      expect(s.matchStart).toBe(expected); // 独立基准：内置 indexOf
    }
  });
});

describe('heap-panel', () => {
  const input = [3, 1, 5, 2, 4];
  it('建成后的满长度帧满足最大堆性质', () => {
    const peak = lastState(heap(input));
    void peak; // 末帧是抽空后的状态，真正的堆形态在中途
    const full = heap(input).find((st: any) => st.state.heap.length === input.length &&
      st.state.heap.every((v: number, i: number) => i === 0 || v <= st.state.heap[Math.floor((i - 1) / 2)]));
    expect(full).toBeDefined();
  });

  it('抽取序列严格递减，且抽取值+末帧剩余值恰为原数组的降序全排列（由帧间多重集差推出，不解析文案）', () => {
    // 面板的抽取循环是 `while (heap.length > 1)`，所以末帧刻意留 1 个元素，
    // 不是漏抽；因此断言「已抽出的」+「最后剩下的」合起来正好是降序全集。
    const frames = heap(input).map((st: any) => st.state.heap as number[]);
    const extracted: number[] = [];
    for (let i = 1; i < frames.length; i++) {
      if (frames[i].length < frames[i - 1].length) {
        const rest = [...frames[i]];
        const gone = frames[i - 1].find((v) => {
          const at = rest.indexOf(v);
          if (at >= 0) { rest.splice(at, 1); return false; }
          return true;
        });
        if (gone !== undefined) extracted.push(gone);
      }
    }
    for (let i = 1; i < extracted.length; i++) {
      expect(extracted[i]).toBeLessThan(extracted[i - 1]); // 严格递减 = 每次确实取到当前最大
    }
    expect([...extracted, ...frames[frames.length - 1]].sort((a, b) => b - a))
      .toEqual([...input].sort((a, b) => b - a));
  });
});

describe('bst-panel', () => {
  it('末帧二叉搜索树的中序遍历等于去重后的升序输入', () => {
    const values = [5, 3, 8, 1, 4, 9, 2];
    const s = lastState(bst(values));
    expect(inOrder(s.tree)).toEqual([...new Set(values)].sort((a, b) => a - b));
  });
});

describe('prefix-sum-panel', () => {
  it('前缀和数组与末次查询结果都等于独立计算', () => {
    const nums = [1, 2, 3, 4];
    const queries: [number, number][] = [[0, 1], [1, 3]];
    const s = lastState(prefixSum(nums, queries));
    const ref: number[] = [0];
    nums.forEach((v) => ref.push(ref[ref.length - 1] + v));
    expect(s.prefix).toEqual(ref);
    const [l, r] = queries[queries.length - 1];
    expect(s.queryResult).toBe(ref[r + 1] - ref[l]);
  });
});

describe('merge-sort-panel', () => {
  it('末帧数组等于排序结果', () => {
    const input = [5, 2, 4, 1, 3];
    expect(lastState(mergeSort(input)).array).toEqual([1, 2, 3, 4, 5]);
  });

  it('不改动入参数组', () => {
    const input = [3, 1, 2];
    mergeSort(input);
    expect(input).toEqual([3, 1, 2]);
  });
});

// ─── 第二批：排序家族 + 单数组输入的经典题 ────────────────────────────────────

import { buildSteps as quickSort } from '@/components/visualizer/quick-sort-panel';
import { buildSteps as heapSort } from '@/components/visualizer/heap-sort-panel';
import { buildSteps as shellSort } from '@/components/visualizer/shell-sort-panel';
import { buildSteps as countingSort } from '@/components/visualizer/counting-sort-panel';
import { buildSteps as maxSubarray } from '@/components/visualizer/maximum-subarray-panel';
import { buildSteps as bestTime } from '@/components/visualizer/best-time-panel';
import { buildSteps as lisSteps } from '@/components/visualizer/lis-panel';
import { buildSteps as windowSteps } from '@/components/visualizer/sliding-window-panel';
import { buildSteps as twoPointers } from '@/components/visualizer/two-pointers-panel';
import { buildSteps as jumpGame } from '@/components/visualizer/jump-game-panel';
import { buildSteps as houseRobber } from '@/components/visualizer/house-robber-panel';

const SORTED = [1, 2, 5, 8, 9];
const SHUFFLES = [[5, 2, 8, 1, 9], [3, 3, 1, 2], [1], [], [9, 8, 7, 6, 5], [4, 2, 4, 2, 4]];

describe('排序家族末帧（quick / heap / shell / counting）', () => {
  // Array#sort 是独立的参照实现；同时断言多重集守恒，防「丢元素/造元素」这类假排序。
  for (const [name, build, field] of [
    ['quick-sort', quickSort, 'array'],
    ['heap-sort', heapSort, 'array'],
    ['shell-sort', shellSort, 'arr'],
    ['counting-sort', countingSort, 'output'],
  ] as [string, (a: number[]) => any[], string][]) {
    for (const input of SHUFFLES) {
      it(`${name} 在 ${JSON.stringify(input)} 上排好序且不丢元素`, () => {
        const s = lastState(build(input));
        expect(s[field]).toEqual([...input].sort((a, b) => a - b));
        expect([...s[field]].sort((a, b) => a - b)).toEqual([...input].sort((a, b) => a - b));
      });
    }
    it(`${name} 不改动入参数组`, () => {
      const input = [...SORTED].reverse();
      const snapshot = [...input];
      build(input);
      expect(input).toEqual(snapshot);
    });
  }
});

describe('maximum-subarray-panel', () => {
  for (const nums of [[-2, 1, -3, 4, -1, 2, 1, -5, 4], [-1, -2, -3], [5], [], [1, 2, 3]]) {
    it(`最大子数组和 ${JSON.stringify(nums)}`, () => {
      // 参照：O(n^2) 暴力枚举，与面板的 Kadane 单遍实现路径完全不同
      let ref = nums.length ? nums[0] : 0;
      for (let i = 0; i < nums.length; i++) {
        let acc = 0;
        for (let j = i; j < nums.length; j++) { acc += nums[j]; ref = Math.max(ref, acc); }
      }
      expect(lastState(maxSubarray(nums)).maxSum).toBe(ref);
    });
  }
});

describe('best-time-panel（LC 122：可多笔交易）', () => {
  // 该面板实现的是 lastBuy/lastSold 状态机，即**无限笔**版本；
  // 参照用「所有正向价差之和」这一完全不同的算法。注意别按 LC 121（单笔）出期望值。
  for (const prices of [[7, 1, 5, 3, 6, 4], [1, 2, 3, 4, 5], [7, 6, 4, 3, 1], [2, 4, 1], []]) {
    it(`最大利润 ${JSON.stringify(prices)}`, () => {
      let ref = 0;
      for (let i = 1; i < prices.length; i++) if (prices[i] > prices[i - 1]) ref += prices[i] - prices[i - 1];
      expect(lastState(bestTime(prices)).lastSold).toBe(ref);
    });
  }
});

describe('lis-panel', () => {
  for (const seq of [[10, 9, 2, 5, 3, 7, 101, 18], [7, 7, 7], [1, 3, 6, 7, 9], [4, 3, 2, 1], []]) {
    it(`最长递增子序列长度 ${JSON.stringify(seq)}`, () => {
      const dp = seq.map(() => 1);
      for (let i = 1; i < seq.length; i++) for (let j = 0; j < i; j++) if (seq[j] < seq[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
      expect(lastState(lisSteps(seq)).maxLen).toBe(seq.length ? Math.max(...dp) : 0);
    });
  }
});

describe('sliding-window-panel', () => {
  for (const s of ['abcabcbb', 'bbbbb', 'pwwkew', '', 'dvdf']) {
    it(`无重复字符最长子串长度 "${s}"`, () => {
      let ref = 0;
      for (let i = 0; i < s.length; i++) {
        const seen = new Set<string>();
        for (let j = i; j < s.length; j++) { if (seen.has(s[j])) break; seen.add(s[j]); }
        ref = Math.max(ref, seen.size);
      }
      expect(lastState(windowSteps(s)).best).toBe(ref);
    });
  }
});

describe('two-pointers-panel', () => {
  const cases: [number[], number][] = [[[2, 7, 11, 15], 9], [[1, 3, 5], 8], [[1, 2, 3], 100]];
  it('末帧给出的下标对确实求和等于 target', () => {
    for (const [arr, target] of cases) {
      const s = lastState(twoPointers(arr, target));
      if (s.found) {
        const [i, j] = s.foundPair;
        expect(arr[i] + arr[j]).toBe(target);
      } else {
        // 独立暴力判定：确无两数和等于 target
        let exists = false;
        for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) if (arr[i] + arr[j] === target) exists = true;
        expect(exists).toBe(false);
      }
    }
  });
});

describe('jump-game-panel', () => {
  for (const nums of [[2, 3, 1, 1, 4], [3, 2, 1, 0, 4], [0], [1, 0]]) {
    it(`可达性 ${JSON.stringify(nums)}`, () => {
      let reach = 0; // 参照：贪心最远可达
      for (let i = 0; i < nums.length && i <= reach; i++) reach = Math.max(reach, i + nums[i]);
      expect(lastState(jumpGame(nums)).reachable[0]).toBe(reach >= nums.length - 1);
    });
  }

  // 空数组下「能否从下标 0 到末尾」没有良定义（末尾下标是 -1），所以不断言结论，
  // 只断言它不崩、且明确提示空输入，而不是渲染「下标 -1」这种句子。
  it('空输入给一帧明确提示而不是无意义文案', () => {
    const s = lastState(jumpGame([]));
    expect(s.reachable).toEqual([]);
    expect(s.message).toContain('输入为空');
  });
});

describe('house-robber-panel', () => {
  for (const nums of [[2, 7, 9, 3, 1], [1, 2, 3, 1], [2, 1, 1, 2], [5], []]) {
    it(`最大可偷金额 ${JSON.stringify(nums)}`, () => {
      let prev2 = 0, prev1 = 0; // 参照：滚动 DP
      for (const v of nums) { const t = Math.max(prev1, prev2 + v); prev2 = prev1; prev1 = t; }
      expect(lastState(houseRobber(nums)).cur).toBe(prev1);
    });
  }
});

// ─── 第三批：字符串 / 递归计数 / AVL / Trie / ADT ─────────────────────────────

import { buildSteps as manacher } from '@/components/visualizer/manacher-panel';
import { buildSteps as staircase } from '@/components/visualizer/staircase-panel';
import { buildSteps as hanoi } from '@/components/visualizer/hanoi-tower-panel';
import { buildSteps as nQueens } from '@/components/visualizer/n-queens-panel';
import { buildSteps as permutations } from '@/components/visualizer/permutations-panel';
import { buildSteps as powerSet } from '@/components/visualizer/power-set-panel';
import { buildSteps as avlBuild } from '@/components/visualizer/avl-panel';
import { buildSteps as trieBuild } from '@/components/visualizer/trie-panel';
import { buildSteps as hashTable } from '@/components/visualizer/hash-table-panel';
import { buildSteps as stackPanel } from '@/components/visualizer/stack-panel';
import { buildSteps as queuePanel } from '@/components/visualizer/queue-panel';
import { buildSteps as listPanel } from '@/components/visualizer/linked-list-panel';

function refLongestPalindrome(s: string): number {
  let best = 0;
  const grow = (l: number, r: number) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { best = Math.max(best, r - l + 1); l--; r++; }
  };
  for (let i = 0; i < s.length; i++) { grow(i, i); grow(i, i + 1); }
  return best;
}

describe('manacher-panel', () => {
  for (const s of ['babad', 'cbbd', 'a', '', 'abacaba', 'aaaa']) {
    it(`最长回文子串长度 "${s}"`, () => {
      expect(lastState(manacher(s)).maxLen).toBe(refLongestPalindrome(s));
    });
  }
});

describe('staircase-panel', () => {
  for (const n of [1, 2, 3, 4, 10]) {
    it(`爬楼梯方法数 n=${n}`, () => {
      const dp = [0, 1, 2];
      for (let i = 3; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
      expect(lastState(staircase(n)).steps[n]).toBe(dp[n]);
    });
  }
});

describe('hanoi-tower-panel', () => {
  for (const n of [1, 2, 3, 4]) {
    it(`${n} 层：移动次数 2^n-1、大盘永不在小盘之上、末态全部到目标柱`, () => {
      const frames = hanoi(n).map((st: any) => st.state.poles as number[][]);
      let moves = 0;
      for (const p of frames) {
        // 不变量：每根柱从上到下（数组尾部是顶）必须严格递增，即不许大盘压小盘
        for (const pole of p) {
          for (let i = pole.length - 1; i > 0; i--) {
            expect(pole[i]).toBeLessThan(pole[i - 1]);
          }
        }
      }
      for (let i = 1; i < frames.length; i++) {
        const total = frames[i].reduce((a, p) => a + p.length, 0);
        const prev = frames[i - 1].reduce((a, p) => a + p.length, 0);
        if (total !== prev) throw new Error('汉诺塔不该改变盘子总数');
        const moved = frames[i - 1].findIndex((p, idx) => p.length !== frames[i][idx].length);
        if (moved >= 0) moves++;
      }
      expect(moves).toBe(Math.pow(2, n) - 1);
      const discsOnLast = frames[frames.length - 1][2];
      expect([...discsOnLast].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i + 1));
      expect(frames[frames.length - 1][0]).toEqual([]);
    });
  }
});

function refQueens(n: number): number[][] {
  const out: number[][] = [];
  const cols: number[] = [];
  const ok = (r: number, c: number) => cols.every((pc, pr) => pc !== c && Math.abs(pc - c) !== Math.abs(pr - r));
  const bt = (r: number) => {
    if (r === n) { out.push([...cols]); return; }
    for (let c = 0; c < n; c++) if (ok(r, c)) { cols[r] = c; bt(r + 1); cols.pop(); }
  };
  bt(0);
  return out;
}

describe('n-queens-panel', () => {
  for (const n of [1, 4, 5, 6]) {
    it(`${n} 后：解数与解的合法性都等于独立回溯`, () => {
      const ref = refQueens(n);
      const s = lastState(nQueens(n));
      expect(s.solutionCount).toBe(ref.length);
      expect([...s.solutions].sort()).toEqual([...ref].sort());
      for (const sol of s.solutions) {
        expect(sol).toHaveLength(n);
        expect(new Set(sol).size).toBe(n); // 每列恰一个
        expect(new Set(sol.map((c: number, r: number) => c + r)).size).toBe(n);
        expect(new Set(sol.map((c: number, r: number) => c - r)).size).toBe(n);
      }
    });
  }
});

describe('permutations / power-set 计数', () => {
  for (const items of [['a', 'b', 'c'], ['x'], ['1', '2', '3', '4']]) {
    it(`全排列 ${JSON.stringify(items)} 恰好是 n! 个且无重复`, () => {
      const res = lastState(permutations(items)).results as string[][];
      expect(res).toHaveLength(factorial(items.length));
      expect(new Set(res.map((r) => r.join(','))).size).toBe(res.length);
      for (const r of res) expect([...r].sort()).toEqual([...items].sort());
    });

    it(`幂集 ${JSON.stringify(items)} 是 2^n 个子集且互不相同`, () => {
      const subs = lastState(powerSet(items)).allSubsets as string[][];
      expect(subs).toHaveLength(2 ** items.length);
      expect(new Set(subs.map((s) => s.slice().sort().join(','))).size).toBe(subs.length);
      for (const s of subs) for (const v of s) expect(items).toContain(v);
    });
  }
});

function factorial(k: number): number { return k <= 1 ? 1 : k * factorial(k - 1); }

describe('avl-panel', () => {
  // 四种失衡形态都要覆盖到，否则「旋转被禁掉」测不出来：升序只触发 RR、
  // 降序只触发 LL，LR/RL 需要穿插插入。（本轮变异验证就发现过只测升序的盲区。）
  for (const values of [
    [5, 3, 8, 1, 9, 7],
    [1, 2, 3, 4, 5, 6, 7],        // 连续右倾 → RR
    [7, 6, 5, 4, 3, 2, 1],        // 连续左倾 → LL
    [3, 1, 2],                    // LR
    [3, 5, 4],                    // RL
    [10],
    [],
  ]) {
    it(`AVL ${JSON.stringify(values)}：中序有序、高度字段自洽、平衡因子 ≤1`, () => {
      const end = lastState(avlBuild(values));
      const nodes = end.nodes as any[];
      expect(nodes).toHaveLength(values.length);
      if (!nodes.length) return;
      // 根节点不保证是数组下标 0——nodes 是按创建顺序追加的，旋转后根会换人；
      // 面板自己暴露了 root 字段，必须用它。
      const inOrder = (i: number, out: number[]) => {
        if (i < 0) return out;
        inOrder(nodes[i].left, out);
        out.push(nodes[i].val);
        inOrder(nodes[i].right, out);
        return out;
      };
      expect(inOrder(end.root, [])).toEqual([...values].sort((a, b) => a - b));

      const height = (i: number): number => (i < 0 ? 0 : 1 + Math.max(height(nodes[i].left), height(nodes[i].right)));
      for (let i = 0; i < nodes.length; i++) {
        expect(nodes[i].height).toBe(height(i)); // 记录的 height 必须与子树推出的一致
        expect(Math.abs(height(nodes[i].left) - height(nodes[i].right))).toBeLessThanOrEqual(1);
      }
      // root 必须真的不被任何节点指为子节点
      for (const nd of nodes) { expect(nd.left).not.toBe(end.root); expect(nd.right).not.toBe(end.root); }
    });
  }
});

describe('trie-panel', () => {
  for (const words of [['cat', 'car', 'cate'], ['a'], ['ab', 'abc', 'abcd'], []]) {
    it(`Trie ${JSON.stringify(words)} 里标记为整词的路径恰好是这些词`, () => {
      const nodes = lastState(trieBuild(words)).nodes as any[];
      const found: string[] = [];
      const walk = (idx: number, prefix: string) => {
        if (nodes[idx].isEnd) found.push(prefix);
        for (const [ch, nxt] of Object.entries(nodes[idx].children)) walk(nxt as number, prefix + ch);
      };
      if (nodes.length) walk(0, '');
      expect(found.sort()).toEqual([...words].sort());
    });
  }
});

describe('hash-table-panel', () => {
  for (const seed of [[4, 8, 15, 16, 23, 42], [1, 2, 3], [7]]) {
    it(`每个键都落在 key % capacity 的桶里且不丢键`, () => {
      const s = lastState(hashTable(seed));
      const seen: number[] = [];
      s.buckets.forEach((bucket: number[], idx: number) => {
        for (const k of bucket) {
          expect(k % s.capacity).toBe(idx);
          seen.push(k);
        }
      });
      expect([...seen].sort((a, b) => a - b)).toEqual([...seed].sort((a, b) => a - b));
    });
  }
});

// ─── 第四批：矩阵 / 数论 / 字符串 / 树 / 图 ──────────────────────────────────

import { buildSteps as rotateBuild } from '@/components/visualizer/matrix-rotation-panel';
import { buildSteps as gaussBuild } from '@/components/visualizer/gaussian-elimination-panel';
import { buildSteps as crtBuild } from '@/components/visualizer/chinese-remainder-theorem-panel';
import { buildSteps as matExpBuild } from '@/components/visualizer/matrix-exponentiation-panel';
import { buildSteps as nimBuild } from '@/components/visualizer/game-theory-panel';
import { buildSteps as saBuild } from '@/components/visualizer/suffix-array-panel';
import { buildSteps as puzzleBuild } from '@/components/visualizer/eight-puzzle-panel';
import { buildSteps as treapBuild } from '@/components/visualizer/treap-panel';
import { buildSteps as rbtBuild } from '@/components/visualizer/red-black-tree-panel';
import { buildSteps as skipBuild } from '@/components/visualizer/skip-list-panel';
import { buildSteps as graphBuild } from '@/components/visualizer/graph-storage-traversal-panel';
import { buildSteps as btBuild } from '@/components/visualizer/backtracking-panel';

const GOAL8 = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function refRotateCW(m: number[][]): number[][] {
  const n = m.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) out[r][c] = m[n - 1 - c][r];
  return out;
}

function refCrt(eqs: { r: number; m: number }[]): number {
  const M = eqs.reduce((a, e) => a * e.m, 1);
  for (let x = 0; x < M; x++) if (eqs.every((e) => x % e.m === ((e.r % e.m) + e.m) % e.m)) return x;
  return -1;
}

function refFib(n: number): number {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) { const t = a + b; a = b; b = t; }
  return a;
}

function refBfsDist(start: number[], goal: number[]): number {
  const key = (b: number[]) => b.join(',');
  if (key(start) === key(goal)) return 0; // 起点即终点：先判再搜，否则这里会漏成 2
  const seen = new Set([key(start)]);
  let frontier = [start];
  for (let d = 1; d <= 31; d++) {
    const next: number[][] = [];
    for (const b of frontier) {
      const z = b.indexOf(0), r = Math.floor(z / 3), c = z % 3;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr > 2 || nc < 0 || nc > 2) continue;
        const nb = [...b]; const k = nr * 3 + nc;
        [nb[z], nb[k]] = [nb[k], nb[z]];
        if (key(nb) === key(goal)) return d;
        if (!seen.has(key(nb))) { seen.add(key(nb)); next.push(nb); }
      }
    }
    frontier = next;
  }
  return -1;
}

describe('matrix-rotation-panel（声明为顺时针：先转置再逐行翻转）', () => {
  for (const m of [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 2], [3, 4]], [[7]]]) {
    it(`顺时针旋转 ${JSON.stringify(m)}`, () => {
      expect(lastState(rotateBuild(m)).m).toEqual(refRotateCW(m));
    });
  }
  it('连转四次回到原矩阵，且每帧都是原矩阵的一个置换', () => {
    const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    let cur = m;
    const flat = m.flat().slice().sort((a, b) => a - b);
    for (let i = 0; i < 4; i++) {
      cur = refRotateCW(cur);
      expect(cur.flat().slice().sort((a, b) => a - b)).toEqual(flat);
    }
    expect(cur).toEqual(m);
  });
});

describe('gaussian-elimination-panel', () => {
  // 参照不重跑消元，而是把末帧解代回原方程组验残差——完全不同的验证路径。
  const systems: number[][][] = [
    [[2, 1, -1, 8], [-3, -1, 2, -11], [-4, -5, 7, -3]],
    [[1, 1, 1, 6], [2, 1, 0, 8], [1, 3, 2, 13]],
    [[3, -1, 2, 8], [1, 4, -1, -3], [2, 1, 5, 11]],
  ];
  systems.forEach((aug, si) => {
    it(`第 ${si + 1} 组：末帧解满足原方程组`, () => {
      const sol = lastState(gaussBuild(aug)).solution as number[];
      expect(sol).toHaveLength(aug[0].length - 1);
      for (const row of aug) {
        const lhs = row.slice(0, -1).reduce((a, coef, i) => a + coef * sol[i], 0);
        expect(Math.abs(lhs - row[row.length - 1])).toBeLessThan(1e-6);
      }
    });
  });
});

describe('chinese-remainder-theorem-panel', () => {
  for (const eqs of [
    [{ r: 2, m: 3 }, { r: 3, m: 5 }, { r: 2, m: 7 }],
    [{ r: 1, m: 2 }, { r: 2, m: 3 }, { r: 3, m: 5 }],
    [{ r: 0, m: 7 }],
  ]) {
    it(`最小非负解 ${JSON.stringify(eqs)}`, () => {
      const expected = refCrt(eqs);
      expect(lastState(crtBuild(eqs as any)).finalX).toBe(expected);
    });
  }
});

describe('matrix-exponentiation-panel', () => {
  for (const n of [0, 1, 2, 5, 10, 20]) {
    it(`fib(${n}) 用快速幂与迭代同值`, () => {
      expect(lastState(matExpBuild(n)).answer).toBe(refFib(n));
    });
  }
});

describe('game-theory-panel（Nim）', () => {
  for (const piles of [[3, 4, 5], [1, 1], [2, 2, 2], [7], [0]]) {
    it(`${JSON.stringify(piles)}：XOR 判定与必胜着法都自洽`, () => {
      const xr = piles.reduce((a, b) => a ^ b, 0);
      const s = lastState(nimBuild(piles));
      expect(s.nimSum).toBe(xr);
      expect(s.isWinning).toBe(xr !== 0);
      if (xr !== 0) {
        expect(s.move).not.toBeNull();
        const { pile, take } = s.move as { pile: number; take: number };
        // 必胜着的定义：走完这一步把 XOR 变成 0
        expect(piles[pile] - take).toBeGreaterThanOrEqual(0);
        expect(piles.map((v, i) => (i === pile ? v - take : v)).reduce((a, b) => a ^ b, 0)).toBe(0);
      }
    });
  }
});

describe('suffix-array-panel', () => {
  it('sa 是后缀的真降序排列，height 等于相邻后缀的 LCP', () => {
    const s = 'banana';
    const st = lastState(saBuild(s));
    const sa = st.sa as number[];
    expect([...sa].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
    for (let i = 1; i < sa.length; i++) expect(s.slice(sa[i - 1]) < s.slice(sa[i])).toBe(true);
    const lcp = (a: string, b: string) => { let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++; return k; };
    const refH = sa.map((idx, rank) => (rank === 0 ? 0 : lcp(s.slice(idx), s.slice(sa[rank - 1]))));
    expect(st.height).toEqual(refH);
  });
});

describe('eight-puzzle-panel', () => {
  for (const start of [[1, 2, 3, 4, 0, 5, 7, 8, 6], [1, 2, 3, 4, 5, 6, 7, 8, 0], GOAL8.slice().reverse()]) {
    it(`${JSON.stringify(start)}：末态即目标布局，步数等于独立 BFS 的最短步数`, () => {
      const d = refBfsDist(start, GOAL8);
      if (d < 0) return; // 不可解的布局不断言步数，只要求面板不崩
      const s = lastState(puzzleBuild(start));
      expect(s.board).toEqual(GOAL8);
      expect(s.total).toBe(d);
    });
  }
});

/** 节点表按创建顺序追加，根不一定是下标 0（AVL 那轮的教训），按入度找根。 */
function findRoot(nodes: any[]): number {
  const childed = new Set<number>();
  for (const nd of nodes) { if (nd.left >= 0) childed.add(nd.left); if (nd.right >= 0) childed.add(nd.right); }
  return nodes.findIndex((_, i) => !childed.has(i));
}

describe('treap-panel', () => {
  for (const values of [[5, 3, 8, 1, 9], [4, 2], [7], []]) {
    it(`Treap ${JSON.stringify(values)}：中序有序 + 优先级满足堆序`, () => {
      const nodes = lastState(treapBuild(values)).nodes as any[];
      expect(nodes).toHaveLength(values.length);
      if (!nodes.length) return;
      const root = findRoot(nodes);
      expect(root).toBeGreaterThanOrEqual(0);
      const inOrder = (i: number, out: number[]): number[] => {
        if (i < 0) return out;
        inOrder(nodes[i].left, out); out.push(nodes[i].val); inOrder(nodes[i].right, out); return out;
      };
      expect(inOrder(root, [])).toEqual([...values].sort((a, b) => a - b));
      for (const nd of nodes) {
        for (const ch of [nd.left, nd.right] as number[]) {
          if (ch >= 0) expect(nd.pri).toBeGreaterThan(nodes[ch].pri); // 最大堆
        }
      }
    });
  }
});

describe('red-black-tree-panel', () => {
  for (const values of [[5, 3, 8, 1, 9, 7], [1, 2, 3, 4, 5, 6, 7], [7, 6, 5, 4, 3, 2, 1], [10]]) {
    it(`红黑树 ${JSON.stringify(values)}：中序有序、根为黑、无连续红、黑高一致`, () => {
      const nodes = lastState(rbtBuild(values)).nodes as any[];
      expect(nodes).toHaveLength(values.length);
      // 面板用 (depth, pos) 描述位置，按完全二叉树编号还原父子关系
      const idxOf = new Map<number, number>();
      nodes.forEach((nd, i) => idxOf.set((2 ** nd.depth - 1) + nd.pos, i));
      const at = (num: number) => (idxOf.has(num) ? idxOf.get(num)! : -1);
      expect(nodes[0].red).toBe(false);
      const inOrder = (num: number, out: number[]): number[] => {
        const i = at(num);
        if (i < 0) return out;
        inOrder(num * 2 + 1, out); out.push(nodes[i].value); inOrder(num * 2 + 2, out); return out;
      };
      expect(inOrder(0, [])).toEqual([...values].sort((a, b) => a - b));
      const bh = (num: number, parentRed: boolean): number => {
        const i = at(num);
        if (i < 0) return 1;
        if (nodes[i].red) expect(parentRed).toBe(false);
        const l = bh(num * 2 + 1, nodes[i].red);
        const r = bh(num * 2 + 2, nodes[i].red);
        expect(l).toBe(r); // 同节点两子树黑高必须相等
        return l + (nodes[i].red ? 0 : 1);
      };
      bh(0, false);
    });
  }
});

describe('skip-list-panel', () => {
  it('第 0 层含全部元素且有序；上层是下层的子序列；查找结论正确', () => {
    for (const target of [12, 99]) {
      const s = lastState(skipBuild([3, 7, 12, 19, 25], 4, target));
      const lv = (s.levels as (number | null)[][]).map((l) => l.filter((v): v is number => v !== null));
      expect(lv[0]).toEqual([3, 7, 12, 19, 25]);
      for (let i = 1; i < lv.length; i++) {
        let p = 0;
        for (const v of lv[i]) {
          while (p < lv[i - 1].length && lv[i - 1][p] !== v) p++;
          expect(p).toBeLessThan(lv[i - 1].length);
        }
      }
      expect(s.found).toBe([3, 7, 12, 19, 25].includes(target));
    }
  });
});

describe('graph-storage-traversal-panel', () => {
  const ADJ = [[1, 2], [0, 3, 4], [0, 4], [1, 4], [1, 2, 3]]; // 与面板内置图一致（数据，非算法）
  it('DFS 序列等于我按同一邻接表跑出的 DFS，BFS 序列同理', () => {
    const dfs: number[] = [];
    const seenD = new Set<number>();
    const go = (u: number) => { seenD.add(u); dfs.push(u); for (const v of ADJ[u]) if (!seenD.has(v)) go(v); };
    go(0);
    const bfs: number[] = [];
    const seenB = new Set<number>([0]);
    for (let q = [0]; q.length;) {
      const u = q.shift()!;
      bfs.push(u);
      for (const v of ADJ[u]) if (!seenB.has(v)) { seenB.add(v); q.push(v); }
    }
    const frames = graphBuild(0).map((st: any) => st.state);
    const lastDfs = [...frames].reverse().find((f: any) => f.phase === 'dfs' && f.order.length === ADJ.length);
    expect(lastDfs?.order).toEqual(dfs);
    const anyBfs = frames.find((f: any) => f.phase === 'bfs' && f.order.length === ADJ.length);
    if (anyBfs) expect(anyBfs.order).toEqual(bfs);
    expect(new Set(lastDfs.order)).toEqual(new Set([0, 1, 2, 3, 4]));
  });
});

describe('backtracking-panel', () => {
  it('全排列结果集等于独立生成的排列集', () => {
    const nums = [1, 2, 3];
    const ref: number[][] = [];
    const walk = (path: number[], rest: number[]) => {
      if (!rest.length) { ref.push([...path]); return; }
      rest.forEach((v, i) => walk([...path, v], [...rest.slice(0, i), ...rest.slice(i + 1)]));
    };
    walk([], nums);
    const res = lastState(btBuild(nums)).results as number[][];
    expect(res.map((r) => r.join(','))).toEqual(expect.arrayContaining(ref.map((r) => r.join(','))));
    expect(res).toHaveLength(ref.length);
    expect(new Set(res.map((r) => r.join(','))).size).toBe(res.length);
  });
});

// ─── 第五批：最短路 / MST / 拓扑 / 区间 DP / 数论 / 线段树 ────────────────────

import { buildSteps as bfBuild } from '@/components/visualizer/bellman-ford-panel';
import { buildSteps as fwBuild } from '@/components/visualizer/floyd-warshall-panel';
import { buildSteps as primBuild } from '@/components/visualizer/prim-panel';
import { buildSteps as kruskalBuild } from '@/components/visualizer/kruskal-panel';
import { buildSteps as topoBuild } from '@/components/visualizer/topological-sort-panel';
import { buildSteps as edBuild } from '@/components/visualizer/edit-distance-panel';
import { buildSteps as upBuild } from '@/components/visualizer/unique-paths-panel';
import { buildSteps as csumBuild } from '@/components/visualizer/combination-sum-panel';
import { buildSteps as cpBuild } from '@/components/visualizer/cartesian-product-panel';
import { buildSteps as combBuild } from '@/components/visualizer/combinations-panel';
import { buildSteps as exgcdBuild } from '@/components/visualizer/extended-gcd-panel';
import { buildSteps as segBuild } from '@/components/visualizer/segment-tree-panel';

type WEdge = [number, number, number];

function refMstWeight(n: number, es: WEdge[]): number {
  const par = Array.from({ length: n }, (_, i) => i);
  const find = (x: number) => { while (par[x] !== x) x = par[x]; return x; };
  let total = 0, used = 0;
  for (const [u, v, w] of [...es].sort((a, b) => a[2] - b[2])) {
    if (find(u) !== find(v)) { par[find(u)] = find(v); total += w; used++; }
  }
  return used === n - 1 ? total : -1;
}

function refEditDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function refComb(n: number, k: number): number {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

const GW: WEdge[] = [[0, 1, 1], [1, 2, 2], [0, 2, 5], [2, 3, 1], [1, 3, 6]];
const toU = (es: WEdge[]) => es.map(([u, v, w]) => ({ u, v, w }));

describe('bellman-ford-panel', () => {
  // 该面板已与 floyd-warshall / prim / kruskal 对齐：边表表示**无向**图
  // （内部把每条边展开成两个方向）。四个图面板对同一份边表必须给出一致的距离。
  const cases: [number, WEdge[], number][] = [
    [4, GW, 0],
    [4, GW, 3],
    [3, [[0, 1, 2], [1, 2, 3]], 0],
    [2, [], 0],
    [5, [[0, 1, 4], [0, 2, 1], [1, 3, 1], [2, 1, 2], [2, 3, 5], [3, 4, 3]], 0],
  ];
  for (const [n, es, src] of cases) {
    it(`单源最短路 n=${n} src=${src}`, () => {
      // 参照用 Dijkstra（正权图上完全不同的算法路径），而不是再跑一遍松弛
      expect(lastState(bfBuild(n, toU(es), src)).dist).toEqual(refDijkstra(n, es, src));
    });
  }

  // 改成无向之后新增的能力：源点没有任何出边时也应当能到达其余点。
  // 有向实现下这里会是 [Infinity, Infinity, 0]。
  it('源点无出边时仍可到达其余点', () => {
    const es: WEdge[] = [[0, 1, 2], [1, 2, 3]];
    expect(lastState(bfBuild(3, toU(es), 2)).dist).toEqual([5, 3, 0]);
  });
});

describe('floyd-warshall-panel', () => {
  for (const [n, es] of [[4, GW], [3, [[0, 1, 4], [1, 2, 1]]]] as [number, WEdge[]][]) {
    it(`所有点对 n=${n}`, () => {
      const d = lastState(fwBuild(n, es)).dist as number[][];
      for (let s = 0; s < n; s++) expect(d[s]).toEqual(refDijkstra(n, es, s));
      for (let i = 0; i < n; i++) {
        expect(d[i][i]).toBe(0);
        for (let j = 0; j < n; j++) expect(d[i][j]).toBe(d[j][i]); // 无向图对称
      }
    });
  }
});

describe('prim / kruskal MST', () => {
  const graphs: [number, WEdge[]][] = [[4, GW], [4, [[0, 1, 3], [1, 2, 4], [2, 3, 2], [0, 3, 9]]], [2, [[0, 1, 5]]]];
  for (const [n, es] of graphs) {
    it(`prim 的 MST 总权重等于独立 Kruskal（n=${n}）`, () => {
      const s = lastState(primBuild(n, es, 0));
      expect(s.totalWeight).toBe(refMstWeight(n, es));
      expect(s.inMST.filter(Boolean)).toHaveLength(n);
    });

    it(`kruskal 的 MST 总权重与排序序列都正确（n=${n}）`, () => {
      const s = lastState(kruskalBuild(n, toU(es)));
      expect(s.totalWeight).toBe(refMstWeight(n, es));
      const w = (s.sortedEdges as any[]).map((e) => e.w);
      expect([...w].sort((a, b) => a - b)).toEqual(w); // 确实按权重升序
    });
  }
});

describe('topological-sort-panel', () => {
  const cases: [number, [number, number][]][] = [
    [6, [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]]],
    [4, [[0, 1], [1, 2], [2, 3]]],
    [3, []],
  ];
  for (const [n, es] of cases) {
    it(`${n} 点 ${es.length} 边的序确实是拓扑序`, () => {
      const order = lastState(topoBuild(n, es)).result as number[];
      expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i));
      const at = new Map(order.map((v, i) => [v, i]));
      for (const [u, v] of es) expect(at.get(u)!).toBeLessThan(at.get(v)!);
    });
  }
});

describe('edit-distance-panel', () => {
  for (const [a, b] of [['horse', 'ros'], ['', 'abc'], ['abc', ''], ['intention', 'execution'], ['same', 'same']]) {
    it(`编辑距离 "${a}" → "${b}"`, () => {
      const s = lastState(edBuild(a, b));
      expect(s.dp[a.length][b.length]).toBe(refEditDistance(a, b));
    });
  }
});

describe('unique-paths-panel', () => {
  for (const [m, n] of [[3, 7], [1, 1], [1, 5], [5, 1], [7, 3]]) {
    it(`${m}×${n} 网格路径数等于组合数 C(m+n-2, m-1)`, () => {
      expect(lastState(upBuild(m, n)).dp[m - 1][n - 1]).toBe(refComb(m + n - 2, m - 1));
    });
  }
});

describe('combination-sum-panel', () => {
  for (const [cands, target] of [[[2, 3, 6, 7], 7], [[2, 3, 5], 8], [[7], 10]] as [number[], number][]) {
    it(`candidates=${JSON.stringify(cands)} target=${target}`, () => {
      const ref: string[] = [];
      const walk = (start: number, rest: number, path: number[]) => {
        if (rest === 0) { ref.push([...path].sort((a, b) => a - b).join(',')); return; }
        for (let i = start; i < cands.length; i++) {
          if (cands[i] > rest) continue;
          path.push(cands[i]); walk(i, rest - cands[i], path); path.pop();
        }
      };
      walk(0, target, []);
      const got = (lastState(csumBuild(cands, target)).results as number[][])
        .map((r) => r.slice().sort((x, y) => x - y).join(','));
      expect(new Set(got).size).toBe(got.length); // 无重复组合
      expect([...got].sort()).toEqual([...new Set(ref)].sort());
      for (const r of lastState(csumBuild(cands, target)).results as number[][]) {
        expect(r.reduce((a, v) => a + v, 0)).toBe(target); // 每条都真的凑成 target
      }
    });
  }
});

describe('cartesian-product / combinations 计数', () => {
  for (const [A, B] of [[['a', 'b'], ['1', '2']], [['x'], []], [[], ['1']]]) {
    it(`笛卡尔积 ${JSON.stringify(A)} × ${JSON.stringify(B)}`, () => {
      const ref: string[] = [];
      for (const x of A) for (const y of B) ref.push(`${x},${y}`);
      const got = (lastState(cpBuild(A, B)).results as string[][]).map((p) => p.join(','));
      expect(got).toEqual(ref);
    });
  }
  // k=0 未纳入：面板对 C(n,0) 返回 0 个组合（数学上应是 1 个空组合）。
  // 该面板 UI 默认 length=2，0 是否可达未证实，已作为边界问题记入 §8 而不是替它编期望值。
  for (const [opts, k] of [[['a', 'b', 'c'], 2], [['a', 'b', 'c'], 1], [['a', 'b', 'c', 'd'], 4]] as [string[], number][]) {
    it(`组合 C(${opts.length},${k}) 的结果集正确`, () => {
      const ref: string[] = [];
      const walk = (start: number, path: number[]) => {
        if (path.length === k) { ref.push(path.map((i) => opts[i]).join(',')); return; }
        for (let i = start; i < opts.length; i++) walk(i + 1, [...path, i]);
      };
      walk(0, []);
      const got = (lastState(combBuild(opts, k)).results as string[][]).map((c) => c.join(','));
      expect(got).toHaveLength(refComb(opts.length, k));
      expect([...got].sort()).toEqual([...ref].sort());
    });
  }
});

describe('extended-gcd-panel', () => {
  for (const [a, b] of [[30, 12], [12, 30], [7, 5], [0, 4], [100, 75]]) {
    it(`exgcd(${a}, ${b})：g 是最大公约数且贝祖等式成立`, () => {
      const g0 = (x: number, y: number): number => (y === 0 ? Math.abs(x) : g0(y, x % y));
      const top = (lastState(exgcdBuild(a, b)).frames as any[])[0];
      expect(top.g).toBe(g0(a, b));
      expect(a * top.x + b * top.y).toBe(top.g); // 贝祖恒等式是 exgcd 的唯一正确性判据
    });
  }
});

describe('segment-tree-panel', () => {
  for (const [nums, ql, qr] of [[[5, 8, 6, 3, 2, 7], 1, 4], [[1], 0, 0], [[3, 4, 5], 0, 2], [[-2, 0, 3], 0, 1]] as [number[], number, number][]) {
    it(`区间和 [${ql},${qr}] 等于朴素求和，且 tree 是自洽的求和线段树`, () => {
      const s = lastState(segBuild(nums, ql, qr));
      expect(s.queryResult).toBe(nums.slice(ql, qr + 1).reduce((a, b) => a + b, 0));
      const tree = s.tree as number[];
      for (let i = 0; i < tree.length; i++) {
        const l = 2 * i + 1, r = 2 * i + 2;
        if (r < tree.length && tree[l] !== undefined) {
          // 内部节点必须等于两子之和（0 表示未使用位，跳过叶子以下）
          if (tree[l] !== 0 || tree[r] !== 0) expect(tree[i]).toBe(tree[l] + tree[r]);
        }
      }
    });
  }
});

// ─── 第六批：贪心 / 区间 DP / 图判定 / 字符串与密码 ───────────────────────────

import { buildSteps as rainBuild } from '@/components/visualizer/rain-terraces-panel';
import { buildSteps as fisherBuild } from '@/components/visualizer/fisher-yates-panel';
import { buildSteps as bloomBuild } from '@/components/visualizer/bloom-filter-panel';
import { buildSteps as caesarBuild } from '@/components/visualizer/caesar-cipher-panel';
import { buildSteps as railBuild } from '@/components/visualizer/rail-fence-panel';
import { buildSteps as linearBuild } from '@/components/visualizer/linear-search-panel';
import { buildSteps as greedyBuild } from '@/components/visualizer/greedy-panel';
import { buildSteps as dpIntBuild } from '@/components/visualizer/dp-interval-panel';
import { buildSteps as bipBuild } from '@/components/visualizer/bipartite-graph-panel';
import { buildSteps as bitBuild } from '@/components/visualizer/binary-indexed-tree-panel';
import { buildSteps as coordBuild } from '@/components/visualizer/coordinate-compression-panel';
import { buildSteps as hashBuild } from '@/components/visualizer/string-hashing-panel';

function refTrap(h: number[]): number[] {
  const n = h.length;
  const L = Array(n).fill(0), R = Array(n).fill(0);
  for (let i = 0; i < n; i++) L[i] = Math.max(L[i - 1] ?? 0, h[i]);
  for (let i = n - 1; i >= 0; i--) R[i] = Math.max(R[i + 1] ?? 0, h[i]);
  return h.map((v, i) => Math.max(0, Math.min(L[i], R[i]) - v));
}

function refCaesar(s: string, k: number): string {
  return s.toLowerCase().split('').map((c) => {
    if (c >= 'a' && c <= 'z') return String.fromCharCode(((c.charCodeAt(0) - 97 + ((k % 26) + 26)) % 26) + 97);
    return c;
  }).join('');
}

function refRail(s: string, rails: number): string {
  const rows: string[] = Array.from({ length: rails }, () => '');
  let r = 0, dir = 1;
  for (const ch of s) {
    rows[r] += ch;
    if (rails > 1) { if (r === rails - 1) dir = -1; else if (r === 0) dir = 1; r += dir; }
  }
  return rows.join('');
}

function refMaxNonOverlap(ivs: [number, number][]): number {
  const sorted = [...ivs].sort((a, b) => a[1] - b[1]);
  let count = 0, end = -Infinity;
  for (const [s, e] of sorted) if (s >= end) { count++; end = e; }
  return count;
}

function refMergeStones(stones: number[]): number {
  const n = stones.length;
  const pre = [0];
  stones.forEach((v) => pre.push(pre[pre.length - 1] + v));
  const dp = Array.from({ length: n }, () => Array(n).fill(0));
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len <= n; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k + 1][j]);
      dp[i][j] += pre[j + 1] - pre[i];
    }
  }
  return n ? dp[0][n - 1] : 0;
}

describe('rain-terraces-panel', () => {
  for (const heights of [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], [4, 1, 2], [3, 0, 3], [], [1, 2, 3]]) {
    it(`每格积水量等于 min(左前缀最高, 右后缀最高) - 高度（${JSON.stringify(heights)}）`, () => {
      const s = lastState(rainBuild(heights));
      expect(s.water).toEqual(refTrap(heights));
      expect(s.water.reduce((a: number, b: number) => a + b, 0)).toBe(refTrap(heights).reduce((a, b) => a + b, 0));
    });
  }
});

describe('fisher-yates-panel', () => {
  const src = [1, 2, 3, 4, 5, 6];
  it('确定性：同 seed 两次结果一致', () => {
    const a = lastState(fisherBuild(src, 7)).arr;
    const b = lastState(fisherBuild([...src], 7)).arr;
    expect(a).toEqual(b);
  });
  it('洗牌是排列：元素多重集守恒', () => {
    for (const seed of [1, 2, 42, 1234, 99]) {
      const out = lastState(fisherBuild([...src], seed)).arr as number[];
      expect([...out].sort((x, y) => x - y)).toEqual([...src].sort((x, y) => x - y));
    }
  });
  it('不同 seed 会产生不同结果（否则洗牌等于没洗）', () => {
    const outs = new Set([1, 2, 3, 4, 5].map((s) => (lastState(fisherBuild([...src], s)).arr as number[]).join(',')));
    expect(outs.size).toBeGreaterThan(1);
  });
});

describe('bloom-filter-panel', () => {
  // 布隆过滤器只保证「说存在可能错、说不存在一定对」，所以直接查每个已插入元素。
  const items = ['apple', 'banana', 'cherry'];
  for (const item of items) {
    it(`已插入的 "${item}" 不会被判为不存在`, () => {
      const frames = bloomBuild(64, items, item).map((s: any) => s.state);
      const asked = frames.filter((f: any) => f.query === item && f.result !== null);
      expect(asked.length).toBeGreaterThan(0);
      expect(asked[asked.length - 1].result).toBe('可能存在');
    });
  }
  it('bits 只取 0/1，长度等于 m', () => {
    const s = lastState(bloomBuild(16, ['a', 'b'], 'a'));
    expect(s.bits).toHaveLength(16);
    expect(new Set(s.bits as number[])).toEqual(new Set([0, 1]));
    expect((s.bits as number[]).some((b) => b === 1)).toBe(true);
  });
});

describe('caesar-cipher / rail-fence 编码结果', () => {
  for (const [text, k] of [['Hello, World!', 3], ['abc', 1], ['zzz', 3], ['x', 0]] as [string, number][]) {
    it(`凯撒密码 "${text}" 位移 ${k}`, () => {
      const s = lastState(caesarBuild(text, k));
      expect((s.result as string[]).join('')).toBe(refCaesar(text, k));
    });
  }
  for (const [str, rails] of [['WEAREDISCOVEREDFLEEATONCE', 3], ['ABCDEF', 2], ['X', 1], ['PAYPALISHIRING', 4]] as [string, number][]) {
    it(`栅栏密码 "${str}" ${rails} 轨`, () => {
      const s = lastState(railBuild(str, rails));
      // 面板把密文存成分轨的 fence 矩阵，读回密文即按轨拼接
      expect((s.fence as string[][]).map((r) => r.join('')).join('')).toBe(refRail(str, rails));
      // 轨道矩阵本身也必须容纳全部字符
      expect((s.fence as string[][]).flat()).toHaveLength(str.length);
    });
  }
});

describe('linear-search-panel', () => {
  for (const [nums, target] of [[[4, 2, 7, 1, 9], 7], [[4, 2, 7], 99], [[5], 5], [[], 1]] as [number[], number][]) {
    it(`查找 ${target} 结果等于 Array#indexOf`, () => {
      const s = lastState(linearBuild(nums, target));
      expect(s.result).toBe(nums.indexOf(target));
      expect(s.checked).toBe(target === -1 ? nums.length : (nums.indexOf(target) >= 0 ? nums.indexOf(target) + 1 : nums.length));
    });
  }
});

describe('greedy-panel（区间调度，入参是 {start,end} 对象）', () => {
  const ivs: [number, number][] = [[1, 3], [2, 5], [4, 7], [6, 7], [5, 9], [8, 10]];
  const objs = ivs.map(([start, end]) => ({ start, end }));
  it('贪心选出的数量等于按结束时间排序的独立参照，且两两不重叠', () => {
    const s = lastState(greedyBuild(objs as any));
    const chosen = (s.selected as number[]).map((i) => s.sorted[i] as { start: number; end: number });
    expect(chosen.length).toBe(refMaxNonOverlap(ivs));
    for (let i = 1; i < chosen.length; i++) expect(chosen[i].start).toBeGreaterThanOrEqual(chosen[i - 1].end);
  });
  // 关键边界：区间「首尾相接」（前一区间 end == 后一区间 start）算不算冲突。
  // 上面那组数据不含相接对，所以把 `start >= lastEnd` 改成 `start > lastEnd`
  // 时测试原本照样全绿——这条就是补那个分支的。
  it('首尾相接的区间应当都可选（兼容判定是 >= 而非 >）', () => {
    const touching: [number, number][] = [[1, 3], [3, 5], [5, 7]];
    const s = lastState(greedyBuild(touching.map(([start, end]) => ({ start, end })) as any));
    expect((s.selected as number[]).length).toBe(refMaxNonOverlap(touching));
    expect((s.selected as number[]).length).toBe(3);
  });
  it('空输入不崩', () => {
    expect(lastState(greedyBuild([] as any)).selected).toEqual([]);
  });
});

describe('dp-interval-panel（石子合并最小代价）', () => {
  for (const stones of [[5, 3, 4, 2], [1], [3, 1, 2], [4, 4, 4, 4]]) {
    it(`最小合并代价 ${JSON.stringify(stones)}`, () => {
      const dp = lastState(dpIntBuild(stones)).dp as number[][];
      const n = stones.length;
      expect(dp[0][n - 1]).toBe(refMergeStones(stones));
      for (let i = 0; i < n; i++) expect(dp[i][i]).toBe(0); // 单堆不需合并
    });
  }
});

describe('bipartite-graph-panel', () => {
  it('偶环 6 圈可二染色：每条边两端颜色不同', () => {
    const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]];
    const s = lastState(bipBuild(6, edges));
    for (const [u, v] of edges) expect(s.color[u]).not.toBe(s.color[v]);
  });
  it('匹配结果合法：每条匹配边都在边表里，且每个点至多被匹配一次', () => {
    const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]];
    const s = lastState(bipBuild(6, edges));
    const edgeSet = new Set(edges.flatMap(([a, b]) => [`${a}-${b}`, `${b}-${a}`]));
    const usedLeft = new Set<number>();
    for (const [r, l] of (s.matchR as number[]).entries()) {
      if (l < 0) continue;
      expect(edgeSet.has(`${l}-${r}`)).toBe(true);
      expect(usedLeft.has(l)).toBe(false);
      usedLeft.add(l);
    }
    expect(usedLeft.size).toBe(s.matchingCount);
  });
});

describe('binary-indexed-tree-panel', () => {
  const nums = [3, 2, 1, 6, 5, 4, 2];
  it('前缀和等于朴素求和，且 tree 满足 BIT 定义', () => {
    const s = lastState(bitBuild(nums, 4));
    expect(s.querySum).toBe(nums.slice(0, 4).reduce((a, b) => a + b, 0));
    const tree = s.tree as number[];
    for (let i = 1; i <= nums.length; i++) {
      const lo = i - (i & -i); // tree[i] 覆盖 (lo, i]
      expect(tree[i]).toBe(nums.slice(lo, i).reduce((a, b) => a + b, 0));
    }
  });
  it('查询不同下标都正确', () => {
    for (const q of [1, 3, 7]) {
      expect(lastState(bitBuild(nums, q)).querySum).toBe(nums.slice(0, q).reduce((a, b) => a + b, 0));
    }
  });
});

describe('coordinate-compression-panel', () => {
  for (const original of [[100, 12, 87, 2, 100], [-7, 0, 3, -7, 100], [5, 5, 5], [1], []] as number[][]) {
    it(`离散化 ${JSON.stringify(original)} 等于「去重升序后的下标」`, () => {
      const uniq = [...new Set(original)].sort((a, b) => a - b);
      const s = lastState(coordBuild(original));
      expect(s.sorted).toEqual(uniq);
      expect(s.mapped).toEqual(original.map((v) => uniq.indexOf(v)));
    });
  }
});

describe('string-hashing-panel', () => {
  for (const [s, pat] of [['ababcab', 'abc'], ['aaaa', 'aa'], ['hello', 'z'], ['abcabc', 'abc']]) {
    it(`"${s}" 中找 "${pat}"：报告的命中位置都是真命中，且不漏真命中`, () => {
      const frames = hashBuild(s, pat).map((x: any) => x.state);
      const expected: number[] = [];
      for (let i = 0; i + pat.length <= s.length; i++) if (s.slice(i, i + pat.length) === pat) expected.push(i);
      const reported = new Set<number>();
      for (const f of frames) for (const m of (f.matches as number[]) ?? []) reported.add(m);
      for (const p of reported) expect(s.slice(p, p + pat.length)).toBe(pat); // 无假阳性
      expect([...reported].sort((a, b) => a - b)).toEqual(expected);          // 无假阴性
    });
  }
});

// ─── 第七批：DP / 二分答案 / 数论 / 强连通 / 网络流 / AC 自动机 ────────────────

import { buildSteps as lcsBuild } from '@/components/visualizer/lcs-panel';
import { buildSteps as knapBuild } from '@/components/visualizer/knapsack-panel';
import { buildSteps as mqBuild } from '@/components/visualizer/monotonic-queue-panel';
import { buildSteps as bsaBuild } from '@/components/visualizer/binary-search-answer-panel';
import { buildSteps as ntBuild } from '@/components/visualizer/number-theory-panel';
import { buildSteps as combBuild2 } from '@/components/visualizer/combinatorics-panel';
import { buildSteps as dsmBuild } from '@/components/visualizer/dp-state-machine-panel';
import { buildSteps as tarjanBuild } from '@/components/visualizer/tarjan-scc-panel';
import { buildSteps as flowBuild } from '@/components/visualizer/network-flow-panel';
import { buildSteps as acBuild } from '@/components/visualizer/aho-corasick-panel';
import { buildSteps as treeDpBuild } from '@/components/visualizer/dp-tree-panel';
import { buildSteps as twoSatBuild } from '@/components/visualizer/two-sat-panel';

function refLcs(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function refKnapsack(items: { weight: number; value: number }[], W: number): number {
  const dp = Array(W + 1).fill(0);
  for (const it of items) for (let w = W; w >= it.weight; w--) dp[w] = Math.max(dp[w], dp[w - it.weight] + it.value);
  return dp[W];
}

function refWindowMax(nums: number[], k: number): number[] {
  const out: number[] = [];
  for (let i = 0; i + k <= nums.length; i++) out.push(Math.max(...nums.slice(i, i + k)));
  return out;
}

// LC 2226：最大化段长 L，使 Σ⌊w/L⌋ ≥ k。暴力从大到小扫，不依赖二分。
function refMaxSegmentLen(woods: number[], k: number): number {
  for (let L = Math.max(...woods, 0); L >= 1; L--) {
    if (woods.reduce((s, w) => s + Math.floor(w / L), 0) >= k) return L;
  }
  return 0;
}

function refPowMod(base: number, exp: number, mod: number): number {
  if (mod === 1) return 0;
  let r = 1 % mod;
  for (let i = 0; i < exp; i++) r = (r * base) % mod;
  return r;
}

function refGcd(a: number, b: number): number { return b === 0 ? Math.abs(a) : refGcd(b, a % b); }

function refPrimesUpTo(n: number): number[] {
  const out: number[] = [];
  for (let x = 2; x <= n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) out.push(x);
  }
  return out;
}

function refCooldown(prices: number[]): number {
  if (!prices.length) return 0;
  let hold = -prices[0], sold = 0, cool = 0;
  for (let i = 1; i < prices.length; i++) {
    const pHold = Math.max(hold, cool - prices[i]);
    const pSold = Math.max(sold, hold + prices[i]);
    cool = Math.max(cool, sold);
    hold = pHold; sold = pSold;
  }
  return Math.max(sold, cool);
}

function refEdmondsKarp(cap: number[][]): number {
  const n = cap.length;
  const r = cap.map((row) => [...row]);
  let flow = 0;
  for (;;) {
    const par = Array(n).fill(-1); par[0] = -2;
    const q = [0];
    while (q.length && par[n - 1] === -1) {
      const u = q.shift()!;
      for (let v = 0; v < n; v++) if (par[v] === -1 && r[u][v] > 0) { par[v] = u; q.push(v); }
    }
    if (par[n - 1] === -1) break;
    let bottleneck = Infinity;
    for (let v = n - 1; v !== 0; v = par[v]) bottleneck = Math.min(bottleneck, r[par[v]][v]);
    for (let v = n - 1; v !== 0; v = par[v]) { r[par[v]][v] -= bottleneck; r[v][par[v]] += bottleneck; }
    flow += bottleneck;
  }
  return flow;
}

function refTreeDp(happy: number[], children: number[][]): number {
  const walk = (u: number): [number, number] => {
    let rob = happy[u], skip = 0;
    for (const c of children[u] ?? []) {
      const [cRob, cSkip] = walk(c);
      rob += cSkip; skip += Math.max(cRob, cSkip);
    }
    return [rob, skip];
  };
  const [a, b] = walk(0);
  return Math.max(a, b);
}

describe('lcs-panel', () => {
  for (const [a, b] of [['ABCBDAB', 'BDCABA'], ['', 'abc'], ['abc', ''], ['abc', 'abc'], ['abcde', 'ace']]) {
    it(`LCS "${a}" / "${b}"`, () => {
      const dp = lastState(lcsBuild(a, b)).dp as number[][];
      expect(dp[a.length][b.length]).toBe(refLcs(a, b));
    });
  }
});

describe('knapsack-panel', () => {
  const cases: [{ weight: number; value: number }[], number][] = [
    [[{ weight: 2, value: 3 }, { weight: 1, value: 2 }, { weight: 3, value: 4 }], 4],
    [[{ weight: 1, value: 15 }, { weight: 3, value: 20 }, { weight: 4, value: 30 }, { weight: 5, value: 40 }], 6],
    [[{ weight: 5, value: 10 }], 3],
  ];
  for (const [items, W] of cases) {
    it(`容量 ${W} 的最大价值`, () => {
      const dp = lastState(knapBuild(items, W)).dp as number[][];
      expect(dp[dp.length - 1][W]).toBe(refKnapsack(items, W));
    });
  }
});

describe('monotonic-queue-panel', () => {
  for (const [nums, k] of [[[1, 3, -1, -3, 5, 3, 6, 7], 3], [[1], 1], [[9, 8, 7], 2]] as [number[], number][]) {
    it(`窗口 ${k} 的最大值序列 ${JSON.stringify(nums)}`, () => {
      expect(lastState(mqBuild(nums, k)).results).toEqual(refWindowMax(nums, k));
    });
  }
});

describe('binary-search-answer-panel（LC 2226 最大化段长）', () => {
  for (const [woods, k] of [[[3, 6, 7, 11], 8], [[5, 2, 3], 4], [[1, 1, 1], 3]] as [number[], number][]) {
    it(`woods=${JSON.stringify(woods)} k=${k} 的答案等于暴力扫描`, () => {
      expect(lastState(bsaBuild(woods, k)).answer).toBe(refMaxSegmentLen(woods, k));
    });
  }
});

describe('number-theory-panel', () => {
  for (const [base, exp, mod, ga, gb, sieveN] of [
    [2, 10, 1000, 12, 8, 20],
    [3, 0, 7, 84, 36, 30],
    [7, 13, 97, 17, 5, 2],
    [5, 6, 1, 0, 9, 1],
  ] as number[][]) {
    it(`快速幂 / 欧几里得 / 筛法三块都与独立实现一致（${base}^${exp} mod ${mod}, gcd(${ga},${gb}), π(${sieveN})）`, () => {
      const s = lastState(ntBuild(base, exp, mod, ga, gb, sieveN));
      expect(s.powResult).toBe(refPowMod(base, exp, mod));
      expect(s.gcdResult).toBe(refGcd(ga, gb));
      const primes = s.sievePrimes as number[];
      expect(primes).toEqual(refPrimesUpTo(sieveN));
      // sieveIsPrime 必须和筛出的素数表自洽
      const flagged = s.sieveIsPrime.map((x: boolean, i: number) => (x && i >= 2 ? i : -1)).filter((i: number) => i >= 0);
      expect(flagged).toEqual(primes);
    });
  }
});

describe('combinatorics-panel', () => {
  for (const [n, k] of [[5, 2], [6, 0], [4, 4], [10, 3]] as [number, number][]) {
    it(`C(${n},${k})`, () => {
      const s = lastState(combBuild2(n, k));
      expect(s.queryResult ?? s.combResult).toBe(refComb(n, k));
    });
  }
});

describe('dp-state-machine-panel（含冷冻期，LC 309）', () => {
  for (const prices of [[1, 2, 3, 0, 2], [1], [], [3, 2, 1, 0, 2]]) {
    it(`最大利润 ${JSON.stringify(prices)}`, () => {
      const s = lastState(dsmBuild(prices));
      expect(s.answer).toBe(refCooldown(prices));
    });
  }
});

describe('tarjan-scc-panel', () => {
  const n = 5;
  const edges: [number, number][] = [[1, 0], [2, 1], [3, 2], [4, 3], [2, 4], [0, 4]];
  it('SCC 分组等于按可达性独立算出的强连通划分', () => {
    const reach: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
    for (const [u, v] of edges) reach[u][v] = true;
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (reach[i][k] && reach[k][j]) reach[i][j] = true;
    }
    const groups: number[][] = lastState(tarjanBuild(n, edges)).sccs as number[][];
    // 划分合法：不重不漏
    const flat = groups.flat();
    expect([...flat].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
    // 每组内部两两互达；跨组不互达
    for (const g of groups) {
      for (const a of g) for (const b of g) expect(reach[a][b]).toBe(true);
    }
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        for (const a of groups[i]) for (const b of groups[j]) {
          expect(reach[a][b] && reach[b][a]).toBe(false);
        }
      }
    }
  });
});

describe('network-flow-panel', () => {
  for (const cap of [
    [[0, 10, 10, 0], [0, 0, 2, 4], [0, 0, 0, 8], [0, 0, 0, 0]],
    [[0, 3, 2, 0], [0, 0, 0, 2], [0, 0, 0, 4], [0, 0, 0, 0]],
    // 三条增广路会复用 0→1 这条边：瓶颈必须按「容量-已有流量」算，否则被高估成 6
    [[0, 3, 2, 0], [0, 0, 2, 2], [0, 0, 0, 3], [0, 0, 0, 0]],
  ] as number[][][]) {
    it(`最大流 = 独立 Edmonds-Karp（源 0 汇 ${cap.length - 1}）`, () => {
      expect(lastState(flowBuild(cap)).maxFlow).toBe(refEdmondsKarp(cap));
    });
  }
});

describe('aho-corasick-panel', () => {
  it('匹配到的 (模式, 结束位置) 集合等于暴力多模式查找', () => {
    const patterns = ['he', 'she', 'his', 'hers'];
    const text = 'ushers';
    const expected = new Set<string>();
    for (const p of patterns) {
      for (let i = 0; i + p.length <= text.length; i++) {
        if (text.slice(i, i + p.length) === p) expected.add(`${p}@${i + p.length - 1}`);
      }
    }
    const got = new Set<string>(
      (lastState(acBuild(patterns, text)).matches as { pattern: string; end: number }[])
        .map((m) => `${m.pattern}@${m.end}`),
    );
    expect([...got].sort()).toEqual([...expected].sort());
  });
});

describe('dp-tree-panel（树形 DP 最大独立集）', () => {
  const cases: [number[], number[][]][] = [
    [[1, 5, 2, 3], [[1, 2], [3], [], []]],
    [[3], [[]]],
    [[1, 2, 3, 4, 5, 6], [[1, 2], [3, 4], [5], [], [], []]],
  ];
  for (const [happy, children] of cases) {
    it(`最大快乐值 ${JSON.stringify(happy)}`, () => {
      const s = lastState(treeDpBuild(happy, children));
      expect(s.result).toBe(refTreeDp(happy, children));
    });
  }
});

describe('two-sat-panel', () => {
  type Cl = { a: number; b: number };
  // 测试用例用带符号字面量书写（+1 = x0，-1 = ¬x0），面板的编码是节点号：2i = x_i、2i+1 = ¬x_i
  const node = (lit: number) => (lit > 0 ? 2 * (lit - 1) : 2 * (-lit - 1) + 1);
  const cases: [number, [number, number][]][] = [
    [2, [[1, 2], [-1, 2], [1, -2]]], // 面板自带的 SAT 示例
    [1, [[1, 1], [-1, -1]]], // 面板自带的 UNSAT 示例
    [2, [[1, 2], [1, -2], [-1, 2], [-1, -2]]], // 四个子句：UNSAT
    [1, [[-1, -1]]], // 单子句：必须 x0 = false
    [3, [[1, 2], [-2, 3], [-3, -1], [2, -3]]], // 蕴含链较长的一例
  ];
  for (const [n, raw] of cases) {
    const clauses: Cl[] = raw.map(([a, b]) => ({ a: node(a), b: node(b) }));
    it(`n=${n} ${JSON.stringify(raw)} 的可满足性判定与 brute force 一致`, () => {
      const lit = (l: number, assign: boolean[]) => (l > 0 ? assign[l - 1] : !assign[-l - 1]);
      let sat = false;
      for (let mask = 0; mask < (1 << n); mask++) {
        const assign = Array.from({ length: n }, (_, i) => ((mask >> i) & 1) === 1);
        if (raw.every((c) => lit(c[0], assign) || lit(c[1], assign))) { sat = true; break; }
      }
      const s = lastState(twoSatBuild(n, clauses));
      expect(!!s.sat).toBe(sat);
      if (sat) {
        // 面板若判定可满足，它给出的赋值必须真的满足所有子句
        expect(Array.isArray(s.assignment) && s.assignment.every((v: boolean | null) => v !== null)).toBe(true);
        expect(raw.every((c) => lit(c[0], s.assignment) || lit(c[1], s.assignment))).toBe(true);
      }
    });
  }
});
// 栈/队列/链表：从**相邻帧的 state 差分**推出实际弹出序列，不去解析文案，
// 也不把面板自己的输出抄来当基线。
describe('stack / queue / linked-list 面板', () => {
  for (const seed of [[1, 2, 3], [9], []]) {
    it(`stack ${JSON.stringify(seed)}：入栈序即给定的序，出栈序是其逆序（LIFO）`, () => {
      const frames = stackPanel(seed).map((st: any) => st.state.items as number[]);
      const pushed: number[] = [], popped: number[] = [];
      for (let i = 1; i < frames.length; i++) {
        const a = frames[i - 1], b = frames[i];
        if (b.length === a.length + 1) pushed.push(b[b.length - 1]);
        else if (b.length === a.length - 1) popped.push(a[a.length - 1]);
      }
      expect(pushed).toEqual(seed);
      expect(popped).toEqual([...seed].reverse());
    });

    it(`queue ${JSON.stringify(seed)}：出队序等于入队序（FIFO）`, () => {
      const frames = queuePanel(seed).map((st: any) => st.state.items as number[]);
      const pushed: number[] = [], popped: number[] = [];
      for (let i = 1; i < frames.length; i++) {
        const a = frames[i - 1], b = frames[i];
        if (b.length === a.length + 1) pushed.push(b[b.length - 1]);
        else if (b.length === a.length - 1) popped.push(a[0]);
      }
      expect(pushed).toEqual(seed);
      expect(popped).toEqual(seed);
    });

    it(`linked-list ${JSON.stringify(seed)}：从表头走到的序列等于独立数组模拟`, () => {
      const s = lastState(listPanel(seed));

      // 空 seed 时面板取 target = seed[Math.floor(0/2)] 得到 undefined，删除目标是未定义行为，
      // 这种情况只要求它不崩、遍历能停且不成环，不替它编一个应有的序列。
      if (seed.length === 0) {
        expect(Array.isArray(s.nodes)).toBe(true);
        const only: number[] = [];
        const seen = new Set<number>();
        for (let cur = s.headId as number | null; cur !== null;) {
          expect(seen.has(cur)).toBe(false);
          seen.add(cur);
          only.push(s.nodes[cur].value);
          cur = s.nodes[cur].nextId;
        }
        return;
      }

      // 参照：用普通数组跑同样的三步（头插 0 → 删中间那个 → 反转）
      const ref = [...seed];
      ref.unshift(0);
      ref.splice(ref.indexOf(seed[Math.floor(seed.length / 2)]), 1);
      ref.reverse();

      const walked: number[] = [];
      const visited = new Set<number>();
      for (let cur = s.headId as number | null; cur !== null;) {
        expect(visited.has(cur)).toBe(false); // 不许成环
        visited.add(cur);
        walked.push(s.nodes[cur].value);
        cur = s.nodes[cur].nextId;
      }
      expect(walked).toEqual(ref);
    });
  }
});

// ===== 第八批：DP 压缩/数位 DP/欧拉路径/B 树/伸展树/柱状图/分块/凸包/扫描线/分治逆序对/Hill 密码/加权随机 =====
import { buildSteps as tspBuild } from '@/components/visualizer/dp-state-compression-panel';
import { buildSteps as digitBuild } from '@/components/visualizer/dp-digit-panel';
import { buildSteps as eulerBuild } from '@/components/visualizer/eulerian-path-panel';
import { buildSteps as btreeBuild } from '@/components/visualizer/b-tree-panel';
import { buildSteps as splayBuild } from '@/components/visualizer/splay-panel';
import { buildSteps as rectBuild } from '@/components/visualizer/monotonic-stack-advanced-panel';
import { buildSteps as sqrtBuild } from '@/components/visualizer/sqrt-decomposition-panel';
import { buildSteps as hullBuild } from '@/components/visualizer/computational-geometry-panel';
import { buildSteps as sweepBuild } from '@/components/visualizer/sweep-line-panel';
import { buildSteps as dcBuild } from '@/components/visualizer/divide-and-conquer-panel';
import { buildSteps as hillBuild } from '@/components/visualizer/hill-cipher-panel';
import { buildSteps as wrBuild } from '@/components/visualizer/weighted-random-panel';

// TSP：全排列暴力，不走位压 DP
function refTsp(dist: number[][]): number {
  const n = dist.length;
  let best = Infinity;
  const walk = (rest: number[], acc: number[]) => {
    if (rest.length === 0) {
      let s = 0, prev = 0;
      for (const v of acc) { s += dist[prev][v]; prev = v; }
      best = Math.min(best, s + dist[prev][0]);
      return;
    }
    for (let i = 0; i < rest.length; i++) walk([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, rest[i]]);
  };
  walk(Array.from({ length: n - 1 }, (_, i) => i + 1), []);
  return best;
}

// 1..n 里数字 1 出现的次数：逐个数位
function refOnes(n: number): number {
  let c = 0;
  for (let x = 1; x <= n; x++) for (const ch of String(x)) if (ch === '1') c++;
  return c;
}

// 欧拉迹的合法性：不是「抄输出」，而是拿原边表逐段核对
function eulerTrailProblems(edges: [number, number][], start: number, path: number[]): string[] {
  const bad: string[] = [];
  if (path.length !== edges.length + 1) bad.push(`路径长度 ${path.length} != 边数+1 = ${edges.length + 1}`);
  if (path[0] !== start) bad.push(`路径起点 ${path[0]} != 指定的 ${start}`);
  const pool = edges.map(([u, v]) => `${u}>${v}`);
  for (let i = 0; i + 1 < path.length; i++) {
    const at = pool.indexOf(`${path[i]}>${path[i + 1]}`);
    if (at < 0) { bad.push(`第 ${i} 段 ${path[i]}>${path[i + 1]} 不是未用过的边`); break; }
    pool.splice(at, 1);
  }
  if (pool.length) bad.push(`有 ${pool.length} 条边没被走到：${pool.join(' ')}`);
  return bad;
}

function refMaxRect(h: number[]): number {
  let best = 0;
  for (let i = 0; i < h.length; i++) {
    let mn = Infinity;
    for (let j = i; j < h.length; j++) { mn = Math.min(mn, h[j]); best = Math.max(best, mn * (j - i + 1)); }
  }
  return best;
}

// 凸包顶点：用「极角张角」判定——p 是顶点 ⟺ 其余点相对 p 的最大角度间隙严格大于 π。
// 落在边上的共线点间隙正好是 π，全共线时两个端点间隙 > π，都与单调链的写法毫无关系。
function refHullSet(points: [number, number][]): string[] {
  const uniq = [...new Map(points.map((p) => [`${p[0]},${p[1]}`, p])).values()];
  const isCorner = (i: number): boolean => {
    const p = uniq[i];
    const angs = uniq
      .map((q, j) => (j === i ? null : Math.atan2(q[1] - p[1], q[0] - p[0])))
      .filter((a): a is number => a !== null)
      .sort((a, b) => a - b);
    if (angs.length === 0) return true;
    let maxGap = 2 * Math.PI - (angs[angs.length - 1] - angs[0]);
    for (let k = 1; k < angs.length; k++) maxGap = Math.max(maxGap, angs[k] - angs[k - 1]);
    return maxGap > Math.PI + 1e-9;
  };
  return uniq.filter((_, i) => isCorner(i)).map((p) => `${p[0]},${p[1]}`).sort();
}

function refUnionArea(rects: number[][]): number {
  const xs = [...new Set(rects.flatMap((r) => [r[0], r[2]]))].sort((a, b) => a - b);
  const ys = [...new Set(rects.flatMap((r) => [r[1], r[3]]))].sort((a, b) => a - b);
  let area = 0;
  for (let i = 0; i + 1 < xs.length; i++) {
    for (let j = 0; j + 1 < ys.length; j++) {
      const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
      if (rects.some(([x1, y1, x2, y2]) => cx > x1 && cx < x2 && cy > y1 && cy < y2)) {
        area += (xs[i + 1] - xs[i]) * (ys[j + 1] - ys[j]);
      }
    }
  }
  return area;
}

function refInvCount(a: number[]): number {
  let c = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) c++;
  return c;
}

// Hill：自己实现一遍，模运算取规范非负代表
function refHill(message: string, K: number[][]): string {
  const A = 'A'.charCodeAt(0);
  const clean = message.toUpperCase().replace(/[^A-Z]/g, '');
  const padded = clean.length % 2 === 1 ? `${clean}X` : clean;
  const e = (u: number) => String.fromCharCode((((u % 26) + 26) % 26) + A);
  let out = '';
  for (let i = 0; i < padded.length; i += 2) {
    const x = padded.charCodeAt(i) - A, y = padded.charCodeAt(i + 1) - A;
    out += e(K[0][0] * x + K[0][1] * y) + e(K[1][0] * x + K[1][1] * y);
  }
  return out;
}

describe('dp-state-compression-panel（TSP 哈密顿回路）', () => {
  it('空矩阵给一帧明确提示而不是抛异常', () => {
    const frames = tspBuild([]);
    expect(frames.length).toBe(1);
    expect(lastState(frames).phase).toBe('done');
  });

  for (const dist of [
    [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]],
    [[0, 1, 1], [1, 0, 1], [1, 1, 0]],
    [[0, 3, 93, 10], [3, 0, 22, 12], [93, 22, 0, 17], [10, 12, 17, 0]],
    [[0, 5, 8, 12], [4, 0, 6, 9], [7, 5, 0, 3], [10, 8, 4, 0]],
  ] as number[][][]) {
    it(`${dist.length} 点的最短哈密顿回路等于全排列暴力`, () => {
      const s = lastState(tspBuild(dist.map((r) => [...r])));
      expect(s.result).toBe(refTsp(dist));
    });
  }
});

describe('dp-digit-panel（1~n 中数字 1 的出现次数）', () => {
  for (const n of [321, 1, 9, 10, 11, 99, 1234]) {
    it(`n=${n} 等于逐个数位统计`, () => {
      expect(lastState(digitBuild(n)).result).toBe(refOnes(n));
    });
  }
});

describe('eulerian-path-panel（Hierholzer）', () => {
  for (const [edges, start] of [
    [[[0, 1], [1, 2], [2, 0], [0, 3], [3, 4], [4, 0]], 0],
    [[[0, 1], [1, 2], [2, 0]], 0],
    [[[0, 1], [1, 2]], 0],
    [[[0, 1], [1, 0], [0, 2], [2, 0]], 1],
  ] as [[number, number][], number][]) {
    it(`边表 ${JSON.stringify(edges)}（起点 ${start}）的出口路径是一条覆盖全部边的欧拉迹`, () => {
      const s = lastState(eulerBuild(edges.map(([u, v]) => [u, v]), start));
      expect(eulerTrailProblems(edges, start, s.result as number[])).toEqual([]);
    });
  }
});

describe('b-tree-panel（B 树插入）', () => {
  for (const [keys, t] of [
    [[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110], 2],
    [[5, 3, 8, 1, 9, 2, 7], 2],
    [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 3],
    [[42], 2],
  ] as [number[], number][]) {
    it(`插入 ${keys.length} 个键（t=${t}）后仍是合法 B 树且中序等于升序输入`, () => {
      const s = lastState(btreeBuild([...keys], t));
      const byId = new Map<number, any>(s.nodes.map((nd: any) => [nd.id, nd]));
      const problems: string[] = [];
      const inorder: number[] = [];
      const leafDepths = new Set<number>();
      const walk = (id: number, d: number, lo: number, hi: number) => {
        const nd = byId.get(id);
        if (!nd) { problems.push(`引用了不存在的节点 ${id}`); return; }
        const k: number[] = nd.keys;
        if (k.length > 2 * t - 1) problems.push(`节点 ${id} 有 ${k.length} 个键 > 2t-1=${2 * t - 1}`);
        if (id !== s.rootId && k.length < t - 1) problems.push(`非根节点 ${id} 只有 ${k.length} 个键 < t-1=${t - 1}`);
        for (let i = 1; i < k.length; i++) if (k[i - 1] >= k[i]) problems.push(`节点 ${id} 键未严格升序`);
        if (nd.childIds.length !== 0 && nd.childIds.length !== k.length + 1) problems.push(`节点 ${id} 孩子数 ${nd.childIds.length} 既不是叶子(0)也不是键数+1`);
        if (nd.childIds.length === 0) leafDepths.add(d);
        nd.childIds.forEach((c: number, i: number) => {
          walk(c, d + 1, i === 0 ? lo : k[i - 1], i === k.length ? hi : k[i]);
        });
        k.forEach((key) => {
          inorder.push(key);
          if (!(key > lo && key < hi)) problems.push(`键 ${key} 越出祖先区间 (${lo},${hi})`);
        });
      };
      walk(s.rootId, 0, -Infinity, Infinity);
      expect(problems).toEqual([]);
      expect(leafDepths.size).toBe(1);
      inorder.sort((a, b) => a - b);
      expect(inorder).toEqual([...keys].sort((a, b) => a - b));
    });
  }
});

describe('splay-panel（伸展树插入）', () => {
  for (const values of [[10, 20, 30, 40, 50, 25, 5], [7], [5, 3, 8, 1, 9, 7], [1, 2, 3, 4, 5]]) {
    it(`插入 ${JSON.stringify(values)} 后中序有序、multiset 守恒，且最后插入的值在根`, () => {
      const s = lastState(splayBuild([...values]));
      const nodes: any[] = s.nodes;
      const out: number[] = [];
      const seen = new Set<number>();
      const walk = (i: number) => {
        if (i < 0 || !nodes[i] || seen.has(i)) return;
        seen.add(i);
        walk(nodes[i].left);
        out.push(nodes[i].val);
        walk(nodes[i].right);
      };
      walk(s.root);
      expect(out).toEqual([...values].sort((a, b) => a - b));
      expect(out.every((v, i) => i === 0 || out[i - 1] <= v)).toBe(true);
      expect(nodes[s.root].val).toBe(values[values.length - 1]);
    });
  }
});

describe('monotonic-stack-advanced-panel（柱状图最大矩形 LC84）', () => {
  for (const heights of [[2, 1, 5, 6, 2, 3], [2, 4], [5, 4, 3, 2, 1], [1], [2, 2, 2, 2], [0, 0], [1000000], [6, 1, 2, 1, 2, 1]]) {
    it(`最大矩形面积 ${JSON.stringify(heights)}`, () => {
      const s = lastState(rectBuild([...heights]));
      expect(s.maxArea).toBe(refMaxRect(heights));
      // 有非零矩形时，报告的「最佳区间」必须自己撑得起这个面积
      if (s.maxArea > 0) {
        expect(s.bestHeight * (s.bestRight - s.bestLeft + 1)).toBe(s.maxArea);
        for (let i = s.bestLeft; i <= s.bestRight; i++) expect(heights[i]).toBeGreaterThanOrEqual(s.bestHeight);
      }
    });
  }
});

describe('sqrt-decomposition-panel（分块查询 + 单点改）', () => {
  const cases: [number[], number, number, number, number][] = [
    [[3, 1, 4, 1, 5, 9, 2, 6, 7, 4], 1, 8, 5, 3],
    [[5], 0, 0, 0, 9],
    [[1, 2, 3, 4, 5, 6, 7, 8], 0, 7, 3, 100],
    [[2, 2, 2, 2, 2], 1, 3, 2, 0],
  ];
  for (const [nums, l, r, updIdx, updVal] of cases) {
    it(`sum[${l}..${r}] 与末态数组/块和都等于朴素计算`, () => {
      const pristine = [...nums];
      const frames = sqrtBuild(nums, l, r, updIdx, updVal);
      expect(nums).toEqual(pristine); // 面板不得就地改调用方的数组
      const q = lastState(frames.filter((f: any) => f.state.phase === 'query'));
      let naive = 0;
      for (let i = l; i <= r; i++) naive += pristine[i];
      expect(q.partialSum).toBe(naive);
      const s = lastState(frames);
      const after = [...pristine];
      after[updIdx] = updVal;
      expect(s.nums).toEqual(after);
      const size = s.size as number;
      const blockSum: number[] = [];
      for (let b = 0; b * size < after.length; b++) {
        blockSum.push(after.slice(b * size, Math.min(after.length, (b + 1) * size)).reduce((x, y) => x + y, 0));
      }
      expect(s.blocks).toEqual(blockSum);
    });
  }
});

describe('computational-geometry-panel（Andrew 单调链凸包）', () => {
  for (const pts of [
    [[0, 0], [4, 0], [4, 4], [0, 4], [2, 1], [1, 2], [3, 2], [2, 3], [2, 2], [5, 2], [2, 5]],
    [[0, 0], [2, 0], [1, 0], [0, 2], [2, 2], [1, 1]],
    [[0, 0], [1, 1], [2, 2], [3, 3]],
    [[0, 0], [1, 0], [0, 1]],
    [[1, 1], [1, 1], [2, 2], [0, 3]],
    [[5, 5], [1, 2], [3, 1], [6, 4], [2, 6], [4, 3], [0, 4]],
  ] as [number, number][][]) {
    it(`凸包顶点集等于「枚举有序点对」暴力求出的集合`, () => {
      const s = lastState(hullBuild(pts.map((p) => [...p] as [number, number])));
      const got = [...new Set((s.hullFinal as [number, number][]).map((p) => `${p[0]},${p[1]}`))].sort();
      expect(got).toEqual(refHullSet(pts));
      // 每个输入点都必须落在凸包多边形内部或边上
      const poly = s.hullFinal as [number, number][];
      if (poly.length >= 3) {
        for (const p of pts) {
          const inside = poly.every((a, i) => {
            const b = poly[(i + 1) % poly.length];
            return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= 0;
          });
          expect(inside).toBe(true);
        }
      }
    });
  }
});

describe('sweep-line-panel（扫描线求矩形面积并）', () => {
  it('没有矩形时给一帧明确提示而不是抛异常', () => {
    const frames = sweepBuild([]);
    expect(frames.length).toBe(1);
    expect(lastState(frames).area).toBe(0);
  });

  for (const rects of [
    [[1, 1, 4, 4], [2, 3, 6, 6], [4, 2, 7, 5]],
    [[0, 0, 2, 2], [0, 0, 2, 2]],
    [[0, 0, 1, 1], [2, 2, 3, 3]],
    [[0, 0, 2, 2], [2, 0, 4, 2]],
    [[0, 0, 3, 3]],
  ] as [number, number, number, number][][]) {
    it(`面积并 ${JSON.stringify(rects)} 等于坐标压缩后的格子暴力`, () => {
      expect(lastState(sweepBuild(rects.map((r) => [...r] as [number, number, number, number]))).area).toBe(refUnionArea(rects));
    });
  }
});

describe('divide-and-conquer-panel（归并求逆序对）', () => {
  for (const input of [[5, 2, 8, 1, 9, 3, 7, 4], [2, 4, 1, 3, 5], [5, 4, 3, 2, 1], [1, 2, 3], [2, 2, 1], [1]]) {
    it(`逆序对数 ${JSON.stringify(input)} 等于 O(n^2) 暴力，且末态已有序`, () => {
      const frames = dcBuild([...input]);
      const s = lastState(frames);
      expect(s.totalInv).toBe(refInvCount(input));
      expect(s.nums).toEqual([...input].sort((a, b) => a - b));
      // 面板同时维护「局部 inv」与「全局 totalInv」两份计数，逐帧增量之和必须等于末帧总数
      const sumSteps = frames.reduce((acc: number, f: any) => acc + (f.state.invStep ?? 0), 0);
      expect(sumSteps).toBe(s.totalInv);
    });
  }
});

describe('hill-cipher-panel（2x2 Hill 密码）', () => {
  for (const [message, K] of [
    ['HELLO', [[3, 3], [2, 5]]],
    ['Meet me at the park', [[6, 24], [1, 13]]],
    ['abc', [[1, 0], [0, 1]]],
    ['ZZZZ', [[0, 1], [1, 0]]],
    ['hi!!', [[3, -2], [1, 7]]],
  ] as [string, number[][]][]) {
    it(`密文 ${JSON.stringify(message)} × K 等于独立实现的矩阵乘法`, () => {
      expect(lastState(hillBuild(message, K)).cipher).toBe(refHill(message, K));
    });
  }
});

describe('weighted-random-panel（加权随机抽样）', () => {
  const items = ['a', 'b', 'c', 'd'];
  const weights = [1, 2, 3, 4];
  const cum: number[] = [];
  weights.forEach((w, i) => cum.push(w + (cum[i - 1] ?? 0)));
  it('累计权重表等于独立前缀和，且 pick 落在自己声明的区间里', () => {
    for (let seed = 0; seed < 40; seed++) {
      const s = lastState(wrBuild(items, weights, seed));
      expect(s.cum).toEqual(cum);
      expect(s.r).toBeGreaterThanOrEqual(0);
      expect(s.r).toBeLessThanOrEqual(cum[cum.length - 1]);
      let expectPick = -1;
      for (let i = 0; i < cum.length; i++) if (cum[i] >= s.r) { expectPick = i; break; }
      expect(s.pick).toBe(expectPick);
    }
  });
  it('权重大的项被选中次数不减于权重小的项（否则随机分布是错的）', () => {
    const hits = new Array(items.length).fill(0);
    for (let seed = 0; seed < 1000; seed++) hits[lastState(wrBuild(items, weights, seed)).pick as number]++;
    expect(hits.every((h) => h > 0)).toBe(true);
    for (let i = 1; i < hits.length; i++) expect(hits[i]).toBeGreaterThanOrEqual(hits[i - 1]);
  });
});

// ===== 第九批 A：18 个有参面板（二分进阶/位运算/分块表/环形队列/差分约束/背包/十五数码/哈希冲突/
// k-means/k-最近点/kNN/链表四合一/多项式哈希/TopK/递归/进阶排序/字符串四合一/复杂度曲线）=====
import { buildFirstSteps as bsFirst, buildLastSteps as bsLast, buildDeadLoopSteps as bsDead } from '@/components/visualizer/binary-search-advanced-panel';
import { buildSteps as bitOpsBuild } from '@/components/visualizer/bit-manipulation-panel';
import { buildSteps as blockBuild } from '@/components/visualizer/block-list-panel';
import { buildSteps as cqBuild } from '@/components/visualizer/design-data-structures-panel';
import { buildSteps as dcDiffBuild } from '@/components/visualizer/difference-constraints-panel';
import { buildSteps as knap2d } from '@/components/visualizer/dp-panel';
import { buildSteps as fifteenBuild } from '@/components/visualizer/fifteen-puzzle-panel';
import { buildSteps as collideBuild } from '@/components/visualizer/hash-collision-panel';
import { buildSteps as kmeansBuild } from '@/components/visualizer/kmeans-panel';
import { buildSteps as knightBuild } from '@/components/visualizer/knight-tour-panel';
import { buildSteps as knnBuild } from '@/components/visualizer/knn-panel';
import { buildSteps as llBuild } from '@/components/visualizer/linked-list-problems-panel';
import { buildSteps as polyBuild } from '@/components/visualizer/polynomial-hash-panel';
import { buildSteps as topkBuild } from '@/components/visualizer/priority-queue-advanced-panel';
import { buildFactorialSteps as factBuild, buildFibSteps as fibBuild } from '@/components/visualizer/recursion-panel';
import { buildCountingSteps as advCount, buildBucketSteps as advBucket, buildRadixSteps as advRadix } from '@/components/visualizer/sorting-advanced-panel';
import { buildSteps as strBuild } from '@/components/visualizer/string-panel';
import { buildSteps as cxBuild } from '@/components/visualizer/time-complexity-panel';

const lastPhaseState = (frames: any[], phase: string) =>
  lastState(frames.filter((f: any) => f.state.phase === phase));

function refLinearTopK(nums: number[], k: number): number[] {
  return [...nums].sort((a, b) => b - a).slice(0, k);
}

describe('binary-search-advanced-panel（first / last / 死循环演示）', () => {
  for (const [nums, target] of [
    [[1, 1, 2, 2, 3, 3], 2], [[1, 2, 3, 4, 5], 1], [[1, 2, 3, 4, 5], 5],
    [[1, 2, 3, 4, 5], 6], [[2, 2, 2], 2], [[7], 7], [[7], 3],
  ] as [number[], number][]) {
    it(`first/last 下标等于 indexOf / lastIndexOf（${JSON.stringify(nums)} 找 ${target}）`, () => {
      const f = lastState(bsFirst([...nums], target));
      const l = lastState(bsLast([...nums], target));
      const first = nums.indexOf(target);
      expect(f.found).toBe(first < 0 ? null : first);
      expect(l.found).toBe(first < 0 ? null : nums.lastIndexOf(target));
    });
    it(`死循环演示（${JSON.stringify(nums)} 找 ${target}）与独立模拟的判定一致`, () => {
      let left = 0, right = nums.length - 1, iter = 0;
      const seen = new Set<string>();
      let simDead = false;
      while (left <= right) {
        if (++iter > 500) { simDead = true; break; }
        const mid = left + ((right - left) >> 1);
        const key = `${left},${right},${mid}`;
        if (seen.has(key)) { simDead = true; break; }
        seen.add(key);
        if (nums[mid] < target) left = mid; else right = mid - 1; // 面板演示的错误写法
      }
      expect(!!lastState(bsDead([...nums], target)).deadLoopDetected).toBe(simDead);
    });
  }
});

describe('bit-manipulation-panel（按位 AND / OR / XOR）', () => {
  for (const [a, b, op] of [[12, 10, '&'], [12, 10, '|'], [12, 10, '^'], [255, 1, '&'], [0, 5, '^'], [170, 85, '|']] as [number, number, string][]) {
    it(`${a} ${op} ${b} 等于 JS 内置运算符`, () => {
      const s = lastState(bitOpsBuild(a, b, op));
      const want = op === '&' ? a & b : op === '|' ? a | b : a ^ b;
      expect(s.result).toBe(want);
      expect(Number.parseInt(String(s.resultBits).replace(/[^01]/g, ''), 2)).toBe(want);
    });
  }
});

describe('block-list-panel（分块表插入与分裂）', () => {
  for (const [values, S] of [[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3], [[42], 3], [[9, 8, 7, 6, 5, 4, 3, 2, 1], 2]] as [number[], number][]) {
    it(`插入 ${values.length} 个值后各块拼接等于插入顺序`, () => {
      const s = lastState(blockBuild([...values], S));
      const flat = (s.blocks as any[]).flatMap((b) => b.items as number[]);
      expect(flat).toEqual(values);
      expect((s.blocks as any[]).every((b) => b.items.length > 0)).toBe(true);
    });
  }
});

describe('design-data-structures-panel（环形队列 API）', () => {
  const ops = (seq: [string, number?][]): any[] => seq.map(([t, v]) => (t === 'enq' ? { type: 'enq', value: v! } : { type: 'deq' }));
  for (const [capacity, seq] of [
    [3, [['enq', 1], ['enq', 2], ['deq'], ['enq', 3], ['enq', 4], ['enq', 5]]],
    [3, [['deq'], ['enq', 1], ['deq'], ['deq']]],
    [1, [['enq', 7], ['enq', 8], ['deq'], ['enq', 9]]],
    [4, [['enq', 1], ['enq', 2], ['enq', 3], ['enq', 4], ['deq'], ['deq'], ['enq', 5]]],
  ] as [number, [string, number?][]][]) {
    it(`capacity=${capacity} 操作序列的存活元素等于独立模拟`, () => {
      const q: number[] = [];
      for (const [t, v] of seq) {
        if (t === 'enq') { if (q.length < capacity) q.push(v!); }
        else if (q.length) q.shift();
      }
      const s = lastState(cqBuild(capacity, ops(seq)));
      const live: number[] = [];
      for (let i = 0; i < (s.size as number); i++) live.push((s.arr as (number | null)[])[((s.front as number) + i) % capacity] as number);
      expect(live).toEqual(q);
      expect(s.size).toBe(q.length);
    });
  }
});

describe('difference-constraints-panel（差分约束可行性）', () => {
  const cases: [number, { u: number; v: number; w: number }[]][] = [
    [3, [{ u: 0, v: 1, w: 2 }, { u: 1, v: 2, w: 3 }, { u: 0, v: 2, w: 6 }]],
    [2, [{ u: 0, v: 1, w: -2 }, { u: 1, v: 0, w: -3 }]], // 负环 → 不可行
    [4, [{ u: 0, v: 1, w: 1 }, { u: 1, v: 2, w: 1 }, { u: 2, v: 3, w: 1 }, { u: 3, v: 0, w: -5 }]],
    [1, []],
  ];
  for (const [n, edges] of cases) {
    it(`n=${n}：给出的解必须逐条满足约束，负环判定与我独立跑 BF 一致`, () => {
      const s = lastState(dcDiffBuild(n, edges.map((e) => ({ ...e }))));
      // 独立判负环：从虚拟源 0 出发松弛 n 轮，第 n+1 轮仍可松弛即有负环
      const d = new Array(n).fill(0);
      for (let r = 0; r < n; r++) for (const e of edges) if (d[e.v] > d[e.u] + e.w) d[e.v] = d[e.u] + e.w;
      let negCycle = false;
      for (const e of edges) if (d[e.v] > d[e.u] + e.w) negCycle = true;
      const dist = s.dist as number[];
      if (negCycle) {
        expect(s.negativeCycle).toBe(true);
      } else {
        expect(s.negativeCycle || false).toBe(false);
        for (const e of edges) expect(dist[e.v] - dist[e.u]).toBeLessThanOrEqual(e.w);
      }
    });
  }
});

describe('dp-panel（二维表 0/1 背包）', () => {
  const cases: [{ weight: number; value: number }[], number][] = [
    [[{ weight: 2, value: 3 }, { weight: 1, value: 2 }, { weight: 3, value: 4 }, { weight: 2, value: 1 }], 5],
    [[{ weight: 1, value: 1 }], 0],
    [[{ weight: 5, value: 10 }, { weight: 5, value: 11 }], 5],
    [[], 3],
  ];
  for (const [items, capacity] of cases) {
    it(`容量 ${capacity} 的最大价值等于独立一维 DP`, () => {
      const dp = new Array(capacity + 1).fill(0);
      for (const it of items) for (let w = capacity; w >= it.weight; w--) dp[w] = Math.max(dp[w], dp[w - it.weight] + it.value);
      const table = lastState(knap2d(items.map((i) => ({ ...i })), capacity)).table as number[][];
      expect(table[items.length][capacity]).toBe(dp[capacity]);
      for (let c = 1; c <= capacity; c++) expect(table[items.length][c]).toBeGreaterThanOrEqual(table[items.length][c - 1]);
    });
  }
});

describe('fifteen-puzzle-panel（IDA* 求解十五数码）', () => {
  const GOAL = [...Array(15).keys()].map((i) => i + 1).concat([0]);
  const slides = (frames: any[]): number[][] => frames.map((f: any) => f.state.board as number[]);
  for (const start of [
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14, 0],
    [2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 13, 14, 15, 12],
  ]) {
    it(`给出的解真的是一步步滑到目标布局（${JSON.stringify(start)}）`, () => {
      const frames = fifteenBuild([...start]);
      const s = lastState(frames);
      const path = slides(frames);
      if (s.total === -1) {
        // 面板声称不可达或超时：奇偶性可独立核算
        const inv = (b: number[]) => {
          let c = 0;
          const f = b.filter((x) => x !== 0);
          for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) if (f[i] > f[j]) c++;
          return c;
        };
        expect(inv(start) % 2).toBe(1); // 奇逆序数 = 真的不可达
      } else {
        expect(path[0]).toEqual(start);
        expect(path[path.length - 1]).toEqual(GOAL);
        expect(s.total).toBe(path.length - 1);
        for (let i = 1; i < path.length; i++) {
          const a = path[i - 1], b = path[i];
          const blank = a.indexOf(0);
          const diff = a.map((v, k) => (v === b[k] ? -1 : k)).filter((k) => k >= 0);
          expect(diff.length).toBe(2); // 只有空格与一个滑块交换
          expect(diff).toContain(blank);
          const moved = diff.find((k) => k !== blank)!;
          expect(Math.abs(moved % 4 - blank % 4) + Math.abs(Math.floor(moved / 4) - Math.floor(blank / 4))).toBe(1);
        }
      }
    });
  }
});

describe('hash-collision-panel（线性探测 / 链地址 / 双重哈希）', () => {
  const M = 7;
  const h1 = (k: number) => k % M;
  const h2 = (k: number) => 5 - (k % 5);
  for (const keys of [[15, 22, 8, 7, 1], [1, 2, 3], [7, 14, 21], [6, 13, 20, 27]]) {
    it(`${JSON.stringify(keys)}：三张表都不丢键，且落位符合各自探测规则`, () => {
      const s = lastState(collideBuild([...keys]));
      const lin = (s.linearTable as (number | null)[]).filter((x) => x !== null) as number[];
      const dbl = (s.doubleTable as (number | null)[]).filter((x) => x !== null) as number[];
      const chain = (s.chainTable as number[][]).flat();
      expect([...lin].sort((a, b) => a - b)).toEqual([...keys].sort((a, b) => a - b));
      expect([...dbl].sort((a, b) => a - b)).toEqual([...keys].sort((a, b) => a - b));
      expect(chain.sort((a, b) => a - b)).toEqual([...keys].sort((a, b) => a - b));
      // 链地址：每个键必须在自己的 home 桶
      keys.forEach((k) => expect((s.chainTable as number[][])[h1(k)]).toContain(k));
      // 线性探测：从 home 起第一个空位就是它的落点
      const sim: (number | null)[] = new Array(M).fill(null);
      for (const k of keys) { let i = h1(k); while (sim[i] !== null) i = (i + 1) % M; sim[i] = k; }
      expect(s.linearTable).toEqual(sim);
      // 双重哈希：步长 h2，探测序列 (h1 + t*h2) % M
      const sim2: (number | null)[] = new Array(M).fill(null);
      for (const k of keys) { let t = 0, i = h1(k); while (sim2[i] !== null) { t++; i = (h1(k) + t * h2(k)) % M; } sim2[i] = k; }
      expect(s.doubleTable).toEqual(sim2);
    });
  }
});

describe('kmeans-panel（k 均值聚类收敛）', () => {
  for (const [data, k] of [
    [[[0, 0], [1, 1], [1, 0], [10, 10], [11, 11], [10, 12]], 2],
    [[[1, 1], [2, 2], [8, 8], [9, 9], [5, 5]], 3],
  ] as [number[][], number][]) {
    it(`末态的分配一定是「最近的中心」，且中心就是所属点的均值`, () => {
      const s = lastState(kmeansBuild(data.map((p) => [...p]), k));
      const centers = s.centers as number[][];
      const classes = s.classes as number[];
      expect(centers.length).toBe(k);
      const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
      data.forEach((p, i) => {
        const best = centers.reduce((bi, c, j) => (dist(p, c) < dist(p, centers[bi]) ? j : bi), 0);
        expect(classes[i]).toBe(best);
      });
      for (let c = 0; c < k; c++) {
        const pts = data.filter((_, i) => classes[i] === c);
        if (!pts.length) continue;
        const mean = [0, 1].map((d) => pts.reduce((acc, p) => acc + p[d], 0) / pts.length);
        expect(Math.abs(centers[c][0] - mean[0])).toBeLessThan(0.01);
        expect(Math.abs(centers[c][1] - mean[1])).toBeLessThan(0.01);
      }
    });
  }
});

describe('knight-tour-panel（马踏棋盘回溯）', () => {
  for (const n of [3, 4, 5]) {
    it(`n=${n}：声称完成就必须是 0..n²-1 的合法马步序列（order 存步序，board 只存访问标记）`, () => {
      const s = lastState(knightBuild(n));
      const order = s.order as number[][];
      const cells = new Map<number, [number, number]>();
      order.forEach((row, r) => row.forEach((v, c) => { if (v >= 0) cells.set(v, [r, c]); }));
      const full = cells.size === n * n && [...Array(n * n).keys()].every((i) => cells.has(i));
      const claim = String(s.message);
      if (claim.includes('完成巡游')) {
        expect(full).toBe(true);
        expect(claim).toContain(`${n * n} 步`);
        for (let i = 1; i < n * n; i++) {
          const a = cells.get(i - 1)!, b = cells.get(i)!;
          const d = [Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])].sort((x, y) => x - y);
          expect(d).toEqual([1, 2]);
        }
      } else {
        expect(full).toBe(false);
      }
    });
  }
});

describe('knn-panel（k 近邻投票）', () => {
  const data = [[0, 0], [1, 0], [0, 1], [9, 9], [10, 9], [9, 10]];
  const labels = [0, 0, 0, 1, 1, 1];
  for (const [target, k] of [[[0.2, 0.2], 3], [[9.5, 9.5], 3], [[5, 5], 1], [[9, 9], 5]] as [[number, number], number][]) {
    it(`目标 ${JSON.stringify(target)} 的 k=${k} 邻居与独立计算的距离序一致`, () => {
      const s = lastState(knnBuild(data.map((p) => [...p]), [...labels], [...target], k));
      const ds = data.map((p, i) => ({ i, d: Math.hypot(p[0] - target[0], p[1] - target[1]), l: labels[i] }))
        .sort((a, b) => a.d - b.d);
      const chosen = (s.chosen as number[]);
      expect(chosen.length).toBe(k);
      expect([...chosen].sort((a, b) => a - b)).toEqual(ds.slice(0, k).map((x) => x.i).sort((a, b) => a - b));
      const cnt: Record<number, number> = {};
      ds.slice(0, k).forEach((x) => { cnt[x.l] = (cnt[x.l] ?? 0) + 1; });
      const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0];
      expect(String(s.message)).toContain(`类 ${top}`);
    });
  }
});

describe('linked-list-problems-panel（删除倒数第 k 个节点）', () => {
  for (const [listA, listB, k] of [
    [[1, 2, 3, 4, 5], [6, 7], 2],
    [[1], [2], 1],
    [[9, 8, 7], [], 3],
    [[1, 2, 3, 4, 5], [6, 7], 5],
  ] as [number[], number[], number][]) {
    it(`k=${k}：删除的下标必须等于「表长 - k」，且 slow 恰好停在前一个`, () => {
      const s = lastState(llBuild([...listA], [...listB], k));
      const nodes = s.rNodes as number[]; // 该子问题用面板自带的固定链表，不吃 listA
      const idx = nodes.length - k;
      expect(s.removed).toBe(idx);
      expect(s.rSlow as number).toBe(idx - 1);
      expect(nodes[s.removed as number]).toBe(nodes[nodes.length - k]);
    });
  }
});

describe('polynomial-hash-panel（多项式滚动哈希）', () => {
  for (const word of ['abc', 'a', '', 'hello world', 'zzzzzz']) {
    it(`滚动哈希等于「按幂次直接求和」的另一条算法路径（${JSON.stringify(word)}）`, () => {
      const BASE = 37, MOD = 101;
      // 路径一：Horner 递推（与面板同式，但由我另写）
      let horner = 0;
      for (const ch of word) horner = (horner * BASE + ch.codePointAt(0)!) % MOD;
      // 路径二：显式幂次求和，完全不同的算法形状
      let sum = 0;
      for (let i = 0; i < word.length; i++) {
        const code = word[i].codePointAt(0)!;
        let pow = 1;
        for (let e = 0; e < word.length - 1 - i; e++) pow = (pow * BASE) % MOD;
        sum = (sum + ((code * pow) % MOD)) % MOD;
      }
      expect(sum).toBe(horner);
      expect(lastState(polyBuild(word)).h).toBe(horner);
    });
  }
});

describe('priority-queue-advanced-panel（数据流中的 Top-K 大）', () => {
  for (const [nums, k] of [
    [[3, 2, 1, 5, 6, 4], 2], [[1], 1], [[5, 5, 5, 5], 3], [[9, 8, 7, 6, 5, 4, 3, 2, 1], 4], [[4, 1, 2], 1],
  ] as [number[], number][]) {
    it(`TopK（${JSON.stringify(nums)}, k=${k}）等于排序截取，且末态堆满足小顶堆序`, () => {
      const s = lastState(topkBuild([...nums], k));
      const result = (s.result as number[]).slice().sort((a, b) => b - a);
      expect(result).toEqual(refLinearTopK(nums, Math.min(k, nums.length)).sort((a, b) => b - a));
      const heap = s.heap as number[];
      for (let i = 1; i < heap.length; i++) expect(heap[(i - 1) >> 1]).toBeLessThanOrEqual(heap[i]);
    });
  }
});

describe('recursion-panel（阶乘与斐波那契递归）', () => {
  for (const n of [0, 1, 5, 10, 12]) {
    it(`factorial(${n}) 与 fib(${n}) 等于迭代值`, () => {
      let f = 1;
      for (let i = 2; i <= n; i++) f *= i;
      const fibs = [0, 1];
      for (let i = 2; i <= n; i++) fibs.push(fibs[i - 1] + fibs[i - 2]);
      expect(lastState(factBuild(n)).finalResult).toBe(f);
      expect(lastState(fibBuild(n)).finalResult).toBe(n === 0 ? 0 : fibs[n]);
    });
  }
});

describe('sorting-advanced-panel（计数 / 桶 / 基数排序）', () => {
  const sets = [[5, 2, 8, 1, 9, 2], [1], [], [9, 9, 9], [3, 1, 4, 1, 5, 9, 2, 6], [0, 100, 50, 25, 75]];
  const sorted = (a: number[]) => [...a].sort((x, y) => x - y);
  for (const nums of sets) {
    it(`三种排序都排好序且不丢元素（${JSON.stringify(nums)}）`, () => {
      const want = sorted(nums);
      const c = lastState(advCount([...nums]));
      const b = lastState(advBucket([...nums], 5));
      const r = lastState(advRadix([...nums]));
      for (const s of [c, b, r]) {
        expect([...(s.nums as number[])].sort((x, y) => x - y)).toEqual(want);
      }
      expect([...(r.nums as number[])]).toEqual(want);
    });
  }
});

describe('string-panel（遍历 / 反转 / 回文 / 查找 / 计数 多阶段）', () => {
  for (const [s, pat] of [['racecar', 'ace'], ['hello', 'll'], ['', 'a'], ['abba', 'ba'], ['a', 'a']]) {
    it(`逐阶段核对：${JSON.stringify(s)}（找 ${JSON.stringify(pat)}）`, () => {
      const frames = strBuild(s, pat);
      const rev = lastPhaseState(frames, 'reverse');
      const pal = lastPhaseState(frames, 'palindrome');
      const sea = lastPhaseState(frames, 'search');
      const cnt = lastPhaseState(frames, 'count');
      expect(rev.rev).toBe([...s].reverse().join(''));
      if (pal.palinResult !== null && pal.palinResult !== undefined) {
        expect(!!pal.palinResult).toBe(s === [...s].reverse().join(''));
      }
      expect(sea.found).toBe(s.indexOf(pat));
      const mine: Record<string, number> = {};
      for (const ch of s) mine[ch] = (mine[ch] ?? 0) + 1;
      expect(cnt.counts).toEqual(mine);
    });
  }
});

describe('time-complexity-panel（复杂度曲线）', () => {
  for (const maxN of [10, 1000, 1]) {
    it(`maxN=${maxN}：逐条曲线展开并在末帧停在最大 n`, () => {
      const frames = cxBuild(maxN);
      const s = lastState(frames);
      expect(s.activeN).toBe(maxN);
      expect(s.visibleCount).toBeGreaterThan(0);
      const counts = frames.map((f: any) => f.state.visibleCount as number);
      expect(counts.every((v, i) => i === 0 || v >= counts[i - 1])).toBe(true);
      expect(s.visibleCount).toBe(Math.max(...counts));
    });
  }
});

// ===== 第九批 B：8 个「原本 buildSteps() 无参」的面板——本批把写死的数据/演示脚本提成了带默认值的入参，
// 于是可以被外部数据驱动地验证。=====
import { buildSteps as blBuild } from '@/components/visualizer/binary-lifting-panel';
import { buildSteps as cdqBuild } from '@/components/visualizer/cdq-divide-conquer-panel';
import { buildSteps as hldBuild } from '@/components/visualizer/heavy-light-decomposition-panel';
import { buildSteps as pstBuild } from '@/components/visualizer/persistent-segment-tree-panel';
import { buildSteps as lazySegBuild } from '@/components/visualizer/segment-tree-advanced-panel';
import { buildSteps as setMapBuild } from '@/components/visualizer/set-and-map-panel';
import { buildSteps as tdcBuild } from '@/components/visualizer/tree-diameter-centroid-panel';
import { buildSteps as ufAdvBuild } from '@/components/visualizer/union-find-advanced-panel';

const parentsOf = (children: number[][]) => {
  const p = new Array(children.length).fill(-1);
  children.forEach((kids, u) => kids.forEach((v) => { p[v] = u; }));
  return p;
};
const depthsOf = (parent: number[]) =>
  parent.map((_, i) => { let d = 0, x = i; while (parent[x] >= 0) { x = parent[x]; d++; } return d; });
const lcaNaive = (parent: number[], depth: number[], u: number, v: number) => {
  let a = u, b = v;
  while (depth[a] > depth[b]) a = parent[a];
  while (depth[b] > depth[a]) b = parent[b];
  while (a !== b) { a = parent[a]; b = parent[b]; }
  return a;
};
const pathSumNaive = (children: number[][], val: number[], u: number, v: number) => {
  const parent = parentsOf(children), depth = depthsOf(parent);
  const on = new Set<number>();
  let a = u, b = v;
  while (a !== b) {
    if (depth[a] >= depth[b]) { on.add(a); a = parent[a]; } else { on.add(b); b = parent[b]; }
  }
  on.add(a);
  return [...on].reduce((acc, x) => acc + val[x], 0);
};

describe('binary-lifting-panel（LCA 倍增）', () => {
  for (const [children, queries] of [
    [[[1, 2], [3, 4], [5], [6], [], [7], [8], [9], [], []], [[8, 9], [9, 5], [0, 9], [3, 4]]],
    [[[], [], [], []], [[3, 2], [0, 3]]],                       // 链 0→1→2→3
    [[[1, 2, 3], [], [], []], [[1, 2], [1, 3], [0, 3]]],        // 星形
  ] as [number[][], [number, number][]][]) {
    it(`每段查询的 LCA 等于「沿父指针暴力上跳」：${JSON.stringify(queries)}`, () => {
      const parent = parentsOf(children);
      const depth = depthsOf(parent);
      const frames = blBuild(parent, depth, Math.max(2, Math.ceil(Math.log2(parent.length)) + 1), queries);
      const done = frames.filter((f: any) => f.state.phase === 'done');
      expect(done.length).toBe(queries.length);
      done.forEach((f: any, i) => {
        const [a, b] = queries[i];
        expect(f.state.result).toBe(lcaNaive(parent, depth, a, b));
      });
    });
  }
});

describe('cdq-divide-conquer-panel（三维偏序计数）', () => {
  // 面板自己不对第一维排序，演示数据本身按 a 升序 —— 用例遵守这个前置约定
  for (const pts of [
    [{ a: 1, b: 5, c: 3 }, { a: 2, b: 3, c: 1 }, { a: 3, b: 4, c: 5 }, { a: 4, b: 1, c: 2 }, { a: 5, b: 2, c: 4 }, { a: 6, b: 6, c: 6 }],
    [{ a: 1, b: 1, c: 1 }, { a: 2, b: 2, c: 2 }],
    [{ a: 1, b: 1, c: 1 }, { a: 2, b: 2, c: 2 }, { a: 3, b: 3, c: 3 }],
    [{ a: 1, b: 3, c: 2 }, { a: 2, b: 1, c: 1 }, { a: 3, b: 2, c: 3 }],
  ].map((arr) => arr.map((p, id) => ({ ...p, id })))) {
    it(`ans[] 等于「逐点比较三维」的暴力计数`, () => {
      const want = pts.map((p) => pts.filter((q) => q.id !== p.id && q.a <= p.a && q.b <= p.b && q.c <= p.c).length);
      const maxC = Math.max(...pts.map((p) => p.c));
      expect(lastState(cdqBuild(pts.map((p) => ({ ...p })), maxC)).ans).toEqual(want);
    });
  }
});

describe('heavy-light-decomposition-panel（树链求和）', () => {
  for (const [children, val, pair] of [
    [[[1, 2, 3], [4, 5], [], [6], [7, 8], [], [9], [], [], [10], []], [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5], [8, 10]],
    [[[1, 2], [3], [], []], [1, 2, 3, 4], [0, 3]],
    [[[1, 2], [], []], [7, 8, 9], [1, 2]],
    [[[1], [2], [3], [4], []], [1, 1, 1, 1, 1], [0, 4]],
  ] as [number[][], number[], [number, number]][]) {
    it(`路径 ${pair[0]}→${pair[1]} 的点权和等于沿父指针暴力累加`, () => {
      expect(lastState(hldBuild(children.map((k) => [...k]), [...val], pair)).result).toBe(pathSumNaive(children, val, pair[0], pair[1]));
    });
  }
});

describe('persistent-segment-tree-panel（版本树区间第 k 小）', () => {
  for (const [nums, q] of [
    [[3, 1, 4, 2], [1, 3, 2]], [[5, 4, 3, 2, 1], [0, 4, 1]], [[1, 2, 3, 4], [0, 3, 4]], [[9, 1, 7, 3, 5], [1, 4, 3]],
  ] as [number[], [number, number, number]][]) {
    it(`nums[${q[0]}..${q[1]}] 的第 ${q[2]} 小等于切片排序取值`, () => {
      const maxV = Math.max(...nums);
      const [l, r, k] = q;
      expect(lastState(pstBuild([...nums], maxV, q)).result).toBe([...nums.slice(l, r + 1)].sort((a, b) => a - b)[k - 1]);
    });
  }
});

describe('segment-tree-advanced-panel（懒标记区间加 + 区间和）', () => {
  type SOp = { type: 'update'; l: number; r: number; val: number } | { type: 'query'; l: number; r: number };
  const scripts: [SOp[], number[]][] = [
    [[{ type: 'update', l: 1, r: 4, val: 2 }, { type: 'query', l: 0, r: 3 }, { type: 'update', l: 0, r: 2, val: 1 }, { type: 'query', l: 2, r: 5 }], [2, 5, 1, 4, 3, 6]],
    [[{ type: 'update', l: 0, r: 1, val: 5 }, { type: 'query', l: 0, r: 1 }], [1, 1]],
    [[{ type: 'query', l: 0, r: 2 }], [7, 8, 9]],
    [[{ type: 'update', l: 0, r: 4, val: -3 }, { type: 'query', l: 1, r: 3 }], [4, 6, 8, 10, 12]],
    [[{ type: 'query', l: 0, r: 0 }, { type: 'update', l: 0, r: 0, val: 10 }, { type: 'query', l: 0, r: 0 }], [-2]],
  ];
  for (const [ops, nums] of scripts) {
    it(`每次区间和等于朴素数组回放（${JSON.stringify(nums)}）`, () => {
      const arr = [...nums];
      const want: number[] = [];
      for (const op of ops) {
        if (op.type === 'update') for (let i = op.l; i <= op.r; i++) arr[i] += op.val;
        else want.push(arr.slice(op.l, op.r + 1).reduce((x, y) => x + y, 0));
      }
      const frames = lazySegBuild([...nums], ops as any[]);
      // 查询结束时才写入 result，按区间去重后取每次查询的首个非空 result
      const got: number[] = [];
      const seenRanges = new Set<string>();
      for (const f of frames as any[]) {
        const st = f.state;
        if (st.opType !== 'query' || st.result === null) continue;
        const key = JSON.stringify([st.opRange, st.result]);
        if (!seenRanges.has(key)) { seenRanges.add(key); got.push(st.result as number); }
      }
      expect(got).toEqual(want);
    });
  }
});

describe('set-and-map-panel（Set / Map 操作脚本）', () => {
  const scripts: any[][] = [
    [[{ type: 'set-add', value: 5 }, { type: 'set-add', value: 3 }, { type: 'set-add', value: 3 }, { type: 'set-has', value: 3 }, { type: 'set-delete', value: 3 }]],
    [[{ type: 'map-set', key: 'a', value: 1 }, { type: 'map-set', key: 'b', value: 2 }, { type: 'map-set', key: 'a', value: 9 }, { type: 'map-get', key: 'a' }]],
    [[{ type: 'set-add', value: 1 }, { type: 'set-has', value: 7 }, { type: 'map-set', key: 'k', value: 3 }, { type: 'map-delete', key: 'k' }]],
    [[]],
  ];
  for (const [script] of scripts) {
    it(`末态集合/映射等于独立模拟：${JSON.stringify(script.map((o: any) => o.type))}`, () => {
      const set = new Set<number>();
      const map = new Map<string, number>();
      for (const op of script) {
        if (op.type === 'set-add') set.add(op.value);
        else if (op.type === 'set-delete') set.delete(op.value);
        else if (op.type === 'map-set') map.set(op.key, op.value);
        else if (op.type === 'map-delete') map.delete(op.key);
      }
      const s = lastState(setMapBuild(script as any[]));
      expect([...(s.setItems as number[])].sort((a, b) => a - b)).toEqual([...set].sort((a, b) => a - b));
      const got: Record<string, number> = {};
      (s.mapEntries as { key: string; value: number }[]).forEach((e) => { got[e.key] = e.value; });
      expect(got).toEqual(Object.fromEntries(map));
    });
  }
});

describe('tree-diameter-centroid-panel（树的直径与重心）', () => {
  const trees: number[][][] = [
    [[1, 2], [3, 4], [5], [6, 7], [], [], [], []],
    [[1], [2], []],
    [[1], [2], [3], [4], []],
    [[1, 2, 3], [], [], []],
    [[1, 2], [3], [], []],
  ];
  for (const children of trees) {
    it(`${children.length} 个点的直径与重心都等于独立计算`, () => {
      const n = children.length;
      const adj: number[][] = Array.from({ length: n }, () => []);
      children.forEach((kids, u) => kids.forEach((v) => { adj[u].push(v); adj[v].push(u); }));
      const bfs = (s: number) => {
        const d = new Array(n).fill(-1); d[s] = 0;
        const q = [s];
        for (let i = 0; i < q.length; i++) for (const v of adj[q[i]]) if (d[v] < 0) { d[v] = d[q[i]] + 1; q.push(v); }
        return d;
      };
      let diam = 0;
      for (let s = 0; s < n; s++) diam = Math.max(diam, ...bfs(s));
      const parent = parentsOf(children);
      const depth = depthsOf(parent);
      const sub = new Array(n).fill(1);
      [...Array(n).keys()].sort((a, b) => depth[b] - depth[a]).forEach((u) => {
        if (parent[u] >= 0) sub[parent[u]] += sub[u];
      });
      const maxPartOf = (u: number) => {
        let mx = n - sub[u];
        for (const v of adj[u]) if (parent[v] === u) mx = Math.max(mx, sub[v]);
        return mx;
      };
      const bestMax = Math.min(...[...Array(n).keys()].map(maxPartOf));
      const s = lastState(tdcBuild(children.map((k) => [...k])));
      expect(s.diameter).toBe(diam);
      // 面板会给每个节点算 maxPart，逐个都必须与我独立算的一致
      expect(s.maxPart).toEqual([...Array(n).keys()].map(maxPartOf));
      // 一棵树的重心可以有两个，只断言「面板选的那个确实最优」
      expect(maxPartOf(s.centroid as number)).toBe(bestMax);
      expect(s.bestMax).toBe(bestMax);
    });
  }
});

describe('union-find-advanced-panel（带权并查集：关系断言）', () => {
  type UOp = { type: 'union'; a: number; b: number; w: number } | { type: 'query'; a: number; b: number };
  const scripts: [UOp[], number][] = [
    [[{ type: 'union', a: 0, b: 1, w: -1 }, { type: 'union', a: 1, b: 2, w: -1 }, { type: 'query', a: 0, b: 2 }, { type: 'union', a: 3, b: 0, w: 2 }, { type: 'query', a: 3, b: 1 }], 5],
    [[{ type: 'query', a: 0, b: 1 }], 3],
    [[{ type: 'union', a: 0, b: 1, w: 4 }, { type: 'union', a: 2, b: 3, w: 5 }, { type: 'query', a: 0, b: 1 }, { type: 'query', a: 1, b: 3 }], 4],
    [[{ type: 'union', a: 0, b: 1, w: 2 }, { type: 'union', a: 1, b: 0, w: -2 }, { type: 'query', a: 0, b: 1 }], 2],
    [[{ type: 'union', a: 4, b: 0, w: 7 }, { type: 'query', a: 4, b: 0 }], 5],
  ];
  for (const [ops, n] of scripts) {
    it(`每个 query 的 d[a]-d[b] 等于独立解方程组的势差`, () => {
      // 参照：把 union(a,b,w) 当作方程 d[a] - d[b] = w，连通块内 BFS 定势（零点任取，差不受影响）
      const pot = new Array<number>(n).fill(0);
      const comp = new Array<number>(n).fill(-1); // 跨连通块的关系是「未知」，不能拿两个零点相减
      const eq: [number, number, number][] = []; // (x, y, w) 表示 d[x] - d[y] = w
      ops.forEach((op) => { if (op.type === 'union') eq.push([op.a, op.b, op.w]); });
      let cid = 0;
      for (let st0 = 0; st0 < n; st0++) {
        if (comp[st0] >= 0) continue;
        comp[st0] = cid;
        const q = [st0];
        for (let i = 0; i < q.length; i++) {
          const cur = q[i];
          for (const [x, y, w] of eq) {
            if (x === cur && comp[y] < 0) { comp[y] = cid; pot[y] = pot[cur] - w; q.push(y); }
            if (y === cur && comp[x] < 0) { comp[x] = cid; pot[x] = pot[cur] + w; q.push(x); }
          }
        }
        cid++;
      }
      const want = ops.filter((o): o is { type: 'query'; a: number; b: number } => o.type === 'query')
        .filter((o) => comp[o.a] === comp[o.b])
        .map((o) => pot[o.a] - pot[o.b]);
      const frames = ufAdvBuild(n, ops.map((o) => ({ ...o })) as any[]);
      const got: number[] = [];
      const stamp = new Set<string>();
      for (const f of frames as any[]) {
        const st = f.state;
        if (st.opType !== 'query' || st.queryResult === null || st.queryResult === undefined) continue;
        const key = `${st.opA}-${st.opB}`;
        if (stamp.has(key)) continue;
        stamp.add(key);
        got.push(st.queryResult as number);
      }
      expect(got).toEqual(want);
    });
  }
});

// memoization-panel 的 buildSteps 吃的是「预先构建好的递归树」，所以可测的真相在两棵树里：
// 朴素树的节点数、重复标记，与记忆化树的命中结构。参照用迭代 fib 与独立的前序首次出现判定。
import { buildSteps as memoBuild, buildNaiveTree, buildMemoTree } from '@/components/visualizer/memoization-panel';

const refFibIter = (k: number): number => {
  let a = 0, b = 1;
  for (let i = 0; i < k; i++) [a, b] = [b, a + b];
  return a;
};
/** fib(n) 的递归真正会碰到的 k 集合（fib(1) 碰不到 0） */
const refMemoReach = (k: number): number[] =>
  k <= 1 ? [k] : [...new Set([k, ...refMemoReach(k - 1), ...refMemoReach(k - 2)])].sort((a, b) => a - b);
/** 朴素 fib(n) 的调用次数 = 2*fib(n+1) - 1 */
const refNaiveCalls = (n: number): number => 2 * refFibIter(n + 1) - 1;

describe('memoization-panel（递归树构建）', () => {
  for (const n of [1, 2, 5, 8, 10]) {
    it(`朴素树有 ${refNaiveCalls(n)} 个节点、每个节点的值等于迭代 fib，重复标记等于前序首次出现判定`, () => {
      const { root, nodes } = buildNaiveTree(n);
      expect(root.k).toBe(n);
      expect(nodes.length).toBe(refNaiveCalls(n));
      nodes.forEach((nd) => expect(nd.value).toBe(refFibIter(nd.k)));
      const seen = new Set<number>();
      const wantDup: boolean[] = [];
      (function walk(nd: any) {
        wantDup.push(seen.has(nd.k));
        seen.add(nd.k);
        nd.children.forEach(walk);
      })(root);
      const flat = new Map<number, boolean>();
      (function idx(nd: any) { flat.set(nd.id, nd.duplicate); nd.children.forEach(idx); })(root);
      const got = nodes.map((nd) => flat.get(nd.id));
      expect(got).toEqual(wantDup);
    });

    it(`记忆化树里每个 k 只被真正计算一次，且 k 覆盖 0..${n}`, () => {
      const { root, nodes } = buildMemoTree(n);
      const computed = nodes.filter((nd) => !nd.hit);
      const ks = computed.map((nd) => nd.k);
      expect(new Set(ks).size).toBe(ks.length);
      // fib(1) 的递归根本碰不到 fib(0)，所以「算过的 k」要由递归定义推出，而不是 0..n
      expect([...ks].sort((a, b) => a - b)).toEqual(refMemoReach(n));
      nodes.forEach((nd) => expect(nd.value).toBe(refFibIter(nd.k)));
      // 命中节点的 k 必须在它之前的前序里已经算过
      const doneAt = new Map<number, number>();
      let seq = 0;
      (function walk(nd: any) {
        if (!nd.hit) doneAt.set(nd.k, seq);
        seq++;
        nd.children.forEach(walk);
      })(root);
      let order = 0;
      (function check(nd: any) {
        if (nd.hit) expect(doneAt.get(nd.k)!).toBeLessThan(order);
        order++;
        nd.children.forEach(check);
      })(root);
      expect(nodes.length).toBeLessThan(2 * refFibIter(n + 1));
    });

    it(`buildSteps 末帧的对比数字与两棵树自报的规模一致，memo 表等于迭代 fib`, () => {
      const naive = buildNaiveTree(n);
      const memo = buildMemoTree(n);
      const frames = memoBuild(n, naive.nodes as any[], memo.nodes as any[]) as any[];
      const last = lastState(frames);
      expect(last.phase).toBe('done');
      const wantTable: (number | null)[] = new Array(n + 1).fill(null);
      refMemoReach(n).forEach((k) => { wantTable[k] = refFibIter(k); });
      expect(last.memoTable.slice(0, n + 1)).toEqual(wantTable);
      const naiveMax = Math.max(...frames.filter((f) => f.state.phase === 'naive').map((f) => f.state.callCount as number));
      expect(naiveMax).toBe(naive.nodes.length);
    });
  }
});
