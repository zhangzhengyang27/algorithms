-- INSERT ch3 基础搜索 7 题。幂等可重跑。
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'graph-search'),
  '疾病传播（Disease）', 'cr-disease', 'MEDIUM',
  $cr4e7b44b5$# 疾病传播（Disease）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 3 Basic Searching（基础搜索）。难度：MEDIUM。标签：bfs, graph, spread。

## 题目描述
有 $n$ 个人，编号 $1\sim n$，部分人之间存在接触关系（无向）。初始有 $m$ 个人已感染，传染病沿接触关系传播：与感染者接触过的人会被感染，且会继续传染下去。求最终被感染的所有人。

## 输入格式
第一行两个整数 $n, m$；
接下来 $n$ 行，第 $i$ 行：先给一个整数 $deg$（第 $i$ 人的接触人数），再给 $deg$ 个整数（接触对象的编号）；
接下来 $m$ 行，每行一个整数：初始感染者的编号。

## 输出格式
每行一个编号，升序输出所有最终感染的人。

## 数据范围
$1 \le n \le 1000$，$0 \le m \le n$。

## 思路提示
- BFS：初始感染者入队，逐层感染未感染的邻居，直到队列空。
- 注意图可能不连通，未接触感染源的人不会被感染。
$cr4e7b44b5$,
  $cr1CceCF35$[{"input": "15 3\n2 7 11\n2 11 6\n4 2 6 11 5\n4 13 7 9 6\n3 6 11 9\n2 12 5\n3 3 6 2\n3 12 1 13\n0\n1 3\n0\n4 9 3 1 11\n3 14 2 10\n1 8\n3 5 13 4\n1\n9\n3", "output": "1\n2\n3\n5\n6\n7\n9\n11\n12"}]$cr1CceCF35$::jsonb,
  $cre8cDeaC3${"typescript": "// 疾病传播：BFS 全传播。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0], m = data[1];\n  const graph: number[][] = Array.from({ length: n + 1 }, () => []);\n  let i = 2;\n  for (let v = 1; v <= n; v++) {\n    const deg = data[i++];\n    for (let k = 0; k < deg; k++) graph[v].push(data[i++]);\n  }\n  const infected: boolean[] = new Array(n + 1).fill(false);\n  const q: number[] = [];\n  for (let k = 0; k < m; k++) { const x = data[i++]; infected[x] = true; q.push(x); }\n  while (q.length) {\n    const v = q.shift()!;\n    for (const nb of graph[v]) {\n      if (!infected[nb]) { infected[nb] = true; q.push(nb); }\n    }\n  }\n  const out: string[] = [];\n  for (let x = 1; x <= n; x++) if (infected[x]) out.push(String(x));\n  return out.join('\\n');\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 疾病传播：BFS 全传播，输出所有感染者。\nimport sys\nfrom collections import deque\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n, m = int(data[0]), int(data[1])\n    graph = {}\n    i = 2\n    for v in range(1, n + 1):\n        deg = int(data[i]); i += 1\n        graph[v] = [int(x) for x in data[i:i + deg]]; i += deg\n    infected = [False] * (n + 1)\n    q = deque()\n    for _ in range(m):\n        x = int(data[i]); i += 1\n        infected[x] = True; q.append(x)\n    while q:\n        v = q.popleft()\n        for nb in graph[v]:\n            if not infected[nb]:\n                infected[nb] = True; q.append(nb)\n    print('\\n'.join(str(x) for x in range(1, n + 1) if infected[x]))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), m = sc.nextInt();\n        List<Integer>[] graph = new List[n + 1];\n        for (int i = 1; i <= n; i++) graph[i] = new ArrayList<>();\n        for (int v = 1; v <= n; v++) {\n            int deg = sc.nextInt();\n            for (int k = 0; k < deg; k++) graph[v].add(sc.nextInt());\n        }\n        boolean[] inf = new boolean[n + 1];\n        Deque<Integer> q = new ArrayDeque<>();\n        for (int k = 0; k < m; k++) { int x = sc.nextInt(); inf[x] = true; q.add(x); }\n        while (!q.isEmpty()) {\n            int v = q.poll();\n            for (int nb : graph[v]) if (!inf[nb]) { inf[nb] = true; q.add(nb); }\n        }\n        StringBuilder sb = new StringBuilder();\n        for (int x = 1; x <= n; x++) if (inf[x]) sb.append(x).append('\\n');\n        System.out.print(sb.toString());\n    }\n}\n"}$cre8cDeaC3$::jsonb,
  $cr34CCF55d$[{"input": "15 3\n3 15 8 2\n2 4 6\n3 14 6 5\n0\n0\n2 5 14\n0\n2 15 9\n3 10 1 2\n4 2 8 6 11\n3 9 13 3\n1 7\n1 3\n3 13 5 15\n4 14 4 2 3\n8\n7\n15", "expected": "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n13\n14\n15"}, {"input": "15 3\n2 14 15\n0\n4 4 6 8 12\n0\n1 15\n4 14 12 1 5\n0\n2 1 11\n2 2 13\n4 1 14 3 2\n2 5 6\n0\n1 11\n1 10\n1 10\n15\n12\n1", "expected": "1\n2\n3\n4\n5\n6\n8\n10\n11\n12\n14\n15"}, {"input": "15 3\n3 5 6 12\n4 14 6 10 7\n1 6\n2 9 15\n0\n4 9 7 8 15\n3 2 14 1\n3 5 15 11\n3 7 6 10\n3 15 14 5\n0\n4 9 7 11 6\n1 3\n4 7 5 2 1\n3 14 8 10\n15\n7\n4", "expected": "1\n2\n4\n5\n6\n7\n8\n9\n10\n11\n12\n14\n15"}]$cr34CCF55d$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crBc81821c$["bfs", "graph", "spread"]$crBc81821c$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'graph-search'),
  '疾病传播 II（Disease II）', 'cr-disease2', 'MEDIUM',
  $cr7F705070$# 疾病传播 II（Disease II）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 3 Basic Searching（基础搜索）。难度：MEDIUM。标签：bfs, graph, limited-depth。

