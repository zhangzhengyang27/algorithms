# 2-SAT 问题

2-SAT（2-Satisfiability）是布尔可满足性问题的特殊情形：每个子句恰好含两个文字。它可以在 O(V+E) 时间内判定是否有解，并构造一组合法赋值。

## 一、问题形式

给定 n 个布尔变量 x₁, x₂, ..., xₙ 和 m 个约束（子句），每个子句形如：

```
(a ∨ b) = true
```

其中 a, b 是文字（变量或其否定）。问是否存在一组赋值使所有子句为真。

### 常见约束转化

| 约束 | 等价子句 |
|------|---------|
| a 必须为真 | (a ∨ a) |
| a 和 b 至少选一个 | (a ∨ b) |
| a 和 b 不能同时选 | (¬a ∨ ¬b) |
| a 和 b 必须同选/同不选 | (a∨¬b) ∧ (¬a∨b) |
| 选 a 则必须选 b | (¬a ∨ b) |

## 二、建图

对每个变量 xᵢ 建两个节点：xᵢ（真）和 ¬xᵢ（假），共 2n 个节点。

子句 (a ∨ b) 等价于两条蕴含：
- ¬a → b（如果 a 为假，则 b 必须为真）
- ¬b → a

```java tab
// 节点编号：x_i = 2*i, ¬x_i = 2*i+1
int neg(int x) { return x ^ 1; }

void addClause(int a, int b) {
    // (a ∨ b) → (¬a → b) 且 (¬b → a)
    adj[neg(a)].add(b);
    adj[neg(b)].add(a);
}
```

```typescript tab
// 节点编号：x_i = 2*i, ¬x_i = 2*i+1
function neg(x: number): number { return x ^ 1; }

function addClause(adj: number[][], a: number, b: number): void {
    // (a ∨ b) → (¬a → b) 且 (¬b → a)
    adj[neg(a)].push(b);
    adj[neg(b)].push(a);
}
```

```python tab
# 节点编号：x_i = 2*i, ¬x_i = 2*i+1
def neg(x: int) -> int:
    return x ^ 1

def add_clause(adj: list, a: int, b: int) -> None:
    # (a ∨ b) → (¬a → b) 且 (¬b → a)
    adj[neg(a)].append(b)
    adj[neg(b)].append(a)
```

## 三、判定：强连通分量

**定理**：2-SAT 有解 ⟺ 对任意变量 xᵢ，xᵢ 和 ¬xᵢ 不在同一个 SCC 中。

```java tab
// Tarjan 求 SCC
boolean isSatisfiable() {
    tarjanSCC(); // 得到 comp[] 数组
    for (int i = 0; i < n; i++) {
        if (comp[2 * i] == comp[2 * i + 1]) return false;
    }
    return true;
}
```

```typescript tab
// Tarjan 求 SCC
function isSatisfiable(n: number, comp: number[]): boolean {
    // tarjanSCC() 已得到 comp[] 数组
    for (let i = 0; i < n; i++) {
        if (comp[2 * i] === comp[2 * i + 1]) return false;
    }
    return true;
}
```

```python tab
# Tarjan 求 SCC
def is_satisfiable(n: int, comp: list) -> bool:
    # tarjan_scc() 已得到 comp[] 数组
    for i in range(n):
        if comp[2 * i] == comp[2 * i + 1]:
            return False
    return True
```

## 四、构造解

在缩点后的 DAG 上，按拓扑逆序赋值：

```java tab
boolean[] assignment = new boolean[n];
for (int i = 0; i < n; i++) {
    // SCC 编号是拓扑逆序（Tarjan 的特性）
    // comp 值小的在拓扑序后面
    assignment[i] = comp[2 * i] > comp[2 * i + 1];
}
```

```typescript tab
const assignment: boolean[] = new Array(n);
for (let i = 0; i < n; i++) {
    // SCC 编号是拓扑逆序（Tarjan 的特性）
    // comp 值小的在拓扑序后面
    assignment[i] = comp[2 * i] > comp[2 * i + 1];
}
```

```python tab
assignment = [False] * n
for i in range(n):
    # SCC 编号是拓扑逆序（Tarjan 的特性）
    # comp 值小的在拓扑序后面
    assignment[i] = comp[2 * i] > comp[2 * i + 1]
```

原理：如果 xᵢ 的 SCC 在 ¬xᵢ 之后（拓扑序更大），选 xᵢ = true。

## 五、完整模板

```java tab
public class TwoSAT {
    int n;
    List<Integer>[] adj;
    int[] dfn, low, comp, stack;
    boolean[] inStack;
    int timer, top, sccCnt;

    public TwoSAT(int n) {
        this.n = n;
        adj = new ArrayList[2 * n];
        for (int i = 0; i < 2 * n; i++) adj[i] = new ArrayList<>();
        dfn = new int[2 * n]; low = new int[2 * n];
        comp = new int[2 * n]; stack = new int[2 * n];
        inStack = new boolean[2 * n];
    }

    void addClause(int a, int b) {
        adj[a ^ 1].add(b);
        adj[b ^ 1].add(a);
    }

    // a 必须为真
    void setTrue(int a) { addClause(a, a); }

    // a 和 b 不能同时为真
    void notBoth(int a, int b) { addClause(a ^ 1, b ^ 1); }

    void tarjan(int u) {
        dfn[u] = low[u] = ++timer;
        stack[++top] = u; inStack[u] = true;
        for (int v : adj[u]) {
            if (dfn[v] == 0) { tarjan(v); low[u] = Math.min(low[u], low[v]); }
            else if (inStack[v]) low[u] = Math.min(low[u], dfn[v]);
        }
        if (dfn[u] == low[u]) {
            sccCnt++;
            while (true) {
                int w = stack[top--]; inStack[w] = false;
                comp[w] = sccCnt;
                if (w == u) break;
            }
        }
    }

    boolean solve(boolean[] ans) {
        for (int i = 0; i < 2 * n; i++)
            if (dfn[i] == 0) tarjan(i);
        for (int i = 0; i < n; i++) {
            if (comp[2 * i] == comp[2 * i + 1]) return false;
            ans[i] = comp[2 * i] > comp[2 * i + 1];
        }
        return true;
    }
}
```

