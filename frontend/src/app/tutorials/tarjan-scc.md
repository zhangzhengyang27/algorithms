# Tarjan 算法：强连通分量

Tarjan 算法通过一次 DFS 求出有向图中所有**强连通分量（SCC）**，时间复杂度 O(V+E)。它是图论中最重要的线性算法之一。

## 一、基本概念

- **强连通**：有向图中 u 和 v 互相可达
- **强连通分量（SCC）**：极大的强连通子图
- **缩点**：将每个 SCC 视为一个超级节点，得到 DAG

## 二、核心概念：dfn 与 low

- `dfn[u]`：DFS 访问 u 的时间戳（发现序）
- `low[u]`：u 通过子树中的边能回溯到的**最早祖先**的 dfn

判定规则：当 `low[u] == dfn[u]` 时，u 是一个 SCC 的根。

## 三、代码实现

```java tab
public class TarjanSCC {
    private List<List<Integer>> graph;
    private int[] dfn, low;
    private boolean[] onStack;
    private Deque<Integer> stack;
    private int timer;
    private List<List<Integer>> sccs;

    public List<List<Integer>> findSCCs(List<List<Integer>> graph) {
        this.graph = graph;
        int n = graph.size();
        dfn = new int[n];
        low = new int[n];
        onStack = new boolean[n];
        stack = new ArrayDeque<>();
        sccs = new ArrayList<>();
        timer = 0;

        for (int i = 0; i < n; i++) {
            if (dfn[i] == 0) {
                dfs(i);
            }
        }
        return sccs;
    }

    private void dfs(int u) {
        dfn[u] = low[u] = ++timer;
        stack.push(u);
        onStack[u] = true;

        for (int v : graph.get(u)) {
            if (dfn[v] == 0) {
                // 未访问：递归
                dfs(v);
                low[u] = Math.min(low[u], low[v]);
            } else if (onStack[v]) {
                // 已访问且在栈中：回边
                low[u] = Math.min(low[u], dfn[v]);
            }
        }

        // u 是 SCC 的根
        if (low[u] == dfn[u]) {
            List<Integer> scc = new ArrayList<>();
            int w;
            do {
                w = stack.pop();
                onStack[w] = false;
                scc.add(w);
            } while (w != u);
            sccs.add(scc);
        }
    }
}
```

```typescript tab
class TarjanSCC {
    private graph: number[][];
    private dfn: number[];
    private low: number[];
    private onStack: boolean[];
    private stack: number[];
    private timer: number;
    private sccs: number[][];

    findSCCs(graph: number[][]): number[][] {
        this.graph = graph;
        const n = graph.length;
        this.dfn = new Array(n).fill(0);
        this.low = new Array(n).fill(0);
        this.onStack = new Array(n).fill(false);
        this.stack = [];
        this.sccs = [];
        this.timer = 0;

        for (let i = 0; i < n; i++) {
            if (this.dfn[i] === 0) {
                this.dfs(i);
            }
        }
        return this.sccs;
    }

    private dfs(u: number): void {
        this.dfn[u] = this.low[u] = ++this.timer;
        this.stack.push(u);
        this.onStack[u] = true;

        for (const v of this.graph[u]) {
            if (this.dfn[v] === 0) {
                // 未访问：递归
                this.dfs(v);
                this.low[u] = Math.min(this.low[u], this.low[v]);
            } else if (this.onStack[v]) {
                // 已访问且在栈中：回边
                this.low[u] = Math.min(this.low[u], this.dfn[v]);
            }
        }

        // u 是 SCC 的根
        if (this.low[u] === this.dfn[u]) {
            const scc: number[] = [];
            let w: number;
            do {
                w = this.stack.pop()!;
                this.onStack[w] = false;
                scc.push(w);
            } while (w !== u);
            this.sccs.push(scc);
        }
    }
}
```