## 题目描述
与「疾病传播」相同，但传染病只会传播 **2 层**：感染者能传染给直接接触者（第 1 层），第 1 层的人再传染给他们的接触者（第 2 层），之后不再扩散。求最终被感染的所有人。

## 输入格式
同「疾病传播」：第一行 $n, m$；接下来 $n$ 行邻接（$deg$ + 邻居）；接下来 $m$ 行初始感染者。

## 输出格式
每行一个编号，升序输出最终被感染的人。

## 数据范围
$1 \le n \le 1000$，$0 \le m \le n$。

## 思路提示
- BFS 带层数：初始感染者层数为 $0$；只扩展层数 $< 2$ 的节点的邻居（新感染层数 +1）。
$cr7F705070$,
  $cr6E09456b$[{"input": "15 3\n4 5 2 4 6\n2 14 5\n0\n0\n0\n0\n4 10 1 4 2\n4 10 2 5 12\n0\n1 5\n1 15\n1 7\n4 3 8 14 15\n1 10\n4 13 1 12 14\n12\n15\n8", "output": "1\n2\n3\n4\n5\n6\n7\n8\n10\n12\n13\n14\n15"}]$cr6E09456b$::jsonb,
  $crE0C6c84d${"typescript": "// 疾病传播 II：BFS 限 2 层。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0], m = data[1];\n  const graph: number[][] = Array.from({ length: n + 1 }, () => []);\n  let i = 2;\n  for (let v = 1; v <= n; v++) {\n    const deg = data[i++];\n    for (let k = 0; k < deg; k++) graph[v].push(data[i++]);\n  }\n  const infected: boolean[] = new Array(n + 1).fill(false);\n  const q: [number, number][] = [];\n  for (let k = 0; k < m; k++) { const x = data[i++]; infected[x] = true; q.push([x, 0]); }\n  while (q.length) {\n    const [v, st] = q.shift()!;\n    if (st === 2) continue;\n    for (const nb of graph[v]) {\n      if (!infected[nb]) { infected[nb] = true; q.push([nb, st + 1]); }\n    }\n  }\n  const out: string[] = [];\n  for (let x = 1; x <= n; x++) if (infected[x]) out.push(String(x));\n  return out.join('\\n');\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 疾病传播 II：BFS 限 2 层。\nimport sys\nfrom collections import deque\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n, m = int(data[0]), int(data[1])\n    graph = {}\n    i = 2\n    for v in range(1, n + 1):\n        deg = int(data[i]); i += 1\n        graph[v] = [int(x) for x in data[i:i + deg]]; i += deg\n    infected = [False] * (n + 1)\n    q = deque()\n    for _ in range(m):\n        x = int(data[i]); i += 1\n        infected[x] = True; q.append((x, 0))\n    while q:\n        v, st = q.popleft()\n        if st == 2:\n            continue\n        for nb in graph[v]:\n            if not infected[nb]:\n                infected[nb] = True; q.append((nb, st + 1))\n    print('\\n'.join(str(x) for x in range(1, n + 1) if infected[x]))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), m = sc.nextInt();\n        List<Integer>[] graph = new List[n + 1];\n        for (int i = 1; i <= n; i++) graph[i] = new ArrayList<>();\n        for (int v = 1; v <= n; v++) {\n            int deg = sc.nextInt();\n            for (int k = 0; k < deg; k++) graph[v].add(sc.nextInt());\n        }\n        boolean[] inf = new boolean[n + 1];\n        Deque<int[]> q = new ArrayDeque<>();\n        for (int k = 0; k < m; k++) { int x = sc.nextInt(); inf[x] = true; q.add(new int[]{x, 0}); }\n        while (!q.isEmpty()) {\n            int[] cur = q.poll();\n            int v = cur[0], st = cur[1];\n            if (st == 2) continue;\n            for (int nb : graph[v]) if (!inf[nb]) { inf[nb] = true; q.add(new int[]{nb, st + 1}); }\n        }\n        StringBuilder sb = new StringBuilder();\n        for (int x = 1; x <= n; x++) if (inf[x]) sb.append(x).append('\\n');\n        System.out.print(sb.toString());\n    }\n}\n"}$crE0C6c84d$::jsonb,
  $crC0f0A238$[{"input": "15 3\n0\n2 6 10\n0\n0\n4 4 6 15 1\n1 11\n1 8\n3 12 1 15\n1 15\n2 5 8\n1 3\n3 2 13 6\n4 8 7 9 2\n3 7 12 3\n1 2\n10\n3\n15", "expected": "1\n2\n3\n4\n5\n6\n8\n10\n12\n15"}, {"input": "15 3\n4 15 14 4 3\n0\n2 2 13\n1 8\n2 7 4\n1 5\n0\n4 14 3 9 15\n4 14 4 6 12\n3 2 12 14\n4 14 3 2 12\n4 14 10 6 9\n0\n0\n0\n2\n7\n12", "expected": "2\n4\n5\n6\n7\n9\n10\n12\n14"}, {"input": "15 3\n4 9 8 15 3\n2 6 1\n0\n3 6 9 1\n2 14 11\n3 11 12 15\n0\n0\n1 6\n4 14 15 7 13\n2 6 3\n2 15 1\n2 11 5\n4 6 11 13 15\n2 9 14\n10\n13\n6", "expected": "1\n3\n5\n6\n7\n9\n10\n11\n12\n13\n14\n15"}]$crC0f0A238$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crF6B4F7b7$["bfs", "graph", "limited-depth"]$crF6B4F7b7$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'searching'),
  '能被 13 整除（Divisible by 13）', 'cr-div13', 'MEDIUM',
  $cr6D41EeeE$# 能被 13 整除（Divisible by 13）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 3 Basic Searching（基础搜索）。难度：MEDIUM。标签：dfs, backtracking, modulo。

