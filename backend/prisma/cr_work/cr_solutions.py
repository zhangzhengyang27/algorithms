# -*- coding: utf-8 -*-
"""三语题解代码（Python / TypeScript / Java）。
Python 版与 cr_ref 参考解逻辑一致，确保能复现 expected；TS/Java 为等价移植。
每类题型的 SOLUTIONS[type] = {python, typescript, java}，均为可直接运行的完整脚本。"""

SOL_PY = {}
SOL_TS = {}
SOL_JAVA = {}

# ============================ 1. 堆（小根堆排序） ============================
SOL_PY['heap'] = '''# 小根堆排序：读入 n 个数，建小根堆后依次弹出，得到升序序列。
import sys, heapq

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    a = list(map(int, data[1:1 + n]))
    heapq.heapify(a)            # 原地建小根堆 O(n)
    out = [str(heapq.heappop(a)) for _ in range(n)]  # 每次取最小 O(log n)
    print(' '.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['heap'] = '''// 小根堆排序：建小根堆后依次弹出，得到升序序列。
import * as readline from 'readline';

function solve(input: string): string {
  const data = input.trim().split(/\s+/).map(Number);
  if (data.length === 0) return '';
  const n = data[0];
  const a: number[] = data.slice(1, 1 + n);
  // 简易二叉堆
  const heap: number[] = [];
  const swap = (i: number, j: number) => { [heap[i], heap[j]] = [heap[j], heap[i]]; };
  const shiftUp = (i: number) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
      swap(i, p); i = p;
    }
  };
  const shiftDown = (i: number, size: number) => {
    while (i * 2 + 1 < size) {
      let j = i * 2 + 1;
      if (j + 1 < size && heap[j + 1] < heap[j]) j++;
      if (heap[j] >= heap[i]) break;
      swap(i, j); i = j;
    }
  };
  for (const x of a) { heap.push(x); shiftUp(heap.length - 1); }
  const out: string[] = [];
  for (let k = 0; k < n; k++) {
    out.push(String(heap[0]));
    heap[0] = heap[heap.length - 1]; heap.pop();
    shiftDown(0, heap.length);
  }
  return out.join(' ');
}

// 本地运行入口（Node）：node heap.ts < input.txt
if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['heap'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : a) pq.offer(x);
        StringBuilder sb = new StringBuilder();
        while (!pq.isEmpty()) sb.append(pq.poll()).append(' ');
        System.out.println(sb.toString().trim());
    }
}
'''

# ============================ 2. 近似平衡 BST（中序 = 升序） ============================
SOL_PY['almost-bst'] = '''# 将序列依次插入二叉搜索树，输出中序遍历（即升序序列）。
# 注：使用 Splay / Treap 等平衡结构只改变树形，不改变中序结果。
import sys

class Node:
    __slots__ = ('val', 'left', 'right')
    def __init__(self, v):
        self.val = v; self.left = None; self.right = None

def insert(root, v):
    if root is None:
        return Node(v)
    cur = root
    while True:
        if v < cur.val:
            if cur.left is None:
                cur.left = Node(v); break
            cur = cur.left
        else:
            if cur.right is None:
                cur.right = Node(v); break
            cur = cur.right
    return root

def inorder(node, out):
    if node is None: return
    inorder(node.left, out)
    out.append(str(node.val))
    inorder(node.right, out)

def main():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    a = list(map(int, data[1:1 + n]))
    root = None
    for x in a: root = insert(root, x)
    out = []
    inorder(root, out)
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['almost-bst'] = '''// 将序列依次插入二叉搜索树，输出中序遍历（升序序列）。
class Node { val: number; left: Node | null; right: Node | null;
  constructor(v: number) { this.val = v; this.left = null; this.right = null; } }

function solve(input: string): string {
  const data = input.trim().split(/\s+/).map(Number);
  if (data.length === 0) return '';
  const n = data[0];
  const a = data.slice(1, 1 + n);
  let root: Node | null = null;
  const insert = (v: number) => {
    const node = new Node(v);
    if (!root) { root = node; return; }
    let cur = root;
    while (true) {
      if (v < cur.val) { if (!cur.left) { cur.left = node; break; } cur = cur.left; }
      else { if (!cur.right) { cur.right = node; break; } cur = cur.right; }
    }
  };
  for (const x of a) insert(x);
  const out: string[] = [];
  const io = (nd: Node | null) => {
    if (!nd) return; io(nd.left); out.push(String(nd.val)); io(nd.right);
  };
  io(root);
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['almost-bst'] = '''import java.util.*;

public class Main {
    static class Node { int val; Node left, right;
        Node(int v) { val = v; } }
    static Node insert(Node root, int v) {
        if (root == null) return new Node(v);
        Node cur = root;
        while (true) {
            if (v < cur.val) { if (cur.left == null) { cur.left = new Node(v); break; } cur = cur.left; }
            else { if (cur.right == null) { cur.right = new Node(v); break; } cur = cur.right; }
        }
        return root;
    }
    static void inorder(Node nd, List<Integer> out) {
        if (nd == null) return;
        inorder(nd.left, out); out.add(nd.val); inorder(nd.right, out);
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Node root = null;
        for (int i = 0; i < n; i++) root = insert(root, sc.nextInt());
        List<Integer> out = new ArrayList<>();
        inorder(root, out);
        StringBuilder sb = new StringBuilder();
        for (int v : out) sb.append(v).append('\\n');
        System.out.print(sb.toString());
    }
}
'''

# ============================ 3. 伪平衡 BST（区间计数） ============================
SOL_PY['pseudobst'] = '''# 伪平衡二叉搜索树：用数组模拟，支持插入/删除/区间计数。
# 区间 [x, y] 内的元素个数 = 该区间内各点出现次数之和。
import sys

def main():
    data = sys.stdin.read().split()
    if not data: return
    rng = int(data[0]); m = int(data[1]); i = 2
    numberCount = [0] * (rng + 1)
    rangeCount = [0] * (rng + 1)
    out = []
    def search(x, y):
        def ps(l, r, x, y):
            if l > r: return 0
            mid = (l + r) // 2
            if l == x and r == y: return rangeCount[mid]
            lc = rc = 0
            if x < mid: lc = ps(l, mid - 1, x, min(mid - 1, y))
            if y > mid: rc = ps(mid + 1, r, max(mid + 1, x), y)
            return lc + rc + ((mid >= x and mid <= y) * numberCount[mid])
        return ps(0, rng - 1, x, y)
    for _ in range(m):
        ct = int(data[i]); i += 1
        if ct == 1:
            x = int(data[i]); i += 1; numberCount[x] += 1; rangeCount[x] += 1
        elif ct == 2:
            x = int(data[i]); i += 1; numberCount[x] -= 1; rangeCount[x] -= 1
        elif ct == 3:
            x = int(data[i]); y = int(data[i + 1]); i += 2
            out.append(str(search(x, y)))
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['pseudobst'] = '''// 伪平衡二叉搜索树：数组模拟，支持插入/删除/区间计数。
function solve(input: string): string {
  const data = input.trim().split(/\s+/).map(Number);
  if (data.length === 0) return '';
  const rng = data[0]; const m = data[1]; let i = 2;
  const numberCount: number[] = new Array(rng + 1).fill(0);
  const rangeCount: number[] = new Array(rng + 1).fill(0);
  const out: string[] = [];
  const ps = (l: number, r: number, x: number, y: number): number => {
    if (l > r) return 0;
    const mid = (l + r) >> 1;
    if (l === x && r === y) return rangeCount[mid];
    let lc = 0, rc = 0;
    if (x < mid) lc = ps(l, mid - 1, x, Math.min(mid - 1, y));
    if (y > mid) rc = ps(mid + 1, r, Math.max(mid + 1, x), y);
    return lc + rc + ((mid >= x && mid <= y) ? numberCount[mid] : 0);
  };
  for (let k = 0; k < m; k++) {
    const ct = data[i++];
    if (ct === 1) { const x = data[i++]; numberCount[x]++; rangeCount[x]++; }
    else if (ct === 2) { const x = data[i++]; numberCount[x]--; rangeCount[x]--; }
    else { const x = data[i++], y = data[i++]; out.push(String(ps(0, rng - 1, x, y))); }
  }
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['pseudobst'] = '''import java.util.*;

public class Main {
    static int rng;
    static int[] numberCount, rangeCount;
    static int ps(int l, int r, int x, int y) {
        if (l > r) return 0;
        int mid = (l + r) / 2;
        if (l == x && r == y) return rangeCount[mid];
        int lc = 0, rc = 0;
        if (x < mid) lc = ps(l, mid - 1, x, Math.min(mid - 1, y));
        if (y > mid) rc = ps(mid + 1, r, Math.max(mid + 1, x), y);
        return lc + rc + ((mid >= x && mid <= y) ? numberCount[mid] : 0);
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        rng = sc.nextInt(); int m = sc.nextInt();
        numberCount = new int[rng + 1]; rangeCount = new int[rng + 1];
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < m; k++) {
            int ct = sc.nextInt();
            if (ct == 1) { int x = sc.nextInt(); numberCount[x]++; rangeCount[x]++; }
            else if (ct == 2) { int x = sc.nextInt(); numberCount[x]--; rangeCount[x]--; }
            else { int x = sc.nextInt(), y = sc.nextInt(); sb.append(ps(0, rng - 1, x, y)).append('\\n'); }
        }
        System.out.print(sb.toString());
    }
}
'''

# ============================ 4. 线段树（覆盖计数） ============================
SOL_PY['segtree'] = '''# 线段树（区间覆盖模型）：支持插入区间、查询最小覆盖次数、删除、求覆盖总长度。
import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0]); m = int(data[1]); i = 2

    def build(l, r):
        node = {'l': l, 'r': r, 'covered': 0, 'count': 0, 'left': None, 'right': None}
        if r - l > 1:
            mid = (l + r) // 2
            node['left'] = build(l, mid); node['right'] = build(mid, r)
        return node
    def recalc(node):
        if node['left'] is None or node['right'] is None:
            node['count'] = node['covered'] * (node['r'] - node['l']); return
        node['count'] = node['left']['count'] + node['right']['count'] if node['covered'] == 0 else node['r'] - node['l']
    def backfill(node):
        if node['left'] is None or node['right'] is None: return
        delta = min(node['left']['covered'], node['right']['covered'])
        if delta:
            node['covered'] += delta
            node['left']['covered'] -= delta; node['right']['covered'] -= delta
            recalc(node['left']); recalc(node['right'])
        recalc(node)
    def insert(node, l, r):
        if l >= r: return
        L, R = node['l'], node['r']
        if L == l and R == r:
            node['covered'] += 1; node['count'] = r - l; return
        mid = (L + R) // 2
        if l < mid: insert(node['left'], l, min(mid, r))
        if r > mid: insert(node['right'], max(mid, l), r)
        backfill(node)
    def search(node, l, r):
        if l >= r: return 0
        L, R = node['l'], node['r']
        if L == l and R == r: return node['covered']
        mid = (L + R) // 2; res = 10**9
        if l < mid: res = min(res, search(node['left'], l, min(mid, r)))
        if r > mid: res = min(res, search(node['right'], max(mid, l), r))
        return res + node['covered']
    def delegate(node):
        node['left']['covered'] += node['covered']; node['right']['covered'] += node['covered']
        if node['covered'] > 0:
            node['left']['count'] = node['left']['r'] - node['left']['l']
            node['right']['count'] = node['right']['r'] - node['right']['l']
        node['covered'] = 0
    def delete(node, l, r):
        if l >= r: return
        L, R = node['l'], node['r']
        if L == l and R == r:
            node['covered'] -= 1
            if node['covered'] == 0:
                node['count'] = node['left']['count'] + node['right']['count'] if (node['left'] and node['right']) else 0
            return
        delegate(node)
        mid = (L + R) // 2
        if l < mid: delete(node['left'], l, min(mid, r))
        if r > mid: delete(node['right'], max(mid, l), r)
        backfill(node)
    def calc(node, l, r):
        if l >= r: return 0
        L, R = node['l'], node['r']
        if L <= l and R >= r and node['covered'] > 0: return r - l
        if L == l and R == r: return node['count']
        mid = (L + R) // 2; res = 0
        if l < mid: res += calc(node['left'], l, min(mid, r))
        if r > mid: res += calc(node['right'], max(mid, l), r)
        return res

    root = build(0, n); out = []
    for _ in range(m):
        op = int(data[i]); x = int(data[i + 1]); y = int(data[i + 2]); i += 3
        if op == 1: insert(root, x, y)
        elif op == 2: out.append(str(search(root, x, y)))
        elif op == 3:
            if search(root, x, y) > 0: delete(root, x, y)
        elif op == 4: out.append(str(calc(root, x, y)))
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['segtree'] = '''// 线段树（区间覆盖模型）：插入区间 / 查询最小覆盖次数 / 删除 / 求覆盖总长度。
type Node = { l: number; r: number; covered: number; count: number; left: Node | null; right: Node | null };

function solve(input: string): string {
  const data = input.trim().split(/\s+/).map(Number);
  const n = data[0]; const m = data[1]; let i = 2;
  const build = (l: number, r: number): Node => {
    const node: Node = { l, r, covered: 0, count: 0, left: null, right: null };
    if (r - l > 1) { const mid = (l + r) >> 1; node.left = build(l, mid); node.right = build(mid, r); }
    return node;
  };
  const recalc = (nd: Node) => {
    if (!nd.left || !nd.right) { nd.count = nd.covered * (nd.r - nd.l); return; }
    nd.count = nd.covered === 0 ? nd.left.count + nd.right.count : nd.r - nd.l;
  };
  const backfill = (nd: Node) => {
    if (!nd.left || !nd.right) return;
    const delta = Math.min(nd.left.covered, nd.right.covered);
    if (delta) {
      nd.covered += delta; nd.left.covered -= delta; nd.right.covered -= delta;
      recalc(nd.left); recalc(nd.right);
    }
    recalc(nd);
  };
  const insert = (nd: Node, l: number, r: number) => {
    if (l >= r) return;
    if (nd.l === l && nd.r === r) { nd.covered++; nd.count = r - l; return; }
    const mid = (nd.l + nd.r) >> 1;
    if (l < mid) insert(nd.left!, l, Math.min(mid, r));
    if (r > mid) insert(nd.right!, Math.max(mid, l), r);
    backfill(nd);
  };
  const search = (nd: Node, l: number, r: number): number => {
    if (l >= r) return 0;
    if (nd.l === l && nd.r === r) return nd.covered;
    const mid = (nd.l + nd.r) >> 1; let res = 1e9;
    if (l < mid) res = Math.min(res, search(nd.left!, l, Math.min(mid, r)));
    if (r > mid) res = Math.min(res, search(nd.right!, Math.max(mid, l), r));
    return res + nd.covered;
  };
  const delegate = (nd: Node) => {
    nd.left!.covered += nd.covered; nd.right!.covered += nd.covered;
    if (nd.covered > 0) { nd.left!.count = nd.left!.r - nd.left!.l; nd.right!.count = nd.right!.r - nd.right!.l; }
    nd.covered = 0;
  };
  const del = (nd: Node, l: number, r: number) => {
    if (l >= r) return;
    if (nd.l === l && nd.r === r) {
      nd.covered--;
      if (nd.covered === 0) nd.count = (nd.left && nd.right) ? nd.left.count + nd.right.count : 0;
      return;
    }
    delegate(nd);
    const mid = (nd.l + nd.r) >> 1;
    if (l < mid) del(nd.left!, l, Math.min(mid, r));
    if (r > mid) del(nd.right!, Math.max(mid, l), r);
    backfill(nd);
  };
  const calc = (nd: Node, l: number, r: number): number => {
    if (l >= r) return 0;
    if (nd.l <= l && nd.r >= r && nd.covered > 0) return r - l;
    if (nd.l === l && nd.r === r) return nd.count;
    const mid = (nd.l + nd.r) >> 1; let res = 0;
    if (l < mid) res += calc(nd.left!, l, Math.min(mid, r));
    if (r > mid) res += calc(nd.right!, Math.max(mid, l), r);
    return res;
  };
  const root = build(0, n); const out: string[] = [];
  for (let k = 0; k < m; k++) {
    const op = data[i], x = data[i + 1], y = data[i + 2]; i += 3;
    if (op === 1) insert(root, x, y);
    else if (op === 2) out.push(String(search(root, x, y)));
    else if (op === 3) { if (search(root, x, y) > 0) del(root, x, y); }
    else out.push(String(calc(root, x, y)));
  }
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['segtree'] = '''import java.util.*;

public class Main {
    static class Node { int l, r, covered, count; Node left, right;
        Node(int l, int r) { this.l = l; this.r = r; } }
    static Node build(int l, int r) {
        Node nd = new Node(l, r);
        if (r - l > 1) { int mid = (l + r) / 2; nd.left = build(l, mid); nd.right = build(mid, r); }
        return nd;
    }
    static void recalc(Node nd) {
        if (nd.left == null || nd.right == null) { nd.count = nd.covered * (nd.r - nd.l); return; }
        nd.count = nd.covered == 0 ? nd.left.count + nd.right.count : nd.r - nd.l;
    }
    static void backfill(Node nd) {
        if (nd.left == null || nd.right == null) return;
        int delta = Math.min(nd.left.covered, nd.right.covered);
        if (delta) {
            nd.covered += delta; nd.left.covered -= delta; nd.right.covered -= delta;
            recalc(nd.left); recalc(nd.right);
        }
        recalc(nd);
    }
    static void insert(Node nd, int l, int r) {
        if (l >= r) return;
        if (nd.l == l && nd.r == r) { nd.covered++; nd.count = r - l; return; }
        int mid = (nd.l + nd.r) / 2;
        if (l < mid) insert(nd.left, l, Math.min(mid, r));
        if (r > mid) insert(nd.right, Math.max(mid, l), r);
        backfill(nd);
    }
    static int search(Node nd, int l, int r) {
        if (l >= r) return 0;
        if (nd.l == l && nd.r == r) return nd.covered;
        int mid = (nd.l + nd.r) / 2, res = Integer.MAX_VALUE;
        if (l < mid) res = Math.min(res, search(nd.left, l, Math.min(mid, r)));
        if (r > mid) res = Math.min(res, search(nd.right, Math.max(mid, l), r));
        return res + nd.covered;
    }
    static void delegate(Node nd) {
        nd.left.covered += nd.covered; nd.right.covered += nd.covered;
        if (nd.covered > 0) { nd.left.count = nd.left.r - nd.left.l; nd.right.count = nd.right.r - nd.right.l; }
        nd.covered = 0;
    }
    static void del(Node nd, int l, int r) {
        if (l >= r) return;
        if (nd.l == l && nd.r == r) {
            nd.covered--;
            if (nd.covered == 0) nd.count = (nd.left != null && nd.right != null) ? nd.left.count + nd.right.count : 0;
            return;
        }
        delegate(nd);
        int mid = (nd.l + nd.r) / 2;
        if (l < mid) del(nd.left, l, Math.min(mid, r));
        if (r > mid) del(nd.right, Math.max(mid, l), r);
        backfill(nd);
    }
    static int calc(Node nd, int l, int r) {
        if (l >= r) return 0;
        if (nd.l <= l && nd.r >= r && nd.covered > 0) return r - l;
        if (nd.l == l && nd.r == r) return nd.count;
        int mid = (nd.l + nd.r) / 2, res = 0;
        if (l < mid) res += calc(nd.left, l, Math.min(mid, r));
        if (r > mid) res += calc(nd.right, Math.max(mid, l), r);
        return res;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        Node root = build(0, n); StringBuilder sb = new StringBuilder();
        for (int k = 0; k < m; k++) {
            int op = sc.nextInt(), x = sc.nextInt(), y = sc.nextInt();
            if (op == 1) insert(root, x, y);
            else if (op == 2) sb.append(search(root, x, y)).append('\\n');
            else if (op == 3) { if (search(root, x, y) > 0) del(root, x, y); }
            else sb.append(calc(root, x, y)).append('\\n');
        }
        System.out.print(sb.toString());
    }
}
'''

# ============================ 5. 字典树（Trie） ============================
SOL_PY['trie'] = '''# 字典树：支持插入单词、查询单词是否存在、删除单词。
import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0]); i = 1; root = {}; out = []
    for _ in range(n):
        op = int(data[i]); w = data[i + 1]; i += 2
        if op == 1:
            node = root
            for ch in w: node = node.setdefault(ch, {})
            node['#'] = True
        elif op == 2:
            node = root
            for ch in w:
                if ch not in node: node = None; break
                node = node[ch]
            out.append('Yes' if (node and node.get('#')) else 'No')
        elif op == 3:
            node = root; ok = True
            for ch in w:
                if ch not in node: ok = False; break
                node = node[ch]
            if ok and node.get('#'): node['#'] = False
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['trie'] = '''// 字典树：插入单词 / 查询单词是否存在 / 删除单词。
function solve(input: string): string {
  const data = input.trim().split(/\s+/);
  const n = parseInt(data[0]); let i = 1;
  const root: any = {}; const out: string[] = [];
  for (let k = 0; k < n; k++) {
    const op = parseInt(data[i]); const w = data[i + 1]; i += 2;
    if (op === 1) {
      let node = root;
      for (const ch of w) node = node[ch] = node[ch] || {};
      node['#'] = true;
    } else if (op === 2) {
      let node = root, ok = true;
      for (const ch of w) { if (!(ch in node)) { ok = false; break; } node = node[ch]; }
      out.push(ok && node['#'] ? 'Yes' : 'No');
    } else {
      let node = root, ok = true;
      for (const ch of w) { if (!(ch in node)) { ok = false; break; } node = node[ch]; }
      if (ok && node['#']) node['#'] = false;
    }
  }
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['trie'] = '''import java.util.*;