```typescript tab
class TwoSAT {
    n: number;
    adj: number[][];
    dfn: number[]; low: number[]; comp: number[]; stack: number[];
    inStack: boolean[];
    timer = 0; top = -1; sccCnt = 0;

    constructor(n: number) {
        this.n = n;
        this.adj = Array.from({ length: 2 * n }, () => []);
        this.dfn = new Array(2 * n).fill(0);
        this.low = new Array(2 * n).fill(0);
        this.comp = new Array(2 * n).fill(0);
        this.stack = new Array(2 * n).fill(0);
        this.inStack = new Array(2 * n).fill(false);
    }

    addClause(a: number, b: number): void {
        this.adj[a ^ 1].push(b);
        this.adj[b ^ 1].push(a);
    }

    setTrue(a: number): void { this.addClause(a, a); }
    notBoth(a: number, b: number): void { this.addClause(a ^ 1, b ^ 1); }

    tarjan(u: number): void {
        this.dfn[u] = this.low[u] = ++this.timer;
        this.stack[++this.top] = u; this.inStack[u] = true;
        for (const v of this.adj[u]) {
            if (this.dfn[v] === 0) { this.tarjan(v); this.low[u] = Math.min(this.low[u], this.low[v]); }
            else if (this.inStack[v]) this.low[u] = Math.min(this.low[u], this.dfn[v]);
        }
        if (this.dfn[u] === this.low[u]) {
            this.sccCnt++;
            while (true) {
                const w = this.stack[this.top--]; this.inStack[w] = false;
                this.comp[w] = this.sccCnt;
                if (w === u) break;
            }
        }
    }

    solve(ans: boolean[]): boolean {
        for (let i = 0; i < 2 * this.n; i++)
            if (this.dfn[i] === 0) this.tarjan(i);
        for (let i = 0; i < this.n; i++) {
            if (this.comp[2 * i] === this.comp[2 * i + 1]) return false;
            ans[i] = this.comp[2 * i] > this.comp[2 * i + 1];
        }
        return true;
    }
}
```

```python tab
class TwoSAT:
    def __init__(self, n: int):
        self.n = n
        self.adj = [[] for _ in range(2 * n)]
        self.dfn = [0] * (2 * n)
        self.low = [0] * (2 * n)
        self.comp = [0] * (2 * n)
        self.stack = []
        self.in_stack = [False] * (2 * n)
        self.timer = 0
        self.scc_cnt = 0

    def add_clause(self, a: int, b: int) -> None:
        self.adj[a ^ 1].append(b)
        self.adj[b ^ 1].append(a)

    def set_true(self, a: int) -> None:
        self.add_clause(a, a)

    def not_both(self, a: int, b: int) -> None:
        self.add_clause(a ^ 1, b ^ 1)

    def tarjan(self, u: int) -> None:
        self.timer += 1
        self.dfn[u] = self.low[u] = self.timer
        self.stack.append(u)
        self.in_stack[u] = True
        for v in self.adj[u]:
            if self.dfn[v] == 0:
                self.tarjan(v)
                self.low[u] = min(self.low[u], self.low[v])
            elif self.in_stack[v]:
                self.low[u] = min(self.low[u], self.dfn[v])
        if self.dfn[u] == self.low[u]:
            self.scc_cnt += 1
            while True:
                w = self.stack.pop()
                self.in_stack[w] = False
                self.comp[w] = self.scc_cnt
                if w == u:
                    break

    def solve(self) -> tuple:
        ans = [False] * self.n
        for i in range(2 * self.n):
            if self.dfn[i] == 0:
                self.tarjan(i)
        for i in range(self.n):
            if self.comp[2 * i] == self.comp[2 * i + 1]:
                return False, ans
            ans[i] = self.comp[2 * i] > self.comp[2 * i + 1]
        return True, ans
```

## 六、经典应用

| 问题 | 建模 |
|------|------|
| 婚礼安排（POJ 3683） | 时间段不冲突 |
| 选代表（每队选1人） | 不能同时选冲突的人 |
| 染色（相邻不同色） | 颜色约束 |
| 课程安排 | 时间冲突 |

## 七、面试要点

1. **建图**：(a∨b) → 两条蕴含边
2. **判定**：Tarjan SCC，x 和 ¬x 同 SCC → 无解
3. **构造解**：按 SCC 拓扑逆序选
4. **复杂度**：O(V + E) = O(n + m)
5. **LeetCode**：无直接 2-SAT 题，但思想用于约束满足问题