## 题目描述
给定数字 $0\sim9$ 各有多少个（计数数组），用这些数字（每个数字用不超过其计数次）按任意顺序排成**非零开头的数字**，找出所有**能被 13 整除**的数字（可以是任意长度，长度 $\ge 1$，首位不能为 0）。

## 输入格式
一行 10 个整数：数字 $0,1,\dots,9$ 各有多少个。

## 输出格式
每行一个满足条件的数字（数字本身，无前导零）。按枚举顺序输出（DFS 依次尝试 $0\sim9$ 升序）。

## 数据范围
各计数 $\ge 0$，数字总个数 $\le 8$（保证输出规模可控）。

## 思路提示
- DFS 枚举所有排列，每放一个数字就用「$x = (x \times 10 + d) \bmod 13$」判断当前前缀能否被 13 整除，能则输出。
- 首位不能为 0；同一数字的多次出现按不同位置处理。
$cr6D41EeeE$,
  $crBaD7bcCB$[{"input": "0 1 3 1 0 0 0 0 0 0", "output": "1222\n13\n2132\n221\n2223\n22321\n312"}]$crBaD7bcCB$::jsonb,
  $cr3F7Aa2DE${"typescript": "// 能被 13 整除的排列前缀：DFS。\nfunction solve(input: string): string {\n  const a = input.trim().split(/\\s+/).map(Number).slice(0, 10);\n  const n = a.reduce((s, v) => s + v, 0);\n  const out: string[] = [];\n  const b: number[] = new Array(n).fill(0);\n  const judge = (k: number) => {\n    let x = 0;\n    for (let i = 0; i <= k; i++) x = (x * 10 + b[i]) % 13;\n    if (x === 0) out.push(b.slice(0, k + 1).join(''));\n  };\n  const search = (k: number) => {\n    if (k === n) return;\n    for (let i = 0; i < 10; i++) {\n      if (a[i] > 0) {\n        if (k === 0 && i === 0) continue;\n        a[i]--;\n        b[k] = i;\n        judge(k);\n        search(k + 1);\n        a[i]++;\n      }\n    }\n  };\n  search(0);\n  return out.join('\\n');\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 能被 13 整除的排列前缀：DFS 枚举 + 逐层判断。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    a = [int(x) for x in data[:10]]\n    n = sum(a)\n    out = []\n    b = [0] * n\n    def judge(k):\n        x = 0\n        for i in range(k + 1):\n            x = (x * 10 + b[i]) % 13\n        if x == 0:\n            out.append(''.join(str(v) for v in b[:k + 1]))\n    def search(k):\n        if k == n:\n            return\n        for i in range(10):\n            if a[i] > 0:\n                if k == 0 and i == 0:\n                    continue\n                a[i] -= 1\n                b[k] = i\n                judge(k)\n                search(k + 1)\n                a[i] += 1\n    search(0)\n    print('\\n'.join(out))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    static int[] a = new int[10];\n    static int n;\n    static int[] b;\n    static StringBuilder out = new StringBuilder();\n    static void judge(int k) {\n        int x = 0;\n        for (int i = 0; i <= k; i++) x = (x * 10 + b[i]) % 13;\n        if (x == 0) {\n            for (int i = 0; i <= k; i++) out.append(b[i]);\n            out.append('\\n');\n        }\n    }\n    static void search(int k) {\n        if (k == n) return;\n        for (int i = 0; i < 10; i++) {\n            if (a[i] > 0) {\n                if (k == 0 && i == 0) continue;\n                a[i]--; b[k] = i;\n                judge(k);\n                search(k + 1);\n                a[i]++;\n            }\n        }\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        for (int i = 0; i < 10; i++) { a[i] = sc.nextInt(); n += a[i]; }\n        b = new int[n];\n        search(0);\n        System.out.print(out.toString());\n    }\n}\n"}$cr3F7Aa2DE$::jsonb,
  $cr4D8ed5f9$[{"input": "0 0 1 0 0 0 0 0 0 2", "expected": "299"}, {"input": "0 2 0 1 0 1 0 0 0 0", "expected": "13\n351"}, {"input": "0 1 1 0 1 0 1 0 1 0", "expected": "1248\n1482\n182\n1846\n18642\n21684\n2184\n2418\n26\n26481\n286\n416\n4186\n42861\n4628\n468\n481\n48126\n4862\n6214\n624\n6812\n8164\n8216\n82641\n84162"}]$cr4D8ed5f9$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr353B5DD2$["dfs", "backtracking", "modulo"]$cr353B5DD2$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'graph-search'),
  '图的 DFS 遍历（Graph Traversal）', 'cr-graphtraversal', 'EASY',
  $cr9c1EBFa0$# 图的 DFS 遍历（Graph Traversal）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 3 Basic Searching（基础搜索）。难度：EASY。标签：dfs, graph, traversal。