public class Main {
    static Map<String, Object> root = new HashMap<>();
    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < n; k++) {
            int op = sc.nextInt(); String w = sc.next();
            if (op == 1) {
                Map<String, Object> node = root;
                for (char c : w.toString().toCharArray()) {
                    String key = String.valueOf(c);
                    node = (Map<String, Object>) node.computeIfAbsent(key, x -> new HashMap<String, Object>());
                }
                node.put("#", true);
            } else if (op == 2) {
                Map<String, Object> node = root; boolean ok = true;
                for (char c : w.toCharArray()) {
                    String key = String.valueOf(c);
                    if (!node.containsKey(key)) { ok = false; break; }
                    node = (Map<String, Object>) node.get(key);
                }
                sb.append(ok && node.containsKey("#") ? "Yes" : "No").append('\\n');
            } else {
                Map<String, Object> node = root; boolean ok = true;
                for (char c : w.toCharArray()) {
                    String key = String.valueOf(c);
                    if (!node.containsKey(key)) { ok = false; break; }
                    node = (Map<String, Object>) node.get(key);
                }
                if (ok && node.containsKey("#")) node.put("#", false);
            }
        }
        System.out.print(sb.toString());
    }
}
'''

# ============================ 6. 字典树练习（含前缀计数 op4） ============================
SOL_PY['triepractice'] = '''# 字典树练习：在 Trie 基础上支持「统计某前缀下的单词数」(op=4)。
import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0]); i = 1; root = {}; out = []
    C, W = '\\x00', '\\x01'   # 保留键：子树单词数 / 是否成词
    def add(w, d):
        node = root
        for ch in w:
            node = node.setdefault(ch, {C: 0})
            node[C] += d
        node[W] = (d > 0)
    def count_prefix(w):
        node = root
        for ch in w:
            if ch not in node: return 0
            node = node[ch]
        return node.get(C, 0)
    for _ in range(n):
        op = int(data[i]); w = data[i + 1]; i += 2
        if op == 1: add(w, 1)
        elif op == 2:
            node = root; ok = True
            for ch in w:
                if ch not in node: ok = False; break
                node = node[ch]
            out.append('Yes' if (ok and node.get(W)) else 'No')
        elif op == 3:
            node = root; ok = True
            for ch in w:
                if ch not in node: ok = False; break
                node = node[ch]
            if ok and node.get(W): add(w, -1)
        elif op == 4: out.append(str(count_prefix(w)))
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['triepractice'] = '''// 字典树练习：插入 / 查询成词 / 删除 / 统计某前缀下的单词数(op=4)。
function solve(input: string): string {
  const data = input.trim().split(/\s+/);
  const n = parseInt(data[0]); let i = 1;
  const root: any = {}; const out: string[] = [];
  const C = '\\x00', W = '\\x01';
  const add = (w: string, d: number) => {
    let node = root;
    for (const ch of w) { node = node[ch] = node[ch] || { [C]: 0 }; node[C] += d; }
    node[W] = d > 0;
  };
  const countPrefix = (w: string): number => {
    let node = root;
    for (const ch of w) { if (!(ch in node)) return 0; node = node[ch]; }
    return node[C] || 0;
  };
  for (let k = 0; k < n; k++) {
    const op = parseInt(data[i]); const w = data[i + 1]; i += 2;
    if (op === 1) add(w, 1);
    else if (op === 2) {
      let node = root, ok = true;
      for (const ch of w) { if (!(ch in node)) { ok = false; break; } node = node[ch]; }
      out.push(ok && node[W] ? 'Yes' : 'No');
    } else if (op === 3) {
      let node = root, ok = true;
      for (const ch of w) { if (!(ch in node)) { ok = false; break; } node = node[ch]; }
      if (ok && node[W]) add(w, -1);
    } else out.push(String(countPrefix(w)));
  }
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['triepractice'] = '''import java.util.*;

public class Main {
    static Map<String, Object> root = new HashMap<>();
    static final String C = "\\u0000", W = "\\u0001";
    @SuppressWarnings("unchecked")
    static void add(String w, int d) {
        Map<String, Object> node = root;
        for (char c : w.toCharArray()) {
            String key = String.valueOf(c);
            if (!node.containsKey(key)) { Map<String, Object> nn = new HashMap<>(); nn.put(C, 0); node.put(key, nn); }
            node = (Map<String, Object>) node.get(key);
            node.put(C, (Integer) node.get(C) + d);
        }
        node.put(W, d > 0);
    }
    @SuppressWarnings("unchecked")
    static int countPrefix(String w) {
        Map<String, Object> node = root;
        for (char c : w.toCharArray()) {
            String key = String.valueOf(c);
            if (!node.containsKey(key)) return 0;
            node = (Map<String, Object>) node.get(key);
        }
        return node.containsKey(C) ? (Integer) node.get(C) : 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(); StringBuilder sb = new StringBuilder();
        for (int k = 0; k < n; k++) {
            int op = sc.nextInt(); String w = sc.next();
            if (op == 1) add(w, 1);
            else if (op == 2) {
                Map<String, Object> node = root; boolean ok = true;
                for (char c : w.toCharArray()) {
                    String key = String.valueOf(c);
                    if (!node.containsKey(key)) { ok = false; break; }
                    node = (Map<String, Object>) node.get(key);
                }
                sb.append(ok && node.containsKey(W) ? "Yes" : "No").append('\\n');
            } else if (op == 3) {
                Map<String, Object> node = root; boolean ok = true;
                for (char c : w.toCharArray()) {
                    String key = String.valueOf(c);
                    if (!node.containsKey(key)) { ok = false; break; }
                    node = (Map<String, Object>) node.get(key);
                }
                if (ok && node.containsKey(W)) add(w, -1);
            } else sb.append(countPrefix(w)).append('\\n');
        }
        System.out.print(sb.toString());
    }
}
'''

# ============================ 7. 块状链表 ============================
SOL_PY['blocklist'] = '''# 块状链表：用 sqrt 大小的块管理序列，支持按位置取元素、插入、删除。
import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0]); sqrtn = int(n ** 0.5)
    arr = list(map(int, data[1:1 + n])); i = 1 + n
    blocks = [arr[k:k + sqrtn] for k in range(0, n, sqrtn)]
    splitCounter = 0
    def get(pos):
        p = pos
        for b in blocks:
            if p <= len(b): return b[p - 1]
            p -= len(b)
        return -1
    def split_at(pos):
        p = pos; bi = 0
        for idx, b in enumerate(blocks):
            if p <= len(b): return idx
            p -= len(b); bi = idx
        return len(blocks) - 1
    out = []
    m = int(data[i]); i += 1
    for _ in range(m):
        op = int(data[i]); i += 1
        if op == 1:
            p = int(data[i]); i += 1; out.append(str(get(p)))
        elif op == 2:
            p = int(data[i]); k = int(data[i + 1]); i += 2
            vals = list(map(int, data[i:i + k])); i += k
            bi = split_at(p)
            b = blocks[bi]
            if p > len(b): blocks[bi] = b + vals
            else: blocks[bi] = b[:p - 1] + vals + b[p - 1:]
            splitCounter += 1
        elif op == 3:
            p = int(data[i]); q = int(data[i + 1]); i += 2
            bi = split_at(p - 1); bj = split_at(q)
            del blocks[bi + 1:bj + 1]
            splitCounter += 1
        if splitCounter >= sqrtn:
            nb = [blocks[0]] if blocks else [[]]
            for b in blocks[1:]:
                if nb and len(nb[-1]) + len(b) <= sqrtn: nb[-1] = nb[-1] + b
                else: nb.append(b)
            blocks[:] = nb; splitCounter = 0
    if not blocks: blocks.append([])
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['blocklist'] = '''// 块状链表：sqrt 大小的块管理序列，按位置取元素 / 插入 / 删除。
function solve(input: string): string {
  const data = input.trim().split(/\s+/).map(Number);
  const n = data[0]; const sqrtn = Math.floor(Math.sqrt(n));
  let arr = data.slice(1, 1 + n); let i = 1 + n;
  let blocks: number[][] = [];
  for (let k = 0; k < n; k += sqrtn) blocks.push(arr.slice(k, k + sqrtn));
  let splitCounter = 0;
  const get = (pos: number): number => {
    let p = pos;
    for (const b of blocks) { if (p <= b.length) return b[p - 1]; p -= b.length; }
    return -1;
  };
  const splitAt = (pos: number): number => {
    let p = pos;
    for (let idx = 0; idx < blocks.length; idx++) {
      if (p <= blocks[idx].length) return idx;
      p -= blocks[idx].length;
    }
    return blocks.length - 1;
  };
  const out: string[] = [];
  const m = data[i++];
  for (let k = 0; k < m; k++) {
    const op = data[i++];
    if (op === 1) { const p = data[i++]; out.push(String(get(p))); }
    else if (op === 2) {
      const p = data[i++], cnt = data[i++];
      const vals = data.slice(i, i + cnt); i += cnt;
      const bi = splitAt(p); const b = blocks[bi];
      blocks[bi] = p > b.length ? [...b, ...vals] : [...b.slice(0, p - 1), ...vals, ...b.slice(p - 1)];
      splitCounter++;
    } else {
      const p = data[i++], q = data[i++];
      const bi = splitAt(p - 1), bj = splitAt(q);
      blocks.splice(bi + 1, bj - bi);
      splitCounter++;
    }
    if (splitCounter >= sqrtn) {
      const nb: number[][] = blocks.length ? [blocks[0]] : [[]];
      for (let b = 1; b < blocks.length; b++) {
        if (nb[nb.length - 1].length + blocks[b].length <= sqrtn) nb[nb.length - 1] = [...nb[nb.length - 1], ...blocks[b]];
        else nb.push(blocks[b]);
      }
      blocks = nb; splitCounter = 0;
    }
  }
  if (blocks.length === 0) blocks.push([]);
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['blocklist'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(); int sqrtn = (int) Math.sqrt(n);
        List<List<Integer>> blocks = new ArrayList<>();
        for (int k = 0; k < n; k += sqrtn) {
            List<Integer> b = new ArrayList<>();
            for (int j = k; j < Math.min(k + sqrtn, n); j++) b.add(sc.nextInt());
            blocks.add(b);
        }
        int splitCounter = 0;
        int get = (int pos) -> {
            int p = pos;
            for (List<Integer> b : blocks) { if (p <= b.size()) return b.get(p - 1); p -= b.size(); }
            return -1;
        };
        StringBuilder sb = new StringBuilder();
        int m = sc.nextInt();
        for (int k = 0; k < m; k++) {
            int op = sc.nextInt();
            if (op == 1) { int p = sc.nextInt(); sb.append(get(p)).append('\\n'); }
            else if (op == 2) {
                int p = sc.nextInt(), cnt = sc.nextInt();
                List<Integer> vals = new ArrayList<>();
                for (int j = 0; j < cnt; j++) vals.add(sc.nextInt());
                int bi = 0, pp = p;
                for (; bi < blocks.size(); bi++) { if (pp <= blocks.get(bi).size()) break; pp -= blocks.get(bi).size(); }
                List<Integer> b = blocks.get(bi);
                List<Integer> nb = new ArrayList<>();
                if (p > b.size()) { nb.addAll(b); nb.addAll(vals); }
                else { nb.addAll(b.subList(0, p - 1)); nb.addAll(vals); nb.addAll(b.subList(p - 1, b.size())); }
                blocks.set(bi, nb); splitCounter++;
            } else {
                int p = sc.nextInt(), q = sc.nextInt();
                int bi = 0, pp = p - 1;
                for (; bi < blocks.size(); bi++) { if (pp <= blocks.get(bi).size()) break; pp -= blocks.get(bi).size(); }
                int bj = 0, qq = q;
                for (; bj < blocks.size(); bj++) { if (qq <= blocks.get(bj).size()) break; qq -= blocks.get(bj).size(); }
                for (int d = 0; d < bj - bi; d++) blocks.remove(bi + 1);
                splitCounter++;
            }
            if (splitCounter >= sqrtn) {
                List<List<Integer>> nb = new ArrayList<>();
                if (!blocks.isEmpty()) nb.add(new ArrayList<>(blocks.get(0)));
                for (int b = 1; b < blocks.size(); b++) {
                    if (!nb.isEmpty() && nb.get(nb.size() - 1).size() + blocks.get(b).size() <= sqrtn)
                        nb.get(nb.size() - 1).addAll(blocks.get(b));
                    else nb.add(new ArrayList<>(blocks.get(b)));
                }
                blocks.clear(); blocks.addAll(nb); splitCounter = 0;
            }
        }
        System.out.print(sb.toString());
    }
}
'''

# ============================ 8. 跳表（成员关系） ============================
SOL_PY['skiplist'] = '''# 跳表：支持插入、查询成员、删除。这里输出每次查询(Yes/No)。
# 提示：跳表的层高随机，但「成员关系」与层高无关，故结果确定。
import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0]); m = int(data[1]); i = 2
    s = set(); out = []
    for _ in range(m):
        op = int(data[i]); x = int(data[i + 1]); i += 2
        if op == 1: s.add(x)
        elif op == 2: out.append('Yes' if x in s else 'No')
        elif op == 3: s.discard(x)
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['skiplist'] = '''// 跳表：插入 / 查询成员 / 删除。输出每次查询的 Yes/No。
function solve(input: string): string {
  const data = input.trim().split(/\s+/).map(Number);
  const n = data[0], m = data[1]; let i = 2;
  const s = new Set<number>(); const out: string[] = [];
  for (let k = 0; k < m; k++) {
    const op = data[i], x = data[i + 1]; i += 2;
    if (op === 1) s.add(x);
    else if (op === 2) out.push(s.has(x) ? 'Yes' : 'No');
    else s.delete(x);
  }
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['skiplist'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        Set<Integer> s = new HashSet<>();
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < m; k++) {
            int op = sc.nextInt(), x = sc.nextInt();
            if (op == 1) s.add(x);
            else if (op == 2) sb.append(s.contains(x) ? "Yes" : "No").append('\\n');
            else s.remove(x);
        }
        System.out.print(sb.toString());
    }
}
'''

# ============================ 9. 并查集 ============================
SOL_PY['ufs'] = '''# 并查集：支持合并集合、查询两元素是否连通。
import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0]); rep = list(range(n)); i = 1
    def find(a):
        while rep[a] != a:
            rep[a] = rep[rep[a]]; a = rep[a]
        return a
    out = []
    m = int(data[i]); i += 1
    for _ in range(m):
        op = int(data[i]); a = int(data[i + 1]); b = int(data[i + 2]); i += 3
        if op == 1: rep[find(a)] = find(b)
        elif op == 2: out.append('Yes' if find(a) == find(b) else 'No')
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['ufs'] = '''// 并查集：合并集合 / 查询两元素是否连通。
function solve(input: string): string {
  const data = input.trim().split(/\s+/).map(Number);
  const n = data[0]; const rep: number[] = Array.from({ length: n }, (_, k) => k);
  const find = (a: number): number => {
    while (rep[a] !== a) { rep[a] = rep[rep[a]]; a = rep[a]; }
    return a;
  };
  const m = data[1]; let i = 2; const out: string[] = [];
  for (let k = 0; k < m; k++) {
    const op = data[i], a = data[i + 1], b = data[i + 2]; i += 3;
    if (op === 1) rep[find(a)] = find(b);
    else out.push(find(a) === find(b) ? 'Yes' : 'No');
  }
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['ufs'] = '''import java.util.*;

public class Main {
    static int[] rep;
    static int find(int a) { while (rep[a] != a) { rep[a] = rep[rep[a]]; a = rep[a]; } return a; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(); rep = new int[n];
        for (int k = 0; k < n; k++) rep[k] = k;
        int m = sc.nextInt(); StringBuilder sb = new StringBuilder();
        for (int k = 0; k < m; k++) {
            int op = sc.nextInt(), a = sc.nextInt(), b = sc.nextInt();
            if (op == 1) rep[find(a)] = find(b);
            else sb.append(find(a) == find(b) ? "Yes" : "No").append('\\n');
        }
        System.out.print(sb.toString());
    }
}
'''

# ============================ 10. 平衡 BST（红黑树，Ch10） ============================
SOL_PY['balanced-bst'] = '''# 平衡二叉搜索树（红黑树）：将序列依次插入红黑树，
# 输出中序遍历的「值 颜色 深度」，最后一行输出树高（最大深度+1）。颜色：0=红 1=黑。
import sys

class RB:
    __slots__ = ('val', 'color', 'p', 'l', 'r')
    def __init__(self, v):
        self.val = v; self.color = 1; self.p = self.l = self.r = None  # 1=红

def rotate(root, a):
    b = a.p
    if not b: return a
    if a == b.l:
        b.l = a.r
        if a.r: a.r.p = b
        a.r = b
    else:
        b.r = a.l
        if a.l: a.l.p = b
        a.l = b
    if b.p:
        if b == b.p.l: b.p.l = a
        else: b.p.r = a
    a.p = b.p; b.p = a
    return a if root == b else root

def rb_insert(root, num):
    cur = root; prev = None
    while cur:
        prev = cur
        if cur.val >= num: cur = cur.l
        else: cur = cur.r
    node = RB(num)
    if not prev: return node
    node.p = prev
    if prev.val >= node.val: prev.l = node
    else: prev.r = node
    return rebalance(root, node)

def rebalance(root, node):
    while True:
        parent = node.p
        if not parent: break
        if parent.color == 0: break
        gparent = parent.p
        if gparent is None:
            parent.color = 0; break
        uncle = gparent.r if parent == gparent.l else gparent.l
        if (not uncle) or uncle.color == 0:
            if (parent == gparent.l) ^ (node == parent.l):
                rotate(root, node); tmp = node; node = parent; parent = tmp
            root = rotate(root, parent); parent.color = 0; gparent.color = 1; break
        parent.color = 0; uncle.color = 0; gparent.color = 1; node = gparent
    return root

def main():
    data = sys.stdin.read().split()
    n = int(data[0]); nums = list(map(int, data[1:1 + n]))
    root = None
    for v in nums: root = rb_insert(root, v)
    out = []
    def inorder(node, depth):
        if not node: return
        inorder(node.l, depth + 1)
        out.append(f"{node.val} {1 - node.color} {depth}")   # 输出：红=0 黑=1
        inorder(node.r, depth + 1)
    inorder(root, 1)
    maxd = max(int(line.split()[2]) for line in out) if out else 0
    print('\\n'.join(out))
    print(maxd + 1)

if __name__ == '__main__':
    main()
'''

SOL_TS['balanced-bst'] = '''// 平衡二叉搜索树（红黑树）：插入后按中序输出「值 颜色 深度」，末行输出树高。
// 颜色：0=红 1=黑。
class RB { val: number; color: number; p: RB | null; l: RB | null; r: RB | null;
  constructor(v: number) { this.val = v; this.color = 1; this.p = this.l = this.r = null; } }

