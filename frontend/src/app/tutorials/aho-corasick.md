# AC 自动机

AC 自动机（Aho-Corasick）= Trie + KMP 的 fail 指针，实现多模式串匹配：在文本中同时查找所有模式串，时间 O(n + 总模式长 + 匹配数)。

## 一、问题场景

- 敏感词过滤：文本中同时匹配 10000 个词
- 病毒特征码检测
- 多模式串出现次数统计

对每个模式单独 KMP → O(n × k)；AC 自动机 → O(n + Σm)。

## 二、构建步骤

### 1. 建 Trie

```java tab
int[][] next = new int[MAXNODE][26];
int[] fail = new int[MAXNODE];
int[] count = new int[MAXNODE]; // 记录哪些模式在此结束
int tot = 0;

void insert(String s, int id) {
    int p = 0;
    for (char c : s.toCharArray()) {
        int idx = c - 'a';
        if (next[p][idx] == 0) next[p][idx] = ++tot;
        p = next[p][idx];
    }
    count[p]++; // 或记录 id
}
```

```typescript tab
const next: number[][] = Array.from({ length: MAXNODE }, () => new Array(26).fill(0));
const fail = new Array(MAXNODE).fill(0);
const count = new Array(MAXNODE).fill(0); // 记录哪些模式在此结束
let tot = 0;

function insert(s: string, id: number): void {
    let p = 0;
    for (const c of s) {
        const idx = c.charCodeAt(0) - 97;
        if (next[p][idx] === 0) next[p][idx] = ++tot;
        p = next[p][idx];
    }
    count[p]++; // 或记录 id
}
```

```python tab
nxt = [[0] * 26 for _ in range(MAXNODE)]
fail = [0] * MAXNODE
count = [0] * MAXNODE  # 记录哪些模式在此结束
tot = 0

def insert(s: str, id: int) -> None:
    global tot
    p = 0
    for c in s:
        idx = ord(c) - ord('a')
        if nxt[p][idx] == 0:
            tot += 1
            nxt[p][idx] = tot
        p = nxt[p][idx]
    count[p] += 1  # 或记录 id
```

### 2. BFS 建 fail 指针

fail[u] = 当 u 失配时跳转到的最长后缀节点（类似 KMP 的 next）。

```java tab
void buildFail() {
    Queue<Integer> queue = new LinkedList<>();
    // 第一层：fail 指向根
    for (int c = 0; c < 26; c++) {
        if (next[0][c] != 0) {
            fail[next[0][c]] = 0;
            queue.offer(next[0][c]);
        }
    }
    while (!queue.isEmpty()) {
        int u = queue.poll();
        for (int c = 0; c < 26; c++) {
            int v = next[u][c];
            if (v != 0) {
                fail[v] = next[fail[u]][c]; // 关键！
                queue.offer(v);
            } else {
                next[u][c] = next[fail[u]][c]; // 路径压缩（可选）
            }
        }
    }
}
```

```typescript tab
function buildFail(): void {
    const queue: number[] = [];
    // 第一层：fail 指向根
    for (let c = 0; c < 26; c++) {
        if (next[0][c] !== 0) {
            fail[next[0][c]] = 0;
            queue.push(next[0][c]);
        }
    }
    let head = 0;
    while (head < queue.length) {
        const u = queue[head++];
        for (let c = 0; c < 26; c++) {
            const v = next[u][c];
            if (v !== 0) {
                fail[v] = next[fail[u]][c]; // 关键！
                queue.push(v);
            } else {
                next[u][c] = next[fail[u]][c]; // 路径压缩（可选）
            }
        }
    }
}
```

```python tab
from collections import deque

def build_fail() -> None:
    queue = deque()
    # 第一层：fail 指向根
    for c in range(26):
        if nxt[0][c] != 0:
            fail[nxt[0][c]] = 0
            queue.append(nxt[0][c])
    while queue:
        u = queue.popleft()
        for c in range(26):
            v = nxt[u][c]
            if v != 0:
                fail[v] = nxt[fail[u]][c]  # 关键！
                queue.append(v)
            else:
                nxt[u][c] = nxt[fail[u]][c]  # 路径压缩（可选）
```

### 3. 匹配