## 题目描述
给定一张 $n$ 个顶点（编号 $0\sim n-1$）、$m$ 条边的无向图。从顶点 $0$ 出发做**深度优先搜索**，访问邻居时按**编号升序**依次尝试。输出 DFS 的访问顺序。

## 输入格式
第一行两个整数 $n, m$；
接下来 $m$ 行，每行两个整数 $x, y$：一条边。

## 输出格式
一行 $n$ 个整数（空格分隔）：DFS 访问顺序。

## 数据范围
$1 \le n \le 100$，$0 \le m \le n(n-1)/2$。保证图连通。

## 思路提示
- 标准 DFS：访问当前顶点后，按编号升序遍历其未访问的邻居并递归。
- 访问顺序完全由「邻居升序」这一规则决定，输出确定。
$cr9c1EBFa0$,
  $crC4C75eDe$[{"input": "8 11\n0 1\n0 6\n1 2\n2 3\n2 7\n3 4\n4 5\n4 7\n5 6\n5 7\n6 7", "output": "0 1 2 3 4 5 6 7"}]$crC4C75eDe$::jsonb,
  $cr51bEE65D${"typescript": "// 图 DFS 遍历：邻居升序。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0], m = data[1];\n  const g: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));\n  let i = 2;\n  for (let k = 0; k < m; k++) {\n    const x = data[i], y = data[i + 1]; i += 2;\n    g[x][y] = g[y][x] = true;\n  }\n  const visited: boolean[] = new Array(n).fill(false);\n  const order: number[] = [];\n  const dfs = (k: number) => {\n    order.push(k);\n    for (let j = 0; j < n; j++) {\n      if (g[k][j] && !visited[j]) { visited[j] = true; dfs(j); }\n    }\n  };\n  visited[0] = true;\n  dfs(0);\n  return order.join(' ');\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 图 DFS 遍历：邻居升序访问，输出访问顺序。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n, m = int(data[0]), int(data[1])\n    g = [[False] * n for _ in range(n)]\n    i = 2\n    for _ in range(m):\n        x, y = int(data[i]), int(data[i + 1]); i += 2\n        g[x][y] = g[y][x] = True\n    visited = [False] * n\n    order = []\n    def dfs(k):\n        order.append(k)\n        for j in range(n):\n            if g[k][j] and not visited[j]:\n                visited[j] = True\n                dfs(j)\n    visited[0] = True\n    dfs(0)\n    print(' '.join(str(x) for x in order))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    static boolean[][] g;\n    static boolean[] vis;\n    static List<Integer> order = new ArrayList<>();\n    static int n;\n    static void dfs(int k) {\n        order.add(k);\n        for (int j = 0; j < n; j++) if (g[k][j] && !vis[j]) { vis[j] = true; dfs(j); }\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        n = sc.nextInt();\n        int m = sc.nextInt();\n        g = new boolean[n][n];\n        for (int k = 0; k < m; k++) {\n            int x = sc.nextInt(), y = sc.nextInt();\n            g[x][y] = g[y][x] = true;\n        }\n        vis = new boolean[n];\n        vis[0] = true;\n        dfs(0);\n        StringBuilder sb = new StringBuilder();\n        for (int v : order) sb.append(v).append(' ');\n        System.out.println(sb.toString().trim());\n    }\n}\n"}$cr51bEE65D$::jsonb,
  $crFEbbD89f$[{"input": "8 7\n0 1\n1 2\n2 3\n3 4\n4 5\n5 6\n6 7", "expected": "0 1 2 3 4 5 6 7"}, {"input": "8 7\n0 1\n1 2\n2 3\n3 4\n4 5\n5 6\n6 7", "expected": "0 1 2 3 4 5 6 7"}, {"input": "8 7\n0 1\n1 2\n2 3\n3 4\n4 5\n5 6\n6 7", "expected": "0 1 2 3 4 5 6 7"}]$crFEbbD89f$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crb26c86AD$["dfs", "graph", "traversal"]$crb26c86AD$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'graph-search'),
  '点灯游戏（Lights Out）', 'cr-lights', 'MEDIUM',
  $cr14c8E3a4$# 点灯游戏（Lights Out）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 3 Basic Searching（基础搜索）。难度：MEDIUM。标签：bfs, state-search, lights。