function solve(input: string): string {
  const data = input.trim().split(/\s+/).map(Number);
  const n = data[0]; const nums = data.slice(1, 1 + n);
  const rotate = (root: RB | null, a: RB): RB | null => {
    const b = a.p; if (!b) return a;
    if (a === b.l) { b.l = a.r; if (a.r) a.r.p = b; a.r = b; }
    else { b.r = a.l; if (a.l) a.l.p = b; a.l = b; }
    if (b.p) { if (b === b.p.l) b.p.l = a; else b.p.r = a; }
    a.p = b.p; b.p = a;
    return root === b ? a : root;
  };
  const rebalance = (root: RB | null, node0: RB): RB | null => {
    let node = node0;
    while (true) {
      let parent = node.p; if (!parent) break;
      if (parent.color === 0) break;
      const gparent = parent.p;
      if (gparent === null) { parent.color = 0; break; }
      const uncle = parent === gparent.l ? gparent.r : gparent.l;
      if (!uncle || uncle.color === 0) {
        if ((parent === gparent.l) !== (node === parent.l)) { rotate(root, node); const tmp = node; node = parent; parent = tmp; }
        root = rotate(root, parent); parent.color = 0; gparent.color = 1; break;
      }
      parent.color = 0; if (uncle) uncle.color = 0; gparent.color = 1; node = gparent;
    }
    return root;
  };
  const insert = (root: RB | null, num: number): RB | null => {
    let cur = root, prev: RB | null = null;
    while (cur) { prev = cur; if (cur.val >= num) cur = cur.l; else cur = cur.r; }
    const node = new RB(num);
    if (!prev) return node;
    node.p = prev;
    if (prev.val >= node.val) prev.l = node; else prev.r = node;
    return rebalance(root, node);
  };
  let root: RB | null = null;
  for (const v of nums) root = insert(root, v);
  const out: string[] = [];
  let maxd = 0;
  const inorder = (nd: RB | null, d: number) => {
    if (!nd) return;
    inorder(nd.l, d + 1);
    out.push(`${nd.val} ${1 - nd.color} ${d}`); maxd = Math.max(maxd, d);
    inorder(nd.r, d + 1);
  };
  inorder(root, 1);
  out.push(String(maxd + 1));
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['balanced-bst'] = '''import java.util.*;

public class Main {
    static class RB { int val, color; RB p, l, r;
        RB(int v) { val = v; color = 1; } }  // 1=红
    static List<String> OUT;
    static int MAXD;
    static void inorder(RB nd, int d) {
        if (nd == null) return;
        inorder(nd.l, d + 1);
        OUT.add(nd.val + " " + (1 - nd.color) + " " + d);
        MAXD = Math.max(MAXD, d);
        inorder(nd.r, d + 1);
    }
    static RB rotate(RB root, RB a) {
        RB b = a.p; if (b == null) return a;
        if (a == b.l) { b.l = a.r; if (a.r != null) a.r.p = b; a.r = b; }
        else { b.r = a.l; if (a.l != null) a.l.p = b; a.l = b; }
        if (b.p != null) { if (b == b.p.l) b.p.l = a; else b.p.r = a; }
        a.p = b.p; b.p = a;
        return root == b ? a : root;
    }
    static RB rebalance(RB root, RB node0) {
        RB node = node0;
        while (true) {
            RB parent = node.p; if (parent == null) break;
            if (parent.color == 0) break;
            RB gparent = parent.p;
            if (gparent == null) { parent.color = 0; break; }
            RB uncle = parent == gparent.l ? gparent.r : gparent.l;
            if (uncle == null || uncle.color == 0) {
                if ((parent == gparent.l) != (node == parent.l)) { rotate(root, node); RB tmp = node; node = parent; parent = tmp; }
                root = rotate(root, parent); parent.color = 0; gparent.color = 1; break;
            }
            parent.color = 0; if (uncle != null) uncle.color = 0; gparent.color = 1; node = gparent;
        }
        return root;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        RB root = null;
        for (int i = 0; i < n; i++) {
            int v = sc.nextInt();
            RB cur = root, prev = null;
            while (cur != null) { prev = cur; if (cur.val >= v) cur = cur.l; else cur = cur.r; }
            RB node = new RB(v);
            if (prev == null) { root = node; continue; }
            node.p = prev;
            if (prev.val >= node.val) prev.l = node; else prev.r = node;
            root = rebalance(root, node);
        }
        OUT = new ArrayList<>(); MAXD = 0;
        inorder(root, 1);
        OUT.add(String.valueOf(MAXD + 1));
        System.out.println(String.join("\\n", OUT));
    }
}
'''

# ============================ 11. 工程实战：运输调度（A*） ============================
SOL_PY['transport'] = '''# 工程实战：运输调度。给定路网（带长度/限速/收费/通行时间窗），
# 用 A* 求从起点到终点满足路径类型（最快/最短/最省/预算内）的最优路径。
import sys

def to_min(s):
    s = s.strip()
    return ((int(s[0]) * 10 + int(s[1])) * 60 + int(s[3]) * 10 + int(s[4]))

def to_hm(m):
    h = m // 60; mm = m % 60
    return ('0' if h < 10 else '') + str(h) + ':' + ('0' if mm < 10 else '') + str(mm)

def main():
    lines = sys.stdin.read().strip().split('\\n')
    N, M, start, end, path_type, budget = lines[0].split()
    N = int(N); M = int(M); start = int(start); end = int(end); path_type = int(path_type)
    budget = float(budget) * 100
    start_time = to_min(lines[1])
    graph = [[] for _ in range(N)]; rgraph = [[] for _ in range(N)]
    for li in lines[2:2 + M]:
        f, to, length, speed, toll, win = li.split()
        f = int(f); to = int(to); length = int(length); speed = int(speed)
        toll = int(float(toll) * 100)
        ws, we = win.split('~'); ps = to_min(ws); pe = to_min(we)
        e = {'from': f, 'to': to, 'length': length, 'speed': speed, 'toll': toll, 'ps': ps, 'pe': pe}
        graph[f].append(e); rgraph[to].append(e)
    MOD = 1440
    level = {}; q = [end]; level[end] = 0
    while q:
        x = q.pop(0)
        for e in rgraph[x]:
            if e['from'] not in level: level[e['from']] = level[x] + 1; q.append(e['from'])
    def next_arr(t, e):
        pt = int(t + (e['length'] + 0.0) / e['speed'])
        if int(t) % MOD > e['pe']: return (t // MOD + 1) * MOD + e['ps'] + pt
        return t + pt
    def heur_time(u, arr):
        cur = u; t = arr
        while cur != end:
            best = -1; bt = 10**9
            for e in graph[cur]:
                if level.get(cur, 10**9) - level.get(e['to'], 10**9) == 1:
                    na = next_arr(t, e)
                    if best == -1 or na < bt: best = e['to']; bt = na
            cur = best; t = bt
        return t
    def heur_dist(u, dist):
        cur = u; d = dist
        while cur != end:
            best = -1; bd = 10**9
            for e in graph[cur]:
                if level.get(cur, 10**9) - level.get(e['to'], 10**9) == 1:
                    nd = d + e['length']
                    if best == -1 or nd < bd: best = e['to']; bd = nd
            cur = best; d = bd
        return d
    def heur_cost(u, cost):
        cur = u; c = cost
        while cur != end:
            best = -1; bc = 10**9
            for e in graph[cur]:
                if level.get(cur, 10**9) - level.get(e['to'], 10**9) == 1:
                    nc = c + e['toll']
                    if best == -1 or nc < bc: best = e['to']; bc = nc
            cur = best; c = bc
        return c
    class PN:
        __slots__ = ('point', 'arr', 'dist', 'cost', 'prev', 'ht', 'hd', 'hc')
        def __init__(self, p, arr, d, c, prev):
            self.point = p; self.arr = arr; self.dist = d; self.cost = c; self.prev = prev
            self.ht = self.hd = self.hc = 0
    arch = []
    def attr(pn, e):
        if path_type == 1: return next_arr(pn.arr, e)
        if path_type == 2: return pn.dist + e['length']
        if path_type == 3: return pn.cost + e['toll']
        return next_arr(pn.arr, e)
    def less(a, b):
        if path_type == 1: return a.ht > b.ht
        if path_type == 2: return a.hd > b.hd
        if path_type == 3:
            if a.hc > b.hc: return True
            if a.hc == b.hc and a.ht > b.ht: return True
            return False
        return a.ht > b.ht
    init = PN(start, start_time, 0, 0, -1)
    if path_type == 1: init.ht = heur_time(start, start_time)
    elif path_type == 2: init.hd = heur_dist(start, 0)
    elif path_type == 3: init.hc = heur_cost(start, 0); init.ht = heur_time(start, start_time)
    else: init.ht = heur_time(start, start_time)
    pq = [init]
    def push(it):
        pq.append(it); ci = len(pq) - 1
        while ci > 0:
            pi = (ci - 1) // 2
            if less(pq[ci], pq[pi]): pq[ci], pq[pi] = pq[pi], pq[ci]; ci = pi
            else: break
    def pop():
        top = pq[0]; pq[0] = pq[-1]; pq.pop()
        ci = 0; sz = len(pq)
        while True:
            l = 2 * ci + 1; r = l + 1; sm = ci
            if l < sz and less(pq[l], pq[sm]): sm = l
            if r < sz and less(pq[r], pq[sm]): sm = r
            if sm == ci: break
            pq[ci], pq[sm] = pq[sm], pq[ci]; ci = sm
        return top
    hash_state = {}
    while pq:
        cur = pop(); arch.append(cur)
        if cur.point == end:
            path = [cur]
            while cur.prev != -1: cur = arch[cur.prev]; path.append(cur)
            res = [f"{to_hm(path[-1].arr)} {path[-1].dist} {path[-1].cost / 100:.2f}",
                   str(len(path))]
            for nd in reversed(path): res.append(f"{nd.point} {to_hm(nd.arr)}")
            print('\\n'.join(res)); return
        for e in graph[cur.point]:
            at = attr(cur, e)
            if e['to'] not in hash_state or hash_state[e['to']] > at:
                nxt = PN(e['to'], next_arr(cur.arr, e), cur.dist + e['length'], cur.cost + e['toll'], len(arch) - 1)
                if path_type == 4 and nxt.cost > budget: continue
                if path_type == 1: nxt.ht = heur_time(nxt.point, nxt.arr)
                elif path_type == 2: nxt.hd = heur_dist(nxt.point, nxt.dist)
                elif path_type == 3: nxt.hc = heur_cost(nxt.point, nxt.cost); nxt.ht = heur_time(nxt.point, nxt.arr)
                else: nxt.ht = heur_time(nxt.point, nxt.arr)
                push(nxt); hash_state[nxt.point] = at

if __name__ == '__main__':
    main()
'''

SOL_TS['transport'] = '''// 工程实战：运输调度（A*）。路网含长度/限速/收费/通行时间窗，
// 按路径类型求起点到终点的最优路径（最快/最短/最省/预算内）。
function solve(input: string): string {
  const lines = input.trim().split('\\n');
  const [N, M, start, end, pathType, budgetStr] = lines[0].split(' ');
  const n = +N, m = +M, st = +start, en = +end, pt = +pathType;
  const budget = parseFloat(budgetStr) * 100;
  const toMin = (s: string) => { s = s.trim(); return ((+s[0] * 10 + +s[1]) * 60 + +s[3] * 10 + +s[4]); };
  const toHm = (x: number) => { const h = Math.floor(x / 60), mm = x % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; };
  const graph: any[][] = Array.from({ length: n }, () => []);
  const rgraph: any[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < m; i++) {
    const f = +lines[2 + i].split(' ')[0];
    const [ff, tt, len, sp, toll, win] = lines[2 + i].split(' ');
    const to = +tt, length = +len, speed = +sp, t = Math.round(parseFloat(toll) * 100);
    const [ws, we] = win.split('~'); const e = { from: +ff, to, length, speed, toll: t, ps: toMin(ws), pe: toMin(we) };
    graph[+ff].push(e); rgraph[to].push(e);
  }
  const MOD = 1440;
  const level: { [k: number]: number } = {}; const q = [en]; level[en] = 0;
  while (q.length) { const x = q.shift()!; for (const e of rgraph[x]) if (!(e.from in level)) { level[e.from] = level[x] + 1; q.push(e.from); } }
  const nextArr = (t: number, e: any) => {
    const pt2 = Math.floor(t + e.length / e.speed);
    if (Math.floor(t) % MOD > e.pe) return (Math.floor(t / MOD) + 1) * MOD + e.ps + pt2;
    return t + pt2;
  };
  const heurTime = (u: number, arr: number): number => {
    let cur = u, t = arr;
    while (cur !== en) {
      let best = -1, bt = 1e9;
      for (const e of graph[cur]) if ((level[cur] ?? 1e9) - (level[e.to] ?? 1e9) === 1) { const na = nextArr(t, e); if (best === -1 || na < bt) { best = e.to; bt = na; } }
      cur = best; t = bt;
    }
    return t;
  };
  const heurDist = (u: number, dist: number): number => {
    let cur = u, d = dist;
    while (cur !== en) {
      let best = -1, bd = 1e9;
      for (const e of graph[cur]) if ((level[cur] ?? 1e9) - (level[e.to] ?? 1e9) === 1) { const nd = d + e.length; if (best === -1 || nd < bd) { best = e.to; bd = nd; } }
      cur = best; d = bd;
    }
    return d;
  };
  const heurCost = (u: number, cost: number): number => {
    let cur = u, c = cost;
    while (cur !== en) {
      let best = -1, bc = 1e9;
      for (const e of graph[cur]) if ((level[cur] ?? 1e9) - (level[e.to] ?? 1e9) === 1) { const nc = c + e.toll; if (best === -1 || nc < bc) { best = e.to; bc = nc; } }
      cur = best; c = bc;
    }
    return c;
  };
  const attr = (pn: any, e: any) => {
    if (pt === 1 || pt === 4) return nextArr(pn.arr, e);
    if (pt === 2) return pn.dist + e.length;
    return pn.cost + e.toll;
  };
  const less = (a: any, b: any) => {
    if (pt === 1 || pt === 4) return a.ht > b.ht;
    if (pt === 2) return a.hd > b.hd;
    if (pt === 3) { if (a.hc > b.hc) return true; if (a.hc === b.hc && a.ht > b.ht) return true; return false; }
    return a.ht > b.ht;
  };
  const arch: any[] = [];
  const init = { point: st, arr: toMin(lines[1]), dist: 0, cost: 0, prev: -1, ht: 0, hd: 0, hc: 0 };
  if (pt === 1) init.ht = heurTime(st, init.arr);
  else if (pt === 2) init.hd = heurDist(st, 0);
  else if (pt === 3) { init.hc = heurCost(st, 0); init.ht = heurTime(st, init.arr); }
  else init.ht = heurTime(st, init.arr);
  const pq: any[] = [init];
  const push = (it: any) => { pq.push(it); let ci = pq.length - 1; while (ci > 0) { const pi = (ci - 1) >> 1; if (less(pq[ci], pq[pi])) { [pq[ci], pq[pi]] = [pq[pi], pq[ci]]; ci = pi; } else break; } };
  const pop = () => { const top = pq[0]; pq[0] = pq[pq.length - 1]; pq.pop(); let ci = 0, sz = pq.length; while (true) { let l = 2 * ci + 1, r = l + 1, sm = ci; if (l < sz && less(pq[l], pq[sm])) sm = l; if (r < sz && less(pq[r], pq[sm])) sm = r; if (sm === ci) break; [pq[ci], pq[sm]] = [pq[sm], pq[ci]]; ci = sm; } return top; };
  const hashState: { [k: number]: number } = {};
  while (pq.length) {
    const cur = pop(); arch.push(cur);
    if (cur.point === en) {
      let path = [cur]; let c = cur;
      while (c.prev !== -1) { c = arch[c.prev]; path.push(c); }
      const res = [toHm(path[path.length - 1].arr) + ' ' + path[path.length - 1].dist + ' ' + (path[path.length - 1].cost / 100).toFixed(2), String(path.length)];
      for (let k = path.length - 1; k >= 0; k--) res.push(path[k].point + ' ' + toHm(path[k].arr));
      return res.join('\\n');
    }
    for (const e of graph[cur.point]) {
      const at = attr(cur, e);
      if (!(e.to in hashState) || hashState[e.to] > at) {
        const nxt = { point: e.to, arr: nextArr(cur.arr, e), dist: cur.dist + e.length, cost: cur.cost + e.toll, prev: arch.length - 1, ht: 0, hd: 0, hc: 0 };
        if (pt === 4 && nxt.cost > budget) continue;
        if (pt === 1) nxt.ht = heurTime(nxt.point, nxt.arr);
        else if (pt === 2) nxt.hd = heurDist(nxt.point, nxt.dist);
        else if (pt === 3) { nxt.hc = heurCost(nxt.point, nxt.cost); nxt.ht = heurTime(nxt.point, nxt.arr); }
        else nxt.ht = heurTime(nxt.point, nxt.arr);
        push(nxt); hashState[nxt.point] = at;
      }
    }
  }
  return '';
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['transport'] = '''import java.util.*;

public class Main {
    static final int MOD = 1440;
    static int N, M, start, end, pathType;
    static double budget;
    static List<Edge>[] graph;
    static List<Edge>[] rgraph;
    static Map<Integer, Integer> level;

    static class Edge {
        int from, to, length, speed, toll, ps, pe;
        Edge(int from, int to, int length, int speed, int toll, int ps, int pe) {
            this.from = from; this.to = to; this.length = length; this.speed = speed;
            this.toll = toll; this.ps = ps; this.pe = pe;
        }
    }
    static class Node {
        int point, arr, dist, cost, prev, ht, hd, hc;
        Node(int point, int arr, int dist, int cost, int prev) {
            this.point = point; this.arr = arr; this.dist = dist; this.cost = cost; this.prev = prev;
        }
    }

    static int toMin(String s) {
        s = s.trim();
        return ((s.charAt(0) - '0') * 10 + (s.charAt(1) - '0')) * 60 + (s.charAt(3) - '0') * 10 + (s.charAt(4) - '0');
    }
    static String toHm(int x) {
        int h = x / 60, m = x % 60;
        return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
    }
    static int nextArr(int t, Edge e) {
        int pt = (int)(t + (double) e.length / e.speed);
        if (t % MOD > e.pe) return (t / MOD + 1) * MOD + e.ps + pt;
        return t + pt;
    }
    static int lvl(int x) { Integer v = level.get(x); return v == null ? 1000000000 : v; }

    static int heurTime(int u, int arr) {
        int cur = u, t = arr;
        while (cur != end) {
            int best = -1, bt = Integer.MAX_VALUE;
            for (Edge e : graph[cur]) {
                if (lvl(cur) - lvl(e.to) == 1) {
                    int na = nextArr(t, e);
                    if (best == -1 || na < bt) { best = e.to; bt = na; }
                }
            }
            cur = best; t = bt;
        }
        return t;
    }
    static int heurDist(int u, int dist) {
        int cur = u, d = dist;
        while (cur != end) {
            int best = -1, bd = Integer.MAX_VALUE;
            for (Edge e : graph[cur]) {
                if (lvl(cur) - lvl(e.to) == 1) {
                    int nd = d + e.length;
                    if (best == -1 || nd < bd) { best = e.to; bd = nd; }
                }
            }
            cur = best; d = bd;
        }
        return d;
    }
    static int heurCost(int u, int cost) {
        int cur = u, c = cost;
        while (cur != end) {
            int best = -1, bc = Integer.MAX_VALUE;
            for (Edge e : graph[cur]) {
                if (lvl(cur) - lvl(e.to) == 1) {
                    int nc = c + e.toll;
                    if (best == -1 || nc < bc) { best = e.to; bc = nc; }
                }
            }
            cur = best; c = bc;
        }
        return c;
    }

    static int attr(Node pn, Edge e) {
        if (pathType == 1 || pathType == 4) return nextArr(pn.arr, e);
        if (pathType == 2) return pn.dist + e.length;
        return pn.cost + e.toll;
    }

    static class PQ {
        List<Node> a = new ArrayList<>();
        boolean less(Node x, Node y) {
            if (pathType == 1 || pathType == 4) return x.ht > y.ht;
            if (pathType == 2) return x.hd > y.hd;
            if (pathType == 3) { if (x.hc != y.hc) return x.hc > y.hc; return x.ht > y.ht; }
            return x.ht > y.ht;
        }
        void swap(int i, int j) { Node t = a.get(i); a.set(i, a.get(j)); a.set(j, t); }
        void push(Node it) {
            a.add(it); int ci = a.size() - 1;
            while (ci > 0) { int pi = (ci - 1) / 2; if (less(a.get(ci), a.get(pi))) { swap(ci, pi); ci = pi; } else break; }
        }
        Node pop() {
            Node top = a.get(0); a.set(0, a.get(a.size() - 1)); a.remove(a.size() - 1);
            int ci = 0;
            while (true) {
                int l = 2 * ci + 1, r = l + 1, sm = ci;
                if (l < a.size() && less(a.get(l), a.get(sm))) sm = l;
                if (r < a.size() && less(a.get(r), a.get(sm))) sm = r;
                if (sm == ci) break;
                swap(ci, sm); ci = sm;
            }
            return top;
        }
        boolean isEmpty() { return a.isEmpty(); }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] h = sc.nextLine().split(" ");
        N = Integer.parseInt(h[0]); M = Integer.parseInt(h[1]); start = Integer.parseInt(h[2]);
        end = Integer.parseInt(h[3]); pathType = Integer.parseInt(h[4]);
        budget = Double.parseDouble(h[5]) * 100;
        int startTime = toMin(sc.nextLine());
        graph = new List[N]; rgraph = new List[N];
        for (int i = 0; i < N; i++) { graph[i] = new ArrayList<>(); rgraph[i] = new ArrayList<>(); }
        for (int i = 0; i < M; i++) {
            String[] p = sc.nextLine().split(" ");
            int f = Integer.parseInt(p[0]), to = Integer.parseInt(p[1]), length = Integer.parseInt(p[2]);
            int speed = Integer.parseInt(p[3]), toll = (int)(Double.parseDouble(p[4]) * 100);
            String[] win = p[5].split("~"); int ps = toMin(win[0]), pe = toMin(win[1]);
            Edge e = new Edge(f, to, length, speed, toll, ps, pe);
            graph[f].add(e); rgraph[to].add(e);
        }
        level = new HashMap<>(); Queue<Integer> q = new LinkedList<>(); q.add(end); level.put(end, 0);
        while (!q.isEmpty()) {
            int x = q.poll();
            for (Edge e : rgraph[x]) {
                if (!level.containsKey(e.from)) { level.put(e.from, level.get(x) + 1); q.add(e.from); }
            }
        }
        List<Node> arch = new ArrayList<>();
        PQ pq = new PQ();
        Node init = new Node(start, startTime, 0, 0, -1);
        if (pathType == 1) init.ht = heurTime(start, startTime);
        else if (pathType == 2) init.hd = heurDist(start, 0);
        else if (pathType == 3) { init.hc = heurCost(start, 0); init.ht = heurTime(start, startTime); }
        else init.ht = heurTime(start, startTime);
        pq.push(init);
        Map<Integer, Integer> hashState = new HashMap<>();
        while (!pq.isEmpty()) {
            Node cur = pq.pop();
            arch.add(cur);
            if (cur.point == end) {
                List<Node> path = new ArrayList<>(); Node c = cur;
                while (c.prev != -1) { c = arch.get(c.prev); path.add(c); }
                StringBuilder res = new StringBuilder();
                Node fin = path.get(0);
                res.append(toHm(fin.arr)).append(' ').append(fin.dist).append(' ').append(String.format("%.2f", fin.cost / 100.0)).append('\n');
                res.append(path.size()).append('\n');
                for (int k = path.size() - 1; k >= 0; k--) {
                    Node nd = path.get(k);
                    res.append(nd.point).append(' ').append(toHm(nd.arr)).append('\n');
                }
                System.out.print(res.toString());
                return;
            }
            for (Edge e : graph[cur.point]) {
                int at = attr(cur, e);
                Integer prev = hashState.get(e.to);
                if (prev == null || prev > at) {
                    Node nxt = new Node(e.to, nextArr(cur.arr, e), cur.dist + e.length, cur.cost + e.toll, arch.size() - 1);
                    if (pathType == 4 && nxt.cost > budget) continue;
                    if (pathType == 1) nxt.ht = heurTime(nxt.point, nxt.arr);
                    else if (pathType == 2) nxt.hd = heurDist(nxt.point, nxt.dist);
                    else if (pathType == 3) { nxt.hc = heurCost(nxt.point, nxt.cost); nxt.ht = heurTime(nxt.point, nxt.arr); }
                    else nxt.ht = heurTime(nxt.point, nxt.arr);
                    pq.push(nxt); hashState.put(e.to, at);
                }
            }
        }
    }
}
'''

# ============================ 12. 八数码（8-Puzzle，Ch5 高级搜索） ============================
SOL_PY['eight-puzzle'] = '''# 八数码：BFS 求从初始布局还原到目标布局（123456780）的最少步数。
import sys
from collections import deque

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    start = tuple(int(x) for x in data[:9])
    goal = (1, 2, 3, 4, 5, 6, 7, 8, 0)
    if start == goal:
        print('Total steps: 0')
        return
    q = deque([(start, 0)])
    seen = {start}
    while q:
        st, d = q.popleft()
        z = st.index(0)
        r, c = divmod(z, 3)
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < 3 and 0 <= nc < 3:
                nz = nr * 3 + nc
                lst = list(st)
                lst[z], lst[nz] = lst[nz], lst[z]
                ns = tuple(lst)
                if ns == goal:
                    print(f'Total steps: {d + 1}')
                    return
                if ns not in seen:
                    seen.add(ns)
                    q.append((ns, d + 1))
    print('Total steps: -1')

