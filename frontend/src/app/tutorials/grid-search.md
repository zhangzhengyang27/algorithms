# 网格搜索与岛屿问题：矩阵上的 BFS/DFS

## 一、为什么单独讲网格搜索

```mermaid
graph LR
  A[矩阵] --> B[BFS/DFS 框架]
  B --> C[标记访问]
  C --> D[统计连通块/周长]
```

"岛屿问题"是面试中出现频率最高的搜索类题型。它的本质是**在二维矩阵上跑 BFS/DFS**，所有题目共享同一套框架，只在"搜什么、怎么标记、统计什么"上有差异。

| 题目 | 搜索目标 | 方法 |
|------|----------|------|
| LC 200. 岛屿数量 | 连通块个数 | DFS/BFS 沉岛 |
| LC 695. 岛屿的最大面积 | 最大连通块 | DFS 计数 |
| LC 994. 腐烂的橘子 | 多源扩散层数 | 多源 BFS |
| LC 130. 被围绕的区域 | 边界连通块 | 边界 DFS 标记 |
| LC 463. 岛屿的周长 | 连通块边界 | DFS + 边界判定 |
| LC 1254. 封闭岛屿 | 不触边界的连通块 | DFS + 触边标记 |

## 二、通用框架

### 2.1 网格 DFS 模板

```java tab
void dfs(char[][] grid, int i, int j) {
    // 越界或不满足条件 → 返回
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) return;
    if (grid[i][j] != '1') return;

    grid[i][j] = '0';  // 标记已访问（沉岛）

    // 四方向扩展
    dfs(grid, i + 1, j);
    dfs(grid, i - 1, j);
    dfs(grid, i, j + 1);
    dfs(grid, i, j - 1);
}
```

```typescript tab
function dfs(grid: string[][], i: number, j: number): void {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) return;
    if (grid[i][j] !== '1') return;

    grid[i][j] = '0';  // 沉岛

    dfs(grid, i + 1, j);
    dfs(grid, i - 1, j);
    dfs(grid, i, j + 1);
    dfs(grid, i, j - 1);
}
```

```python tab
def dfs(grid: list[list[str]], i: int, j: int) -> None:
    if not (0 <= i < len(grid) and 0 <= j < len(grid[0])):
        return
    if grid[i][j] != '1':
        return
    grid[i][j] = '0'  # 沉岛
    dfs(grid, i + 1, j)
    dfs(grid, i - 1, j)
    dfs(grid, i, j + 1)
    dfs(grid, i, j - 1)
```

### 2.2 网格 BFS 模板

```typescript tab
function bfs(grid: string[][], i: number, j: number): number {
    const queue: [number, number][] = [[i, j]];
    grid[i][j] = '0';
    let area = 0;

    while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        area++;
        for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length
                && grid[nr][nc] === '1') {
                grid[nr][nc] = '0';  // 入队时标记，防止重复入队
                queue.push([nr, nc]);
            }
        }
    }
    return area;
}
```

**关键细节**：BFS 必须在**入队时**标记已访问，而非出队时，否则同一格子会被重复入队。

## 三、LC 200：岛屿数量

遍历每个格子，遇到 `'1'` 就计数 +1 并把整座岛沉掉：

```java tab
public int numIslands(char[][] grid) {
    int count = 0;
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == '1') {
                count++;
                dfs(grid, i, j);
            }
        }
    }
    return count;
}
```

```typescript tab
function numIslands(grid: string[][]): number {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === '1') {
                count++;
                dfs(grid, i, j);
            }
        }
    }
    return count;
}
```

```python tab
def numIslands(grid: list[list[str]]) -> int:
    count = 0
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == '1':
                count += 1
                dfs(grid, i, j)
    return count
```

**复杂度**：时间 O(m·n)，每个格子最多访问一次；空间 O(m·n) 最坏递归深度。

## 四、LC 695：岛屿的最大面积

DFS 返回连通块面积：

```typescript tab
function maxAreaOfIsland(grid: number[][]): number {
    let maxArea = 0;
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[0].length; j++)
            if (grid[i][j] === 1) maxArea = Math.max(maxArea, dfs(grid, i, j));
    return maxArea;
}

function dfs(grid: number[][], i: number, j: number): number {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) return 0;
    if (grid[i][j] !== 1) return 0;
    grid[i][j] = 0;
    return 1 + dfs(grid, i+1, j) + dfs(grid, i-1, j)
             + dfs(grid, i, j+1) + dfs(grid, i, j-1);
}
```

```python tab
def maxAreaOfIsland(grid: list[list[int]]) -> int:
    def dfs(i: int, j: int) -> int:
        if not (0 <= i < len(grid) and 0 <= j < len(grid[0])):
            return 0
        if grid[i][j] != 1:
            return 0
        grid[i][j] = 0
        return 1 + dfs(i+1, j) + dfs(i-1, j) + dfs(i, j+1) + dfs(i, j-1)

    return max(
        dfs(i, j)
        for i in range(len(grid))
        for j in range(len(grid[0]))
        if grid[i][j] == 1
    ) or 0
```

