# 树的直径与重心

树的直径是树上最远两点的距离，树的重心是删除后使最大连通分量最小的点。两者都是树形 DP 的经典应用。

## 一、树的直径

### 定义

树上任意两点间距离的最大值。

### 方法一：两次 BFS/DFS

1. 从任意点出发，找到最远点 u
2. 从 u 出发，找到最远点 v
3. dist(u, v) = 直径

```java tab
// 适用于边权非负的树
int[] bfs(int start, List<int[]>[] adj) {
    int n = adj.length;
    int[] dist = new int[n];
    Arrays.fill(dist, -1);
    dist[start] = 0;
    Queue<Integer> q = new LinkedList<>();
    q.offer(start);
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int[] edge : adj[u]) {
            int v = edge[0], w = edge[1];
            if (dist[v] == -1) {
                dist[v] = dist[u] + w;
                q.offer(v);
            }
        }
    }
    return dist;
}

// 求直径
int treeDiameter(List<int[]>[] adj) {
    int[] d1 = bfs(0, adj);
    int u = maxIndex(d1);
    int[] d2 = bfs(u, adj);
    int v = maxIndex(d2);
    return d2[v];
}
```

```typescript tab
// 适用于边权非负的树
function bfs(start: number, adj: [number, number][][]): number[] {
    const n = adj.length;
    const dist = new Array(n).fill(-1);
    dist[start] = 0;
    const q: number[] = [start];
    while (q.length > 0) {
        const u = q.shift()!;
        for (const [v, w] of adj[u]) {
            if (dist[v] === -1) {
                dist[v] = dist[u] + w;
                q.push(v);
            }
        }
    }
    return dist;
}

// 求直径
function treeDiameter(adj: [number, number][][]): number {
    const d1 = bfs(0, adj);
    const u = d1.indexOf(Math.max(...d1));
    const d2 = bfs(u, adj);
    return Math.max(...d2);
}
```

```python tab
from collections import deque

# 适用于边权非负的树
def bfs(start: int, adj: list) -> list:
    n = len(adj)
    dist = [-1] * n
    dist[start] = 0
    q = deque([start])
    while q:
        u = q.popleft()
        for v, w in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + w
                q.append(v)
    return dist

# 求直径
def tree_diameter(adj: list) -> int:
    d1 = bfs(0, adj)
    u = d1.index(max(d1))
    d2 = bfs(u, adj)
    return max(d2)
```

### 方法二：树形 DP

```java tab
int diameter = 0;

// 返回以 u 为根的子树中，从 u 出发的最长路径
int dfs(int u, int parent, List<int[]>[] adj) {
    int max1 = 0, max2 = 0; // 最长和次长
    for (int[] edge : adj[u]) {
        int v = edge[0], w = edge[1];
        if (v == parent) continue;
        int d = dfs(v, u, adj) + w;
        if (d > max1) { max2 = max1; max1 = d; }
        else if (d > max2) { max2 = d; }
    }
    diameter = Math.max(diameter, max1 + max2); // 经过 u 的最长路径
    return max1;
}
```

```typescript tab
let diameter = 0;

// 返回以 u 为根的子树中，从 u 出发的最长路径
function dfs(u: number, parent: number, adj: [number, number][][]): number {
    let max1 = 0, max2 = 0; // 最长和次长
    for (const [v, w] of adj[u]) {
        if (v === parent) continue;
        const d = dfs(v, u, adj) + w;
        if (d > max1) { max2 = max1; max1 = d; }
        else if (d > max2) { max2 = d; }
    }
    diameter = Math.max(diameter, max1 + max2); // 经过 u 的最长路径
    return max1;
}
```

```python tab
diameter = 0

# 返回以 u 为根的子树中，从 u 出发的最长路径
def dfs(u: int, parent: int, adj: list) -> int:
    global diameter
    max1 = max2 = 0  # 最长和次长
    for v, w in adj[u]:
        if v == parent:
            continue
        d = dfs(v, u, adj) + w
        if d > max1:
            max2 = max1
            max1 = d
        elif d > max2:
            max2 = d
    diameter = max(diameter, max1 + max2)  # 经过 u 的最长路径
    return max1
```

## 二、树的重心

### 定义

删除该点后，最大连通分量的节点数最小。一棵树有 1 或 2 个重心。

### 性质

- 重心到所有节点的距离之和最小
- 两棵树的合并重心在原来两重心连线上

### 求法

```java tab
int[] size;
int centroid = -1, minMaxPart = Integer.MAX_VALUE;

void findCentroid(int u, int parent, int n, List<Integer>[] adj) {
    size[u] = 1;
    int maxPart = 0;
    for (int v : adj[u]) {
        if (v == parent) continue;
        findCentroid(v, u, n, adj);
        size[u] += size[v];
        maxPart = Math.max(maxPart, size[v]);
    }
    maxPart = Math.max(maxPart, n - size[u]); // 上方部分
    if (maxPart < minMaxPart) {
        minMaxPart = maxPart;
        centroid = u;
    }
}
```

```typescript tab
let size: number[];
let centroid = -1, minMaxPart = Infinity;

function findCentroid(u: number, parent: number, n: number, adj: number[][]): void {
    size[u] = 1;
    let maxPart = 0;
    for (const v of adj[u]) {
        if (v === parent) continue;
        findCentroid(v, u, n, adj);
        size[u] += size[v];
        maxPart = Math.max(maxPart, size[v]);
    }
    maxPart = Math.max(maxPart, n - size[u]); // 上方部分
    if (maxPart < minMaxPart) {
        minMaxPart = maxPart;
        centroid = u;
    }
}
```

```python tab
size = []
centroid = -1
min_max_part = float('inf')

def find_centroid(u: int, parent: int, n: int, adj: list) -> None:
    global centroid, min_max_part
    size[u] = 1
    max_part = 0
    for v in adj[u]:
        if v == parent:
            continue
        find_centroid(v, u, n, adj)
        size[u] += size[v]
        max_part = max(max_part, size[v])
    max_part = max(max_part, n - size[u])  # 上方部分
    if max_part < min_max_part:
        min_max_part = max_part
        centroid = u
```

## 三、应用

| 问题 | 方法 |
|------|------|
| 树的直径 | 两次 BFS / 树形 DP |
| 树的重心 | 一次 DFS 求子树大小 |
| 点分治 | 每次选重心作为分治中心 |
| 树上最远点对 | 直径 |
| 最小化最大子树 | 重心 |

## 四、点分治（简介）

利用重心将树分成 O(log n) 层：

1. 找当前树的重心
2. 处理经过重心的路径
3. 删除重心，递归处理各子树

时间 O(n log n)（每层 O(n)，共 log n 层）。

## 五、复杂度

| 操作 | 时间 |
|------|------|
| 两次 BFS 求直径 | O(n) |
| 树形 DP 求直径 | O(n) |
| 求重心 | O(n) |
| 点分治 | O(n log n) |

## 六、面试要点

1. **直径两次 BFS**：任意点→最远→最远
2. **树形 DP 直径**：维护最长+次长
3. **重心**：最大连通分量最小化
4. **点分治**：重心分治，处理跨子树路径
5. **LeetCode**：1245（树的直径）、543（二叉树直径）、834（树中距离之和，重心思想）
