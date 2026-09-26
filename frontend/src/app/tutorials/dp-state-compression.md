# 状态压缩 DP：用二进制表示状态




## 一、什么是状态压缩 DP

```mermaid
graph LR
  A[集合选取状态] --> B[二进制位表示]
  B --> C[整数即状态]
  C --> D[位运算转移]
```

**状态压缩 DP（Bitmask DP）** 用一个整数的**二进制位**表示一组元素的选取状态，从而将集合问题转化为 DP。

> 适用条件：元素个数 n 很小（通常 n ≤ 20），因为状态数为 2ⁿ。

| n | 状态数 2ⁿ | 可行性 |
|---|-----------|--------|
| 10 | 1024 | 轻松 |
| 15 | 32768 | 可行 |
| 20 | 1048576 | 勉强 |
| 25 | 33M | 太慢 |

## 二、位运算基础

```java tab
int mask = 0;
mask |= (1 << i);              // 选第 i 个
mask &= ~(1 << i);             // 去掉第 i 个
boolean has = (mask & (1 << i)) != 0;  // 第 i 个是否被选
int count = Integer.bitCount(mask);    // 选了几个
```
```typescript tab
let mask = 0;
mask |= (1 << i);              // 选第 i 个
mask &= ~(1 << i);             // 去掉第 i 个
const has = (mask & (1 << i)) !== 0;   // 第 i 个是否被选
const count = popcount(mask);          // 选了几个（需自行实现或用库）

function popcount(x: number): number {
    let c = 0;
    while (x) { c++; x &= x - 1; }
    return c;
}
```
```python tab
mask = 0
mask |= (1 << i)              # 选第 i 个
mask &= ~(1 << i)             # 去掉第 i 个
has = (mask & (1 << i)) != 0  # 第 i 个是否被选
count = bin(mask).count('1')  # 选了几个
```

## 三、经典案例

### 3.1 旅行商问题（TSP）

**问题**：从城市 0 出发，经过所有城市恰好一次后回到 0，求最短路径。

**状态**：`dp[mask][i]` = 已访问城市集合为 mask，当前在城市 i 的最短距离。

```java tab
public int tsp(int[][] dist) {
    int n = dist.length;
    int full = 1 << n;
    int[][] dp = new int[full][n];
    for (int[] row : dp) Arrays.fill(row, Integer.MAX_VALUE / 2);
    dp[1][0] = 0;   // 从城市 0 出发

    for (int mask = 1; mask < full; mask++) {
        for (int u = 0; u < n; u++) {
            if ((mask & (1 << u)) == 0) continue;   // u 必须在 mask 中
            if (dp[mask][u] >= Integer.MAX_VALUE / 2) continue;
            for (int v = 0; v < n; v++) {
                if ((mask & (1 << v)) != 0) continue;   // v 未访问
                int newMask = mask | (1 << v);
                dp[newMask][v] = Math.min(dp[newMask][v], dp[mask][u] + dist[u][v]);
            }
        }
    }

    int ans = Integer.MAX_VALUE / 2;
    int allVisited = full - 1;
    for (int u = 0; u < n; u++) {
        ans = Math.min(ans, dp[allVisited][u] + dist[u][0]);
    }
    return ans;
}
```
```typescript tab
function tsp(dist: number[][]): number {
    const n = dist.length;
    const full = 1 << n;
    const INF = 1e15;
    const dp: number[][] = Array.from({ length: full }, () => new Array(n).fill(INF));
    dp[1][0] = 0;
    for (let mask = 1; mask < full; mask++) {
        for (let u = 0; u < n; u++) {
            if (!(mask & (1 << u)) || dp[mask][u] >= INF) continue;
            for (let v = 0; v < n; v++) {
                if (mask & (1 << v)) continue;
                const nm = mask | (1 << v);
                dp[nm][v] = Math.min(dp[nm][v], dp[mask][u] + dist[u][v]);
            }
        }
    }
    let ans = INF;
    for (let u = 0; u < n; u++) ans = Math.min(ans, dp[full - 1][u] + dist[u][0]);
    return ans;
}
```
```python tab
def tsp(dist: list[list[int]]) -> int:
    n = len(dist)
    full = 1 << n
    INF = float('inf')
    dp = [[INF] * n for _ in range(full)]
    dp[1][0] = 0
    for mask in range(full):
        for u in range(n):
            if not (mask & (1 << u)):
                continue
            for v in range(n):
                if mask & (1 << v):
                    continue
                dp[mask | (1 << v)][v] = min(
                    dp[mask | (1 << v)][v],
                    dp[mask][u] + dist[u][v]
                )
    return min(dp[full - 1][u] + dist[u][0] for u in range(n))
```

- **时间**：O(2ⁿ × n²)，**空间**：O(2ⁿ × n)

### 3.2 全排列的计数（带约束）

**问题**：n 个数的排列中，满足相邻约束的有多少种？

