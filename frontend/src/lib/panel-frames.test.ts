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