## 题目描述
有一个 $3\times3$ 的灯阵，每盏灯亮（1）或灭（0）。按一盏灯会**翻转**它自己及其上下左右相邻（存在）的灯。求把所有灯都**点亮**（全为 1）所需的最少按灯次数。

## 输入格式
三行，每行三个整数（$0$ 或 $1$）：初始灯阵。

## 输出格式
一行一个整数：最少按灯次数。

## 数据范围
保证初始状态可达全亮（$3\times3$ 点灯游戏）。

## 思路提示
- 状态只有 $2^9 = 512$ 种，用 **BFS** 求到全亮状态的最短步数。
- 每个操作翻转自己 + 四邻（边界外忽略）；按同一盏灯两次等于没按。
$cr14c8E3a4$,
  $crbACC115F$[{"input": "1 1 0\n0 1 0\n1 1 1", "output": "3"}]$crbACC115F$::jsonb,
  $crBA31ecFb${"typescript": "// 点灯：3×3 BFS。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const key = (s: number[]) => s.join(',');\n  const start = data.slice(0, 9);\n  const final = new Array(9).fill(1);\n  if (key(start) === key(final)) return '0';\n  const seen = new Set<string>([key(start)]);\n  const q: [number[], number][] = [[start, 0]];\n  while (q.length) {\n    const [state, step] = q.shift()!;\n    for (let op = 0; op < 9; op++) {\n      const tmp = state.slice();\n      tmp[op] = 1 - tmp[op];\n      if (op % 3 !== 0) tmp[op - 1] = 1 - tmp[op - 1];\n      if (op % 3 !== 2) tmp[op + 1] = 1 - tmp[op + 1];\n      if (op > 2) tmp[op - 3] = 1 - tmp[op - 3];\n      if (op < 6) tmp[op + 3] = 1 - tmp[op + 3];\n      if (key(tmp) === key(final)) return String(step + 1);\n      const k = key(tmp);\n      if (!seen.has(k)) { seen.add(k); q.push([tmp, step + 1]); }\n    }\n  }\n  return '-1';\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 点灯：3×3 BFS 求全亮最少步数。\nimport sys\nfrom collections import deque\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    st = tuple(int(x) for x in data[:9])\n    final = (1,) * 9\n    if st == final:\n        print(0)\n        return\n    q = deque([(st, 0)])\n    seen = {st}\n    while q:\n        state, step = q.popleft()\n        for op in range(9):\n            tmp = list(state)\n            tmp[op] = 1 - tmp[op]\n            if op % 3 != 0: tmp[op - 1] = 1 - tmp[op - 1]\n            if op % 3 != 2: tmp[op + 1] = 1 - tmp[op + 1]\n            if op > 2: tmp[op - 3] = 1 - tmp[op - 3]\n            if op < 6: tmp[op + 3] = 1 - tmp[op + 3]\n            ns = tuple(tmp)\n            if ns == final:\n                print(step + 1)\n                return\n            if ns not in seen:\n                seen.add(ns); q.append((ns, step + 1))\n    print(-1)\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    static String key(int[] s) {\n        StringBuilder sb = new StringBuilder();\n        for (int v : s) sb.append(v).append(',');\n        return sb.toString();\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] start = new int[9];\n        for (int i = 0; i < 9; i++) start[i] = sc.nextInt();\n        int[] finalState = new int[9];\n        Arrays.fill(finalState, 1);\n        if (key(start).equals(key(finalState))) { System.out.println(0); return; }\n        Set<String> seen = new HashSet<>();\n        seen.add(key(start));\n        Deque<Object[]> q = new ArrayDeque<>();\n        q.add(new Object[]{start, 0});\n        while (!q.isEmpty()) {\n            Object[] cur = q.poll();\n            int[] state = (int[]) cur[0];\n            int step = (Integer) cur[1];\n            for (int op = 0; op < 9; op++) {\n                int[] tmp = state.clone();\n                tmp[op] = 1 - tmp[op];\n                if (op % 3 != 0) tmp[op - 1] = 1 - tmp[op - 1];\n                if (op % 3 != 2) tmp[op + 1] = 1 - tmp[op + 1];\n                if (op > 2) tmp[op - 3] = 1 - tmp[op - 3];\n                if (op < 6) tmp[op + 3] = 1 - tmp[op + 3];\n                if (key(tmp).equals(key(finalState))) { System.out.println(step + 1); return; }\n                String k = key(tmp);\n                if (!seen.contains(k)) { seen.add(k); q.add(new Object[]{tmp, step + 1}); }\n            }\n        }\n        System.out.println(-1);\n    }\n}\n"}$crBA31ecFb$::jsonb,
  $crb56eEDf1$[{"input": "1 1 1\n1 1 1\n1 1 1", "expected": "0"}, {"input": "1 1 1\n0 1 1\n0 1 0", "expected": "4"}, {"input": "1 0 0\n1 0 0\n0 0 0", "expected": "2"}]$crb56eEDf1$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crCFEdb948$["bfs", "state-search", "lights"]$crCFEdb948$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'searching'),
  '线段覆盖（Line Cover）', 'cr-linecover', 'MEDIUM',
  $cr76E578fd$# 线段覆盖（Line Cover）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 3 Basic Searching（基础搜索）。难度：MEDIUM。标签：dfs, backtracking, cover。

