# 树堆 Treap

## 一、概念：随机平衡的二叉搜索树

**Treap = Tr**ee + h**eap**。每个节点同时持有两个关键值：

- `key`（或 `val`）：满足**二叉搜索树**性质（左 < 根 < 右）。
- `priority`：随机生成，满足**堆**性质（父节点的 priority ≥ 子节点，即最大堆）。

BST 性质保证中序遍历有序；堆性质（靠随机 priority）让树在期望意义下平衡，从而插入 / 删除 / 查找期望 **O(log n)**。**它不需要旋转平衡因子，实现比 AVL / 红黑树简单得多**。

> 与 Splay 的区别：Splay 靠「访问即上移」获得摊还平衡；Treap 靠「随机 priority + 堆性质」获得期望平衡。

## 二、插入

1. 按 BST 规则插入新节点，并赋予一个**随机 priority**。
2. 若新节点的 priority 大于其父节点，则旋转（左旋或右旋）把新节点**上浮**一层；重复直到父节点的 priority ≥ 本节点（或新节点已到根）。

```typescript tab
interface Node { val: number; pri: number; left: Node | null; right: Node | null; }

function rotateRight(y: Node): Node {
  const x = y.left!;
  y.left = x.right;
  x.right = y;
  return x;
}
function rotateLeft(x: Node): Node {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  return y;
}
function insert(root: Node | null, v: number): Node {
  if (!root) return { val: v, pri: Math.random(), left: null, right: null };
  if (v < root.val) {
    root.left = insert(root.left, v);
    if (root.left!.pri > root.pri) root = rotateRight(root);
  } else if (v > root.val) {
    root.right = insert(root.right, v);
    if (root.right!.pri > root.pri) root = rotateLeft(root);
  }
  return root;
}
```

```java tab
class Node {
    int val, pri;
    Node left, right;
    Node(int v) { val = v; pri = (int)(Math.random() * 1e9); }
}

Node rotateRight(Node y) { Node x = y.left; y.left = x.right; x.right = y; return x; }
Node rotateLeft(Node x) { Node y = x.right; x.right = y.left; y.left = x; return y; }

Node insert(Node root, int v) {
    if (root == null) return new Node(v);
    if (v < root.val) {
        root.left = insert(root.left, v);
        if (root.left.pri > root.pri) root = rotateRight(root);
    } else if (v > root.val) {
        root.right = insert(root.right, v);
        if (root.right.pri > root.pri) root = rotateLeft(root);
    }
    return root;
}
```

```python tab
import random

class Node:
    def __init__(self, v):
        self.val = v
        self.pri = random.random()
        self.left = None
        self.right = None

def rotate_right(y):
    x = y.left
    y.left = x.right
    x.right = y
    return x

def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = x
    return y

def insert(root, v):
    if root is None:
        return Node(v)
    if v < root.val:
        root.left = insert(root.left, v)
        if root.left.pri > root.pri:
            root = rotate_right(root)
    elif v > root.val:
        root.right = insert(root.right, v)
        if root.right.pri > root.pri:
            root = rotate_left(root)
    return root
```

## 三、删除

Treap 的删除很巧妙：把要删除的节点**反复与 priority 更大的孩子交换（旋转）**，直到它沉到叶子节点，然后直接删掉叶子。这样删除后整棵树仍满足堆性质，无需额外调整。

```text
delete(x):
  while x 有孩子:
    选 x 的 priority 更大的孩子 c
    rotate(c)        // c 旋转到 x 的位置，x 下沉一层
  // 此时 x 已是叶子
  断开 x 与其父节点的链接
```

## 四、复杂度

| 操作 | 期望复杂度 |
|---|---|
| 插入 / 删除 / 查找 | O(log n) |
| 中序遍历 | O(n) |

> 期望 O(log n) 由**随机 priority** 保证：随机排列构成的 BST 期望高度为 O(log n)，证明依赖「随机堆序 + BST 序」的组合结构。

## 五、应用场景

- **有序集合 / 有序映射**（竞赛题与手写平衡结构常用）。
- 需要**随机化以对抗刻意构造的退化数据**的场景（比固定规则的 AVL 更稳）。
- 配合子树大小可扩展为**名次树**（查第 k 大、排名）。