if __name__ == '__main__':
    main()
'''

SOL_TS['eight-puzzle'] = '''// 八数码：BFS 求最少还原步数（目标 123456780）。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const start = data.slice(0, 9);
  const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const key = (s: number[]) => s.join(',');
  if (start.every((v, i) => v === goal[i])) return 'Total steps: 0';
  const seen = new Set<string>([key(start)]);
  const depth = new Map<string, number>([[key(start), 0]]);
  const q: number[][] = [start];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  while (q.length) {
    const st = q.shift()!;
    const d = depth.get(key(st))!;
    const z = st.indexOf(0);
    const r = Math.floor(z / 3), c = z % 3;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr > 2 || nc < 0 || nc > 2) continue;
      const nz = nr * 3 + nc;
      const ns = st.slice();
      ns[z] = ns[nz]; ns[nz] = 0;
      if (ns.every((v, i) => v === goal[i])) return `Total steps: ${d + 1}`;
      const k = key(ns);
      if (!seen.has(k)) { seen.add(k); depth.set(k, d + 1); q.push(ns); }
    }
  }
  return 'Total steps: -1';
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['eight-puzzle'] = '''import java.util.*;

public class Main {
    static boolean eq(int[] a, int[] b) {
        for (int i = 0; i < 9; i++) if (a[i] != b[i]) return false;
        return true;
    }
    static String key(int[] a) {
        StringBuilder sb = new StringBuilder();
        for (int v : a) sb.append(v).append(',');
        return sb.toString();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] goal = {1, 2, 3, 4, 5, 6, 7, 8, 0};
        int[] start = new int[9];
        for (int i = 0; i < 9; i++) start[i] = sc.nextInt();
        if (eq(start, goal)) { System.out.println("Total steps: 0"); return; }
        Set<String> seen = new HashSet<>();
        Map<String, Integer> depth = new HashMap<>();
        Deque<int[]> q = new ArrayDeque<>();
        seen.add(key(start)); depth.put(key(start), 0); q.add(start);
        int[][] dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        while (!q.isEmpty()) {
            int[] st = q.poll();
            int d = depth.get(key(st));
            int z = 0;
            while (st[z] != 0) z++;
            int r = z / 3, c = z % 3;
            for (int[] dir : dirs) {
                int nr = r + dir[0], nc = c + dir[1];
                if (nr < 0 || nr > 2 || nc < 0 || nc > 2) continue;
                int nz = nr * 3 + nc;
                int[] ns = st.clone();
                ns[z] = ns[nz]; ns[nz] = 0;
                if (eq(ns, goal)) { System.out.println("Total steps: " + (d + 1)); return; }
                String k = key(ns);
                if (!seen.contains(k)) { seen.add(k); depth.put(k, d + 1); q.add(ns); }
            }
        }
        System.out.println("Total steps: -1");
    }
}
'''

# ============================ 13. 十五数码（15-Puzzle，Ch5 高级搜索） ============================
SOL_PY['fifteen-puzzle'] = '''# 十五数码：IDA* + 曼哈顿距离求最少还原步数（目标 1..15,0）。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    start = tuple(int(x) for x in data[:16])
    goal = tuple(range(1, 16)) + (0,)
    if start == goal:
        print('Total steps: 0')
        return
    flat = [x for x in start if x != 0]
    inv = sum(1 for i in range(len(flat)) for j in range(i + 1, len(flat)) if flat[i] > flat[j])
    blank_row = start.index(0) // 4
    if (inv + (3 - blank_row)) % 2 != 0:
        print('Total steps: -1')
        return
    dist = [[0] * 16 for _ in range(16)]
    for v in range(16):
        gr, gc = divmod(v - 1 if v != 0 else 15, 4)
        for pos in range(16):
            pr, pc = divmod(pos, 4)
            dist[v][pos] = abs(gr - pr) + abs(gc - pc)
    def h(state):
        return sum(dist[state[i]][i] for i in range(16))
    DR = (-1, 1, 0, 0); DC = (0, 0, -1, 1)
    def ida(state, g, bound, prev):
        f = g + h(state)
        if f > bound:
            return f
        if state == goal:
            return 0
        z = state.index(0); r, c = divmod(z, 4)
        minf = 10**9
        for d in range(4):
            if d == (prev ^ 1):
                continue
            nr, nc = r + DR[d], c + DC[d]
            if not (0 <= nr < 4 and 0 <= nc < 4):
                continue
            nz = nr * 4 + nc
            ns = list(state); ns[z], ns[nz] = ns[nz], ns[z]
            res = ida(tuple(ns), g + 1, bound, d)
            if res == 0:
                return 0
            if res < minf:
                minf = res
        return minf
    bound = h(start)
    while True:
        res = ida(start, 0, bound, -1)
        if res == 0:
            print(f'Total steps: {bound}')
            return
        bound = res

if __name__ == '__main__':
    main()
'''

SOL_TS['fifteen-puzzle'] = '''// 十五数码：IDA* + 曼哈顿距离求最少还原步数（目标 1..15,0）。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const start = data.slice(0, 16);
  const goal = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
  const eq = (a: number[], b: number[]) => a.every((v, i) => v === b[i]);
  if (eq(start, goal)) return 'Total steps: 0';
  const flat = start.filter((x) => x !== 0);
  let inv = 0;
  for (let i = 0; i < flat.length; i++)
    for (let j = i + 1; j < flat.length; j++)
      if (flat[i] > flat[j]) inv++;
  const blankRow = Math.floor(start.indexOf(0) / 4);
  if ((inv + (3 - blankRow)) % 2 !== 0) return 'Total steps: -1';
  const dist: number[][] = [];
  for (let v = 0; v < 16; v++) {
    const g = v === 0 ? 15 : v - 1;
    const row: number[] = [];
    for (let pos = 0; pos < 16; pos++)
      row.push(Math.abs(Math.floor(g / 4) - Math.floor(pos / 4)) + Math.abs((g % 4) - (pos % 4)));
    dist.push(row);
  }
  const h = (s: number[]) => s.reduce((acc, v, i) => acc + dist[v][i], 0);
  const DR = [-1, 1, 0, 0], DC = [0, 0, -1, 1];
  let bound = h(start);
  let found = false;
  const ida = (state: number[], g: number, b: number, prev: number): number => {
    const f = g + h(state);
    if (f > b) return f;
    if (eq(state, goal)) { found = true; return 0; }
    const z = state.indexOf(0);
    const r = Math.floor(z / 4), c = z % 4;
    let minf = Infinity;
    for (let d = 0; d < 4; d++) {
      if (d === (prev ^ 1)) continue;
      const nr = r + DR[d], nc = c + DC[d];
      if (nr < 0 || nr > 3 || nc < 0 || nc > 3) continue;
      const nz = nr * 4 + nc;
      const ns = state.slice();
      ns[z] = ns[nz]; ns[nz] = 0;
      const res = ida(ns, g + 1, b, d);
      if (found) return 0;
      if (res < minf) minf = res;
    }
    return minf;
  };
  while (!found) {
    const res = ida(start, 0, bound, -1);
    if (found) break;
    bound = res;
  }
  return `Total steps: ${bound}`;
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['fifteen-puzzle'] = '''import java.util.*;

public class Main {
    static final int[] GOAL = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0};
    static int[][] dist = new int[16][16];
    static boolean found;
    static int bound;
    static boolean eq(int[] a) {
        for (int i = 0; i < 16; i++) if (a[i] != GOAL[i]) return false;
        return true;
    }
    static int h(int[] s) {
        int res = 0;
        for (int i = 0; i < 16; i++) res += dist[s[i]][i];
        return res;
    }
    static int ida(int[] state, int g, int b, int prev) {
        int f = g + h(state);
        if (f > b) return f;
        if (eq(state)) { found = true; return 0; }
        int z = 0; while (state[z] != 0) z++;
        int r = z / 4, c = z % 4;
        int[] dr = {-1, 1, 0, 0}, dc = {0, 0, -1, 1};
        int minf = Integer.MAX_VALUE;
        for (int d = 0; d < 4; d++) {
            if (d == (prev ^ 1)) continue;
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr > 3 || nc < 0 || nc > 3) continue;
            int nz = nr * 4 + nc;
            int[] ns = state.clone();
            ns[z] = ns[nz]; ns[nz] = 0;
            int res = ida(ns, g + 1, b, d);
            if (found) return 0;
            if (res < minf) minf = res;
        }
        return minf;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] start = new int[16];
        for (int i = 0; i < 16; i++) start[i] = sc.nextInt();
        if (eq(start)) { System.out.println("Total steps: 0"); return; }
        int inv = 0;
        for (int i = 0; i < 16; i++) if (start[i] != 0)
            for (int j = i + 1; j < 16; j++) if (start[j] != 0 && start[i] > start[j]) inv++;
        int blankRow = 0;
        for (int i = 0; i < 16; i++) if (start[i] == 0) { blankRow = i / 4; break; }
        if ((inv + (3 - blankRow)) % 2 != 0) { System.out.println("Total steps: -1"); return; }
        for (int v = 0; v < 16; v++) {
            int g = v == 0 ? 15 : v - 1;
            for (int pos = 0; pos < 16; pos++)
                dist[v][pos] = Math.abs(g / 4 - pos / 4) + Math.abs(g % 4 - pos % 4);
        }
        bound = h(start);
        found = false;
        while (!found) {
            int res = ida(start, 0, bound, -1);
            if (found) break;
            bound = res;
        }
        System.out.println("Total steps: " + bound);
    }
}
'''

# ============================ 14. 木棒拼接（Stick，Ch5 高级搜索） ============================
SOL_PY['stick'] = '''# 木棒拼接：DFS+剪枝求最短原始木棒长度。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    a = sorted((int(x) for x in data[1:1 + n]), reverse=True)
    total = sum(a)
    def can(L):
        if total % L:
            return False
        K = total // L
        used = [False] * n
        def dfs(done, cur, start):
            if done == K - 1:
                return True
            if cur == L:
                return dfs(done + 1, 0, 0)
            prev = -1
            for i in range(start, n):
                if used[i] or a[i] == prev:
                    continue
                if cur + a[i] > L:
                    continue
                prev = a[i]
                used[i] = True
                if dfs(done, cur + a[i], i + 1):
                    return True
                used[i] = False
                if cur == 0 or cur + a[i] == L:
                    return False
            return False
        return dfs(0, 0, 0)
    for L in range(max(a), total // 2 + 1):
        if can(L):
            print(L)
            return
    print(total)

if __name__ == '__main__':
    main()
'''

SOL_TS['stick'] = '''// 木棒拼接：DFS+剪枝求最短原始木棒长度。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0];
  const a = data.slice(1, 1 + n).sort((x, y) => y - x);
  const total = a.reduce((s, v) => s + v, 0);
  const can = (L: number): boolean => {
    if (total % L !== 0) return false;
    const K = total / L;
    const used: boolean[] = new Array(n).fill(false);
    const dfs = (done: number, cur: number, start: number): boolean => {
      if (done === K - 1) return true;
      if (cur === L) return dfs(done + 1, 0, 0);
      let prev = -1;
      for (let i = start; i < n; i++) {
        if (used[i] || a[i] === prev) continue;
        if (cur + a[i] > L) continue;
        prev = a[i];
        used[i] = true;
        if (dfs(done, cur + a[i], i + 1)) return true;
        used[i] = false;
        if (cur === 0 || cur + a[i] === L) return false;
      }
      return false;
    };
    return dfs(0, 0, 0);
  };
  for (let L = a[0]; L <= Math.floor(total / 2); L++) {
    if (can(L)) return String(L);
  }
  return String(total);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['stick'] = '''import java.util.*;

public class Main {
    static int[] a;
    static boolean[] used;
    static int n;
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        a = new int[n];
        int total = 0;
        for (int i = 0; i < n; i++) { a[i] = sc.nextInt(); total += a[i]; }
        Arrays.sort(a);
        for (int i = 0; i < n / 2; i++) { int t = a[i]; a[i] = a[n - 1 - i]; a[n - 1 - i] = t; }
        for (int L = a[0]; L <= total / 2; L++) {
            if (total % L != 0) continue;
            used = new boolean[n];
            if (dfs(0, 0, 0, L, total / L)) { System.out.println(L); return; }
        }
        System.out.println(total);
    }
    static boolean dfs(int done, int cur, int start, int L, int K) {
        if (done == K - 1) return true;
        if (cur == L) return dfs(done + 1, 0, 0, L, K);
        int prev = -1;
        for (int i = start; i < n; i++) {
            if (used[i] || a[i] == prev) continue;
            if (cur + a[i] > L) continue;
            prev = a[i];
            used[i] = true;
            if (dfs(done, cur + a[i], i + 1, L, K)) return true;
            used[i] = false;
            if (cur == 0 || cur + a[i] == L) return false;
        }
        return false;
    }
}
'''

# ============================ 15. 01 背包（Ch4） ============================
SOL_PY['knapsack01'] = '''# 01 背包：容量逆序遍历，每件至多取一次，输出最大价值。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    maxc, n = int(data[0]), int(data[1])
    f = [-1] * (maxc + 1); f[0] = 0
    i = 2
    for _ in range(n):
        c, w = int(data[i]), int(data[i + 1]); i += 2
        for j in range(maxc - c, -1, -1):
            if f[j] > -1 and f[j] + w > f[j + c]:
                f[j + c] = f[j] + w
    print(max(f))

if __name__ == '__main__':
    main()
'''

SOL_TS['knapsack01'] = '''// 01 背包：容量逆序遍历，每件至多取一次。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const maxc = data[0], n = data[1];
  const f: number[] = new Array(maxc + 1).fill(-1);
  f[0] = 0;
  let i = 2;
  for (let k = 0; k < n; k++) {
    const c = data[i], w = data[i + 1]; i += 2;
    for (let j = maxc - c; j >= 0; j--) {
      if (f[j] > -1 && f[j] + w > f[j + c]) f[j + c] = f[j] + w;
    }
  }
  return String(Math.max(...f));
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['knapsack01'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int maxc = sc.nextInt(), n = sc.nextInt();
        int[] f = new int[maxc + 1];
        Arrays.fill(f, -1); f[0] = 0;
        for (int k = 0; k < n; k++) {
            int c = sc.nextInt(), w = sc.nextInt();
            for (int j = maxc - c; j >= 0; j--)
                if (f[j] > -1 && f[j] + w > f[j + c]) f[j + c] = f[j] + w;
        }
        int res = 0;
        for (int v : f) res = Math.max(res, v);
        System.out.println(res);
    }
}
'''

# ============================ 16. 完全背包（Ch4） ============================
SOL_PY['knapsackmulti'] = '''# 完全背包：容量正序遍历，同一种可重复取。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    maxc, n = int(data[0]), int(data[1])
    f = [-1] * (maxc + 1); f[0] = 0
    i = 2
    for _ in range(n):
        c, w = int(data[i]), int(data[i + 1]); i += 2
        for j in range(maxc - c + 1):
            if f[j] > -1 and f[j] + w > f[j + c]:
                f[j + c] = f[j] + w
    print(max(f))

if __name__ == '__main__':
    main()
'''

SOL_TS['knapsackmulti'] = '''// 完全背包：容量正序遍历，同一种可重复取。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const maxc = data[0], n = data[1];
  const f: number[] = new Array(maxc + 1).fill(-1);
  f[0] = 0;
  let i = 2;
  for (let k = 0; k < n; k++) {
    const c = data[i], w = data[i + 1]; i += 2;
    for (let j = 0; j <= maxc - c; j++) {
      if (f[j] > -1 && f[j] + w > f[j + c]) f[j + c] = f[j] + w;
    }
  }
  return String(Math.max(...f));
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['knapsackmulti'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int maxc = sc.nextInt(), n = sc.nextInt();
        int[] f = new int[maxc + 1];
        Arrays.fill(f, -1); f[0] = 0;
        for (int k = 0; k < n; k++) {
            int c = sc.nextInt(), w = sc.nextInt();
            for (int j = 0; j <= maxc - c; j++)
                if (f[j] > -1 && f[j] + w > f[j + c]) f[j + c] = f[j] + w;
        }
        int res = 0;
        for (int v : f) res = Math.max(res, v);
        System.out.println(res);
    }
}
'''

# ============================ 17. 石子合并（Ch4） ============================
SOL_PY['numbercombine'] = '''# 石子合并：区间 DP，合并代价 = 两堆和的乘积。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    a = [0] + [int(x) for x in data[1:1 + n]]
    s = [0] * (n + 1)
    for i in range(1, n + 1):
        s[i] = s[i - 1] + a[i]
    f = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            best = 10 ** 18
            for k in range(i, j):
                v = f[i][k] + f[k + 1][j] + (s[k] - s[i - 1]) * (s[j] - s[k])
                if v < best:
                    best = v
            f[i][j] = best
    print(f[1][n])

if __name__ == '__main__':
    main()
'''

SOL_TS['numbercombine'] = '''// 石子合并：区间 DP。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0];
  const s: number[] = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) s[i] = s[i - 1] + data[i];
  const f: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  for (let len = 2; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1;
      let best = Infinity;
      for (let k = i; k < j; k++) {
        const v = f[i][k] + f[k + 1][j] + (s[k] - s[i - 1]) * (s[j] - s[k]);
        if (v < best) best = v;
      }
      f[i][j] = best;
    }
  }
  return String(f[1][n]);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['numbercombine'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[] s = new long[n + 1];
        for (int i = 1; i <= n; i++) s[i] = s[i - 1] + sc.nextLong();
        long[][] f = new long[n + 1][n + 1];
        for (int len = 2; len <= n; len++)
            for (int i = 1; i <= n - len + 1; i++) {
                int j = i + len - 1;
                long best = Long.MAX_VALUE;
                for (int k = i; k < j; k++) {
                    long v = f[i][k] + f[k + 1][j] + (s[k] - s[i - 1]) * (s[j] - s[k]);
                    if (v < best) best = v;
                }
                f[i][j] = best;
            }
        System.out.println(f[1][n]);
    }
}
'''

# ============================ 18. 爬楼梯（Ch4） ============================
SOL_PY['jump'] = '''# 爬楼梯：步长 1-3，跳过禁止位置，输出方案数。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    f = [0] * (n + 1)
    for x in data[2:]:
        f[int(x)] = -1
    if f[n] == -1:
        print(0)
        return
    f[0] = 1
    for i in range(1, n + 1):
        if f[i] == -1:
            continue
        for j in range(1, 4):
            if i - j >= 0 and f[i - j] != -1:
                f[i] += f[i - j]
    print(f[n])

if __name__ == '__main__':
    main()
'''

SOL_TS['jump'] = '''// 爬楼梯：步长 1-3，跳过禁止位置。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0];
  const f: number[] = new Array(n + 1).fill(0);
  for (let i = 2; i < data.length; i++) f[data[i]] = -1;
  if (f[n] === -1) return '0';
  f[0] = 1;
  for (let i = 1; i <= n; i++) {
    if (f[i] === -1) continue;
    for (let j = 1; j <= 3; j++) {
      if (i - j >= 0 && f[i - j] !== -1) f[i] += f[i - j];
    }
  }
  return String(f[n]);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['jump'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[] f = new long[n + 1];
        while (sc.hasNextInt()) {
            int t = sc.nextInt();
            if (t <= n) f[t] = -1;
        }
        if (f[n] == -1) { System.out.println(0); return; }
        f[0] = 1;
        for (int i = 1; i <= n; i++) {
            if (f[i] == -1) continue;
            for (int j = 1; j <= 3; j++)
                if (i - j >= 0 && f[i - j] != -1) f[i] += f[i - j];
        }
        System.out.println(f[n]);
    }
}
'''

# ============================ 19. 最大全1正方形（Ch6） ============================
SOL_PY['maxsquare'] = '''# 最大全 1 正方形：DP 边长，f[i][j] = min(上,左,左上) + 1。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, m = int(data[0]), int(data[1])
    f = [[0] * (m + 1) for _ in range(n + 1)]
    res = 0
    idx = 2
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            v = int(data[idx]); idx += 1
            if v == 1:
                f[i][j] = min(f[i - 1][j], f[i][j - 1], f[i - 1][j - 1]) + 1
                if f[i][j] > res:
                    res = f[i][j]
    print(res)

if __name__ == '__main__':
    main()
'''

SOL_TS['maxsquare'] = '''// 最大全 1 正方形：DP 边长。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], m = data[1];
  const f: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  let res = 0, idx = 2;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const v = data[idx++];
      if (v === 1) {
        f[i][j] = Math.min(f[i - 1][j], f[i][j - 1], f[i - 1][j - 1]) + 1;
        if (f[i][j] > res) res = f[i][j];
      }
    }
  }
  return String(res);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['maxsquare'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        int[][] f = new int[n + 1][m + 1];
        int res = 0;
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++) {
                int v = sc.nextInt();
                if (v == 1) {
                    f[i][j] = Math.min(Math.min(f[i - 1][j], f[i][j - 1]), f[i - 1][j - 1]) + 1;
                    res = Math.max(res, f[i][j]);
                }
            }
        System.out.println(res);
    }
}
'''

# ============================ 20. 整除判断（Ch6） ============================
SOL_PY['divisible'] = '''# 整除判断：DP 余数可达性，滚动数组。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    m = int(data[0]); i = 1; out = []
    for _ in range(m):
        n = int(data[i]); k = int(data[i + 1]); i += 2
        nums = [abs(int(x)) % k for x in data[i:i + n]]; i += n
        cur = [False] * k; cur[nums[0]] = True
        for x in nums[1:]:
            nxt = [False] * k
            for j in range(k):
                if cur[j]:
                    nxt[(j + x) % k] = True
                    nxt[(j - x) % k] = True
            cur = nxt
        out.append('Divisible' if cur[0] else 'Not divisible')
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['divisible'] = '''// 整除判断：DP 余数可达性。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  let i = 1;
  const m = data[0];
  const out: string[] = [];
  for (let g = 0; g < m; g++) {
    const n = data[i], k = data[i + 1]; i += 2;
    const nums = data.slice(i, i + n).map(x => Math.abs(x) % k); i += n;
    let cur: boolean[] = new Array(k).fill(false);
    cur[nums[0]] = true;
    for (let t = 1; t < n; t++) {
      const nxt: boolean[] = new Array(k).fill(false);
      for (let j = 0; j < k; j++) {
        if (cur[j]) {
          nxt[(j + nums[t]) % k] = true;
          nxt[(j - nums[t] + k) % k] = true;
        }
      }
      cur = nxt;
    }
    out.push(cur[0] ? 'Divisible' : 'Not divisible');
  }
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['divisible'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = sc.nextInt();
        StringBuilder sb = new StringBuilder();
        for (int g = 0; g < m; g++) {
            int n = sc.nextInt(), k = sc.nextInt();
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = Math.abs(sc.nextInt()) % k;
            boolean[] cur = new boolean[k];
            cur[nums[0]] = true;
            for (int t = 1; t < n; t++) {
                boolean[] nxt = new boolean[k];
                for (int j = 0; j < k; j++)
                    if (cur[j]) {
                        nxt[(j + nums[t]) % k] = true;
                        nxt[(j - nums[t] + k) % k] = true;
                    }
                cur = nxt;
            }
            sb.append(cur[0] ? "Divisible\\n" : "Not divisible\\n");
        }
        System.out.print(sb.toString());
    }
}
'''

# ============================ 21. 单词拆分（Ch6） ============================
SOL_PY['wordbreak'] = '''# 单词拆分：dp[i] = 前缀 s[0..i] 能否由词表拼出。
import sys