```java tab
int search(String text) {
    int p = 0, result = 0;
    for (char c : text.toCharArray()) {
        p = next[p][c - 'a'];
        // 沿 fail 链统计所有匹配
        int tmp = p;
        while (tmp != 0) {
            result += count[tmp];
            count[tmp] = 0; // 避免重复计数（如果只统计一次）
            tmp = fail[tmp];
        }
    }
    return result;
}
```

```typescript tab
function search(text: string): number {
    let p = 0, result = 0;
    for (const c of text) {
        p = next[p][c.charCodeAt(0) - 97];
        // 沿 fail 链统计所有匹配
        let tmp = p;
        while (tmp !== 0) {
            result += count[tmp];
            count[tmp] = 0; // 避免重复计数（如果只统计一次）
            tmp = fail[tmp];
        }
    }
    return result;
}
```

```python tab
def search(text: str) -> int:
    p, result = 0, 0
    for c in text:
        p = nxt[p][ord(c) - ord('a')]
        # 沿 fail 链统计所有匹配
        tmp = p
        while tmp != 0:
            result += count[tmp]
            count[tmp] = 0  # 避免重复计数（如果只统计一次）
            tmp = fail[tmp]
    return result
```

## 三、图解 fail 指针

```
模式: he, she, his, hers

Trie:
    root
   / | \
  h  s  ...
 / \   \
e   i   h
|   |    |
r   s    e
|
s

fail[she的e] → he的e（"she"的后缀"he"在Trie中）
```

## 四、复杂度

| 阶段 | 时间 |
|------|------|
| 建 Trie | O(Σm)（所有模式总长） |
| 建 fail | O(Σm × 字符集) |
| 匹配 | O(n × 字符集) 或 O(n + 匹配数) |

## 五、优化技巧

1. **路径压缩**：`next[u][c] = next[fail[u]][c]`（空边补全），匹配时 O(n)
2. **last 指针**：只跳到有模式结束的 fail 节点，减少无效遍历
3. **拓扑排序统计**：匹配时只标记，最后按 fail 树拓扑序累加

## 六、面试要点

1. **本质**：Trie 上跑 KMP，fail 指针 = 最长真后缀在 Trie 中的位置
2. **BFS 建 fail**：`fail[child] = next[fail[parent]][c]`
3. **匹配时沿 fail 链收集**：一次遍历找到所有匹配的模式
4. **与 KMP 对比**：KMP 单模式 O(n+m)；AC 多模式 O(n+Σm)
5. **LeetCode**：1032（字符流）、2167（移除所有载有违禁品的车厢）

## 七、fail 指针构建过程模拟

以模式集 `{he, she, his, hers}` 为例，在 Trie 上构建 fail 指针：

```
Trie 结构（数字为节点）：
          0(root)
         / | \
        h  s  ...
       / \   \
      1(e) 3(i)  ...
      |     |
     ...   4(s)

fail 指针构建（BFS 逐层）：
  - 第1层节点：fail = root
  - 节点 "she" 的 e 节点：
      fail["she"] = next[fail["sh"]][e] = next["h"][e] = "he" 节点
      → "she" 的后缀 "he" 恰好也是一个模式！

匹配 "ushers" 时：
  u→s→h→e→r→s
  走到 "she" 时，沿 fail 链发现 "he" 也匹配
  → 一次扫描同时找到 she, he, hers 三个模式 ✓
```

**核心直觉**：fail 指针让“当前匹配失败时，跳到另一个最长后缀继续”，与 KMP 的 next 数组思想完全一致，只是从“字符串”搬到了“Trie”。

## 八、思考题

1. 为什么构建 fail 指针必须用 BFS（按层）而不能用 DFS？（提示：fail[child] 依赖 fail[parent]，而 parent 的 fail 指向的节点层数更低）
2. 如果某个模式串是另一个模式串的子串（如 he 是 she 的后缀），AC 自动机如何保证两者都被报告？（提示：fail 链收集或 output 指针）
3. AC 自动机与“对每个模式串分别跑一次 KMP”相比，优势在哪里？什么场景下后者反而更简单？（提示：文本长度 n 与模式个数 k 的关系）

> 练习推荐：先掌握 [KMP](/tutorials/kmp) 与 [Trie](/tutorials/trie)，再理解 AC 自动机如何把两者结合。
