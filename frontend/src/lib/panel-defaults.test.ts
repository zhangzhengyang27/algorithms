/* eslint-disable @typescript-eslint/no-explicit-any */
// 第八批把 8 个「buildSteps() 完全无参」的面板改成了「数据与演示脚本作为带默认值的入参」。
// 面板组件仍然走无参调用（默认值 = 原来的模块常量），所以这条真实产品路径必须单独钉住：
// 每组用例用**我在测试里另写的面板默认数据**跑一遍，与独立参照比对——既防重构改坏行为，也防默认示例本身是错的。
import { buildSteps as blBuild } from '@/components/visualizer/binary-lifting-panel';
import { buildSteps as cdqBuild } from '@/components/visualizer/cdq-divide-conquer-panel';
import { buildSteps as hldBuild } from '@/components/visualizer/heavy-light-decomposition-panel';
import { buildSteps as pstBuild } from '@/components/visualizer/persistent-segment-tree-panel';
import { buildSteps as lazySegBuild } from '@/components/visualizer/segment-tree-advanced-panel';
import { buildSteps as setMapBuild } from '@/components/visualizer/set-and-map-panel';
import { buildSteps as tdcBuild } from '@/components/visualizer/tree-diameter-centroid-panel';
import { buildSteps as ufAdvBuild } from '@/components/visualizer/union-find-advanced-panel';

const lastState = (steps: any[]) => steps[steps.length - 1].state;

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

/** 直径树的孩子表（= 面板里的 CHILDREN） */
const BL_CHILDREN = [[1, 2], [3, 4], [5], [6], [], [7], [8], [9], [], []];
const BL_PARENT = [-1, 0, 0, 1, 1, 2, 3, 5, 6, 7];
const BL_DEPTH = [0, 1, 1, 2, 2, 2, 3, 3, 4, 4];

describe('默认数据回归：binary-lifting', () => {
  it('默认树上两段查询的 LCA 等于沿父指针暴力上跳', () => {
    const done = (blBuild() as any[]).filter((f) => f.state.phase === 'done');
    expect(done.length).toBe(2);
    done.forEach((f, i) => {
      const [a, b] = ([[8, 9], [9, 5]] as [number, number][])[i];
      expect(f.state.result).toBe(lcaNaive(BL_PARENT, BL_DEPTH, a, b));
    });
    // 面板的 PARENT/DEPTH 常量必须真的对应同一棵树
    expect(parentsOf(BL_CHILDREN)).toEqual(BL_PARENT);
    expect(depthsOf(BL_PARENT)).toEqual(BL_DEPTH);
  });
});

describe('默认数据回归：cdq-divide-conquer', () => {
  const PTS = [
    { a: 1, b: 5, c: 3, id: 0 }, { a: 2, b: 3, c: 1, id: 1 }, { a: 3, b: 4, c: 5, id: 2 },
    { a: 4, b: 1, c: 2, id: 3 }, { a: 5, b: 2, c: 4, id: 4 }, { a: 6, b: 6, c: 6, id: 5 },
  ];
  it('默认六点集的 ans[] 等于逐点三维比较', () => {
    const want = PTS.map((p) => PTS.filter((q) => q.id !== p.id && q.a <= p.a && q.b <= p.b && q.c <= p.c).length);
    expect(lastState(cdqBuild()).ans).toEqual(want);
  });
});

describe('默认数据回归：heavy-light-decomposition', () => {
  const CHILDREN = [[1, 2, 3], [4, 5], [], [6], [7, 8], [], [9], [], [], [10], []];
  const VAL = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
  it('默认树上路径 8→10 的点权和等于沿父指针暴力累加', () => {
    expect(lastState(hldBuild()).result).toBe(pathSumNaive(CHILDREN, VAL, 8, 10));
  });
});

describe('默认数据回归：persistent-segment-tree', () => {
  const NUMS = [3, 1, 4, 2];
  it('默认查询 nums[1..3] 的第 2 小等于切片排序', () => {
    expect(lastState(pstBuild()).result).toBe([...NUMS.slice(1, 4)].sort((a, b) => a - b)[1]);
  });
});

describe('默认数据回归：segment-tree-advanced', () => {
  const NUMS = [2, 5, 1, 4, 3, 6];
  const OPS: any[] = [
    { type: 'update', l: 1, r: 4, val: 2 },
    { type: 'query', l: 0, r: 3 },
    { type: 'update', l: 0, r: 2, val: 1 },
    { type: 'query', l: 2, r: 5 },
  ];
  it('默认脚本的两次区间和等于朴素回放', () => {
    const arr = [...NUMS];
    const want: number[] = [];
    for (const op of OPS) {
      if (op.type === 'update') for (let i = op.l; i <= op.r; i++) arr[i] += op.val;
      else want.push(arr.slice(op.l, op.r + 1).reduce((x, y) => x + y, 0));
    }
    const got: number[] = [];
    const seen = new Set<string>();
    for (const f of lazySegBuild() as any[]) {
      const st = f.state;
      if (st.opType !== 'query' || st.result === null) continue;
      const key = JSON.stringify([st.opRange, st.result]);
      if (seen.has(key)) continue;
      seen.add(key);
      got.push(st.result);
    }
    expect(got).toEqual(want);
  });
});