def main():
    lines = sys.stdin.read().strip().split('\\n')
    if not lines or not lines[0].strip():
        print('1')
        return
    s = lines[0].strip()
    n = int(lines[1].strip())
    words = [w.strip() for w in lines[2:2 + n]]
    m = len(s)
    ok = [False] * m
    for i in range(m):
        for w in words:
            t = len(w)
            if t == i + 1 or (t < i + 1 and ok[i - t]):
                if s[i - t + 1:i + 1] == w:
                    ok[i] = True
                    break
    print('1' if ok[m - 1] else '0')

if __name__ == '__main__':
    main()
'''

SOL_TS['wordbreak'] = '''// 单词拆分：dp[i] = 前缀能否由词表拼出。
function solve(input: string): string {
  const lines = input.trim().split(/\\n/);
  const s = lines[0].trim();
  if (!s) return '1';
  const n = Number(lines[1].trim());
  const words = lines.slice(2, 2 + n).map(w => w.trim());
  const m = s.length;
  const ok: boolean[] = new Array(m).fill(false);
  for (let i = 0; i < m; i++) {
    for (const w of words) {
      const t = w.length;
      if (t === i + 1 || (t < i + 1 && ok[i - t])) {
        if (s.slice(i - t + 1, i + 1) === w) { ok[i] = true; break; }
      }
    }
  }
  return ok[m - 1] ? '1' : '0';
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['wordbreak'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        if (s.isEmpty()) { System.out.println(1); return; }
        int n = Integer.parseInt(sc.nextLine());
        String[] words = new String[n];
        for (int i = 0; i < n; i++) words[i] = sc.nextLine().trim();
        int m = s.length();
        boolean[] ok = new boolean[m];
        for (int i = 0; i < m; i++) {
            for (String w : words) {
                int t = w.length();
                if (t == i + 1 || (t < i + 1 && ok[i - t])) {
                    if (s.substring(i - t + 1, i + 1).equals(w)) { ok[i] = true; break; }
                }
            }
        }
        System.out.println(ok[m - 1] ? 1 : 0);
    }
}
'''

# ============================ 22. 音量调节（Ch2） ============================
SOL_PY['changevolume'] = '''# 音量调节：DP 记录每首歌后可达音量集合。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, begin, maxl = int(data[0]), int(data[1]), int(data[2])
    c = [int(x) for x in data[3:3 + n]]
    cur = [False] * (maxl + 1); cur[begin] = True
    for x in c:
        nxt = [False] * (maxl + 1)
        for lv in range(maxl + 1):
            if cur[lv]:
                if lv + x <= maxl:
                    nxt[lv + x] = True
                if lv - x >= 0:
                    nxt[lv - x] = True
        cur = nxt
    for lv in range(maxl, -1, -1):
        if cur[lv]:
            print(lv)
            return
    print(-1)

if __name__ == '__main__':
    main()
'''

SOL_TS['changevolume'] = '''// 音量调节：DP 记录可达音量集合。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], begin = data[1], maxl = data[2];
  const c = data.slice(3, 3 + n);
  let cur: boolean[] = new Array(maxl + 1).fill(false);
  cur[begin] = true;
  for (const x of c) {
    const nxt: boolean[] = new Array(maxl + 1).fill(false);
    for (let lv = 0; lv <= maxl; lv++) {
      if (cur[lv]) {
        if (lv + x <= maxl) nxt[lv + x] = true;
        if (lv - x >= 0) nxt[lv - x] = true;
      }
    }
    cur = nxt;
  }
  for (let lv = maxl; lv >= 0; lv--) if (cur[lv]) return String(lv);
  return '-1';
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['changevolume'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), begin = sc.nextInt(), maxl = sc.nextInt();
        int[] c = new int[n];
        for (int i = 0; i < n; i++) c[i] = sc.nextInt();
        boolean[] cur = new boolean[maxl + 1];
        cur[begin] = true;
        for (int x : c) {
            boolean[] nxt = new boolean[maxl + 1];
            for (int lv = 0; lv <= maxl; lv++)
                if (cur[lv]) {
                    if (lv + x <= maxl) nxt[lv + x] = true;
                    if (lv - x >= 0) nxt[lv - x] = true;
                }
            cur = nxt;
        }
        for (int lv = maxl; lv >= 0; lv--)
            if (cur[lv]) { System.out.println(lv); return; }
        System.out.println(-1);
    }
}
'''

# ============================ 23. 跳石头（Ch2） ============================
SOL_PY['stonejump'] = '''# 跳石头：二分答案 + 贪心验证最少移走数。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    l, n, m = int(data[0]), int(data[1]), int(data[2])
    d = [int(x) for x in data[3:3 + n]]
    if n == 0:
        print(l)
        return
    def cnt(gap):
        count = 0; prev = 0
        for x in d:
            if x - prev < gap:
                count += 1
            else:
                prev = x
        if l - d[-1] < gap:
            count += 1
        return count
    left, right, ans = 1, l, 0
    while left <= right:
        mid = (left + right) // 2
        if cnt(mid) <= m:
            ans = mid; left = mid + 1
        else:
            right = mid - 1
    print(ans)

if __name__ == '__main__':
    main()
'''

SOL_TS['stonejump'] = '''// 跳石头：二分答案 + 贪心验证。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const l = data[0], n = data[1], m = data[2];
  const d = data.slice(3, 3 + n);
  if (n === 0) return String(l);
  const cnt = (gap: number): number => {
    let count = 0, prev = 0;
    for (const x of d) {
      if (x - prev < gap) count++;
      else prev = x;
    }
    if (l - d[n - 1] < gap) count++;
    return count;
  };
  let left = 1, right = l, ans = 0;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (cnt(mid) <= m) { ans = mid; left = mid + 1; }
    else right = mid - 1;
  }
  return String(ans);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['stonejump'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long l = sc.nextLong();
        int n = sc.nextInt(), m = sc.nextInt();
        long[] d = new long[n];
        for (int i = 0; i < n; i++) d[i] = sc.nextLong();
        if (n == 0) { System.out.println(l); return; }
        long left = 1, right = l, ans = 0;
        while (left <= right) {
            long mid = (left + right) / 2;
            long count = 0, prev = 0;
            for (long x : d) {
                if (x - prev < mid) count++;
                else prev = x;
            }
            if (l - d[n - 1] < mid) count++;
            if (count <= m) { ans = mid; left = mid + 1; }
            else right = mid - 1;
        }
        System.out.println(ans);
    }
}
'''

# ============================ 24. 三值排序（Ch2） ============================
SOL_PY['sortthree'] = '''# 三值排序：统计错位对，直接交换配对 + 循环错位 2 步。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    a = [int(x) for x in data[1:1 + n]]
    c1 = sum(1 for x in a if x == 1)
    c2 = sum(1 for x in a if x == 2)
    x12 = sum(1 for i in range(c1) if a[i] == 2)
    x13 = sum(1 for i in range(c1) if a[i] == 3)
    x21 = sum(1 for i in range(c1, c1 + c2) if a[i] == 1)
    x23 = sum(1 for i in range(c1, c1 + c2) if a[i] == 3)
    x31 = sum(1 for i in range(c1 + c2, n) if a[i] == 1)
    x32 = sum(1 for i in range(c1 + c2, n) if a[i] == 2)
    direct = min(x12, x21) + min(x13, x31) + min(x23, x32)
    print(direct + 2 * abs(x12 - x21))

if __name__ == '__main__':
    main()
'''

SOL_TS['sortthree'] = '''// 三值排序：统计错位对，直接交换 + 循环错位。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0];
  const a = data.slice(1, 1 + n);
  const c1 = a.filter(x => x === 1).length;
  const c2 = a.filter(x => x === 2).length;
  let x12 = 0, x13 = 0, x21 = 0, x23 = 0, x31 = 0, x32 = 0;
  for (let i = 0; i < c1; i++) { if (a[i] === 2) x12++; if (a[i] === 3) x13++; }
  for (let i = c1; i < c1 + c2; i++) { if (a[i] === 1) x21++; if (a[i] === 3) x23++; }
  for (let i = c1 + c2; i < n; i++) { if (a[i] === 1) x31++; if (a[i] === 2) x32++; }
  const direct = Math.min(x12, x21) + Math.min(x13, x31) + Math.min(x23, x32);
  return String(direct + 2 * Math.abs(x12 - x21));
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['sortthree'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        int c1 = 0, c2 = 0;
        for (int i = 0; i < n; i++) { a[i] = sc.nextInt(); if (a[i] == 1) c1++; else if (a[i] == 2) c2++; }
        int x12 = 0, x13 = 0, x21 = 0, x23 = 0, x31 = 0, x32 = 0;
        for (int i = 0; i < c1; i++) { if (a[i] == 2) x12++; if (a[i] == 3) x13++; }
        for (int i = c1; i < c1 + c2; i++) { if (a[i] == 1) x21++; if (a[i] == 3) x23++; }
        for (int i = c1 + c2; i < n; i++) { if (a[i] == 1) x31++; if (a[i] == 2) x32++; }
        int direct = Math.min(x12, x21) + Math.min(x13, x31) + Math.min(x23, x32);
        System.out.println(direct + 2 * Math.abs(x12 - x21));
    }
}
'''

# ============================ 25. 机器工厂（Ch2） ============================
SOL_PY['machinefactory'] = '''# 机器工厂：贪心维护本周最低单价（生产 or 上周库存+仓储）。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, s = int(data[0]), int(data[1])
    total = 0
    min_p = 10 ** 18
    i = 2
    for _ in range(n):
        p, y = int(data[i]), int(data[i + 1]); i += 2
        min_p = min(min_p + s, p)
        total += min_p * y
    print(total)

if __name__ == '__main__':
    main()
'''

SOL_TS['machinefactory'] = '''// 机器工厂：贪心维护本周最低单价。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], s = data[1];
  let total = 0, minP = Infinity, i = 2;
  for (let k = 0; k < n; k++) {
    const p = data[i], y = data[i + 1]; i += 2;
    minP = Math.min(minP + s, p);
    total += minP * y;
  }
  return String(total);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['machinefactory'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), s = sc.nextInt();
        long total = 0, minP = Long.MAX_VALUE / 2;
        for (int k = 0; k < n; k++) {
            long p = sc.nextLong(), y = sc.nextLong();
            minP = Math.min(minP + s, p);
            total += minP * y;
        }
        System.out.println(total);
    }
}
'''

# ============================ 26. 分段（Ch2） ============================
SOL_PY['segmentation'] = '''# 分段：二分最小最大段和，贪心验证段数。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, m = int(data[0]), int(data[1])
    a = [int(x) for x in data[2:2 + n]]
    def seg(ub):
        count = 0; segs = 1
        for x in a:
            if x > ub:
                return 10 ** 18
            if count + x <= ub:
                count += x
            else:
                count = x; segs += 1
        return segs
    l, r = max(a), sum(a)
    while l < r:
        mid = (l + r) // 2
        if seg(mid) <= m:
            r = mid
        else:
            l = mid + 1
    print(l)

if __name__ == '__main__':
    main()
'''

SOL_TS['segmentation'] = '''// 分段：二分最小最大段和。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], m = data[1];
  const a = data.slice(2, 2 + n);
  const seg = (ub: number): number => {
    let count = 0, segs = 1;
    for (const x of a) {
      if (x > ub) return Infinity;
      if (count + x <= ub) count += x;
      else { count = x; segs++; }
    }
    return segs;
  };
  let l = Math.max(...a), r = a.reduce((s, v) => s + v, 0);
  while (l < r) {
    const mid = Math.floor((l + r) / 2);
    if (seg(mid) <= m) r = mid;
    else l = mid + 1;
  }
  return String(l);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['segmentation'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        long[] a = new long[n];
        long l = 0, r = 0;
        for (int i = 0; i < n; i++) { a[i] = sc.nextLong(); r += a[i]; l = Math.max(l, a[i]); }
        while (l < r) {
            long mid = (l + r) / 2;
            long count = 0; int segs = 1;
            for (long x : a) {
                if (x > mid) { segs = Integer.MAX_VALUE; break; }
                if (count + x <= mid) count += x;
                else { count = x; segs++; }
            }
            if (segs <= m) r = mid;
            else l = mid + 1;
        }
        System.out.println(l);
    }
}
'''

# ============================ 27. 逃离孤岛（Ch2） ============================
SOL_PY['islandescape'] = '''# 逃离孤岛：逐秒贪心（闪现 > 走路 > 休息）。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    m, s, tt = int(data[0]), int(data[1]), int(data[2])
    dis = 0
    for i in range(1, tt + 1):
        if m >= 10:
            dis += 60; m -= 10
        elif (m < 2 and (tt - i < 3 or s - dis <= 102)
              or m < 6 and (tt - i < 2 or s - dis <= 34)
              or (tt - i == 0 or s - dis <= 17)):
            dis += 17
        else:
            m += 4
        if dis >= s:
            print('Yes')
            print(i)
            return
    print('No')
    print(dis)

if __name__ == '__main__':
    main()
'''

SOL_TS['islandescape'] = '''// 逃离孤岛：逐秒贪心。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  let m = data[0], s = data[1], tt = data[2], dis = 0;
  for (let i = 1; i <= tt; i++) {
    if (m >= 10) { dis += 60; m -= 10; }
    else if ((m < 2 && (tt - i < 3 || s - dis <= 102))
      || (m < 6 && (tt - i < 2 || s - dis <= 34))
      || (tt - i === 0 || s - dis <= 17)) {
      dis += 17;
    } else {
      m += 4;
    }
    if (dis >= s) return 'Yes\\n' + i;
  }
  return 'No\\n' + dis;
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['islandescape'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long m = sc.nextLong(), s = sc.nextLong();
        int tt = sc.nextInt();
        long dis = 0;
        for (int i = 1; i <= tt; i++) {
            if (m >= 10) { dis += 60; m -= 10; }
            else if ((m < 2 && (tt - i < 3 || s - dis <= 102))
                  || (m < 6 && (tt - i < 2 || s - dis <= 34))
                  || (tt - i == 0 || s - dis <= 17)) {
                dis += 17;
            } else {
                m += 4;
            }
            if (dis >= s) { System.out.println("Yes"); System.out.println(i); return; }
        }
        System.out.println("No");
        System.out.println(dis);
    }
}
'''

# ============================ 28. 抄书（Ch2） ============================
SOL_PY['bookcopy'] = '''# 抄书：二分最小最大抄页数，从后往前贪心划分（靠后的人多抄）。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    m, k = int(data[0]), int(data[1])
    b = [int(x) for x in data[2:2 + m]]
    tot = sum(b)
    l, r = tot // k, tot
    resp = [0] * (m + 1)
    best = 10 ** 18
    while l < r:
        mid = (l + r) // 2
        seg = 1; count = 0
        period = [0] * (m + 1)
        for i in range(m - 1, -1, -1):
            if b[i] > mid:
                seg = 10 ** 18
                break
            if count + b[i] <= mid:
                count += b[i]
            else:
                count = b[i]
                period[seg] = i + 1
                seg += 1
        if seg == k and mid < best:
            best = mid
            resp = period[:]
        if seg <= k:
            r = mid
        else:
            l = mid + 1
    resp[0] = m
    resp[k] = 0
    out = []
    for i in range(k - 1, -1, -1):
        out.append(f"{resp[i + 1] + 1} {resp[i]}")
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['bookcopy'] = '''// 抄书：二分 + 从后往前贪心划分。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const m = data[0], k = data[1];
  const b = data.slice(2, 2 + m);
  const tot = b.reduce((s, v) => s + v, 0);
  let l = Math.floor(tot / k), r = tot;
  let resp: number[] = new Array(m + 1).fill(0);
  let best = Infinity;
  while (l < r) {
    const mid = Math.floor((l + r) / 2);
    let seg = 1, count = 0;
    const period: number[] = new Array(m + 1).fill(0);
    let ok = true;
    for (let i = m - 1; i >= 0; i--) {
      if (b[i] > mid) { seg = Infinity; ok = false; break; }
      if (count + b[i] <= mid) count += b[i];
      else { count = b[i]; period[seg] = i + 1; seg++; }
    }
    if (ok && seg === k && mid < best) { best = mid; resp = period.slice(); }
    if (seg <= k) r = mid;
    else l = mid + 1;
  }
  resp[0] = m; resp[k] = 0;
  const out: string[] = [];
  for (let i = k - 1; i >= 0; i--) out.push(`${resp[i + 1] + 1} ${resp[i]}`);
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['bookcopy'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = sc.nextInt(), k = sc.nextInt();
        int[] b = new int[m];
        long tot = 0;
        for (int i = 0; i < m; i++) { b[i] = sc.nextInt(); tot += b[i]; }
        long l = tot / k, r = tot;
        int[] resp = new int[m + 1];
        long best = Long.MAX_VALUE;
        while (l < r) {
            long mid = (l + r) / 2;
            int seg = 1; long count = 0;
            int[] period = new int[m + 1];
            for (int i = m - 1; i >= 0; i--) {
                if (b[i] > mid) { seg = Integer.MAX_VALUE; break; }
                if (count + b[i] <= mid) count += b[i];
                else { count = b[i]; period[seg] = i + 1; seg++; }
            }
            if (seg == k && mid < best) { best = mid; resp = period.clone(); }
            if (seg <= k) r = mid;
            else l = mid + 1;
        }
        resp[0] = m; resp[k] = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = k - 1; i >= 0; i--) sb.append(resp[i + 1] + 1).append(' ').append(resp[i]).append('\\n');
        System.out.print(sb.toString());
    }
}
'''