```python tab
class TarjanSCC:
    def __init__(self):
        self.graph = []
        self.dfn = []
        self.low = []
        self.on_stack = []
        self.stack = []
        self.timer = 0
        self.sccs = []

    def find_sccs(self, graph: list[list[int]]) -> list[list[int]]:
        self.graph = graph
        n = len(graph)
        self.dfn = [0] * n
        self.low = [0] * n
        self.on_stack = [False] * n
        self.stack = []
        self.sccs = []
        self.timer = 0

        for i in range(n):
            if self.dfn[i] == 0:
                self._dfs(i)
        return self.sccs

    def _dfs(self, u: int) -> None:
        self.timer += 1
        self.dfn[u] = self.low[u] = self.timer
        self.stack.append(u)
        self.on_stack[u] = True

        for v in self.graph[u]:
            if self.dfn[v] == 0:
                # 未访问：递归
                self._dfs(v)
                self.low[u] = min(self.low[u], self.low[v])
            elif self.on_stack[v]:
                # 已访问且在栈中：回边
                self.low[u] = min(self.low[u], self.dfn[v])

        # u 是 SCC 的根
        if self.low[u] == self.dfn[u]:
            scc = []
            while True:
                w = self.stack.pop()
                self.on_stack[w] = False
                scc.append(w)
                if w == u:
                    break
            self.sccs.append(scc)
```

## 四、算法流程图解

```
DFS 遍历图：
1. 给节点标 dfn（时间戳）和 low（初始=dfn）
2. 将节点压栈
3. 遍历邻居：
   - 未访问 → 递归，回溯后 low[u] = min(low[u], low[v])
   - 在栈中 → low[u] = min(low[u], dfn[v])
4. 若 low[u] == dfn[u]：弹栈直到 u，形成一个 SCC
```

## 五、经典应用

### 1. 缩点 + DAG 上 DP

```java tab
// 缩点后求 DAG 最长路径
// 1. Tarjan 求 SCC
// 2. 建缩点图（DAG）
// 3. 拓扑排序 + DP
```

```typescript tab
// 缩点后求 DAG 最长路径
// 1. Tarjan 求 SCC
// 2. 建缩点图（DAG）
// 3. 拓扑排序 + DP
```

```python tab
# 缩点后求 DAG 最长路径
# 1. Tarjan 求 SCC
# 2. 建缩点图（DAG）
# 3. 拓扑排序 + DP
```

### 2. 2-SAT 问题

```java tab
// 2-SAT：每个变量选 true/false，满足所有子句
// 建图：每个变量两个节点 x, ¬x
// 若 x 和 ¬x 在同一 SCC → 无解
// 否则按 SCC 拓扑序赋值
```

```typescript tab
// 2-SAT：每个变量选 true/false，满足所有子句
// 建图：每个变量两个节点 x, ¬x
// 若 x 和 ¬x 在同一 SCC → 无解
// 否则按 SCC 拓扑序赋值
```

```python tab
# 2-SAT：每个变量选 true/false，满足所有子句
# 建图：每个变量两个节点 x, ¬x
# 若 x 和 ¬x 在同一 SCC → 无解
# 否则按 SCC 拓扑序赋值
```

### 3. 有向图桥/割点（无向图版本）

无向图中将 Tarjan 稍作修改可求桥和割点：
- 桥：`low[v] > dfn[u]`（u-v 是桥）
- 割点：存在子节点 v 使得 `low[v] >= dfn[u]`

## 六、复杂度

| 指标 | 值 |
|------|-----|
| 时间 | O(V + E) |
| 空间 | O(V)（栈 + 数组） |

## 七、面试要点

1. **dfn vs low 的区别**：dfn 是发现时间，low 是能回溯到的最早时间
2. **为什么用栈**：栈中保存当前 DFS 路径上可能属于同一 SCC 的节点
3. **onStack 的作用**：区分"已访问但属于其他 SCC"和"在当前 SCC 候选中"
4. **LeetCode**：1192（关键连接/桥）、1568（使图不连通的最少边数）
5. **与 Kosaraju 的区别**：Tarjan 一次 DFS，Kosaraju 需要两次（正序+逆序）
