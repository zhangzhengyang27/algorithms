import { DynamicArray } from './dynamic-array';
import { LinkedList, removeElementsRecursive } from './linked-list';
import { ArrayStack, LinkedListStack, isValidParentheses } from './stack';
import { ArrayQueue, LoopQueue, LinkedListQueue, Deque } from './queue';
import { MaxHeap, MinHeap, PriorityQueue, heapSort, getLeastNumbers } from './heap';
import { BST } from './bst';
import { SegmentTree, NumArray } from './segment-tree';
import { Trie, MapSum } from './trie';
import { UnionFind1, UnionFind2, UnionFind3, UnionFind4 } from './union-find';
import { BSTMap, LinkedListMap, BSTSet, LinkedListSet, intersection, intersect } from './map-and-set';

// 每种 Stack 实现共用同一组契约断言，避免只测到其中一个。
const stackImpls: [string, () => ArrayStack<number> | LinkedListStack<number>][] = [
  ['ArrayStack', () => new ArrayStack<number>()],
  ['LinkedListStack', () => new LinkedListStack<number>()],
];

describe('DynamicArray', () => {
  it('在任意位置插入并保持一致的 size', () => {
    const a = new DynamicArray<number>();
    a.addLast(1);
    a.addLast(3);
    a.add(1, 2);
    a.addFirst(0);
    expect(a.toArray()).toEqual([0, 1, 2, 3]);
    expect(a.size).toBe(4);
  });

  it('扩容后不丢数据（跨越初始 capacity）', () => {
    const a = new DynamicArray<number>(2);
    for (let i = 0; i < 50; i++) a.addLast(i);
    expect(a.size).toBe(50);
    expect(a.get(0)).toBe(0);
    expect(a.get(49)).toBe(49);
    expect(a.capacity).toBeGreaterThanOrEqual(50);
  });

  it('缩容到一半时容量减半但仍可继续读写', () => {
    const a = new DynamicArray<number>(8);
    for (let i = 0; i < 8; i++) a.addLast(i);
    a.removeFirst();
    a.removeFirst();
    a.removeFirst();
    a.addLast(100);
    expect(a.contains(100)).toBe(true);
    expect(a.indexOf(100)).toBe(a.size - 1);
  });

  it('removeElement 删除首个匹配项并返回是否命中', () => {
    const a = new DynamicArray<number>();
    [5, 6, 5, 7].forEach((v) => a.addLast(v));
    expect(a.removeElement(5)).toBe(true);
    expect(a.toArray()).toEqual([6, 5, 7]);
    expect(a.removeElement(999)).toBe(false);
  });

  it('越界访问抛错而不是静默返回 undefined', () => {
    const a = new DynamicArray<number>();
    a.addLast(1);
    expect(() => a.get(1)).toThrow();
    expect(() => a.get(-1)).toThrow();
  });

  it('swap 交换两个下标的值', () => {
    const a = new DynamicArray<number>();
    [1, 2, 3].forEach((v) => a.addLast(v));
    a.swap(0, 2);
    expect(a.toArray()).toEqual([3, 2, 1]);
  });
});

describe('LinkedList', () => {
  it('按序增删改查', () => {
    const l = new LinkedList<number>();
    l.addLast(1);
    l.addLast(3);
    l.add(1, 2);
    expect(l.toArray()).toEqual([1, 2, 3]);
    expect(l.get(1)).toBe(2);
    l.set(1, 20);
    expect(l.get(1)).toBe(20);
    expect(l.remove(0)).toBe(1);
    expect(l.toArray()).toEqual([20, 3]);
    expect(l.size).toBe(2);
  });

  it('reverse 真正反转且可再次还原', () => {
    const l = new LinkedList<number>();
    [1, 2, 3, 4].forEach((v) => l.addLast(v));
    l.reverse();
    expect(l.toArray()).toEqual([4, 3, 2, 1]);
    l.reverse();
    expect(l.toArray()).toEqual([1, 2, 3, 4]);
  });

  it('removeElement 只删除首个匹配项', () => {
    const l = new LinkedList<number>();
    [7, 2, 7, 3, 7].forEach((v) => l.addLast(v));
    expect(l.removeElement(7)).toBe(true);
    expect(l.toArray()).toEqual([2, 7, 3, 7]);
    expect(l.size).toBe(4);
    expect(l.removeElement(999)).toBe(false);
    expect(l.size).toBe(4);
  });

  it('removeElementsRecursive（LC203）删除全部匹配项，作用于裸节点链', () => {
    type Node = { value: number; next: Node | null };
    const build = (): Node => ({
      value: 1,
      next: { value: 2, next: { value: 2, next: { value: 3, next: null } } },
    });
    const out = removeElementsRecursive(build(), 2) as Node;
    const flat: number[] = [];
    for (let cur: Node | null = out; cur !== null; cur = cur.next) flat.push(cur.value);
    expect(flat).toEqual([1, 3]);
    expect(removeElementsRecursive(null, 1)).toBeNull();
  });

  it('空表 reverse 不崩溃', () => {
    const l = new LinkedList<number>();
    expect(() => l.reverse()).not.toThrow();
    expect(l.isEmpty()).toBe(true);
  });

  it('越界索引抛错', () => {
    const l = new LinkedList<number>();
    l.addLast(1);
    expect(() => l.get(1)).toThrow();
    expect(() => l.add(5, 9)).toThrow();
  });
});

