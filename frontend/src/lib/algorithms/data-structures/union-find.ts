/**
 * 并查集 (Union Find)
 * 包含多种优化：Quick Find → Quick Union → 基于 size/rank 优化 → 路径压缩
 * 移植自 Java DSA 项目 unionfind/
 */

export interface UF {
  size: number;
  union(p: number, q: number): void;
  isConnected(p: number, q: number): boolean;
}

/**
 * UnionFind1：Quick Find
 * find O(1)，union O(n)
 */
export class UnionFind1 implements UF {
  private id: number[];

  constructor(n: number) {
    this.id = Array.from({ length: n }, (_, i) => i);
  }

  get size(): number {
    return this.id.length;
  }

  /** 查找元素所属集合（直接看 id） */
  find(p: number): number {
    this.validate(p);
    return this.id[p];
  }

  isConnected(p: number, q: number): boolean {
    return this.find(p) === this.find(q);
  }

  /** 合并：将所有 p 集合的元素改为 q 的集合 */
  union(p: number, q: number): void {
    const pID = this.find(p);
    const qID = this.find(q);
    if (pID === qID) return;
    for (let i = 0; i < this.id.length; i++) {
      if (this.id[i] === pID) this.id[i] = qID;
    }
  }

  private validate(p: number): void {
    if (p < 0 || p >= this.id.length) throw new Error(`Index ${p} out of bounds`);
  }
}

/**
 * UnionFind2：Quick Union（树形结构）
 * find O(h)，union O(h)，h 为树高
 */
export class UnionFind2 implements UF {
  private parent: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }

  get size(): number {
    return this.parent.length;
  }

  /** 查找根节点 */
  find(p: number): number {
    this.validate(p);
    while (this.parent[p] !== p) {
      p = this.parent[p];
    }
    return p;
  }

  isConnected(p: number, q: number): boolean {
    return this.find(p) === this.find(q);
  }

  /** 合并：将 p 的根指向 q 的根 */
  union(p: number, q: number): void {
    const pRoot = this.find(p);
    const qRoot = this.find(q);
    if (pRoot === qRoot) return;
    this.parent[pRoot] = qRoot;
  }

  private validate(p: number): void {
    if (p < 0 || p >= this.parent.length) throw new Error(`Index ${p} out of bounds`);
  }
}

/**
 * UnionFind3：基于 size 优化
 * 将小树挂到大树下，保持树平衡
 */
export class UnionFind3 implements UF {
  private parent: number[];
  private sz: number[]; // sz[i] 表示以 i 为根的集合大小

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.sz = new Array(n).fill(1);
  }

  get size(): number {
    return this.parent.length;
  }

  find(p: number): number {
    this.validate(p);
    while (this.parent[p] !== p) {
      p = this.parent[p];
    }
    return p;
  }

  isConnected(p: number, q: number): boolean {
    return this.find(p) === this.find(q);
  }

  /** 基于 size 合并：小树挂大树 */
  union(p: number, q: number): void {
    const pRoot = this.find(p);
    const qRoot = this.find(q);
    if (pRoot === qRoot) return;
    if (this.sz[pRoot] < this.sz[qRoot]) {
      this.parent[pRoot] = qRoot;
      this.sz[qRoot] += this.sz[pRoot];
    } else {
      this.parent[qRoot] = pRoot;
      this.sz[pRoot] += this.sz[qRoot];
    }
  }

  private validate(p: number): void {
    if (p < 0 || p >= this.parent.length) throw new Error(`Index ${p} out of bounds`);
  }
}

/**
 * UnionFind4：基于 rank 优化 + 路径压缩（推荐实现）
 * rank 表示树的高度上界，路径压缩在 find 时把节点直接挂到根
 */
export class UnionFind4 implements UF {
  private parent: number[];
  private rank: number[]; // rank[i] 表示以 i 为根的树的高度

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(1);
  }

  get size(): number {
    return this.parent.length;
  }

  /** 查找根节点（带路径压缩） */
  find(p: number): number {
    this.validate(p);
    if (this.parent[p] !== p) {
      // 路径压缩：递归将节点直接挂到根
      this.parent[p] = this.find(this.parent[p]);
    }
    return this.parent[p];
  }

  isConnected(p: number, q: number): boolean {
    return this.find(p) === this.find(q);
  }

  /** 基于 rank 合并 */
  union(p: number, q: number): void {
    const pRoot = this.find(p);
    const qRoot = this.find(q);
    if (pRoot === qRoot) return;
    if (this.rank[pRoot] < this.rank[qRoot]) {
      this.parent[pRoot] = qRoot;
    } else if (this.rank[qRoot] < this.rank[pRoot]) {
      this.parent[qRoot] = pRoot;
    } else {
      this.parent[pRoot] = qRoot;
      this.rank[qRoot]++;
    }
  }

  private validate(p: number): void {
    if (p < 0 || p >= this.parent.length) throw new Error(`Index ${p} out of bounds`);
  }
}
