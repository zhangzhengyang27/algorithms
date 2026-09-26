# 欧拉回路与一笔画

欧拉回路/路径是图论中的经典问题：能否一笔画完所有边且不重复？从柯尼斯堡七桥问题到现代应用（DNA 测序、垃圾回收），欧拉算法无处不在。

## 一、基本概念

- **欧拉路径**：经过每条边恰好一次的路径（不要求回到起点）
- **欧拉回路**：经过每条边恰好一次且回到起点的回路
- **欧拉图**：存在欧拉回路的图

## 二、存在性判定

### 无向图

| 条件 | 欧拉回路 | 欧拉路径 |
|------|---------|---------|
| 连通性 | 所有边所在顶点连通 | 同左 |
| 度数 | 所有顶点度数为偶数 | 恰好 0 或 2 个奇度顶点 |

### 有向图

| 条件 | 欧拉回路 | 欧拉路径 |
|------|---------|---------|
| 连通性 | 弱连通 | 同左 |
| 度数 | 每个顶点入度=出度 | 一个出度-入度=1（起点），一个入度-出度=1（终点），其余相等 |

## 三、Hierholzer 算法（求欧拉回路）

核心思想：DFS + 回溯时记录边（后序）。

```java tab
// 无向图，邻接表 + 边删除
Map<Integer, Queue<Integer>> adj = new HashMap<>();
List<Integer> circuit = new ArrayList<>();

void hierholzer(int u) {
    Queue<Integer> neighbors = adj.getOrDefault(u, new LinkedList<>());
    while (!neighbors.isEmpty()) {
        int v = neighbors.poll();
        adj.get(v).remove(Integer.valueOf(u)); // 删除反向边
        hierholzer(v);
    }
    circuit.add(u); // 后序加入
}

// 使用
hierholzer(start);
Collections.reverse(circuit); // 反转得到欧拉回路
```

```typescript tab
// 无向图，邻接表 + 边删除
const adj = new Map<number, number[]>();
const circuit: number[] = [];

function hierholzer(u: number): void {
    const neighbors = adj.get(u) ?? [];
    while (neighbors.length > 0) {
        const v = neighbors.shift()!;
        const rev = adj.get(v)!;
        rev.splice(rev.indexOf(u), 1); // 删除反向边
        hierholzer(v);
    }
    circuit.push(u); // 后序加入
}

// 使用
hierholzer(start);
circuit.reverse(); // 反转得到欧拉回路
```

```python tab
# 无向图，邻接表 + 边删除
from collections import defaultdict, deque

adj = defaultdict(deque)
circuit = []

def hierholzer(u: int) -> None:
    while adj[u]:
        v = adj[u].popleft()
        adj[v].remove(u)  # 删除反向边
        hierholzer(v)
    circuit.append(u)  # 后序加入

# 使用
hierholzer(start)
circuit.reverse()  # 反转得到欧拉回路
```

### 有向图版本

```java tab
Map<Integer, Queue<Integer>> adj = new HashMap<>();
List<Integer> path = new ArrayList<>();

void dfs(int u) {
    Queue<Integer> q = adj.getOrDefault(u, new LinkedList<>());
    while (!q.isEmpty()) {
        int v = q.poll();
        dfs(v);
    }
    path.add(u);
}
```

```typescript tab
const adj = new Map<number, number[]>();
const path: number[] = [];

function dfs(u: number): void {
    const q = adj.get(u) ?? [];
    while (q.length > 0) {
        const v = q.shift()!;
        dfs(v);
    }
    path.push(u);
}
```

```python tab
from collections import defaultdict, deque

adj = defaultdict(deque)
path = []

def dfs(u: int) -> None:
    while adj[u]:
        v = adj[u].popleft()
        dfs(v)
    path.append(u)
```

## 四、LeetCode 经典：重新安排行程（332）

```java tab
// 有向图欧拉路径
public List<String> findItinerary(List<List<String>> tickets) {
    Map<String, PriorityQueue<String>> adj = new HashMap<>();
    for (List<String> t : tickets) {
        adj.computeIfAbsent(t.get(0), k -> new PriorityQueue<>()).add(t.get(1));
    }
    List<String> result = new ArrayList<>();
    dfs("JFK", adj, result);
    Collections.reverse(result);
    return result;
}

void dfs(String u, Map<String, PriorityQueue<String>> adj, List<String> result) {
    PriorityQueue<String> pq = adj.getOrDefault(u, new PriorityQueue<>());
    while (!pq.isEmpty()) {
        dfs(pq.poll(), adj, result);
    }
    result.add(u);
}
```