## 题目描述
在一条数轴上有 $m$ 个点（坐标严格递增）。有 $n$ 条线段，第 $i$ 条长度为 $l_i$。一条线段可以覆盖「从某个点向右延伸 $l_i$ 长度」范围内的一段连续点（含该点）。求**最少用几条线段**能覆盖全部 $m$ 个点（每条线段最多用一次）。

## 输入格式
第一行两个整数 $m, n$；
第二行 $m$ 个整数：点坐标（递增）；
第三行 $n$ 个整数：线段长度。

## 输出格式
一行一个整数：最少使用线段数。

## 数据范围
$1 \le m, n \le 8$（DFS 搜索规模可控），坐标与长度 $\le 10^3$。

## 思路提示
- DFS：当前未覆盖的第一个点是 $k$，枚举用哪条线段从该点向右覆盖，跳到下一个未被覆盖的点继续。
- 剪枝：当前已用条数 $\ge$ 已知最优则回溯。
$cr76E578fd$,
  $crcaea4073$[{"input": "6 5\n1 7 10 14 18 20\n15 9 9 14 3", "output": "2"}]$crcaea4073$::jsonb,
  $cr52EB8cd0${"typescript": "// 线段覆盖：DFS。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const m = data[0], n = data[1];\n  const point = data.slice(2, 2 + m);\n  const length = data.slice(2 + m, 2 + m + n);\n  const used: boolean[] = new Array(n).fill(false);\n  let best = n;\n  const dfs = (k: number, cnt: number) => {\n    if (cnt >= best) return;\n    if (k === m - 1) { best = cnt; return; }\n    for (let i = 0; i < n; i++) {\n      if (used[i]) continue;\n      used[i] = true;\n      const r = point[k] + length[i];\n      let t2 = k + 1;\n      while (t2 < m - 1 && point[t2 + 1] <= r) t2++;\n      dfs(t2, cnt + 1);\n      used[i] = false;\n    }\n  };\n  dfs(0, 0);\n  return String(best);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 线段覆盖：DFS 求覆盖全部点的最少线段数。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    m, n = int(data[0]), int(data[1])\n    point = [int(x) for x in data[2:2 + m]]\n    length = [int(x) for x in data[2 + m:2 + m + n]]\n    used = [False] * n\n    best = n\n    def dfs(k, cnt):\n        nonlocal best\n        if cnt >= best:\n            return\n        if k == m - 1:\n            best = cnt\n            return\n        for i in range(n):\n            if used[i]:\n                continue\n            used[i] = True\n            r = point[k] + length[i]\n            t2 = k + 1\n            while t2 < m - 1 and point[t2 + 1] <= r:\n                t2 += 1\n            dfs(t2, cnt + 1)\n            used[i] = False\n    dfs(0, 0)\n    print(best)\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    static int m, n, best;\n    static int[] point, length;\n    static boolean[] used;\n    static void dfs(int k, int cnt) {\n        if (cnt >= best) return;\n        if (k == m - 1) { best = cnt; return; }\n        for (int i = 0; i < n; i++) {\n            if (used[i]) continue;\n            used[i] = true;\n            int r = point[k] + length[i];\n            int t2 = k + 1;\n            while (t2 < m - 1 && point[t2 + 1] <= r) t2++;\n            dfs(t2, cnt + 1);\n            used[i] = false;\n        }\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        m = sc.nextInt(); n = sc.nextInt();\n        point = new int[m];\n        length = new int[n];\n        for (int i = 0; i < m; i++) point[i] = sc.nextInt();\n        for (int i = 0; i < n; i++) length[i] = sc.nextInt();\n        used = new boolean[n];\n        best = n;\n        dfs(0, 0);\n        System.out.println(best);\n    }\n}\n"}$cr52EB8cd0$::jsonb,
  $cre253fEaC$[{"input": "6 4\n1 7 14 17 23 28\n4 7 7 14", "expected": "3"}, {"input": "4 6\n1 4 10 18\n15 13 12 10 15 4", "expected": "2"}, {"input": "4 7\n1 9 12 17\n11 13 11 10 12 8 14", "expected": "2"}]$cre253fEaC$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr3C1A09f2$["dfs", "backtracking", "cover"]$cr3C1A09f2$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'searching'),
  '全排列（Permutation）', 'cr-permutation', 'EASY',
  $crcFBAef4F$# 全排列（Permutation）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 3 Basic Searching（基础搜索）。难度：EASY。标签：dfs, backtracking, permutation。

