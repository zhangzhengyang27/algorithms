# 左偏树（Leftist Tree / 可并堆）

## 一、为什么学左偏树？

```mermaid
graph LR
  A[可并堆] --> B["左偏树 merge O(log n)"]
  B --> C[右链短, 沿右合并]
```

左偏树是支持高效**合并（merge）**的堆，解决二叉堆 merge 慢的问题：

| 操作 | 左偏树 | 二叉堆 |
|------|--------|--------|
| merge | O(log n) | O(n) |
| insert / extract-min | O(log n) | O(log n) |

应用：多路归并、可撤销贪心、Dijkstra 多源合并。

## 二、核心：dist（零路径长）

`dist(x)` = 从 x 到最近空子节点的距离。左偏性质：
**任一节点的左孩子 dist ≥ 右孩子 dist**（始终让右链更短）。

合并时把较矮的右孩子接上去，若破坏左偏则交换左右子树。

## 三、实现

```java tab
class Node { int val, dist; Node l, r; }
int dist(Node x) { return x == null ? -1 : x.dist; }
Node merge(Node a, Node b) {
    if (a == null) return b;
    if (b == null) return a;
    if (a.val > b.val) { Node t = a; a = b; b = t; } // 小根堆
    a.r = merge(a.r, b);
    if (dist(a.l) < dist(a.r)) { Node t = a.l; a.l = a.r; a.r = t; }
    a.dist = dist(a.r) + 1;
    return a;
}
Node insert(Node h, int v) { return merge(h, new Node(v)); }
Node extractMin(Node h) { return merge(h.l, h.r); }
```

```typescript tab
class Node { val = 0; dist = 0; l: Node | null = null; r: Node | null = null; }
function dist(x: Node | null): number { return x ? x.dist : -1; }
function merge(a: Node | null, b: Node | null): Node | null {
    if (!a) return b; if (!b) return a;
    if (a.val > b.val) { const t = a; a = b; b = t; }
    a.r = merge(a.r, b);
    if (dist(a.l) < dist(a.r)) { const t = a.l; a.l = a.r; a.r = t; }
    a.dist = dist(a.r) + 1;
    return a;
}
function insert(h: Node | null, v: number): Node | null { return merge(h, new Node(v)); }
function extractMin(h: Node | null): Node | null { return h ? merge(h.l, h.r) : null; }
```

```python tab
class Node:
    def __init__(self, val):
        self.val = val
        self.dist = 0
        self.l = self.r = None
def dist(x):
    return x.dist if x else -1
def merge(a, b):
    if not a: return b
    if not b: return a
    if a.val > b.val:
        a, b = b, a
    a.r = merge(a.r, b)
    if dist(a.l) < dist(a.r):
        a.l, a.r = a.r, a.l
    a.dist = dist(a.r) + 1
    return a
def insert(h, v): return merge(h, Node(v))
def extract_min(h): return merge(h.l, h.r) if h else None
```

## 四、复杂度

| 操作 | 复杂度 |
|------|--------|
| merge | O(log n) |
| insert / extract-min | O(log n) |

## 五、面试要点

1. 左偏性质保证右链短，merge 沿右链进行
2. 合并后若左孩子 dist < 右孩子 dist 则交换（维持左偏）
3. 与 skew heap（随机化）对比：左偏树确定性更优
