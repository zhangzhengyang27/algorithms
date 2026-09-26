# 红黑树：自平衡二叉搜索树的工程实现




## 一、为什么需要红黑树？

普通 BST 在极端情况下会退化成链表（O(n) 操作）。  
**平衡 BST** 通过旋转操作保证树高始终为 O(log n)，从而保证所有操作的对数复杂度。

**主流平衡 BST 对比：**

| 树 | 严格平衡？ | 插入删除效率 | 工程应用 |
|----|-----------|--------------|----------|
| AVL | ✅ 严格 | 旋转多，删除成本高 | 数据库索引（读密集） |
| **红黑树** | ❌ 近似 | 旋转少 | Java TreeMap, C++ STL map |
| 2-3 树 / 2-3-4 树 | ✅ 严格 | 复杂 | B 树前身 |
| B 树 / B+ 树 | ✅（页级） | 适合外存 | 数据库、文件系统 |
| 跳表 | ❌ 概率 | 简单 | Redis ZSet |

## 二、红黑树的性质

红黑树是**每个节点带颜色**的二叉搜索树，满足 5 条性质：

1. **节点是红或黑**。
2. **根节点是黑**。
3. **每个叶子（NIL 哨兵）是黑**。
4. **红节点的子节点必须是黑**（不能连续两个红）。
5. **从任一节点到其所有 NIL 叶子的路径上，黑节点数相同**（黑高）。

由这些性质推出：**最长路径 ≤ 2 × 最短路径** → 树高 O(log n)。

## 三、为什么这些性质能保证平衡？

```text
假设黑高 = h。
- 最短路径：全黑 → h 个节点。
- 最长路径：红黑交替 → 2h 个节点。

比值 ≤ 2 → 树是"近似平衡"。
```

## 四、插入操作

### 4.1 步骤

1. **BST 方式插入**，新节点颜色为 **RED**（插入黑节点会破坏黑高）。
2. **修复**（最多 2 次旋转 + 重新着色）。

### 4.2 修复分情况（设 uncle 为父节点的兄弟）

| 情况 | uncle 颜色 | 操作 |
|------|-----------|------|
| 1 | 红 | 父和 uncle 变黑，祖父变红，向上递归 |
| 2 | 黑 / NIL | 父是祖父左子、自己是父右子 → 左旋父（变情况 3）|
| 3 | 黑 / NIL | 父变黑，祖父变红，以祖父为支点右旋 |

### 4.3 关键点

- **情况 1**：不变树形，只重新染色。
- **情况 2 → 3**：先变形成"同侧"。
- **情况 3**：旋转 + 染色，结束。

## 五、删除操作（最复杂）

删除比插入复杂得多，分**6 种情况**。核心思路：

1. **删除节点**：若删除红节点，无需修复。若删除黑节点，黑高被破坏，需要"额外黑色"补救。
2. **修复**：通过旋转和染色恢复性质。

**6 种情况分类**（设兄弟为 s）：

| 情况 | 兄弟状态 | 操作 |
|------|----------|------|
| 1 | s 红 | s 变黑，父变红，左旋父（变情况 2/3/4） |
| 2 | s 黑，s 两子黑 | s 变红，向上递归 |
| 3 | s 黑，s 左红右黑 | s 变红，s 左子变黑，右旋 s（变情况 4） |
| 4 | s 黑，s 右红 | s 继承父颜色，父变黑，s 右子变黑，左旋父 |

> 红黑树的删除正确性证明是数据结构课最难的环节之一。

## 六、代码实现（简化版）

```java tab
enum Color { RED, BLACK }

class Node {
    int key;
    Color color = Color.RED;   // 新节点默认红色
    Node left, right, parent;

    Node(int key) { this.key = key; }
}

public class RBTree {
    private Node root;
    private final Node NIL = new Node(0);   // 哨兵
    { NIL.color = Color.BLACK; }

    private void leftRotate(Node x) {
        Node y = x.right;
        x.right = y.left;
        if (y.left != NIL) y.left.parent = x;
        y.parent = x.parent;
        if (x.parent == NIL) root = y;
        else if (x == x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x;
        x.parent = y;
    }

    private void rightRotate(Node y) {
        Node x = y.left;
        y.left = x.right;
        if (x.right != NIL) x.right.parent = y;
        x.parent = y.parent;
        if (y.parent == NIL) root = x;
        else if (y == y.parent.right) y.parent.right = x;
        else y.parent.left = x;
        x.right = y;
        y.parent = x;
    }

    private void fixInsert(Node z) {
        while (z.parent.color == Color.RED) {
            Node gp = z.parent.parent;
            if (z.parent == gp.left) {
                Node uncle = gp.right;
                if (uncle.color == Color.RED) {        // 情况 1
                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    gp.color = Color.RED;
                    z = gp;
                } else {
                    if (z == z.parent.right) {         // 情况 2 → 转情况 3
                        z = z.parent;
                        leftRotate(z);
                    }
                    z.parent.color = Color.BLACK;       // 情况 3
                    gp.color = Color.RED;
                    rightRotate(gp);
                }
            } else { /* 对称情形：父是祖父右子 */ }
        }
        root.color = Color.BLACK;
    }

    private void fixDelete(Node x) {
        while (x != root && x.color == Color.BLACK) {
            if (x == x.parent.left) {
                Node w = x.parent.right;               // 兄弟
                if (w.color == Color.RED) {            // 情况 1
                    w.color = Color.BLACK;
                    x.parent.color = Color.RED;
                    leftRotate(x.parent);
                    w = x.parent.right;
                }
                if (w.left.color == Color.BLACK && w.right.color == Color.BLACK) {  // 情况 2
                    w.color = Color.RED;
                    x = x.parent;
                } else {
                    if (w.right.color == Color.BLACK) {  // 情况 3 → 转 4
                        w.left.color = Color.BLACK;
                        w.color = Color.RED;
                        rightRotate(w);
                        w = x.parent.right;
                    }
                    w.color = x.parent.color;             // 情况 4
                    x.parent.color = Color.BLACK;
                    w.right.color = Color.BLACK;
                    leftRotate(x.parent);
                    x = root;
                }
            } else { /* 对称情形 */ }
        }
        x.color = Color.BLACK;
    }
}
```

