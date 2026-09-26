/**
 * 线段树 (Segment Tree)
 * 支持区间查询和单点更新，O(log n)
 * 移植自 Java DSA 项目 tree/segmenttree
 */

export class SegmentTree<T> {
  private tree: (T | undefined)[];
  private data: T[];
  private merger: (a: T, b: T) => T;

  constructor(arr: T[], merger: (a: T, b: T) => T) {
    this.data = [...arr];
    this.merger = merger;
    this.tree = new Array(4 * arr.length);
    if (arr.length > 0) {
      this.build(0, 0, arr.length - 1);
    }
  }

  get size(): number {
    return this.data.length;
  }

  /** 区间查询 [queryL, queryR] */
  query(queryL: number, queryR: number): T {
    if (queryL < 0 || queryR >= this.data.length || queryL > queryR) {
      throw new Error('Invalid query range');
    }
    return this.queryRecursive(0, 0, this.data.length - 1, queryL, queryR);
  }

  /** 单点更新 */
  update(index: number, value: T): void {
    if (index < 0 || index >= this.data.length) {
      throw new Error('Index out of bounds');
    }
    this.data[index] = value;
    this.updateRecursive(0, 0, this.data.length - 1, index, value);
  }

  /** 获取原始数据 */
  get(index: number): T {
    return this.data[index];
  }

  // ---- private ----

  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  private rightChild(index: number): number {
    return 2 * index + 2;
  }

  /** 构建线段树 */
  private build(treeIndex: number, l: number, r: number): void {
    if (l === r) {
      this.tree[treeIndex] = this.data[l];
      return;
    }
    const mid = l + Math.floor((r - l) / 2);
    this.build(this.leftChild(treeIndex), l, mid);
    this.build(this.rightChild(treeIndex), mid + 1, r);
    this.tree[treeIndex] = this.merger(
      this.tree[this.leftChild(treeIndex)] as T,
      this.tree[this.rightChild(treeIndex)] as T,
    );
  }

  /** 区间查询递归 */
  private queryRecursive(treeIndex: number, l: number, r: number, queryL: number, queryR: number): T {
    if (l === queryL && r === queryR) {
      return this.tree[treeIndex] as T;
    }
    const mid = l + Math.floor((r - l) / 2);
    const leftResult = this.leftChild(treeIndex);
    const rightResult = this.rightChild(treeIndex);

    if (queryL >= mid + 1) {
      return this.queryRecursive(rightResult, mid + 1, r, queryL, queryR);
    } else if (queryR <= mid) {
      return this.queryRecursive(leftResult, l, mid, queryL, queryR);
    } else {
      const left = this.queryRecursive(leftResult, l, mid, queryL, mid);
      const right = this.queryRecursive(rightResult, mid + 1, r, mid + 1, queryR);
      return this.merger(left, right);
    }
  }

  /** 单点更新递归 */
  private updateRecursive(treeIndex: number, l: number, r: number, index: number, value: T): void {
    if (l === r) {
      this.tree[treeIndex] = value;
      return;
    }
    const mid = l + Math.floor((r - l) / 2);
    if (index <= mid) {
      this.updateRecursive(this.leftChild(treeIndex), l, mid, index, value);
    } else {
      this.updateRecursive(this.rightChild(treeIndex), mid + 1, r, index, value);
    }
    this.tree[treeIndex] = this.merger(
      this.tree[this.leftChild(treeIndex)] as T,
      this.tree[this.rightChild(treeIndex)] as T,
    );
  }
}

/**
 * 经典应用：区间求和 (LeetCode 307)
 */
export class NumArray {
  private segTree: SegmentTree<number>;

  constructor(nums: number[]) {
    this.segTree = new SegmentTree(nums, (a, b) => a + b);
  }

  update(index: number, val: number): void {
    this.segTree.update(index, val);
  }

  sumRange(left: number, right: number): number {
    return this.segTree.query(left, right);
  }
}