# ============================ 29. 买干草（Ch2，原随机 → 确定性完全背包） ============================
SOL_PY['buyinghay'] = '''# 买干草：完全背包，f[j] = 恰好 j 磅的最小花费，允许超买。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, h = int(data[0]), int(data[1])
    ps = []; cs = []
    i = 2
    for _ in range(n):
        ps.append(int(data[i])); cs.append(int(data[i + 1])); i += 2
    maxp = max(ps)
    H = h + maxp - 1
    INF = 10 ** 18
    f = [INF] * (H + 1); f[0] = 0
    for p, c in zip(ps, cs):
        for j in range(H - p + 1):
            if f[j] + c < f[j + p]:
                f[j + p] = f[j] + c
    print(min(f[h:]))

if __name__ == '__main__':
    main()
'''

SOL_TS['buyinghay'] = '''// 买干草：完全背包，允许超买。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], h = data[1];
  const ps: number[] = [], cs: number[] = [];
  let i = 2;
  let maxp = 0;
  for (let k = 0; k < n; k++) { ps.push(data[i]); cs.push(data[i + 1]); maxp = Math.max(maxp, data[i]); i += 2; }
  const H = h + maxp - 1;
  const f: number[] = new Array(H + 1).fill(Infinity);
  f[0] = 0;
  for (let k = 0; k < n; k++) {
    for (let j = 0; j <= H - ps[k]; j++) {
      if (f[j] + cs[k] < f[j + ps[k]]) f[j + ps[k]] = f[j] + cs[k];
    }
  }
  let res = Infinity;
  for (let j = h; j <= H; j++) res = Math.min(res, f[j]);
  return String(res);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['buyinghay'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), h = sc.nextInt();
        int[] ps = new int[n], cs = new int[n];
        int maxp = 0;
        for (int i = 0; i < n; i++) { ps[i] = sc.nextInt(); cs[i] = sc.nextInt(); maxp = Math.max(maxp, ps[i]); }
        int H = h + maxp - 1;
        long[] f = new long[H + 1];
        Arrays.fill(f, Long.MAX_VALUE / 2);
        f[0] = 0;
        for (int i = 0; i < n; i++)
            for (int j = 0; j <= H - ps[i]; j++)
                if (f[j] + cs[i] < f[j + ps[i]]) f[j + ps[i]] = f[j] + cs[i];
        long res = Long.MAX_VALUE / 2;
        for (int j = h; j <= H; j++) res = Math.min(res, f[j]);
        System.out.println(res);
    }
}
'''

# ============================ 30. 疾病传播（Ch3） ============================
SOL_PY['disease'] = '''# 疾病传播：BFS 全传播，输出所有感染者。
import sys
from collections import deque

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, m = int(data[0]), int(data[1])
    graph = {}
    i = 2
    for v in range(1, n + 1):
        deg = int(data[i]); i += 1
        graph[v] = [int(x) for x in data[i:i + deg]]; i += deg
    infected = [False] * (n + 1)
    q = deque()
    for _ in range(m):
        x = int(data[i]); i += 1
        infected[x] = True; q.append(x)
    while q:
        v = q.popleft()
        for nb in graph[v]:
            if not infected[nb]:
                infected[nb] = True; q.append(nb)
    print('\\n'.join(str(x) for x in range(1, n + 1) if infected[x]))

if __name__ == '__main__':
    main()
'''

SOL_TS['disease'] = '''// 疾病传播：BFS 全传播。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], m = data[1];
  const graph: number[][] = Array.from({ length: n + 1 }, () => []);
  let i = 2;
  for (let v = 1; v <= n; v++) {
    const deg = data[i++];
    for (let k = 0; k < deg; k++) graph[v].push(data[i++]);
  }
  const infected: boolean[] = new Array(n + 1).fill(false);
  const q: number[] = [];
  for (let k = 0; k < m; k++) { const x = data[i++]; infected[x] = true; q.push(x); }
  while (q.length) {
    const v = q.shift()!;
    for (const nb of graph[v]) {
      if (!infected[nb]) { infected[nb] = true; q.push(nb); }
    }
  }
  const out: string[] = [];
  for (let x = 1; x <= n; x++) if (infected[x]) out.push(String(x));
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['disease'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        List<Integer>[] graph = new List[n + 1];
        for (int i = 1; i <= n; i++) graph[i] = new ArrayList<>();
        for (int v = 1; v <= n; v++) {
            int deg = sc.nextInt();
            for (int k = 0; k < deg; k++) graph[v].add(sc.nextInt());
        }
        boolean[] inf = new boolean[n + 1];
        Deque<Integer> q = new ArrayDeque<>();
        for (int k = 0; k < m; k++) { int x = sc.nextInt(); inf[x] = true; q.add(x); }
        while (!q.isEmpty()) {
            int v = q.poll();
            for (int nb : graph[v]) if (!inf[nb]) { inf[nb] = true; q.add(nb); }
        }
        StringBuilder sb = new StringBuilder();
        for (int x = 1; x <= n; x++) if (inf[x]) sb.append(x).append('\\n');
        System.out.print(sb.toString());
    }
}
'''

# ============================ 31. 疾病传播 II（Ch3） ============================
SOL_PY['disease2'] = '''# 疾病传播 II：BFS 限 2 层。
import sys
from collections import deque

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, m = int(data[0]), int(data[1])
    graph = {}
    i = 2
    for v in range(1, n + 1):
        deg = int(data[i]); i += 1
        graph[v] = [int(x) for x in data[i:i + deg]]; i += deg
    infected = [False] * (n + 1)
    q = deque()
    for _ in range(m):
        x = int(data[i]); i += 1
        infected[x] = True; q.append((x, 0))
    while q:
        v, st = q.popleft()
        if st == 2:
            continue
        for nb in graph[v]:
            if not infected[nb]:
                infected[nb] = True; q.append((nb, st + 1))
    print('\\n'.join(str(x) for x in range(1, n + 1) if infected[x]))

if __name__ == '__main__':
    main()
'''

SOL_TS['disease2'] = '''// 疾病传播 II：BFS 限 2 层。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], m = data[1];
  const graph: number[][] = Array.from({ length: n + 1 }, () => []);
  let i = 2;
  for (let v = 1; v <= n; v++) {
    const deg = data[i++];
    for (let k = 0; k < deg; k++) graph[v].push(data[i++]);
  }
  const infected: boolean[] = new Array(n + 1).fill(false);
  const q: [number, number][] = [];
  for (let k = 0; k < m; k++) { const x = data[i++]; infected[x] = true; q.push([x, 0]); }
  while (q.length) {
    const [v, st] = q.shift()!;
    if (st === 2) continue;
    for (const nb of graph[v]) {
      if (!infected[nb]) { infected[nb] = true; q.push([nb, st + 1]); }
    }
  }
  const out: string[] = [];
  for (let x = 1; x <= n; x++) if (infected[x]) out.push(String(x));
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['disease2'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        List<Integer>[] graph = new List[n + 1];
        for (int i = 1; i <= n; i++) graph[i] = new ArrayList<>();
        for (int v = 1; v <= n; v++) {
            int deg = sc.nextInt();
            for (int k = 0; k < deg; k++) graph[v].add(sc.nextInt());
        }
        boolean[] inf = new boolean[n + 1];
        Deque<int[]> q = new ArrayDeque<>();
        for (int k = 0; k < m; k++) { int x = sc.nextInt(); inf[x] = true; q.add(new int[]{x, 0}); }
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int v = cur[0], st = cur[1];
            if (st == 2) continue;
            for (int nb : graph[v]) if (!inf[nb]) { inf[nb] = true; q.add(new int[]{nb, st + 1}); }
        }
        StringBuilder sb = new StringBuilder();
        for (int x = 1; x <= n; x++) if (inf[x]) sb.append(x).append('\\n');
        System.out.print(sb.toString());
    }
}
'''

# ============================ 32. 能被13整除（Ch3） ============================
SOL_PY['div13'] = '''# 能被 13 整除的排列前缀：DFS 枚举 + 逐层判断。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    a = [int(x) for x in data[:10]]
    n = sum(a)
    out = []
    b = [0] * n
    def judge(k):
        x = 0
        for i in range(k + 1):
            x = (x * 10 + b[i]) % 13
        if x == 0:
            out.append(''.join(str(v) for v in b[:k + 1]))
    def search(k):
        if k == n:
            return
        for i in range(10):
            if a[i] > 0:
                if k == 0 and i == 0:
                    continue
                a[i] -= 1
                b[k] = i
                judge(k)
                search(k + 1)
                a[i] += 1
    search(0)
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['div13'] = '''// 能被 13 整除的排列前缀：DFS。
function solve(input: string): string {
  const a = input.trim().split(/\\s+/).map(Number).slice(0, 10);
  const n = a.reduce((s, v) => s + v, 0);
  const out: string[] = [];
  const b: number[] = new Array(n).fill(0);
  const judge = (k: number) => {
    let x = 0;
    for (let i = 0; i <= k; i++) x = (x * 10 + b[i]) % 13;
    if (x === 0) out.push(b.slice(0, k + 1).join(''));
  };
  const search = (k: number) => {
    if (k === n) return;
    for (let i = 0; i < 10; i++) {
      if (a[i] > 0) {
        if (k === 0 && i === 0) continue;
        a[i]--;
        b[k] = i;
        judge(k);
        search(k + 1);
        a[i]++;
      }
    }
  };
  search(0);
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['div13'] = '''import java.util.*;

public class Main {
    static int[] a = new int[10];
    static int n;
    static int[] b;
    static StringBuilder out = new StringBuilder();
    static void judge(int k) {
        int x = 0;
        for (int i = 0; i <= k; i++) x = (x * 10 + b[i]) % 13;
        if (x == 0) {
            for (int i = 0; i <= k; i++) out.append(b[i]);
            out.append('\\n');
        }
    }
    static void search(int k) {
        if (k == n) return;
        for (int i = 0; i < 10; i++) {
            if (a[i] > 0) {
                if (k == 0 && i == 0) continue;
                a[i]--; b[k] = i;
                judge(k);
                search(k + 1);
                a[i]++;
            }
        }
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        for (int i = 0; i < 10; i++) { a[i] = sc.nextInt(); n += a[i]; }
        b = new int[n];
        search(0);
        System.out.print(out.toString());
    }
}
'''

# ============================ 33. 图 DFS 遍历（Ch3） ============================
SOL_PY['graphtraversal'] = '''# 图 DFS 遍历：邻居升序访问，输出访问顺序。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, m = int(data[0]), int(data[1])
    g = [[False] * n for _ in range(n)]
    i = 2
    for _ in range(m):
        x, y = int(data[i]), int(data[i + 1]); i += 2
        g[x][y] = g[y][x] = True
    visited = [False] * n
    order = []
    def dfs(k):
        order.append(k)
        for j in range(n):
            if g[k][j] and not visited[j]:
                visited[j] = True
                dfs(j)
    visited[0] = True
    dfs(0)
    print(' '.join(str(x) for x in order))

if __name__ == '__main__':
    main()
'''

SOL_TS['graphtraversal'] = '''// 图 DFS 遍历：邻居升序。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], m = data[1];
  const g: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));
  let i = 2;
  for (let k = 0; k < m; k++) {
    const x = data[i], y = data[i + 1]; i += 2;
    g[x][y] = g[y][x] = true;
  }
  const visited: boolean[] = new Array(n).fill(false);
  const order: number[] = [];
  const dfs = (k: number) => {
    order.push(k);
    for (let j = 0; j < n; j++) {
      if (g[k][j] && !visited[j]) { visited[j] = true; dfs(j); }
    }
  };
  visited[0] = true;
  dfs(0);
  return order.join(' ');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['graphtraversal'] = '''import java.util.*;

public class Main {
    static boolean[][] g;
    static boolean[] vis;
    static List<Integer> order = new ArrayList<>();
    static int n;
    static void dfs(int k) {
        order.add(k);
        for (int j = 0; j < n; j++) if (g[k][j] && !vis[j]) { vis[j] = true; dfs(j); }
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        int m = sc.nextInt();
        g = new boolean[n][n];
        for (int k = 0; k < m; k++) {
            int x = sc.nextInt(), y = sc.nextInt();
            g[x][y] = g[y][x] = true;
        }
        vis = new boolean[n];
        vis[0] = true;
        dfs(0);
        StringBuilder sb = new StringBuilder();
        for (int v : order) sb.append(v).append(' ');
        System.out.println(sb.toString().trim());
    }
}
'''

# ============================ 34. 点灯（Ch3） ============================
SOL_PY['lights'] = '''# 点灯：3×3 BFS 求全亮最少步数。
import sys
from collections import deque

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    st = tuple(int(x) for x in data[:9])
    final = (1,) * 9
    if st == final:
        print(0)
        return
    q = deque([(st, 0)])
    seen = {st}
    while q:
        state, step = q.popleft()
        for op in range(9):
            tmp = list(state)
            tmp[op] = 1 - tmp[op]
            if op % 3 != 0: tmp[op - 1] = 1 - tmp[op - 1]
            if op % 3 != 2: tmp[op + 1] = 1 - tmp[op + 1]
            if op > 2: tmp[op - 3] = 1 - tmp[op - 3]
            if op < 6: tmp[op + 3] = 1 - tmp[op + 3]
            ns = tuple(tmp)
            if ns == final:
                print(step + 1)
                return
            if ns not in seen:
                seen.add(ns); q.append((ns, step + 1))
    print(-1)

if __name__ == '__main__':
    main()
'''

SOL_TS['lights'] = '''// 点灯：3×3 BFS。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const key = (s: number[]) => s.join(',');
  const start = data.slice(0, 9);
  const final = new Array(9).fill(1);
  if (key(start) === key(final)) return '0';
  const seen = new Set<string>([key(start)]);
  const q: [number[], number][] = [[start, 0]];
  while (q.length) {
    const [state, step] = q.shift()!;
    for (let op = 0; op < 9; op++) {
      const tmp = state.slice();
      tmp[op] = 1 - tmp[op];
      if (op % 3 !== 0) tmp[op - 1] = 1 - tmp[op - 1];
      if (op % 3 !== 2) tmp[op + 1] = 1 - tmp[op + 1];
      if (op > 2) tmp[op - 3] = 1 - tmp[op - 3];
      if (op < 6) tmp[op + 3] = 1 - tmp[op + 3];
      if (key(tmp) === key(final)) return String(step + 1);
      const k = key(tmp);
      if (!seen.has(k)) { seen.add(k); q.push([tmp, step + 1]); }
    }
  }
  return '-1';
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['lights'] = '''import java.util.*;

public class Main {
    static String key(int[] s) {
        StringBuilder sb = new StringBuilder();
        for (int v : s) sb.append(v).append(',');
        return sb.toString();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] start = new int[9];
        for (int i = 0; i < 9; i++) start[i] = sc.nextInt();
        int[] finalState = new int[9];
        Arrays.fill(finalState, 1);
        if (key(start).equals(key(finalState))) { System.out.println(0); return; }
        Set<String> seen = new HashSet<>();
        seen.add(key(start));
        Deque<Object[]> q = new ArrayDeque<>();
        q.add(new Object[]{start, 0});
        while (!q.isEmpty()) {
            Object[] cur = q.poll();
            int[] state = (int[]) cur[0];
            int step = (Integer) cur[1];
            for (int op = 0; op < 9; op++) {
                int[] tmp = state.clone();
                tmp[op] = 1 - tmp[op];
                if (op % 3 != 0) tmp[op - 1] = 1 - tmp[op - 1];
                if (op % 3 != 2) tmp[op + 1] = 1 - tmp[op + 1];
                if (op > 2) tmp[op - 3] = 1 - tmp[op - 3];
                if (op < 6) tmp[op + 3] = 1 - tmp[op + 3];
                if (key(tmp).equals(key(finalState))) { System.out.println(step + 1); return; }
                String k = key(tmp);
                if (!seen.contains(k)) { seen.add(k); q.add(new Object[]{tmp, step + 1}); }
            }
        }
        System.out.println(-1);
    }
}
'''

# ============================ 35. 线段覆盖（Ch3） ============================
SOL_PY['linecover'] = '''# 线段覆盖：DFS 求覆盖全部点的最少线段数。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    m, n = int(data[0]), int(data[1])
    point = [int(x) for x in data[2:2 + m]]
    length = [int(x) for x in data[2 + m:2 + m + n]]
    used = [False] * n
    best = n
    def dfs(k, cnt):
        nonlocal best
        if cnt >= best:
            return
        if k == m - 1:
            best = cnt
            return
        for i in range(n):
            if used[i]:
                continue
            used[i] = True
            r = point[k] + length[i]
            t2 = k + 1
            while t2 < m - 1 and point[t2 + 1] <= r:
                t2 += 1
            dfs(t2, cnt + 1)
            used[i] = False
    dfs(0, 0)
    print(best)

if __name__ == '__main__':
    main()
'''

SOL_TS['linecover'] = '''// 线段覆盖：DFS。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const m = data[0], n = data[1];
  const point = data.slice(2, 2 + m);
  const length = data.slice(2 + m, 2 + m + n);
  const used: boolean[] = new Array(n).fill(false);
  let best = n;
  const dfs = (k: number, cnt: number) => {
    if (cnt >= best) return;
    if (k === m - 1) { best = cnt; return; }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      const r = point[k] + length[i];
      let t2 = k + 1;
      while (t2 < m - 1 && point[t2 + 1] <= r) t2++;
      dfs(t2, cnt + 1);
      used[i] = false;
    }
  };
  dfs(0, 0);
  return String(best);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['linecover'] = '''import java.util.*;

public class Main {
    static int m, n, best;
    static int[] point, length;
    static boolean[] used;
    static void dfs(int k, int cnt) {
        if (cnt >= best) return;
        if (k == m - 1) { best = cnt; return; }
        for (int i = 0; i < n; i++) {
            if (used[i]) continue;
            used[i] = true;
            int r = point[k] + length[i];
            int t2 = k + 1;
            while (t2 < m - 1 && point[t2 + 1] <= r) t2++;
            dfs(t2, cnt + 1);
            used[i] = false;
        }
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        m = sc.nextInt(); n = sc.nextInt();
        point = new int[m];
        length = new int[n];
        for (int i = 0; i < m; i++) point[i] = sc.nextInt();
        for (int i = 0; i < n; i++) length[i] = sc.nextInt();
        used = new boolean[n];
        best = n;
        dfs(0, 0);
        System.out.println(best);
    }
}
'''

# ============================ 36. 全排列（Ch3） ============================
SOL_PY['permutation'] = '''# 全排列：DFS 字典序输出 1..n 的所有排列。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    out = []
    a = []
    used = [True] * (n + 1)
    def dfs(k):
        if k == n:
            out.append(' '.join(str(x) for x in a))
            return
        for i in range(1, n + 1):
            if used[i]:
                a.append(i); used[i] = False
                dfs(k + 1)
                used[i] = True; a.pop()
    dfs(0)
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['permutation'] = '''// 全排列：DFS 字典序。
function solve(input: string): string {
  const n = Number(input.trim().split(/\\s+/)[0]);
  const out: string[] = [];
  const a: number[] = [];
  const used: boolean[] = new Array(n + 1).fill(true);
  const dfs = (k: number) => {
    if (k === n) { out.push(a.join(' ')); return; }
    for (let i = 1; i <= n; i++) {
      if (used[i]) {
        a.push(i); used[i] = false;
        dfs(k + 1);
        used[i] = true; a.pop();
      }
    }
  };
  dfs(0);
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['permutation'] = '''import java.util.*;

public class Main {
    static int n;
    static boolean[] used;
    static List<Integer> a = new ArrayList<>();
    static StringBuilder out = new StringBuilder();
    static void dfs(int k) {
        if (k == n) {
            for (int i = 0; i < n; i++) out.append(a.get(i)).append(i == n - 1 ? '\\n' : ' ');
            return;
        }
        for (int i = 1; i <= n; i++) {
            if (used[i]) {
                a.add(i); used[i] = false;
                dfs(k + 1);
                used[i] = true; a.remove(a.size() - 1);
            }
        }
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        used = new boolean[n + 1];
        Arrays.fill(used, true);
        dfs(0);
        System.out.print(out.toString());
    }
}
'''

# ============================ 37. 单词覆盖链（Ch4） ============================
SOL_PY['wordsequence'] = '''# 单词覆盖链：按长度排序，DP 求最长覆盖链并输出。
import sys

def main():
    raw = sys.stdin.read()
    words = [ln.strip() for ln in raw.split('\\n') if ln.strip()]
    if not words:
        return
    words.sort(key=len)
    n = len(words)
    cc = [[0] * 26 for _ in range(n)]
    for i, w in enumerate(words):
        for ch in w:
            cc[i][ord(ch) - 97] += 1
    f = [1] * n
    pre = list(range(n))
    for i in range(n):
        for j in range(i):
            if all(cc[i][c] >= cc[j][c] for c in range(26)):
                if f[j] + 1 > f[i]:
                    f[i] = f[j] + 1
                    pre[i] = j
    res = 0
    for i in range(n):
        if f[i] > f[res]:
            res = i
    chain = []
    x = res
    while True:
        chain.append(words[x])
        if pre[x] == x:
            break
        x = pre[x]
    chain.reverse()
    print(len(chain))
    for w in chain:
        print(w)

if __name__ == '__main__':
    main()
'''

SOL_TS['wordsequence'] = '''// 单词覆盖链：DP 最长链。
function solve(input: string): string {
  const words = input.split(/\\n/).map(w => w.trim()).filter(w => w.length > 0);
  if (words.length === 0) return '';
  words.sort((a, b) => a.length - b.length);
  const n = words.length;
  const cc: number[][] = Array.from({ length: n }, () => new Array(26).fill(0));
  for (let i = 0; i < n; i++)
    for (const ch of words[i]) cc[i][ch.charCodeAt(0) - 97]++;
  const f: number[] = new Array(n).fill(1);
  const pre: number[] = Array.from({ length: n }, (_, k) => k);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      let ok = true;
      for (let c = 0; c < 26; c++) if (cc[i][c] < cc[j][c]) { ok = false; break; }
      if (ok && f[j] + 1 > f[i]) { f[i] = f[j] + 1; pre[i] = j; }
    }
  }
  let res = 0;
  for (let i = 0; i < n; i++) if (f[i] > f[res]) res = i;
  const chain: string[] = [];
  let x = res;
  while (true) {
    chain.push(words[x]);
    if (pre[x] === x) break;
    x = pre[x];
  }
  chain.reverse();
  return String(chain.length) + '\\n' + chain.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['wordsequence'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<String> list = new ArrayList<>();
        while (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            if (!line.isEmpty()) list.add(line);
        }
        if (list.isEmpty()) return;
        list.sort(Comparator.comparingInt(String::length));
        int n = list.size();
        int[][] cc = new int[n][26];
        for (int i = 0; i < n; i++)
            for (char ch : list.get(i).toCharArray()) cc[i][ch - 'a']++;
        int[] f = new int[n];
        int[] pre = new int[n];
        Arrays.fill(f, 1);
        for (int i = 0; i < n; i++) pre[i] = i;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                boolean ok = true;
                for (int c = 0; c < 26; c++) if (cc[i][c] < cc[j][c]) { ok = false; break; }
                if (ok && f[j] + 1 > f[i]) { f[i] = f[j] + 1; pre[i] = j; }
            }
        }
        int res = 0;
        for (int i = 0; i < n; i++) if (f[i] > f[res]) res = i;
        List<String> chain = new ArrayList<>();
        int x = res;
        while (true) {
            chain.add(list.get(x));
            if (pre[x] == x) break;
            x = pre[x];
        }
        Collections.reverse(chain);
        System.out.println(chain.size());
        for (String w : chain) System.out.println(w);
    }
}
'''

# ============================ 38. 玉米田（Ch6） ============================
SOL_PY['cornfield'] = '''# 玉米田：状压 DP 方案数（无相邻、不种贫瘠），MOD=1e8。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    m, n = int(data[0]), int(data[1])
    field = []
    idx = 2
    for _ in range(m):
        row = 0
        for j in range(n):
            v = int(data[idx]); idx += 1
            row = (row << 1) + (1 - v)
        field.append(row)
    MOD = 100000000
    states = [s for s in range(1 << n) if not (s & (s << 1))]
    f = [[0] * (1 << n) for _ in range(m)]
    for s in states:
        if not (s & field[0]):
            f[0][s] = 1
    for r in range(1, m):
        for sj in states:
            if f[r - 1][sj]:
                for sk in states:
                    if (sk & sj) or (sk & field[r]):
                        continue
                    f[r][sk] = (f[r][sk] + f[r - 1][sj]) % MOD
    print(sum(f[m - 1][s] for s in states) % MOD)