```typescript tab
enum Color { RED, BLACK }

class RBNode {
    key: number;
    color: Color = Color.RED;
    left: RBNode;
    right: RBNode;
    parent: RBNode;
    constructor(key: number) { this.key = key; }
}

class RBTree {
    private root: RBNode;
    private NIL: RBNode;

    constructor() {
        this.NIL = new RBNode(0);
        this.NIL.color = Color.BLACK;
        this.root = this.NIL;
    }

    private leftRotate(x: RBNode): void {
        const y = x.right;
        x.right = y.left;
        if (y.left !== this.NIL) y.left.parent = x;
        y.parent = x.parent;
        if (x.parent === this.NIL) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x;
        x.parent = y;
    }

    private rightRotate(y: RBNode): void {
        const x = y.left;
        y.left = x.right;
        if (x.right !== this.NIL) x.right.parent = y;
        x.parent = y.parent;
        if (y.parent === this.NIL) this.root = x;
        else if (y === y.parent.right) y.parent.right = x;
        else y.parent.left = x;
        x.right = y;
        y.parent = x;
    }

    private fixInsert(z: RBNode): void {
        while (z.parent.color === Color.RED) {
            const gp = z.parent.parent;
            if (z.parent === gp.left) {
                const uncle = gp.right;
                if (uncle.color === Color.RED) {
                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    gp.color = Color.RED;
                    z = gp;
                } else {
                    if (z === z.parent.right) { z = z.parent; this.leftRotate(z); }
                    z.parent.color = Color.BLACK;
                    gp.color = Color.RED;
                    this.rightRotate(gp);
                }
            } else { /* 对称情形 */ }
        }
        this.root.color = Color.BLACK;
    }
}
```

```python tab
class Color(Enum):
    RED = 0
    BLACK = 1

class RBNode:
    def __init__(self, key: int):
        self.key = key
        self.color = Color.RED
        self.left = None
        self.right = None
        self.parent = None

class RBTree:
    def __init__(self):
        self.NIL = RBNode(0)
        self.NIL.color = Color.BLACK
        self.root = self.NIL

    def _left_rotate(self, x: RBNode) -> None:
        y = x.right
        x.right = y.left
        if y.left != self.NIL:
            y.left.parent = x
        y.parent = x.parent
        if x.parent == self.NIL:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y

    def _right_rotate(self, y: RBNode) -> None:
        x = y.left
        y.left = x.right
        if x.right != self.NIL:
            x.right.parent = y
        x.parent = y.parent
        if y.parent == self.NIL:
            self.root = x
        elif y == y.parent.right:
            y.parent.right = x
        else:
            y.parent.left = x
        x.right = y
        y.parent = x

    def _fix_insert(self, z: RBNode) -> None:
        while z.parent.color == Color.RED:
            gp = z.parent.parent
            if z.parent == gp.left:
                uncle = gp.right
                if uncle.color == Color.RED:
                    z.parent.color = Color.BLACK
                    uncle.color = Color.BLACK
                    gp.color = Color.RED
                    z = gp
                else:
                    if z == z.parent.right:
                        z = z.parent
                        self._left_rotate(z)
                    z.parent.color = Color.BLACK
                    gp.color = Color.RED
                    self._right_rotate(gp)
            else:  # 对称情形
                pass
        self.root.color = Color.BLACK
```

## 七、复杂度

| 操作 | 时间 |
|------|------|
| 查找 | O(log n) |
| 插入 | O(log n) |
| 删除 | O(log n) |
| 旋转次数 | ≤ 2（插入）/ ≤ 3（删除）|

> **关键事实**：红黑树的插入最多 2 次旋转，删除最多 3 次旋转。AVL 树的删除可能更多。

## 八、工程应用

| 系统 | 使用红黑树的位置 |
|------|------------------|
| Java | `TreeMap`, `TreeSet` |
| C++ STL | `std::map`, `std::set` |
| Linux 内核 | CFS 调度器、虚拟内存管理 |
| Nginx | 定时器管理 |
| epoll | 事件回调管理 |

> **为什么选红黑树而不是 AVL？**  
> 红黑树的插入/删除旋转更少（≤ 3 次），而 AVL 树为了严格平衡需要更多旋转。对于写密集场景，红黑树性能更稳定。

## 九、常见面试题

### Q1: 红黑树和 AVL 树怎么选？

| 场景 | 推荐 |
|------|------|
| 读多写少 | AVL（更严格的平衡） |
| 写多读少 | 红黑树（更少的旋转） |
| 通用 | 红黑树（工业界默认） |

### Q2: 红黑树为什么不用 NIL 哨兵会出 bug？

> 旋转和删除时，需要判断 `null` 还是叶子，统一用 NIL 哨兵可以让边界条件统一处理。

### Q3: 怎么证明"最长路径 ≤ 2 × 最短路径"？

> 性质 4 + 性质 5：路径上红黑交替上限（红不连续），且黑节点数固定。最长全是红黑交替，最短全是黑。比值 = 2。

## 十、心法口诀

> **左红右黑不能连续，红黑交替算平衡。**  
> **插入修复三情况，叔叔红则染色，叔叔黑则旋转。**  
> **删除修复四情况，兄弟红则染色旋转，兄弟黑看侄子。**
