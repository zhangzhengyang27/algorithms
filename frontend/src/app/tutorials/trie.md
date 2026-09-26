# Trie 字典树

**Trie**，又称**字典树**或**前缀树**，是一种用于高效存储和检索字符串的树形数据结构。

> 查询每个条目的时间复杂度，和字典中一共有多少条目无关！
> 时间复杂度为 O(w)，w 为查询单词的长度！

## 一、主要特点

```mermaid
graph TD
  R((root)) --> A((c))
  R --> B((d))
  A --> A1((a))
  A1 --> A2((t)):::end
  B --> B1((o))
  B1 --> B2((g)):::end
  classDef end fill:#f96;
```

1. **节点结构**：
   - 每个节点代表一个字符
   - 节点可以有多个子节点
   - 包含布尔值标记当前节点是否为一个单词的结束

2. **高效的前缀查找**：
   - 查找一个前缀的时间复杂度为 O(m)，其中 m 是前缀的长度
   - 支持快速查找具有共同前缀的所有单词

**结构图解**（存储 "cat", "car", "card", "dog"）：

```
            (root)
           /      \
          c        d
         /          \
        a            o
       / \            \
      t*   r*          g*
            \
             d*

* 表示 isEndOfWord = true

共享前缀 "ca" 只存储一次 → 空间换时间的经典结构
查找 "car": root→c→a→r，3步，与字典中有几个词无关
查找 "cap": root→c→a→p? 不存在 → 立即返回 false
```

**Trie vs 哈希表**：

| 维度 | Trie | HashSet |
|------|------|---------|
| 精确查找 | O(m) | O(m) 平均 |
| 前缀查找 | ✅ O(m) | ❌ 需遍历所有词 O(n·m) |
| 枚举同前缀词 | ✅ DFS 子树 | ❌ 全量扫描 |
| 空间 | 共享前缀，但节点开销大 | 每个词独立存储 |
| 有序遍历 | ✅ 天然字典序 | ❌ 无序 |

## 二、代码实现

```java tab
import java.util.HashMap;
import java.util.Map;

class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isEndOfWord;
}

public class Trie {
    private TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    public void insert(String word) {
        TrieNode current = root;
        for (char ch : word.toCharArray()) {
            current.children.putIfAbsent(ch, new TrieNode());
            current = current.children.get(ch);
        }
        current.isEndOfWord = true;
    }

    public boolean search(String word) {
        TrieNode current = searchPrefix(word);
        return current != null && current.isEndOfWord;
    }

    public boolean startsWith(String prefix) {
        return searchPrefix(prefix) != null;
    }

    private TrieNode searchPrefix(String prefix) {
        TrieNode current = root;
        for (char ch : prefix.toCharArray()) {
            if (!current.children.containsKey(ch)) {
                return null;
            }
            current = current.children.get(ch);
        }
        return current;
    }
}
```

```typescript tab
class TrieNode {
    children: Map<string, TrieNode> = new Map();
    isEndOfWord: boolean = false;
}

class Trie {
    private root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    insert(word: string): void {
        let current = this.root;
        for (const ch of word) {
            if (!current.children.has(ch)) {
                current.children.set(ch, new TrieNode());
            }
            current = current.children.get(ch)!;
        }
        current.isEndOfWord = true;
    }

    search(word: string): boolean {
        const node = this.searchPrefix(word);
        return node !== null && node.isEndOfWord;
    }

    startsWith(prefix: string): boolean {
        return this.searchPrefix(prefix) !== null;
    }

    private searchPrefix(prefix: string): TrieNode | null {
        let current = this.root;
        for (const ch of prefix) {
            if (!current.children.has(ch)) {
                return null;
            }
            current = current.children.get(ch)!;
        }
        return current;
    }
}
```

```python tab
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        current = self.root
        for ch in word:
            if ch not in current.children:
                current.children[ch] = TrieNode()
            current = current.children[ch]
        current.is_end_of_word = True

    def search(self, word: str) -> bool:
        current = self._search_prefix(word)
        return current is not None and current.is_end_of_word

    def starts_with(self, prefix: str) -> bool:
        return self._search_prefix(prefix) is not None

    def _search_prefix(self, prefix: str):
        current = self.root
        for ch in prefix:
            if ch not in current.children:
                return None
            current = current.children[ch]
        return current
```

**数组实现（仅小写字母时更高效）**：

```java
// HashMap 版每个节点 ~48 字节开销；数组版直接下标访问
class TrieNode {
    TrieNode[] children = new TrieNode[26];  // 'a'~'z'
    boolean isEndOfWord;
}
// 访问方式：children[ch - 'a']
```

## 三、时间复杂度

| 操作 | 时间复杂度 | 说明 |
|------|----------|------|
| 插入 | O(m) | m 为单词长度 |
| 搜索 | O(m) | 与字典大小 n 无关 |
| 前缀搜索 | O(m) | Trie 的核心优势 |
| 枚举所有词 | O(总字符数) | DFS 整棵树 |
| 空间 | O(总字符数 × 字符集) | 最坏每个字符一个节点 |