describe.each(stackImpls)('%s 契约', (_name, make) => {
  it('LIFO 顺序', () => {
    const s = make();
    s.push(1);
    s.push(2);
    s.push(3);
    expect(s.size).toBe(3);
    expect(s.peek()).toBe(3);
    expect(s.pop()).toBe(3);
    expect(s.pop()).toBe(2);
    expect(s.peek()).toBe(1);
    expect(s.size).toBe(1);
  });

  it('空栈 isEmpty 为真，空栈 pop 抛错', () => {
    const s = make();
    expect(s.isEmpty()).toBe(true);
    [1, 2, 3].forEach((v) => s.push(v));
    s.pop();
    s.pop();
    s.pop();
    expect(s.isEmpty()).toBe(true);
    expect(() => s.pop()).toThrow();
  });
});

// 注意：两个 Stack 实现的 toArray 方向是**相反**的，同一条 Stack<T> 接口下并不等价。
// 这里按当前实际行为分别锁定；若将来统一方向，本组用例会失败并强制你确认调用方。
describe('Stack.toArray 方向（已知不一致）', () => {
  it('ArrayStack：自底向顶', () => {
    const s = new ArrayStack<number>();
    [1, 2, 3].forEach((v) => s.push(v));
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it('LinkedListStack：自顶向底', () => {
    const s = new LinkedListStack<number>();
    [1, 2, 3].forEach((v) => s.push(v));
    expect(s.toArray()).toEqual([3, 2, 1]);
  });
});

describe('isValidParentheses', () => {
  it.each([
    ['()', true],
    ['()[]{}', true],
    ['(]', false],
    ['([)]', false],
    ['{[]}', true],
    ['(', false],
    ['', true],
  ])('%s -> %s', (input, expected) => {
    expect(isValidParentheses(input)).toBe(expected);
  });
});

describe.each([
  ['ArrayQueue', () => new ArrayQueue<number>()],
  ['LoopQueue', () => new LoopQueue<number>(4)],
  ['LinkedListQueue', () => new LinkedListQueue<number>()],
])('%s 契约', (_name, make) => {
  it('FIFO 顺序', () => {
    const q = make();
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    expect(q.size).toBe(3);
    expect(q.peek()).toBe(1);
    expect(q.dequeue()).toBe(1);
    expect(q.dequeue()).toBe(2);
    expect(q.size).toBe(1);
    expect(q.toArray()).toEqual([3]);
  });

  it('超出初始容量的循环队列仍能正确环绕', () => {
    const q = make();
    for (let i = 0; i < 20; i++) q.enqueue(i);
    for (let i = 0; i < 10; i++) expect(q.dequeue()).toBe(i);
    expect(q.size).toBe(10);
    expect(q.peek()).toBe(10);
  });

  it('空队列入队/出队交替', () => {
    const q = make();
    q.enqueue(1);
    expect(q.dequeue()).toBe(1);
    expect(q.isEmpty()).toBe(true);
    expect(() => q.dequeue()).toThrow();
  });
});

describe('LoopQueue 动态扩容', () => {
  it('扩容后保持元素顺序（环绕索引不能错位）', () => {
    const q = new LoopQueue<number>(4);
    [1, 2, 3].forEach((v) => q.enqueue(v));
    q.dequeue();
    q.dequeue();
    [4, 5, 6, 7, 8].forEach((v) => q.enqueue(v));
    expect(q.toArray()).toEqual([3, 4, 5, 6, 7, 8]);
  });
});

describe('Deque', () => {
  it('两端均可进出', () => {
    const d = new Deque<number>();
    d.addFirst(2);
    d.addFirst(1);
    d.addLast(3);
    expect(d.toArray()).toEqual([1, 2, 3]);
    expect(d.removeFirst()).toBe(1);
    expect(d.removeLast()).toBe(3);
    expect(d.size).toBe(1);
  });
});

describe('堆', () => {
  it('MaxHeap 按序弹出最大值', () => {
    const h = new MaxHeap<number>();
    [3, 1, 6, 5, 2, 4].forEach((v) => h.add(v));
    expect(h.findMax()).toBe(6);
    const out: number[] = [];
    while (!h.isEmpty()) out.push(h.extractMax());
    expect(out).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it('MinHeap 按序弹出最小值', () => {
    const h = new MinHeap<number>();
    [3, 1, 6, 5, 2, 4].forEach((v) => h.add(v));
    expect(h.findMin()).toBe(1);
    const out: number[] = [];
    while (!h.isEmpty()) out.push(h.extractMin());
    expect(out).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('replace 一次操作完成弹出+压入', () => {
    const h = new MaxHeap<number>();
    [10, 5, 7].forEach((v) => h.add(v));
    expect(h.replace(8)).toBe(10);
    expect(h.findMax()).toBe(8);
    expect(h.size).toBe(3);
  });

  it('PriorityQueue 按优先级出队', () => {
    const p = new PriorityQueue<number>();
    [30, 10, 20].forEach((v) => p.enqueue(v));
    expect(p.getFront()).toBe(30);
    expect(p.dequeue()).toBe(30);
    expect(p.dequeue()).toBe(20);
    expect(p.size).toBe(1);
  });

  it('heapSort 排序且不改动入参数组', () => {
    const input = [5, 3, 8, 1, 9, 2];
    const snapshot = [...input];
    expect(heapSort(input)).toEqual([1, 2, 3, 5, 8, 9]);
    expect(input).toEqual(snapshot);
  });

  it('getLeastNumbers 返回最小的 k 个（集合语义，不保证顺序）', () => {
    const got = getLeastNumbers([6, 1, 2, 7, 3, 9], 3);
    expect(got).toHaveLength(3);
    expect([...got].sort((a, b) => a - b)).toEqual([1, 2, 3]);
    expect(getLeastNumbers([1, 2, 3], 0)).toEqual([]);
    expect(getLeastNumbers([], 2)).toEqual([]);
  });
});

describe('BST', () => {
  const build = () => {
    const t = new BST<number>();
    [4, 2, 6, 1, 3, 5, 7].forEach((v) => t.add(v));
    return t;
  };

  it('中序遍历有序，前/后/层序结构正确', () => {
    const t = build();
    expect(t.inOrder()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(t.preOrder()).toEqual([4, 2, 1, 3, 6, 5, 7]);
    expect(t.postOrder()).toEqual([1, 3, 2, 5, 7, 6, 4]);
    expect(t.levelOrder()).toEqual([4, 2, 6, 1, 3, 5, 7]);
    expect(t.size).toBe(7);
  });

  it('重复值不会让 size 增长', () => {
    const t = new BST<number>();
    t.add(1);
    t.add(1);
    expect(t.size).toBe(1);
    expect(t.contains(1)).toBe(true);
  });

  it('minimum / maximum / removeMin / removeMax', () => {
    const t = build();
    expect(t.minimum()).toBe(1);
    expect(t.maximum()).toBe(7);
    expect(t.removeMin()).toBe(1);
    expect(t.minimum()).toBe(2);
    expect(t.removeMax()).toBe(7);
    expect(t.maximum()).toBe(6);
    expect(t.size).toBe(5);
  });

  it('删除有三种情况：叶子 / 单子树 / 双子树', () => {
    const t = build();
    expect(t.remove(1)).toBe(true); // 叶子
    expect(t.remove(2)).toBe(true); // 单子树（此时 2 只剩右孩子 3）
    expect(t.remove(4)).toBe(true); // 双子树（根），用后继 5 顶替，其余节点都保留
    expect(t.inOrder()).toEqual([3, 5, 6, 7]);
    expect(t.size).toBe(4);
    expect(t.remove(999)).toBe(false);
  });

  it('删除后搜索路径仍然自洽', () => {
    const t = build();
    t.remove(6);
    expect(t.contains(5)).toBe(true);
    expect(t.contains(7)).toBe(true);
    expect(t.contains(6)).toBe(false);
    expect(t.inOrder()).toEqual([1, 2, 3, 4, 5, 7]);
  });

  it('空树的 size / isEmpty / height 边界', () => {
    const t = new BST<number>();
    expect(t.isEmpty()).toBe(true);
    expect(t.size).toBe(0);
    expect(t.getHeight()).toBe(0);
    expect(t.inOrder()).toEqual([]);
    expect(() => t.minimum()).toThrow();
  });

  it('自定义比较器可反转排序方向', () => {
    const t = new BST<number>((a, b) => b - a);
    [4, 2, 6].forEach((v) => t.add(v));
    expect(t.inOrder()).toEqual([6, 4, 2]);
    expect(t.contains(2)).toBe(true);
  });
});

describe('SegmentTree / NumArray', () => {
  it('区间查询与单点更新一致', () => {
    const st = new SegmentTree([-2, 0, 3, -5, 2, -1], (a, b) => a + b);
    expect(st.query(0, 2)).toBe(1);
    expect(st.query(2, 5)).toBe(-1);
    expect(st.query(0, 5)).toBe(-3);
    st.update(4, 1);
    expect(st.get(4)).toBe(1);
    expect(st.query(0, 5)).toBe(-4);
  });

  it('NumArray 与朴素前缀和结果一致', () => {
    const nums = [1, 3, 5, 7, 9, 11];
    const na = new NumArray(nums);
    const naive = (l: number, r: number) => nums.slice(l, r + 1).reduce((a, b) => a + b, 0);
    expect(na.sumRange(0, 5)).toBe(naive(0, 5));
    expect(na.sumRange(1, 3)).toBe(naive(1, 3));
    expect(na.sumRange(2, 2)).toBe(naive(2, 2));
    na.update(2, 100);
    nums[2] = 100;
    expect(na.sumRange(0, 5)).toBe(naive(0, 5));
  });

  it('单元素数组不构成越界', () => {
    const st = new SegmentTree([7], (a, b) => a + b);
    expect(st.query(0, 0)).toBe(7);
  });
});

describe('Trie', () => {
  it('add / contains / hasPrefix 区分整词与前缀', () => {
    const t = new Trie();
    t.add('apple');
    expect(t.contains('apple')).toBe(true);
    expect(t.contains('app')).toBe(false);
    expect(t.hasPrefix('app')).toBe(true);
    expect(t.hasPrefix('apple')).toBe(true);
    expect(t.hasPrefix('b')).toBe(false);
    expect(t.size).toBe(1);
  });

  it('前缀检索与全量列举', () => {
    const t = new Trie();
    ['apple', 'app', 'apt', 'bat'].forEach((w) => t.add(w));
    expect(t.size).toBe(4);
    expect([...t.wordsWithPrefix('ap')].sort()).toEqual(['app', 'apple', 'apt']);
    expect(t.allWords().sort()).toEqual(['app', 'apple', 'apt', 'bat']);
  });

  it('remove 只删整词、保留仍作为前缀的分支', () => {
    const t = new Trie();
    t.add('app');
    t.add('apple');
    expect(t.remove('apple')).toBe(true);
    expect(t.contains('apple')).toBe(false);
    expect(t.contains('app')).toBe(true); // app 仍是独立整词
    expect(t.hasPrefix('app')).toBe(true);
    expect(t.remove('nope')).toBe(false);
  });

  it('重复 add 同一词不重复计数', () => {
    const t = new Trie();
    t.add('x');
    t.add('x');
    expect(t.size).toBe(1);
  });
});

describe('MapSum', () => {
  it('同前缀权重求和（含所有以该前缀开头的整词）', () => {
    const m = new MapSum();
    m.insert('apple', 3);
    m.insert('app', 2);
    m.insert('apt', 5);
    // ap* 命中 app(2) + apple(3) + apt(5)
    expect(m.sum('ap')).toBe(10);
    expect(m.sum('app')).toBe(5); // app(2) + apple(3)
    expect(m.sum('apple')).toBe(3);
    expect(m.sum('apt')).toBe(5);
    expect(m.sum('zzz')).toBe(0);
  });

  it('insert 覆盖已有键而非累加', () => {
    const m = new MapSum();
    m.insert('key', 1);
    m.insert('key', 7);
    expect(m.sum('key')).toBe(7);
  });
});

describe.each([
  ['UnionFind1', UnionFind1],
  ['UnionFind2', UnionFind2],
  ['UnionFind3', UnionFind3],
  ['UnionFind4', UnionFind4],
])('%s 契约', (_name, Ctor) => {
  it('初始各自独立：find 指向自身，任意两点不连通', () => {
    const uf = new Ctor(10);
    // 注意 size 语义是「元素个数 n」，不随 union 变化（本接口未暴露分量数）
    expect(uf.size).toBe(10);
    expect(uf.isConnected(0, 1)).toBe(false);
    expect(uf.find(3)).toBe(3);
  });

  it('union 后两端 find 落到同一代表元', () => {
    const uf = new Ctor(10);
    uf.union(0, 1);
    expect(uf.isConnected(0, 1)).toBe(true);
    expect(uf.find(0)).toBe(uf.find(1));
    expect(uf.size).toBe(10);
    uf.union(1, 2);
    expect(uf.isConnected(0, 2)).toBe(true);
  });

  it('重复 union 同一对保持幂等', () => {
    const uf = new Ctor(6);
    uf.union(0, 1);
    const rep = uf.find(0);
    uf.union(0, 1);
    uf.union(1, 0);
    expect(uf.find(0)).toBe(rep);
    expect(uf.find(1)).toBe(rep);
    expect(uf.isConnected(0, 1)).toBe(true);
    expect(uf.isConnected(0, 2)).toBe(false);
  });

  it('传递闭包：一串 union 后首尾连通', () => {
    const uf = new Ctor(8);
    [2, 3, 4].forEach((v) => uf.union(1, v));
    uf.union(5, 6);
    expect(uf.isConnected(1, 4)).toBe(true);
    expect(uf.isConnected(4, 2)).toBe(true);
    expect(uf.isConnected(1, 5)).toBe(false);
    expect(uf.isConnected(6, 7)).toBe(false);
  });

  it('全部连通后任意两点互通', () => {
    const uf = new Ctor(5);
    for (let i = 1; i < 5; i++) uf.union(i - 1, i);
    for (let a = 0; a < 5; a++) {
      for (let b = 0; b < 5; b++) expect(uf.isConnected(a, b)).toBe(true);
    }
  });

  it('越界 find 抛错', () => {
    const uf = new Ctor(3);
    expect(() => uf.find(3)).toThrow();
    expect(() => uf.find(-1)).toThrow();
  });
});

// 键类型用 number：BSTMap 未传比较器时默认做数值相减，字符串键会得到 NaN，
// 导致所有查找静默失配（详见 PROJECT_MAP.md §8 的已知缺陷条目）。
describe.each([
  ['BSTMap', () => new BSTMap<number, string>()],
  ['LinkedListMap', () => new LinkedListMap<number, string>()],
])('%s 契约', (_name, make) => {
  it('add / get / contains / remove', () => {
    const m = make();
    m.add(1, 'a');
    m.add(2, 'b');
    expect(m.size).toBe(2);
    expect(m.get(1)).toBe('a');
    m.add(1, 'z'); // 已存在则更新而非追加
    expect(m.get(1)).toBe('z');
    expect(m.size).toBe(2);
    expect(m.contains(2)).toBe(true);
    expect(m.remove(1)).toBe('z');
    expect(m.contains(1)).toBe(false);
    expect(m.get(99)).toBeUndefined();
    expect(m.remove(99)).toBeUndefined();
    expect(m.size).toBe(1);
  });

  it('set 只更新已存在的键，缺失键抛错（两种实现一致）', () => {
    const m = make();
    m.add(7, 'x');
    m.set(7, 'y');
    expect(m.get(7)).toBe('y');
    expect(() => m.set(8, 'nope')).toThrow();
  });

  it('空 map 与全部删除', () => {
    const m = make();
    expect(m.isEmpty()).toBe(true);
    m.add(1, 'a');
    m.remove(1);
    expect(m.isEmpty()).toBe(true);
    expect(m.size).toBe(0);
  });
});

describe.each([
  ['BSTSet', () => new BSTSet<number>()],
  ['LinkedListSet', () => new LinkedListSet<number>()],
])('%s 契约', (_name, make) => {
  it('去重语义', () => {
    const s = make();
    [1, 2, 2, 3, 3, 3].forEach((v) => s.add(v));
    expect(s.size).toBe(3);
    expect(s.contains(2)).toBe(true);
    expect(s.contains(9)).toBe(false);
    s.remove(2);
    expect(s.contains(2)).toBe(false);
    expect(s.size).toBe(2);
    s.remove(2);
    expect(s.size).toBe(2);
  });
});

describe('交集函数', () => {
  it('intersection 返回去重交集', () => {
    expect([...intersection([1, 2, 2, 3], [2, 2, 3, 4])].sort()).toEqual([2, 3]);
  });

  it('intersect 保留重复次数（多重集交集）', () => {
    expect([...intersect([1, 2, 2, 3], [2, 2, 2, 4])].sort()).toEqual([2, 2]);
    expect(intersect([1, 2], [3, 4])).toEqual([]);
  });
});