```typescript tab
// 有向图欧拉路径
function findItinerary(tickets: string[][]): string[] {
    const adj = new Map<string, string[]>();
    for (const [from, to] of tickets) {
        if (!adj.has(from)) adj.set(from, []);
        adj.get(from)!.push(to);
    }
    // 排序保证字典序
    for (const [, list] of adj) list.sort();

    const result: string[] = [];
    function dfs(u: string): void {
        const neighbors = adj.get(u) ?? [];
        while (neighbors.length > 0) {
            dfs(neighbors.shift()!);
        }
        result.push(u);
    }

    dfs("JFK");
    result.reverse();
    return result;
}
```

```python tab
# 有向图欧拉路径
from collections import defaultdict
import heapq

def find_itinerary(tickets: list[list[str]]) -> list[str]:
    adj = defaultdict(list)
    for frm, to in tickets:
        heapq.heappush(adj[frm], to)

    result = []
    def dfs(u: str) -> None:
        while adj[u]:
            dfs(heapq.heappop(adj[u]))
        result.append(u)

    dfs("JFK")
    result.reverse()
    return result
```

## 五、Fleury 算法（了解）

每次选一条"非桥"的边走。判断桥需要 O(m) → 总 O(m²)，不如 Hierholzer 的 O(m)。

## 六、应用

| 场景 | 说明 |
|------|------|
| 一笔画 | 判断能否一笔画完 |
| DNA 测序 | De Bruijn 图 → 欧拉路径 |
| 垃圾回收 | 扫描所有街道的最优路线 |
| 电路板布线 | 覆盖所有连线 |
| 字典序最小路径 | Hierholzer + 优先队列 |

## 七、复杂度

| 算法 | 时间 | 空间 |
|------|------|------|
| 判定（度数） | O(V + E) | O(V) |
| Hierholzer | O(E) | O(E) |
| Fleury | O(E²) | O(E) |

## 八、面试要点

1. **判定条件**：无向看奇度个数（0或2），有向看入度出度差
2. **Hierholzer 精髓**：后序记录 → 反转 = 欧拉路径
3. **字典序**：邻接表用 PriorityQueue（最小堆）
4. **删边**：保证每条边只走一次
5. **LeetCode**：332（重新安排行程）、753（破解保险箱）、2097（合法重新排列子集 ）

## 九、Hierholzer 算法过程模拟

以 LC 332 的机票 `[[JFK,SFO],[JFK,ATL],[SFO,ATL],[ATL,JFK],[ATL,SFO]]` 为例：

```
邻接表（按字典序排序）：
  JFK: [ATL, SFO]
  ATL: [JFK, SFO]
  SFO: [ATL]

Hierholzer（后序记录）：
  dfs(JFK):
    走 ATL → dfs(ATL):
      走 JFK → dfs(JFK):
        走 SFO → dfs(SFO):
          走 ATL → dfs(ATL):
            无边可走 → 记录 ATL
          记录 SFO
        记录 JFK
      记录 ATL
    记录 JFK

  记录顺序（后序）: [ATL, SFO, JFK, ATL, JFK]
  反转 → [JFK, ATL, JFK, SFO, ATL] ✓ 欧拉路径
```

**为什么“后序记录 + 反转”有效**：当某个节点“无路可走”时它一定是当前路径的终点；先记录的总是路径末端，反转后即为从起点到终点的顺序。

## 十、思考题

1. 为什么 Hierholzer 要用“后序”记录而不是“前序”？前序记录会在什么情况下出错？（提示：可能提前进入“死胡同”分支）
2. LC 332 要求字典序最小的行程，为什么贪心“每次选字典序最小的邻居”是正确的？（提示：欧拉路径的存在性保证不会“卡死”）
3. “一笔画”问题（如 LC 753 破解保险箱）如何转化为欧拉回路？节点和边分别代表什么？（提示：节点 = n-1 位密码状态，边 = n 位密码）

> 练习推荐：先在练习题模块完成 [岛屿数量](/problems/number-of-islands) 巩固图遍历，再挑战 LC 332 与 LC 753。
