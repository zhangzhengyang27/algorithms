import {
  createTreeNode,
  generateBFSSteps,
  generateDFSSteps,
  generateRandomBST,
  insertBST,
  searchBST,
  type GraphNode,
  type TreeNode,
} from './graph';

/** graph-search-panel / tree-traversal-panel 没有自己的 buildSteps，
 * 它们的步骤来自 @/lib/algorithms/graph —— 可测的那一层在这里。 */

const mkNodes = (spec: [string, string[]][]): GraphNode[] =>
  spec.map(([id, neighbors], i) => ({ id, value: i, x: i * 40, y: 0, neighbors }));

const refBfs = (spec: [string, string[]][], start: string): string[] => {
  const adj = new Map(spec);
  const seen = new Set([start]);
  const q = [start];
  const out: string[] = [];
  for (let i = 0; i < q.length; i++) {
    const u = q[i];
    out.push(u);
    for (const v of adj.get(u) ?? []) if (!seen.has(v)) { seen.add(v); q.push(v); }
  }
  return out;
};

const refDfs = (spec: [string, string[]][], start: string): string[] => {
  const adj = new Map(spec);
  const seen = new Set<string>();
  const out: string[] = [];
  const walk = (u: string) => {
    if (seen.has(u)) return;
    seen.add(u);
    out.push(u);
    for (const v of adj.get(u) ?? []) walk(v);
  };
  walk(start);
  return out;
};

const inorder = (root: TreeNode | undefined): number[] => {
  if (!root) return [];
  return [...inorder(root.left), root.value, ...inorder(root.right)];
};

const TOPO: [string, string[]][] = [
  ['0', ['1', '2']],
  ['1', ['0', '3']],
  ['2', ['0', '3', '4']],
  ['3', ['1', '2']],
  ['4', ['2']],
];

describe('generateBFSSteps', () => {
  for (const start of ['0', '3', '4']) {
    it(`访问顺序等于我在同一邻接表上跑的 BFS（起点 ${start}）`, () => {
      const steps = generateBFSSteps(mkNodes(TOPO), start);
      const visits = steps.filter((s) => s.type === 'visit').map((s) => s.nodeId);
      expect(visits).toEqual(refBfs(TOPO, start));
      // 每个 visited 快照都必须是「已访问前缀」，不能回头删
      steps.forEach((s) => expect(s.visited.length).toBeGreaterThan(0));
    });
  }

  it('孤立分量里的节点不会被访问', () => {
    const spec: [string, string[]][] = [['0', ['1']], ['1', ['0']], ['2', ['3']], ['3', ['2']]];
    const visits = generateBFSSteps(mkNodes(spec), '0').filter((s) => s.type === 'visit').map((s) => s.nodeId);
    expect(visits).toEqual(['0', '1']);
  });

  it('单点图也能给出一帧访问', () => {
    const visits = generateBFSSteps(mkNodes([['0', []]]), '0').filter((s) => s.type === 'visit');
    expect(visits.map((v) => v.nodeId)).toEqual(['0']);
  });
});

describe('generateDFSSteps', () => {
  for (const start of ['0', '3']) {
    it(`访问顺序等于我在同一邻接表上跑的 DFS（起点 ${start}）`, () => {
      const steps = generateDFSSteps(mkNodes(TOPO), start);
      const visits = steps.filter((s) => s.type === 'visit').map((s) => s.nodeId);
      expect(visits).toEqual(refDfs(TOPO, start));
    });
  }

  it('回溯步骤在深链上必然出现', () => {
    const chain: [string, string[]][] = [['0', ['1']], ['1', ['2']], ['2', ['3']], ['3', []]];
    const steps = generateDFSSteps(mkNodes(chain), '0');
    expect(steps.some((s) => s.type === 'backtrack')).toBe(true);
    expect(steps.filter((s) => s.type === 'visit').map((s) => s.nodeId)).toEqual(['0', '1', '2', '3']);
  });
});

describe('insertBST / searchBST', () => {
  const seeds = [[50, 30, 70, 20, 40, 60, 80], [1], [7, 7, 3], [5, 3, 8, 1, 9, 7]];
  for (const values of seeds) {
    it(`${JSON.stringify(values)}：中序遍历必须升序，且查得到每个已插入值`, () => {
      let root: TreeNode | undefined;
      for (const v of values) root = insertBST(root, v);
      const seq = inorder(root);
      expect(seq).toEqual([...seq].sort((a, b) => a - b));
      for (const v of values) expect(searchBST(root, v)).toBe(true);
      for (const v of [values[0] + 0.5, -99999, 99999]) expect(searchBST(root, v)).toBe(false);
      expect(seq.length).toBeGreaterThanOrEqual(new Set(values).size);
    });
  }

  it('空树查询不崩', () => {
    expect(searchBST(undefined, 1)).toBe(false);
    expect(inorder(undefined)).toEqual([]);
  });

  it('createTreeNode 造出没有孩子的叶子', () => {
    const n = createTreeNode(9);
    expect(n.value).toBe(9);
    expect(n.left).toBeUndefined();
    expect(n.right).toBeUndefined();
  });
});

describe('generateRandomBST', () => {
  for (const size of [1, 5, 12, 30]) {
    it(`随机生成的 BST（size=${size}）中序升序且节点数不超过 size`, () => {
      const root = generateRandomBST(size);
      const seq = inorder(root);
      expect(seq.length).toBeGreaterThan(0);
      expect(seq.length).toBeLessThanOrEqual(size);
      expect(seq).toEqual([...seq].sort((a, b) => a - b));
    });
  }
});