if __name__ == '__main__':
    main()
'''

SOL_TS['cornfield'] = '''// 玉米田：状压 DP。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const m = data[0], n = data[1];
  const field: number[] = [];
  let idx = 2;
  for (let r = 0; r < m; r++) {
    let row = 0;
    for (let j = 0; j < n; j++) { row = (row << 1) + (1 - data[idx++]); }
    field.push(row);
  }
  const MOD = 100000000;
  const states: number[] = [];
  for (let s = 0; s < (1 << n); s++) if (!(s & (s << 1))) states.push(s);
  const f: number[][] = Array.from({ length: m }, () => new Array(1 << n).fill(0));
  for (const s of states) if (!(s & field[0])) f[0][s] = 1;
  for (let r = 1; r < m; r++) {
    for (const sj of states) {
      if (f[r - 1][sj]) {
        for (const sk of states) {
          if ((sk & sj) || (sk & field[r])) continue;
          f[r][sk] = (f[r][sk] + f[r - 1][sj]) % MOD;
        }
      }
    }
  }
  let res = 0;
  for (const s of states) res = (res + f[m - 1][s]) % MOD;
  return String(res);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['cornfield'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = sc.nextInt(), n = sc.nextInt();
        int[] field = new int[m];
        for (int r = 0; r < m; r++) {
            int row = 0;
            for (int j = 0; j < n; j++) row = (row << 1) + (1 - sc.nextInt());
            field[r] = row;
        }
        final int MOD = 100000000;
        List<Integer> states = new ArrayList<>();
        for (int s = 0; s < (1 << n); s++) if ((s & (s << 1)) == 0) states.add(s);
        int[][] f = new int[m][1 << n];
        for (int s : states) if ((s & field[0]) == 0) f[0][s] = 1;
        for (int r = 1; r < m; r++)
            for (int sj : states) {
                if (f[r - 1][sj] == 0) continue;
                for (int sk : states) {
                    if ((sk & sj) != 0 || (sk & field[r]) != 0) continue;
                    f[r][sk] = (f[r][sk] + f[r - 1][sj]) % MOD;
                }
            }
        int res = 0;
        for (int s : states) res = (res + f[m - 1][s]) % MOD;
        System.out.println(res);
    }
}
'''

# ============================ 39. 字符串压缩（Ch6） ============================
SOL_PY['compression'] = '''# 字符串压缩：区间 DP，k(内容) 循环压缩。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    s = data[0]
    n = len(s)
    f = [[0] * n for _ in range(n)]
    for i in range(n):
        f[i][i] = 1
    def is_repeat(left, mid, right):
        if mid < (left + right + 1) // 2:
            t = mid + 1 - left
            if (right - mid) % t != 0:
                return False
            for i in range(right - mid):
                if s[mid + 1 + i] != s[left + (i % t)]:
                    return False
        else:
            t = right - mid
            if (mid + 1 - left) % t != 0:
                return False
            for i in range(mid - left + 1):
                if s[left + i] != s[mid + 1 + (i % t)]:
                    return False
        return True
    def calc_len(left, mid, right):
        if mid < (left + right + 1) // 2:
            base = f[left][mid]
            times = (right - left + 1) // (mid - left + 1)
        else:
            base = f[mid + 1][right]
            times = (right - left + 1) // (right - mid)
        return base + 3 + (1 if times >= 10 else 0) + (1 if times >= 100 else 0)
    for length in range(1, n):
        for i in range(n - length):
            j = i + length
            f[i][j] = length + 1
            for k in range(i, j):
                v = f[i][k] + f[k + 1][j]
                if v < f[i][j]:
                    f[i][j] = v
                if is_repeat(i, k, j):
                    v2 = calc_len(i, k, j)
                    if v2 < f[i][j]:
                        f[i][j] = v2
    print(f[0][n - 1])

if __name__ == '__main__':
    main()
'''

SOL_TS['compression'] = '''// 字符串压缩：区间 DP。
function solve(input: string): string {
  const s = input.trim().split(/\\s+/)[0];
  const n = s.length;
  const f: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) f[i][i] = 1;
  const isRepeat = (left: number, mid: number, right: number): boolean => {
    if (mid < Math.floor((left + right + 1) / 2)) {
      const t = mid + 1 - left;
      if ((right - mid) % t !== 0) return false;
      for (let i = 0; i < right - mid; i++) if (s[mid + 1 + i] !== s[left + (i % t)]) return false;
    } else {
      const t = right - mid;
      if ((mid + 1 - left) % t !== 0) return false;
      for (let i = 0; i <= mid - left; i++) if (s[left + i] !== s[mid + 1 + (i % t)]) return false;
    }
    return true;
  };
  const calcLen = (left: number, mid: number, right: number): number => {
    let base: number, times: number;
    if (mid < Math.floor((left + right + 1) / 2)) {
      base = f[left][mid];
      times = Math.floor((right - left + 1) / (mid - left + 1));
    } else {
      base = f[mid + 1][right];
      times = Math.floor((right - left + 1) / (right - mid));
    }
    return base + 3 + (times >= 10 ? 1 : 0) + (times >= 100 ? 1 : 0);
  };
  for (let len = 1; len < n; len++) {
    for (let i = 0; i < n - len; i++) {
      const j = i + len;
      f[i][j] = len + 1;
      for (let k = i; k < j; k++) {
        const v = f[i][k] + f[k + 1][j];
        if (v < f[i][j]) f[i][j] = v;
        if (isRepeat(i, k, j)) {
          const v2 = calcLen(i, k, j);
          if (v2 < f[i][j]) f[i][j] = v2;
        }
      }
    }
  }
  return String(f[0][n - 1]);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['compression'] = '''import java.util.*;

public class Main {
    static String s;
    static int[][] f;
    static boolean isRepeat(int left, int mid, int right) {
        if (mid < (left + right + 1) / 2) {
            int t = mid + 1 - left;
            if ((right - mid) % t != 0) return false;
            for (int i = 0; i < right - mid; i++) if (s.charAt(mid + 1 + i) != s.charAt(left + (i % t))) return false;
        } else {
            int t = right - mid;
            if ((mid + 1 - left) % t != 0) return false;
            for (int i = 0; i <= mid - left; i++) if (s.charAt(left + i) != s.charAt(mid + 1 + (i % t))) return false;
        }
        return true;
    }
    static int calcLen(int left, int mid, int right) {
        int base, times;
        if (mid < (left + right + 1) / 2) {
            base = f[left][mid];
            times = (right - left + 1) / (mid - left + 1);
        } else {
            base = f[mid + 1][right];
            times = (right - left + 1) / (right - mid);
        }
        return base + 3 + (times >= 10 ? 1 : 0) + (times >= 100 ? 1 : 0);
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        s = sc.next();
        int n = s.length();
        f = new int[n][n];
        for (int i = 0; i < n; i++) f[i][i] = 1;
        for (int len = 1; len < n; len++) {
            for (int i = 0; i < n - len; i++) {
                int j = i + len;
                f[i][j] = len + 1;
                for (int k = i; k < j; k++) {
                    int v = f[i][k] + f[k + 1][j];
                    if (v < f[i][j]) f[i][j] = v;
                    if (isRepeat(i, k, j)) {
                        int v2 = calcLen(i, k, j);
                        if (v2 < f[i][j]) f[i][j] = v2;
                    }
                }
            }
        }
        System.out.println(f[0][n - 1]);
    }
}
'''

# ============================ 40. 唯一字符计数（Ch6） ============================
SOL_PY['uniquechar'] = '''# 唯一字符计数：贡献法（上次/下次出现位置）。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    s = data[0]
    MOD = 1000000007
    n = len(s)
    pos = [[] for _ in range(26)]
    for i, ch in enumerate(s):
        pos[ord(ch) - 65].append(i)
    res = 0
    for arr in pos:
        for k, i in enumerate(arr):
            left = i - (arr[k - 1] if k > 0 else -1)
            right = (arr[k + 1] if k + 1 < len(arr) else n) - i
            res = (res + left * right) % MOD
    print(res)

if __name__ == '__main__':
    main()
'''

SOL_TS['uniquechar'] = '''// 唯一字符计数：贡献法。
function solve(input: string): string {
  const s = input.trim().split(/\\s+/)[0];
  const MOD = 1000000007;
  const n = s.length;
  const pos: number[][] = Array.from({ length: 26 }, () => []);
  for (let i = 0; i < n; i++) pos[s.charCodeAt(i) - 65].push(i);
  let res = 0;
  for (const arr of pos) {
    for (let k = 0; k < arr.length; k++) {
      const i = arr[k];
      const left = i - (k > 0 ? arr[k - 1] : -1);
      const right = (k + 1 < arr.length ? arr[k + 1] : n) - i;
      res = (res + left * right) % MOD;
    }
  }
  return String(res);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['uniquechar'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        final int MOD = 1000000007;
        int n = s.length();
        List<List<Integer>> pos = new ArrayList<>();
        for (int i = 0; i < 26; i++) pos.add(new ArrayList<>());
        for (int i = 0; i < n; i++) pos.get(s.charAt(i) - 'A').add(i);
        long res = 0;
        for (List<Integer> arr : pos) {
            for (int k = 0; k < arr.size(); k++) {
                int i = arr.get(k);
                int left = i - (k > 0 ? arr.get(k - 1) : -1);
                int right = (k + 1 < arr.size() ? arr.get(k + 1) : n) - i;
                res = (res + (long) left * right) % MOD;
            }
        }
        System.out.println(res);
    }
}
'''

# ============================ 41. 正则匹配（Ch6） ============================
SOL_PY['regexp'] = '''# 正则匹配：LeetCode 10（. 单字符，* 前字符 0+ 次）。
import sys

def main():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    s = lines[0].strip()
    p = lines[1].strip()
    m, n = len(s), len(p)
    f = [[False] * (n + 1) for _ in range(m + 1)]
    f[0][0] = True
    i = 1
    while i < n and p[i] == '*':
        f[0][i + 1] = True
        i += 2
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if j < n and p[j] == '*':
                continue
            c = p[j - 1]
            if c == '.':
                f[i][j] = f[i - 1][j - 1]
            elif c == '*':
                k = i
                while k >= 0:
                    if f[k][j - 2]:
                        f[i][j] = True
                        break
                    if k == 0:
                        break
                    if p[j - 2] != '.' and s[k - 1] != p[j - 2]:
                        break
                    k -= 1
            else:
                f[i][j] = f[i - 1][j - 1] and (s[i - 1] == p[j - 1])
    print('1' if f[m][n] else '0')

if __name__ == '__main__':
    main()
'''

SOL_TS['regexp'] = '''// 正则匹配：LeetCode 10。
function solve(input: string): string {
  const lines = input.trim().split(/\\n/);
  const s = lines[0].trim(), p = lines[1].trim();
  const m = s.length, n = p.length;
  const f: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  f[0][0] = true;
  let i = 1;
  while (i < n && p[i] === '*') { f[0][i + 1] = true; i += 2; }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (j < n && p[j] === '*') continue;
      const c = p[j - 1];
      if (c === '.') {
        f[i][j] = f[i - 1][j - 1];
      } else if (c === '*') {
        let k = i;
        while (k >= 0) {
          if (f[k][j - 2]) { f[i][j] = true; break; }
          if (k === 0) break;
          if (p[j - 2] !== '.' && s[k - 1] !== p[j - 2]) break;
          k--;
        }
      } else {
        f[i][j] = f[i - 1][j - 1] && s[i - 1] === p[j - 1];
      }
    }
  }
  return f[m][n] ? '1' : '0';
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['regexp'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        String p = sc.nextLine();
        int m = s.length(), n = p.length();
        boolean[][] f = new boolean[m + 1][n + 1];
        f[0][0] = true;
        int i = 1;
        while (i < n && p.charAt(i) == '*') { f[0][i + 1] = true; i += 2; }
        for (i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (j < n && p.charAt(j) == '*') continue;
                char c = p.charAt(j - 1);
                if (c == '.') {
                    f[i][j] = f[i - 1][j - 1];
                } else if (c == '*') {
                    int k = i;
                    while (k >= 0) {
                        if (f[k][j - 2]) { f[i][j] = true; break; }
                        if (k == 0) break;
                        if (p.charAt(j - 2) != '.' && s.charAt(k - 1) != p.charAt(j - 2)) break;
                        k--;
                    }
                } else {
                    f[i][j] = f[i - 1][j - 1] && s.charAt(i - 1) == p.charAt(j - 1);
                }
            }
        }
        System.out.println(f[m][n] ? 1 : 0);
    }
}
'''

# ============================ 42. 青蛙过河（Ch6） ============================
SOL_PY['frog'] = '''# 青蛙过河：dp[位置] = 可达跳距集合，判断能否到终点。
import sys
from collections import defaultdict

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    stones = [int(x) for x in data[1:1 + n]]
    if n <= 1:
        print('true')
        return
    stone_set = set(stones)
    dp = defaultdict(set)
    dp[0] = {0}
    for x in stones:
        for k in dp[x]:
            for nk in (k - 1, k, k + 1):
                if nk > 0 and (x + nk) in stone_set:
                    dp[x + nk].add(nk)
    print('true' if dp[stones[-1]] else 'false')

if __name__ == '__main__':
    main()
'''

SOL_TS['frog'] = '''// 青蛙过河：dp[位置] = 跳距集合。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0];
  const stones = data.slice(1, 1 + n);
  if (n <= 1) return 'true';
  const stoneSet = new Set<number>(stones);
  const dp = new Map<number, Set<number>>();
  dp.set(0, new Set([0]));
  for (const x of stones) {
    const ks = dp.get(x);
    if (!ks) continue;
    for (const k of ks) {
      for (const nk of [k - 1, k, k + 1]) {
        if (nk > 0 && stoneSet.has(x + nk)) {
          if (!dp.has(x + nk)) dp.set(x + nk, new Set());
          dp.get(x + nk)!.add(nk);
        }
      }
    }
  }
  return dp.has(stones[n - 1]) && dp.get(stones[n - 1])!.size > 0 ? 'true' : 'false';
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['frog'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[] stones = new long[n];
        for (int i = 0; i < n; i++) stones[i] = sc.nextLong();
        if (n <= 1) { System.out.println("true"); return; }
        Set<Long> stoneSet = new HashSet<>();
        for (long x : stones) stoneSet.add(x);
        Map<Long, Set<Long>> dp = new HashMap<>();
        dp.put(0L, new HashSet<>(Collections.singletonList(0L)));
        for (long x : stones) {
            Set<Long> ks = dp.get(x);
            if (ks == null) continue;
            for (long k : ks) {
                for (long nk = k - 1; nk <= k + 1; nk++) {
                    if (nk > 0 && stoneSet.contains(x + nk)) {
                        dp.computeIfAbsent(x + nk, z -> new HashSet<>()).add(nk);
                    }
                }
            }
        }
        Set<Long> t = dp.get(stones[n - 1]);
        System.out.println(t != null && !t.isEmpty() ? "true" : "false");
    }
}
'''

# ============================ 43. 谷仓涂色（Ch6） ============================
SOL_PY['barnpainting'] = '''# 谷仓涂色：树形 DP，f[x][c] 乘子节点异色方案和。
import sys
sys.setrecursionlimit(1000000)

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, k = int(data[0]), int(data[1])
    adj = [[] for _ in range(n + 1)]
    i = 2
    for _ in range(n - 1):
        x, y = int(data[i]), int(data[i + 1]); i += 2
        adj[x].append(y); adj[y].append(x)
    MOD = 1000000007
    fixed = [-1] * (n + 1)
    for _ in range(k):
        x, y = int(data[i]), int(data[i + 1]); i += 2
        fixed[x] = y - 1
    f = [[0] * 3 for _ in range(n + 1)]
    marked = [False] * (n + 1)
    def dfs(x):
        marked[x] = True
        if fixed[x] > -1:
            f[x][fixed[x]] = 1
        else:
            f[x][0] = f[x][1] = f[x][2] = 1
        for nb in adj[x]:
            if marked[nb]:
                continue
            dfs(nb)
            for c in range(3):
                s = 0
                for c2 in range(3):
                    if c2 != c:
                        s = (s + f[nb][c2]) % MOD
                f[x][c] = f[x][c] * s % MOD
    dfs(1)
    print((f[1][0] + f[1][1] + f[1][2]) % MOD)

if __name__ == '__main__':
    main()
'''

SOL_TS['barnpainting'] = '''// 谷仓涂色：树形 DP。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], k = data[1];
  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  let i = 2;
  for (let e = 0; e < n - 1; e++) {
    const x = data[i], y = data[i + 1]; i += 2;
    adj[x].push(y); adj[y].push(x);
  }
  const MOD = 1000000007;
  const fixed: number[] = new Array(n + 1).fill(-1);
  for (let e = 0; e < k; e++) { const x = data[i], y = data[i + 1]; i += 2; fixed[x] = y - 1; }
  const f: number[][] = Array.from({ length: n + 1 }, () => [0, 0, 0]);
  const marked: boolean[] = new Array(n + 1).fill(false);
  const dfs = (x: number) => {
    marked[x] = true;
    if (fixed[x] > -1) f[x][fixed[x]] = 1;
    else f[x][0] = f[x][1] = f[x][2] = 1;
    for (const nb of adj[x]) {
      if (marked[nb]) continue;
      dfs(nb);
      for (let c = 0; c < 3; c++) {
        let s = 0;
        for (let c2 = 0; c2 < 3; c2++) if (c2 !== c) s = (s + f[nb][c2]) % MOD;
        f[x][c] = (f[x][c] * s) % MOD;
      }
    }
  };
  dfs(1);
  return String((f[1][0] + f[1][1] + f[1][2]) % MOD);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['barnpainting'] = '''import java.util.*;