## 题目描述
输出 $1,2,\dots,n$ 的**全部排列**（每行一个，元素间空格分隔），按字典序（DFS 依次尝试 $1\sim n$ 升序）。

## 输入格式
一行一个整数 $n$。

## 输出格式
每行一个排列，共 $n!$ 行，按字典序输出。

## 数据范围
$1 \le n \le 7$（保证 $n!$ 行输出规模可控）。

## 思路提示
- 经典 DFS 全排列：逐位尝试 $1\sim n$ 中未使用的数字。
- 输出顺序由「升序尝试」确定，即字典序。
$crcFBAef4F$,
  $cr85Ba3E8a$[{"input": "3", "output": "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1"}]$cr85Ba3E8a$::jsonb,
  $crC6D0CCBB${"typescript": "// 全排列：DFS 字典序。\nfunction solve(input: string): string {\n  const n = Number(input.trim().split(/\\s+/)[0]);\n  const out: string[] = [];\n  const a: number[] = [];\n  const used: boolean[] = new Array(n + 1).fill(true);\n  const dfs = (k: number) => {\n    if (k === n) { out.push(a.join(' ')); return; }\n    for (let i = 1; i <= n; i++) {\n      if (used[i]) {\n        a.push(i); used[i] = false;\n        dfs(k + 1);\n        used[i] = true; a.pop();\n      }\n    }\n  };\n  dfs(0);\n  return out.join('\\n');\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 全排列：DFS 字典序输出 1..n 的所有排列。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    out = []\n    a = []\n    used = [True] * (n + 1)\n    def dfs(k):\n        if k == n:\n            out.append(' '.join(str(x) for x in a))\n            return\n        for i in range(1, n + 1):\n            if used[i]:\n                a.append(i); used[i] = False\n                dfs(k + 1)\n                used[i] = True; a.pop()\n    dfs(0)\n    print('\\n'.join(out))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    static int n;\n    static boolean[] used;\n    static List<Integer> a = new ArrayList<>();\n    static StringBuilder out = new StringBuilder();\n    static void dfs(int k) {\n        if (k == n) {\n            for (int i = 0; i < n; i++) out.append(a.get(i)).append(i == n - 1 ? '\\n' : ' ');\n            return;\n        }\n        for (int i = 1; i <= n; i++) {\n            if (used[i]) {\n                a.add(i); used[i] = false;\n                dfs(k + 1);\n                used[i] = true; a.remove(a.size() - 1);\n            }\n        }\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        n = sc.nextInt();\n        used = new boolean[n + 1];\n        Arrays.fill(used, true);\n        dfs(0);\n        System.out.print(out.toString());\n    }\n}\n"}$crC6D0CCBB$::jsonb,
  $cr574e4baC$[{"input": "4", "expected": "1 2 3 4\n1 2 4 3\n1 3 2 4\n1 3 4 2\n1 4 2 3\n1 4 3 2\n2 1 3 4\n2 1 4 3\n2 3 1 4\n2 3 4 1\n2 4 1 3\n2 4 3 1\n3 1 2 4\n3 1 4 2\n3 2 1 4\n3 2 4 1\n3 4 1 2\n3 4 2 1\n4 1 2 3\n4 1 3 2\n4 2 1 3\n4 2 3 1\n4 3 1 2\n4 3 2 1"}, {"input": "4", "expected": "1 2 3 4\n1 2 4 3\n1 3 2 4\n1 3 4 2\n1 4 2 3\n1 4 3 2\n2 1 3 4\n2 1 4 3\n2 3 1 4\n2 3 4 1\n2 4 1 3\n2 4 3 1\n3 1 2 4\n3 1 4 2\n3 2 1 4\n3 2 4 1\n3 4 1 2\n3 4 2 1\n4 1 2 3\n4 1 3 2\n4 2 1 3\n4 2 3 1\n4 3 1 2\n4 3 2 1"}, {"input": "2", "expected": "1 2\n2 1"}]$cr574e4baC$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr989b4a69$["dfs", "backtracking", "permutation"]$cr989b4a69$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