describe('默认数据回归：set-and-map', () => {
  const SCRIPT: any[] = [
    { type: 'set-add', value: 5 }, { type: 'set-add', value: 3 }, { type: 'set-add', value: 9 }, { type: 'set-add', value: 3 },
    { type: 'set-has', value: 3 }, { type: 'set-has', value: 7 }, { type: 'set-delete', value: 3 },
    { type: 'map-set', key: 'apple', value: 3 }, { type: 'map-set', key: 'banana', value: 5 }, { type: 'map-set', key: 'cherry', value: 7 },
    { type: 'map-get', key: 'banana' }, { type: 'map-get', key: 'durian' }, { type: 'map-delete', key: 'apple' }, { type: 'set-add', value: 7 },
  ];
  it('默认脚本跑完的集合/映射等于独立模拟', () => {
    const set = new Set<number>();
    const map = new Map<string, number>();
    for (const op of SCRIPT) {
      if (op.type === 'set-add') set.add(op.value);
      else if (op.type === 'set-delete') set.delete(op.value);
      else if (op.type === 'map-set') map.set(op.key, op.value);
      else if (op.type === 'map-delete') map.delete(op.key);
    }
    const s = lastState(setMapBuild());
    expect([...(s.setItems as number[])].sort((a, b) => a - b)).toEqual([...set].sort((a, b) => a - b));
    const got: Record<string, number> = {};
    (s.mapEntries as { key: string; value: number }[]).forEach((e) => { got[e.key] = e.value; });
    expect(got).toEqual(Object.fromEntries(map));
  });
});

describe('默认数据回归：tree-diameter-centroid', () => {
  const CHILDREN = [[1, 2], [3, 4], [5], [6, 7], [], [], [], []];
  it('默认树的直径与重心等于独立计算', () => {
    const n = CHILDREN.length;
    const adj: number[][] = Array.from({ length: n }, () => []);
    CHILDREN.forEach((kids, u) => kids.forEach((v) => { adj[u].push(v); adj[v].push(u); }));
    const bfs = (s: number) => {
      const d = new Array(n).fill(-1); d[s] = 0;
      const q = [s];
      for (let i = 0; i < q.length; i++) for (const v of adj[q[i]]) if (d[v] < 0) { d[v] = d[q[i]] + 1; q.push(v); }
      return d;
    };
    let diam = 0;
    for (let s = 0; s < n; s++) diam = Math.max(diam, ...bfs(s));
    const parent = parentsOf(CHILDREN), depth = depthsOf(parent);
    const sub = new Array(n).fill(1);
    [...Array(n).keys()].sort((a, b) => depth[b] - depth[a]).forEach((u) => { if (parent[u] >= 0) sub[parent[u]] += sub[u]; });
    const maxPartOf = (u: number) => {
      let mx = n - sub[u];
      for (const v of adj[u]) if (parent[v] === u) mx = Math.max(mx, sub[v]);
      return mx;
    };
    const bestMax = Math.min(...[...Array(n).keys()].map(maxPartOf));
    const s = lastState(tdcBuild());
    expect(s.diameter).toBe(diam);
    expect(maxPartOf(s.centroid as number)).toBe(bestMax);
  });
});

describe('默认数据回归：union-find-advanced', () => {
  const N = 5;
  const OPS: any[] = [
    { type: 'union', a: 0, b: 1, w: -1 }, { type: 'union', a: 1, b: 2, w: -1 }, { type: 'query', a: 0, b: 2 },
    { type: 'union', a: 3, b: 0, w: 2 }, { type: 'query', a: 3, b: 1 },
  ];
  it('默认脚本两次查询的结果等于独立解方程组', () => {
    const pot = new Array<number>(N).fill(0);
    const comp = new Array<number>(N).fill(-1);
    const eq: [number, number, number][] = OPS.filter((o) => o.type === 'union').map((o) => [o.a, o.b, o.w]);
    let cid = 0;
    for (let st0 = 0; st0 < N; st0++) {
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
    const want = OPS.filter((o) => o.type === 'query').map((o) => pot[o.a] - pot[o.b]);
    const got: number[] = [];
    const stamp = new Set<string>();
    for (const f of ufAdvBuild() as any[]) {
      const st = f.state;
      if (st.opType !== 'query' || st.queryResult === null || st.queryResult === undefined) continue;
      const key = `${st.opA}-${st.opB}`;
      if (stamp.has(key)) continue;
      stamp.add(key);
      got.push(st.queryResult);
    }
    expect(got).toEqual(want);
  });
});