```java tab
// dp[mask][last] = 已选集合 mask，最后一个数是 last 的方案数
int[][] dp = new int[1 << n][n];
for (int i = 0; i < n; i++) dp[1 << i][i] = 1;

for (int mask = 1; mask < (1 << n); mask++) {
    for (int last = 0; last < n; last++) {
        if ((mask & (1 << last)) == 0) continue;
        for (int next = 0; next < n; next++) {
            if ((mask & (1 << next)) != 0) continue;
            if (!valid(last, next)) continue;   // 约束检查
            dp[mask | (1 << next)][next] += dp[mask][last];
        }
    }
}
```
```typescript tab
// dp[mask][last] = 已选集合 mask，最后一个数是 last 的方案数
const dp: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(0));
for (let i = 0; i < n; i++) dp[1 << i][i] = 1;

for (let mask = 1; mask < (1 << n); mask++) {
    for (let last = 0; last < n; last++) {
        if (!(mask & (1 << last))) continue;
        for (let next = 0; next < n; next++) {
            if (mask & (1 << next)) continue;
            if (!valid(last, next)) continue;   // 约束检查
            dp[mask | (1 << next)][next] += dp[mask][last];
        }
    }
}
```
```python tab
# dp[mask][last] = 已选集合 mask，最后一个数是 last 的方案数
dp = [[0] * n for _ in range(1 << n)]
for i in range(n):
    dp[1 << i][i] = 1

for mask in range(1, 1 << n):
    for last in range(n):
        if not (mask & (1 << last)):
            continue
        for nxt in range(n):
            if mask & (1 << nxt):
                continue
            if not valid(last, nxt):
                continue  # 约束检查
            dp[mask | (1 << nxt)][nxt] += dp[mask][last]
```

### 3.3 最短超级串 / 集合覆盖

**问题**：给定 n 个字符串，找包含所有串的最短超级串。

状态：`dp[mask][i]` = 已包含 mask 中的串，当前以第 i 个串结尾的最短长度。

## 四、子集枚举技巧

### 4.1 枚举 mask 的所有子集

```java tab
for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
    // sub 是 mask 的子集
}
```
```typescript tab
for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
    // sub 是 mask 的子集
}
```
```python tab
sub = mask
while sub > 0:
    # sub 是 mask 的子集
    sub = (sub - 1) & mask
```

- 总复杂度：O(3ⁿ)（所有 mask 的子集总数）

### 4.2 枚举大小为 k 的子集

```java tab
// Gosper's Hack
int subset = (1 << k) - 1;
while (subset < (1 << n)) {
    // 处理 subset
    int x = subset & (-subset);
    int y = subset + x;
    subset = ((subset & ~y) / x >> 1) | y;
}
```
```typescript tab
// Gosper's Hack
let subset = (1 << k) - 1;
while (subset < (1 << n)) {
    // 处理 subset
    const x = subset & (-subset);
    const y = subset + x;
    subset = (((subset & ~y) / x) >> 1) | y;
}
```
```python tab
# Gosper's Hack
subset = (1 << k) - 1
while subset < (1 << n):
    # 处理 subset
    x = subset & (-subset)
    y = subset + x
    subset = (((subset & ~y) // x) >> 1) | y
```

## 五、状态压缩 DP 的识别信号

| 信号 | 说明 |
|------|------|
| n ≤ 20 | 状态数 2ⁿ 可接受 |
| "选/不选"的集合 | 用二进制位表示 |
| 排列/组合约束 | 相邻、顺序限制 |
| TSP / 哈密顿路径 | 经典状压题 |
| 棋盘放置（小棋盘） | 每行状态压缩 |

## 六、棋盘状压（进阶）

**问题**：在 n×m 棋盘上放棋子，某些格子不能放，求方案数。

- 每行的放置方案用一个 m 位整数表示
- 预处理合法行状态（无相邻）
- 行间转移：上下行不冲突

```java tab
// 预处理：所有合法的单行状态
List<Integer> validRows = new ArrayList<>();
for (int s = 0; s < (1 << m); s++) {
    if ((s & (s << 1)) == 0) validRows.add(s);   // 无相邻 1
}

// dp[i][state] = 前 i 行，第 i 行状态为 state 的方案数
for (int i = 1; i <= n; i++) {
    for (int cur : validRows) {
        if ((cur & blocked[i]) != 0) continue;   // 不能放在障碍上
        for (int prev : validRows) {
            if ((cur & prev) != 0) continue;      // 上下不冲突
            dp[i][cur] += dp[i - 1][prev];
        }
    }
}
```
```typescript tab
// 预处理：所有合法的单行状态
const validRows: number[] = [];
for (let s = 0; s < (1 << m); s++) {
    if ((s & (s << 1)) === 0) validRows.push(s);   // 无相邻 1
}

// dp[i][state] = 前 i 行，第 i 行状态为 state 的方案数
for (let i = 1; i <= n; i++) {
    for (const cur of validRows) {
        if ((cur & blocked[i]) !== 0) continue;   // 不能放在障碍上
        for (const prev of validRows) {
            if ((cur & prev) !== 0) continue;      // 上下不冲突
            dp[i][cur] += dp[i - 1][prev];
        }
    }
}
```
```python tab
# 预处理：所有合法的单行状态
valid_rows = []
for s in range(1 << m):
    if (s & (s << 1)) == 0:
        valid_rows.append(s)  # 无相邻 1

# dp[i][state] = 前 i 行，第 i 行状态为 state 的方案数
for i in range(1, n + 1):
    for cur in valid_rows:
        if (cur & blocked[i]) != 0:
            continue  # 不能放在障碍上
        for prev in valid_rows:
            if (cur & prev) != 0:
                continue  # 上下不冲突
            dp[i][cur] += dp[i - 1][prev]
```

## 七、面试常见题

- 🟡 匹配sticks 拼正方形、划分为 K 个相等子集
- 🟠 旅行商问题、最短超级串
- 🔴 棋盘放置、集合覆盖、状压 + 树形 DP

## 八、调试技巧

1. **位运算优先级**：`mask & (1 << i) == 0` 要加括号！`&` 优先级低于 `==`。
2. **状态数**：`1 << n` 别写成 `1 << (n-1)`。
3. **初始化**：只有初始状态 `dp[初始mask][起点] = 0`，其余为 INF。
4. **n 的范围**：n > 20 基本不可行，考虑其他方法。