## 五、LC 994：腐烂的橘子（多源 BFS）

**多源 BFS**：所有初始腐烂的橘子同时入队，逐层扩散。层数 = 分钟数。

```java tab
public int orangesRotting(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    Queue<int[]> queue = new LinkedList<>();
    int fresh = 0;

    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 2) queue.offer(new int[]{i, j});
            else if (grid[i][j] == 1) fresh++;
        }

    if (fresh == 0) return 0;
    int minutes = 0;
    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};

    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int k = 0; k < size; k++) {
            int[] cell = queue.poll();
            for (int[] d : dirs) {
                int ni = cell[0] + d[0], nj = cell[1] + d[1];
                if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] == 1) {
                    grid[ni][nj] = 2;
                    fresh--;
                    queue.offer(new int[]{ni, nj});
                }
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes - 1 : -1;
}
```

```typescript tab
function orangesRotting(grid: number[][]): number {
    const m = grid.length, n = grid[0].length;
    const queue: [number, number][] = [];
    let fresh = 0;

    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++) {
            if (grid[i][j] === 2) queue.push([i, j]);
            else if (grid[i][j] === 1) fresh++;
        }

    if (fresh === 0) return 0;
    let minutes = 0;

    while (queue.length > 0) {
        const size = queue.length;
        for (let k = 0; k < size; k++) {
            const [r, c] = queue.shift()!;
            for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    queue.push([nr, nc]);
                }
            }
        }
        minutes++;
    }
    return fresh === 0 ? minutes - 1 : -1;
}
```

**要点**：
- 多源同时入队 = 虚拟超级源点
- 按层遍历（`size` 快照）计算分钟数
- 最后 `minutes - 1`（最后一层没有新感染）

## 六、LC 130：被围绕的区域

**逆向思维**：不找"被围绕的 O"，而是找"不被围绕的 O"（与边界连通的 O），其余全部翻转。

```typescript tab
function solve(board: string[][]): void {
    const m = board.length, n = board[0].length;

    // 从边界 O 出发，标记连通区域为 '#'
    for (let i = 0; i < m; i++) {
        dfs(board, i, 0);
        dfs(board, i, n - 1);
    }
    for (let j = 0; j < n; j++) {
        dfs(board, 0, j);
        dfs(board, m - 1, j);
    }

    // 翻转：O→X（被围绕），#→O（保留）
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++) {
            if (board[i][j] === 'O') board[i][j] = 'X';
            else if (board[i][j] === '#') board[i][j] = 'O';
        }
}

function dfs(board: string[][], i: number, j: number): void {
    if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) return;
    if (board[i][j] !== 'O') return;
    board[i][j] = '#';
    dfs(board, i+1, j); dfs(board, i-1, j);
    dfs(board, i, j+1); dfs(board, i, j-1);
}
```

## 七、LC 463：岛屿的周长

每个陆地格子贡献 4 条边，每有一个相邻陆地减 2（共享边被算了两次）：

```typescript tab
function islandPerimeter(grid: number[][]): number {
    let perimeter = 0;
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[0].length; j++)
            if (grid[i][j] === 1) {
                perimeter += 4;
                if (i > 0 && grid[i-1][j] === 1) perimeter -= 2;
                if (j > 0 && grid[i][j-1] === 1) perimeter -= 2;
            }
    return perimeter;
}
```

## 八、DFS vs BFS 选择

| 场景 | 推荐 | 原因 |
|------|------|------|
| 连通块计数/面积 | DFS | 代码简洁 |
| 最短距离/层数 | BFS | 天然按层扩展 |
| 多源同时扩散 | 多源 BFS | 超级源点技巧 |
| 网格极大（10⁶+） | BFS | 避免递归栈溢出 |
| 需要回溯路径 | DFS + 栈 | 递归天然记录路径 |

## 九、面试常见题

- 🟡 LC 200. 岛屿数量（超高频）
- 🟡 LC 695. 岛屿的最大面积
- 🟡 LC 994. 腐烂的橘子
- 🟡 LC 130. 被围绕的区域
- 🟢 LC 463. 岛屿的周长
- 🟡 LC 1254. 统计封闭岛屿的数目
- 🔴 LC 827. 最大人工岛（填海造陆）

## 十、易错点

1. **BFS 出队时才标记**：导致重复入队，时间爆炸。必须入队时标记。
2. **修改原数组 vs visited 数组**：面试先问能否修改输入；不能则开 visited。
3. **递归深度**：200×200 网格 DFS 递归深度可达 4×10⁴，Java 可能栈溢出，改 BFS。
4. **多源 BFS 忘记 minutes-1**：最后一层循环没有新感染但 minutes 已加。

## 十一、心法口诀

> **网格四方向，越界先返回；**
> **访问即标记，入队不等出队；**
> **多源同时走，层数即距离。**