## 四、经典应用：单词搜索 II

在二维网格中搜索字典中的所有单词（LC 212）——Trie + DFS 回溯的黄金组合：

```python tab
def find_words(board: list[list[str]], words: list[str]) -> list[str]:
    # 1. 所有单词建 Trie
    root = {}
    for word in words:
        node = root
        for ch in word:
            node = node.setdefault(ch, {})
        node['#'] = word  # 叶子存完整单词

    result = []
    m, n = len(board), len(board[0])

    def dfs(i: int, j: int, node: dict) -> None:
        ch = board[i][j]
        if ch not in node:
            return
        nxt = node[ch]
        if '#' in nxt:
            result.append(nxt['#'])
            del nxt['#']  # 去重，避免重复收集
        board[i][j] = '.'  # 标记已访问
        for di, dj in [(0,1),(0,-1),(1,0),(-1,0)]:
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n and board[ni][nj] != '.':
                dfs(ni, nj, nxt)
        board[i][j] = ch  # 回溯

    for i in range(m):
        for j in range(n):
            dfs(i, j, root)
    return result
```

**为什么不用 HashSet + 逐词搜索**：10⁴ 个单词 × 每个词 DFS 整个网格 = 超时。Trie 让所有词**共享**搜索路径，一次 DFS 同时匹配多个词。

## 五、经典应用：01-Trie 求最大异或对

给定整数数组，找两个数使异或值最大（LC 421）。将每个数的二进制位插入 Trie，查询时贪心走相反位：

```python tab
def find_maximum_xor(nums: list[int]) -> int:
    HIGH_BIT = 30
    # 建 01-Trie
    root = {}
    for num in nums:
        node = root
        for k in range(HIGH_BIT, -1, -1):
            bit = (num >> k) & 1
            node = node.setdefault(bit, {})

    max_xor = 0
    for num in nums:
        node = root
        xor_val = 0
        for k in range(HIGH_BIT, -1, -1):
            bit = (num >> k) & 1
            # 贪心：尽量走相反的位（异或为1）
            if 1 - bit in node:
                node = node[1 - bit]
                xor_val |= (1 << k)
            else:
                node = node[bit]
        max_xor = max(max_xor, xor_val)
    return max_xor
```

**核心思想**：高位优先贪心——从最高位开始，每一位都尽量让异或结果为 1。Trie 保证 O(31) 完成一次贪心查询。

## 六、应用场景总结

| 场景 | Trie 的作用 |
|------|------------|
| 自动补全系统 | 前缀搜索 + DFS 枚举候选词 |
| 拼写检查器 | 精确查找 + 编辑距离剪枝 |
| IP 路由表 | 最长前缀匹配 |
| 单词游戏 | 快速判断前缀是否合法 |
| 最大异或对 | 01-Trie 贪心 |
| AC 自动机 | 多模式匹配的基础结构 |

### 面试真题

| 题目 | 难度 | 核心思路 |
|------|------|----------|
| 实现 Trie（LC 208） | 🟡 Medium | 模板题，必须手写 |
| 单词搜索 II（LC 212） | 🔴 Hard | Trie + DFS 回溯 |
| 添加与搜索单词（LC 211） | 🟡 Medium | Trie + 通配符 DFS |
| 数组中两个数的最大异或值（LC 421） | 🟡 Medium | 01-Trie 贪心 |
| 单词拆分 II（LC 140） | 🔴 Hard | Trie 加速前缀判断 |
| 键值映射（LC 677） | 🟡 Medium | Trie 节点存前缀和 |

## 七、易错点分析

**1. search 和 startsWith 混淆**

```java
// search("app") 要求 isEndOfWord == true
// startsWith("app") 只要路径存在即可
// 插入 "apple" 后：search("app") = false, startsWith("app") = true
```

**2. 删除单词时误删共享路径**

```
存储 "cat" 和 "car" 时，删除 "cat" 只能取消 t 节点的 isEndOfWord，
不能删除 c→a 路径（"car" 还在用）。
正确做法：标记 isEndOfWord = false + 可选的惰性清理。
```

**3. 单词搜索中忘记回溯**

DFS 进入下一格前标记 `board[i][j] = '.'`，返回后必须恢复原字符，否则同一条路径不能分叉使用。

## 八、思考题

1. 如果字符集是全部 Unicode（而非 26 个字母），HashMap 实现和数组实现哪个更合适？为什么？
2. 如何给 Trie 增加 `delete(word)` 操作？什么情况下可以安全释放节点？
3. LC 211 中 `search("a.c")` 支持通配符 `.`，如何在 Trie 上实现？（提示：遇到 `.` 时 DFS 所有子节点）

> 练习推荐：先手写 [实现 Trie（LC 208）]，再挑战单词搜索 II。
