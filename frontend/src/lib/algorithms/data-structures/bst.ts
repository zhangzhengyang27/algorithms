/**
 * 二叉搜索树 (Binary Search Tree)
 * 支持增删查、前中后序遍历、最大最小值
 * 移植自 Java DSA 项目 tree/bst
 */

class BSTNode<T> {
  value: T;
  left: BSTNode<T> | null;
  right: BSTNode<T> | null;

  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class BST<T> {
  private root: BSTNode<T> | null;
  private _size: number;
  private compareFn: (a: T, b: T) => number;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.root = null;
    this._size = 0;
    this.compareFn = compareFn ?? ((a, b) => (a as unknown as number) - (b as unknown as number));
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  /** 添加元素（非递归） */
  add(value: T): void {
    if (this.root === null) {
      this.root = new BSTNode(value);
      this._size++;
      return;
    }
    let cur = this.root;
    while (true) {
      const cmp = this.compareFn(value, cur.value);
      if (cmp === 0) return; // 不插入重复元素
      if (cmp < 0) {
        if (cur.left === null) {
          cur.left = new BSTNode(value);
          this._size++;
          return;
        }
        cur = cur.left;
      } else {
        if (cur.right === null) {
          cur.right = new BSTNode(value);
          this._size++;
          return;
        }
        cur = cur.right;
      }
    }
  }

  /** 查找是否包含 */
  contains(value: T): boolean {
    let cur = this.root;
    while (cur !== null) {
      const cmp = this.compareFn(value, cur.value);
      if (cmp === 0) return true;
      cur = cmp < 0 ? cur.left : cur.right;
    }
    return false;
  }

  /** 最小值 */
  minimum(): T {
    if (this.isEmpty()) throw new Error('BST is empty');
    let cur = this.root!;
    while (cur.left !== null) cur = cur.left;
    return cur.value;
  }

  /** 最大值 */
  maximum(): T {
    if (this.isEmpty()) throw new Error('BST is empty');
    let cur = this.root!;
    while (cur.right !== null) cur = cur.right;
    return cur.value;
  }

  /** 删除最小值，返回被删除的值 */
  removeMin(): T {
    const ret = this.minimum();
    this.root = this.removeMinNode(this.root);
    return ret;
  }

  /** 删除最大值，返回被删除的值 */
  removeMax(): T {
    const ret = this.maximum();
    this.root = this.removeMaxNode(this.root);
    return ret;
  }

  /** 删除任意值（Hibbard 删除法） */
  remove(value: T): boolean {
    if (!this.contains(value)) return false;
    this.root = this.removeNode(this.root, value);
    return true;
  }

  /** 前序遍历 */
  preOrder(): T[] {
    const result: T[] = [];
    this.preOrderWalk(this.root, result);
    return result;
  }

  /** 中序遍历（有序） */
  inOrder(): T[] {
    const result: T[] = [];
    this.inOrderWalk(this.root, result);
    return result;
  }

  /** 后序遍历 */
  postOrder(): T[] {
    const result: T[] = [];
    this.postOrderWalk(this.root, result);
    return result;
  }

  /** 层序遍历（BFS） */
  levelOrder(): T[] {
    const result: T[] = [];
    if (this.root === null) return result;
    const queue: BSTNode<T>[] = [this.root];
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node.value);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    return result;
  }

  /** 获取树的高度 */
  getHeight(): number {
    return this.height(this.root);
  }

  // ---- private helpers ----

  private preOrderWalk(node: BSTNode<T> | null, result: T[]): void {
    if (node === null) return;
    result.push(node.value);
    this.preOrderWalk(node.left, result);
    this.preOrderWalk(node.right, result);
  }

  private inOrderWalk(node: BSTNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.inOrderWalk(node.left, result);
    result.push(node.value);
    this.inOrderWalk(node.right, result);
  }

  private postOrderWalk(node: BSTNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.postOrderWalk(node.left, result);
    this.postOrderWalk(node.right, result);
    result.push(node.value);
  }

  private height(node: BSTNode<T> | null): number {
    if (node === null) return 0;
    return 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  private removeMinNode(node: BSTNode<T> | null): BSTNode<T> | null {
    if (node === null) return null;
    if (node.left === null) {
      this._size--;
      return node.right;
    }
    node.left = this.removeMinNode(node.left);
    return node;
  }

  private removeMaxNode(node: BSTNode<T> | null): BSTNode<T> | null {
    if (node === null) return null;
    if (node.right === null) {
      this._size--;
      return node.left;
    }
    node.right = this.removeMaxNode(node.right);
    return node;
  }

  private removeNode(node: BSTNode<T> | null, value: T): BSTNode<T> | null {
    if (node === null) return null;
    const cmp = this.compareFn(value, node.value);
    if (cmp < 0) {
      node.left = this.removeNode(node.left, value);
      return node;
    } else if (cmp > 0) {
      node.right = this.removeNode(node.right, value);
      return node;
    } else {
      // 找到待删除节点
      if (node.left === null) {
        this._size--;
        return node.right;
      }
      if (node.right === null) {
        this._size--;
        return node.left;
      }
      // 两个子节点：用右子树最小值替换
      const successor = this.findMinNode(node.right);
      successor.right = this.removeMinNode(node.right);
      successor.left = node.left;
      return successor;
    }
  }

  private findMinNode(node: BSTNode<T>): BSTNode<T> {
    let cur = node;
    while (cur.left !== null) cur = cur.left;
    return cur;
  }
}