public class Main {
    static List<Integer>[] adj;
    static int[] fixed;
    static long[][] f;
    static boolean[] marked;
    static final int MOD = 1000000007;
    static void dfs(int x) {
        marked[x] = true;
        if (fixed[x] > -1) f[x][fixed[x]] = 1;
        else f[x][0] = f[x][1] = f[x][2] = 1;
        for (int nb : adj[x]) {
            if (marked[nb]) continue;
            dfs(nb);
            for (int c = 0; c < 3; c++) {
                long s = 0;
                for (int c2 = 0; c2 < 3; c2++) if (c2 != c) s = (s + f[nb][c2]) % MOD;
                f[x][c] = f[x][c] * s % MOD;
            }
        }
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), k = sc.nextInt();
        adj = new List[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();
        for (int e = 0; e < n - 1; e++) {
            int x = sc.nextInt(), y = sc.nextInt();
            adj[x].add(y); adj[y].add(x);
        }
        fixed = new int[n + 1];
        Arrays.fill(fixed, -1);
        for (int e = 0; e < k; e++) { int x = sc.nextInt(), y = sc.nextInt(); fixed[x] = y - 1; }
        f = new long[n + 1][3];
        marked = new boolean[n + 1];
        dfs(1);
        System.out.println((f[1][0] + f[1][1] + f[1][2]) % MOD);
    }
}
'''

# ============================ 44. 毛毛虫（Ch6） ============================
SOL_PY['caterpillar'] = '''# 毛毛虫：树形 DP，f[x] 向下最长链 + 子节点作毛。
import sys
sys.setrecursionlimit(1000000)

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, m = int(data[0]), int(data[1])
    adj = [[] for _ in range(n + 1)]
    i = 2
    for _ in range(m):
        x, y = int(data[i]), int(data[i + 1]); i += 2
        adj[x].append(y); adj[y].append(x)
    f = [0] * (n + 1)
    res = 0
    def dfs(x):
        nonlocal res
        l1 = l2 = 0; children = 0
        f[x] = 1
        for nb in adj[x]:
            if f[nb]:
                continue
            children += 1
            dfs(nb)
            if l1 <= f[nb]:
                l2 = l1; l1 = f[nb]
            elif f[nb] > l2:
                l2 = f[nb]
        f[x] = l1 + 1 + max(0, children - 1)
        res = max(res, l1 + l2 + 1 + max(0, len(adj[x]) - 2))
    dfs(1)
    print(res)

if __name__ == '__main__':
    main()
'''

SOL_TS['caterpillar'] = '''// 毛毛虫：树形 DP。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], m = data[1];
  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  let i = 2;
  for (let e = 0; e < m; e++) {
    const x = data[i], y = data[i + 1]; i += 2;
    adj[x].push(y); adj[y].push(x);
  }
  const f: number[] = new Array(n + 1).fill(0);
  let res = 0;
  const dfs = (x: number) => {
    let l1 = 0, l2 = 0, children = 0;
    f[x] = 1;
    for (const nb of adj[x]) {
      if (f[nb]) continue;
      children++;
      dfs(nb);
      if (l1 <= f[nb]) { l2 = l1; l1 = f[nb]; }
      else if (f[nb] > l2) l2 = f[nb];
    }
    f[x] = l1 + 1 + Math.max(0, children - 1);
    res = Math.max(res, l1 + l2 + 1 + Math.max(0, adj[x].length - 2));
  };
  dfs(1);
  return String(res);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['caterpillar'] = '''import java.util.*;

public class Main {
    static List<Integer>[] adj;
    static int[] f;
    static long res = 0;
    static void dfs(int x) {
        int l1 = 0, l2 = 0, children = 0;
        f[x] = 1;
        for (int nb : adj[x]) {
            if (f[nb] != 0) continue;
            children++;
            dfs(nb);
            if (l1 <= f[nb]) { l2 = l1; l1 = f[nb]; }
            else if (f[nb] > l2) l2 = f[nb];
        }
        f[x] = l1 + 1 + Math.max(0, children - 1);
        res = Math.max(res, l1 + l2 + 1 + Math.max(0, adj[x].size() - 2));
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        adj = new List[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();
        for (int e = 0; e < m; e++) {
            int x = sc.nextInt(), y = sc.nextInt();
            adj[x].add(y); adj[y].add(x);
        }
        f = new int[n + 1];
        dfs(1);
        System.out.println(res);
    }
}
'''

# ============================ 45. 巧克力（Ch6） ============================
SOL_PY['chocolate'] = '''# 巧克力：0 视为大负数，最大子矩阵和（Kadane）。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, m = int(data[0]), int(data[1])
    ZERO = 1 << 25
    f = [[0] * (m + 1) for _ in range(n + 1)]
    idx = 2
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            v = int(data[idx]); idx += 1
            if v == 0:
                v = -ZERO
            f[i][j] = f[i - 1][j] + v
    res = 0
    for i in range(1, n + 1):
        for j in range(1, i + 1):
            count = 0
            for k in range(1, m + 1):
                count += f[i][k] - f[j - 1][k]
                if count > res:
                    res = count
                if count < 0:
                    count = 0
    print(res)

if __name__ == '__main__':
    main()
'''

SOL_TS['chocolate'] = '''// 巧克力：最大子矩阵和。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], m = data[1];
  const ZERO = 1 << 25;
  const f: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  let idx = 2;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      let v = data[idx++];
      if (v === 0) v = -ZERO;
      f[i][j] = f[i - 1][j] + v;
    }
  }
  let res = 0;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= i; j++) {
      let count = 0;
      for (let k = 1; k <= m; k++) {
        count += f[i][k] - f[j - 1][k];
        if (count > res) res = count;
        if (count < 0) count = 0;
      }
    }
  }
  return String(res);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['chocolate'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        final int ZERO = 1 << 25;
        long[][] f = new long[n + 1][m + 1];
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++) {
                long v = sc.nextLong();
                if (v == 0) v = -ZERO;
                f[i][j] = f[i - 1][j] + v;
            }
        long res = 0;
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= i; j++) {
                long count = 0;
                for (int k = 1; k <= m; k++) {
                    count += f[i][k] - f[j - 1][k];
                    if (count > res) res = count;
                    if (count < 0) count = 0;
                }
            }
        System.out.println(res);
    }
}
'''

# ============================ 46. 外星人入侵（Ch6） ============================
SOL_PY['invader'] = '''# 外星人入侵：区间 DP，引爆最大 d 事件。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    idx = 0
    total = int(data[idx]); idx += 1
    out = []
    for _ in range(total):
        n = int(data[idx]); idx += 1
        a = [0] * n; b = [0] * n; d = [0] * n
        times = [0] * 10001
        for i in range(n):
            a[i] = int(data[idx]); b[i] = int(data[idx + 1]); d[i] = int(data[idx + 2]); idx += 3
            times[a[i]] = 1; times[b[i]] = 1
        timeN = 0
        for i in range(10001):
            if times[i]:
                timeN += 1
                times[i] = timeN
        for i in range(n):
            a[i] = times[a[i]]; b[i] = times[b[i]]
        INF = 10 ** 9
        f = [[0] * (timeN + 2) for _ in range(timeN + 2)]
        for length in range(1, timeN + 1):
            for i in range(1, timeN - length + 1):
                j = i + length
                maxDi = -1
                for di in range(n):
                    if a[di] >= i and b[di] <= j and (maxDi == -1 or d[di] > d[maxDi]):
                        maxDi = di
                if maxDi == -1:
                    continue
                f[i][j] = INF
                for tt in range(a[maxDi], b[maxDi] + 1):
                    tmp = 0
                    if tt - 1 >= i:
                        tmp += f[i][tt - 1]
                    if tt + 1 <= j:
                        tmp += f[tt + 1][j]
                    if tmp + d[maxDi] < f[i][j]:
                        f[i][j] = tmp + d[maxDi]
        out.append(str(f[1][timeN]))
    print('\\n'.join(out))

if __name__ == '__main__':
    main()
'''

SOL_TS['invader'] = '''// 外星人入侵：区间 DP。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  let idx = 0;
  const total = data[idx++];
  const out: string[] = [];
  for (let g = 0; g < total; g++) {
    const n = data[idx++];
    const a: number[] = [], b: number[] = [], d: number[] = [];
    const times: number[] = new Array(10001).fill(0);
    for (let i = 0; i < n; i++) {
      a.push(data[idx]); b.push(data[idx + 1]); d.push(data[idx + 2]); idx += 3;
      times[a[i]] = 1; times[b[i]] = 1;
    }
    let timeN = 0;
    for (let i = 0; i <= 10000; i++) if (times[i]) times[i] = ++timeN;
    for (let i = 0; i < n; i++) { a[i] = times[a[i]]; b[i] = times[b[i]]; }
    const INF = 1e9;
    const f: number[][] = Array.from({ length: timeN + 2 }, () => new Array(timeN + 2).fill(0));
    for (let len = 1; len <= timeN; len++) {
      for (let i = 1; i <= timeN - len; i++) {
        const j = i + len;
        let maxDi = -1;
        for (let di = 0; di < n; di++) {
          if (a[di] >= i && b[di] <= j && (maxDi === -1 || d[di] > d[maxDi])) maxDi = di;
        }
        if (maxDi === -1) continue;
        f[i][j] = INF;
        for (let tt = a[maxDi]; tt <= b[maxDi]; tt++) {
          let tmp = 0;
          if (tt - 1 >= i) tmp += f[i][tt - 1];
          if (tt + 1 <= j) tmp += f[tt + 1][j];
          if (tmp + d[maxDi] < f[i][j]) f[i][j] = tmp + d[maxDi];
        }
      }
    }
    out.push(String(f[1][timeN]));
  }
  return out.join('\\n');
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['invader'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int total = sc.nextInt();
        StringBuilder sb = new StringBuilder();
        for (int g = 0; g < total; g++) {
            int n = sc.nextInt();
            int[] a = new int[n], b = new int[n], d = new int[n];
            int[] times = new int[10001];
            for (int i = 0; i < n; i++) {
                a[i] = sc.nextInt(); b[i] = sc.nextInt(); d[i] = sc.nextInt();
                times[a[i]] = 1; times[b[i]] = 1;
            }
            int timeN = 0;
            for (int i = 0; i <= 10000; i++) if (times[i] != 0) times[i] = ++timeN;
            for (int i = 0; i < n; i++) { a[i] = times[a[i]]; b[i] = times[b[i]]; }
            long[][] f = new long[timeN + 2][timeN + 2];
            for (int len = 1; len <= timeN; len++) {
                for (int i = 1; i <= timeN - len; i++) {
                    int j = i + len;
                    int maxDi = -1;
                    for (int di = 0; di < n; di++) {
                        if (a[di] >= i && b[di] <= j && (maxDi == -1 || d[di] > d[maxDi])) maxDi = di;
                    }
                    if (maxDi == -1) continue;
                    f[i][j] = Long.MAX_VALUE / 2;
                    for (int tt = a[maxDi]; tt <= b[maxDi]; tt++) {
                        long tmp = 0;
                        if (tt - 1 >= i) tmp += f[i][tt - 1];
                        if (tt + 1 <= j) tmp += f[tt + 1][j];
                        if (tmp + d[maxDi] < f[i][j]) f[i][j] = tmp + d[maxDi];
                    }
                }
            }
            sb.append(f[1][timeN]).append('\\n');
        }
        System.out.print(sb.toString());
    }
}
'''

# ============================ 47. 国王（Ch6） ============================
SOL_PY['king'] = '''# 国王：状压 DP 棋盘放王方案数。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n, k = int(data[0]), int(data[1])
    states = []
    def gen(x, s, cnt):
        if x == n:
            states.append((s, cnt))
            return
        gen(x + 1, s, cnt)
        if x == 0 or not (s & 1):
            gen(x + 1, (s << 1) | 1, cnt + 1)
    gen(0, 0, 0)
    f = [[[0] * (1 << n) for _ in range(k + 1)] for _ in range(n)]
    for s, cnt in states:
        if cnt <= k:
            f[0][cnt][s] = 1
    for i in range(1, n):
        for c in range(k + 1):
            for sj, cj in states:
                if f[i - 1][c][sj] > 0:
                    cover = sj | (sj << 1) | (sj >> 1)
                    for sj2, cj2 in states:
                        if (sj2 & cover) or c + cj2 > k:
                            continue
                        f[i][c + cj2][sj2] += f[i - 1][c][sj]
    res = 0
    for s, cnt in states:
        res += f[n - 1][k][s]
    print(res)

if __name__ == '__main__':
    main()
'''

SOL_TS['king'] = '''// 国王：状压 DP。
function solve(input: string): string {
  const data = input.trim().split(/\\s+/).map(Number);
  const n = data[0], k = data[1];
  const states: [number, number][] = [];
  const gen = (x: number, s: number, cnt: number) => {
    if (x === n) { states.push([s, cnt]); return; }
    gen(x + 1, s, cnt);
    if (x === 0 || !(s & 1)) gen(x + 1, (s << 1) | 1, cnt + 1);
  };
  gen(0, 0, 0);
  const f: number[][][] = Array.from({ length: n }, () => Array.from({ length: k + 1 }, () => new Array(1 << n).fill(0)));
  for (const [s, cnt] of states) if (cnt <= k) f[0][cnt][s] = 1;
  for (let i = 1; i < n; i++) {
    for (let c = 0; c <= k; c++) {
      for (const [sj] of states) {
        if (f[i - 1][c][sj] > 0) {
          const cover = sj | (sj << 1) | (sj >> 1);
          for (const [sj2, cj2] of states) {
            if ((sj2 & cover) || c + cj2 > k) continue;
            f[i][c + cj2][sj2] += f[i - 1][c][sj];
          }
        }
      }
    }
  }
  let res = 0;
  for (const [s] of states) res += f[n - 1][k][s];
  return String(res);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['king'] = '''import java.util.*;

public class Main {
    static List<int[]> states = new ArrayList<>();
    static int n;
    static void gen(int x, int s, int cnt) {
        if (x == n) { states.add(new int[]{s, cnt}); return; }
        gen(x + 1, s, cnt);
        if (x == 0 || (s & 1) == 0) gen(x + 1, (s << 1) | 1, cnt + 1);
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        int k = sc.nextInt();
        gen(0, 0, 0);
        long[][][] f = new long[n][k + 1][1 << n];
        for (int[] st : states) if (st[1] <= k) f[0][st[1]][st[0]] = 1;
        for (int i = 1; i < n; i++)
            for (int c = 0; c <= k; c++)
                for (int[] sj : states) {
                    int sj0 = sj[0];
                    if (f[i - 1][c][sj0] > 0) {
                        int cover = sj0 | (sj0 << 1) | (sj0 >> 1);
                        for (int[] sj2 : states) {
                            if ((sj2[0] & cover) != 0 || c + sj2[1] > k) continue;
                            f[i][c + sj2[1]][sj2[0]] += f[i - 1][c][sj0];
                        }
                    }
                }
        long res = 0;
        for (int[] st : states) res += f[n - 1][k][st[0]];
        System.out.println(res);
    }
}
'''

# ============================ 48. 回文路径（Ch6） ============================
SOL_PY['palinpath'] = '''# 回文路径：对角 DP，滚动数组。
import sys

def main():
    lines = sys.stdin.read().strip().split('\\n')
    if not lines:
        return
    n = int(lines[0].strip())
    grid = [ln.strip() for ln in lines[1:1 + n]]
    MOD = 1000000007
    f = [[[0] * n for _ in range(n)] for _ in range(2)]
    for i in range(n):
        f[0][n - i - 1][n - i - 1] = 1
    for k in range(1, n):
        k1 = k % 2; k2 = (k - 1) % 2
        f[k1] = [[0] * n for _ in range(n)]
        for i in range(n - k):
            iy = n - k - i - 1
            for j in range(k, n):
                jy = n + k - j - 1
                if grid[i][iy] == grid[j][jy]:
                    v = 0
                    v += f[k2][i + 1][j - 1] * (grid[i + 1][iy] == grid[j - 1][jy])
                    v += f[k2][i + 1][j] * (grid[i + 1][iy] == grid[j][jy - 1])
                    v += f[k2][i][j - 1] * (grid[i][iy + 1] == grid[j - 1][jy])
                    v += f[k2][i][j] * (grid[i][iy + 1] == grid[j][jy - 1])
                    f[k1][i][j] = v % MOD
    print(f[(n - 1) % 2][0][n - 1])

if __name__ == '__main__':
    main()
'''

SOL_TS['palinpath'] = '''// 回文路径：对角 DP。
function solve(input: string): string {
  const lines = input.trim().split(/\\n/);
  const n = Number(lines[0].trim());
  const grid = lines.slice(1, 1 + n).map(s => s.trim());
  const MOD = 1000000007;
  let f: number[][][] = [Array.from({ length: n }, () => new Array(n).fill(0)), Array.from({ length: n }, () => new Array(n).fill(0))];
  for (let i = 0; i < n; i++) f[0][n - i - 1][n - i - 1] = 1;
  for (let k = 1; k < n; k++) {
    const k1 = k % 2, k2 = (k - 1) % 2;
    f[k1] = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n - k; i++) {
      const iy = n - k - i - 1;
      for (let j = k; j < n; j++) {
        const jy = n + k - j - 1;
        if (grid[i][iy] === grid[j][jy]) {
          let v = 0;
          v += f[k2][i + 1][j - 1] * (grid[i + 1][iy] === grid[j - 1][jy] ? 1 : 0);
          v += f[k2][i + 1][j] * (grid[i + 1][iy] === grid[j][jy - 1] ? 1 : 0);
          v += f[k2][i][j - 1] * (grid[i][iy + 1] === grid[j - 1][jy] ? 1 : 0);
          v += f[k2][i][j] * (grid[i][iy + 1] === grid[j][jy - 1] ? 1 : 0);
          f[k1][i][j] = v % MOD;
        }
      }
    }
  }
  return String(f[(n - 1) % 2][0][n - 1]);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['palinpath'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        char[][] grid = new char[n][n];
        for (int i = 0; i < n; i++) grid[i] = sc.next().toCharArray();
        final int MOD = 1000000007;
        long[][][] f = new long[2][n][n];
        for (int i = 0; i < n; i++) f[0][n - i - 1][n - i - 1] = 1;
        for (int k = 1; k < n; k++) {
            int k1 = k % 2, k2 = (k - 1) % 2;
            for (int a = 0; a < n; a++) Arrays.fill(f[k1][a], 0);
            for (int i = 0; i < n - k; i++) {
                int iy = n - k - i - 1;
                for (int j = k; j < n; j++) {
                    int jy = n + k - j - 1;
                    if (grid[i][iy] == grid[j][jy]) {
                        long v = 0;
                        v += f[k2][i + 1][j - 1] * (grid[i + 1][iy] == grid[j - 1][jy] ? 1 : 0);
                        v += f[k2][i + 1][j] * (grid[i + 1][iy] == grid[j][jy - 1] ? 1 : 0);
                        v += f[k2][i][j - 1] * (grid[i][iy + 1] == grid[j - 1][jy] ? 1 : 0);
                        v += f[k2][i][j] * (grid[i][iy + 1] == grid[j][jy - 1] ? 1 : 0);
                        f[k1][i][j] = v % MOD;
                    }
                }
            }
        }
        System.out.println(f[(n - 1) % 2][0][n - 1]);
    }
}
'''

# ============================ 49. 石子游戏 V（Ch6） ============================
SOL_PY['stonegamev'] = '''# 石子游戏 V：区间 DP，分割取较小段分数。
import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    stones = [int(x) for x in data]
    n = len(stones)
    if n == 0:
        print(0)
        return
    s = [0] * (n + 1)
    for i in range(n):
        s[i + 1] = s[i] + stones[i]
    f = [[0] * n for _ in range(n)]
    for k in range(1, n):
        for i in range(n - k):
            j = i + k
            for m in range(i, j):
                sl = s[m + 1] - s[i]
                sr = s[j + 1] - s[m + 1]
                if sl <= sr:
                    v = sl + f[i][m]
                    if v > f[i][j]:
                        f[i][j] = v
                if sl >= sr:
                    v = sr + f[m + 1][j]
                    if v > f[i][j]:
                        f[i][j] = v
    print(f[0][n - 1])

if __name__ == '__main__':
    main()
'''

SOL_TS['stonegamev'] = '''// 石子游戏 V：区间 DP。
function solve(input: string): string {
  const stones = input.trim().split(/\\s+/).map(Number);
  const n = stones.length;
  if (n === 0) return '0';
  const s: number[] = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) s[i + 1] = s[i] + stones[i];
  const f: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let k = 1; k < n; k++) {
    for (let i = 0; i < n - k; i++) {
      const j = i + k;
      for (let m = i; m < j; m++) {
        const sl = s[m + 1] - s[i];
        const sr = s[j + 1] - s[m + 1];
        if (sl <= sr) f[i][j] = Math.max(f[i][j], sl + f[i][m]);
        if (sl >= sr) f[i][j] = Math.max(f[i][j], sr + f[m + 1][j]);
      }
    }
  }
  return String(f[0][n - 1]);
}

if (require.main === module) {
  let buf = '';
  process.stdin.on('data', d => buf += d);
  process.stdin.on('end', () => console.log(solve(buf)));
}
'''

SOL_JAVA['stonegamev'] = '''import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int n = list.size();
        if (n == 0) { System.out.println(0); return; }
        int[] stones = new int[n];
        long[] s = new long[n + 1];
        for (int i = 0; i < n; i++) { stones[i] = list.get(i); s[i + 1] = s[i] + stones[i]; }
        long[][] f = new long[n][n];
        for (int k = 1; k < n; k++) {
            for (int i = 0; i < n - k; i++) {
                int j = i + k;
                for (int m = i; m < j; m++) {
                    long sl = s[m + 1] - s[i];
                    long sr = s[j + 1] - s[m + 1];
                    if (sl <= sr) f[i][j] = Math.max(f[i][j], sl + f[i][m]);
                    if (sl >= sr) f[i][j] = Math.max(f[i][j], sr + f[m + 1][j]);
                }
            }
        }
        System.out.println(f[0][n - 1]);
    }
}
'''
