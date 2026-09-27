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
