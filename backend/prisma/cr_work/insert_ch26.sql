-- INSERT ch2-6 经典判题类 10 题。幂等可重跑。
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '01 背包（Knapsack 0/1）', 'cr-knapsack01', 'MEDIUM',
  $crA4BE0aA0$# 01 背包（Knapsack 0/1）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 4 Dynamic Programming Basics（动态规划入门）。难度：MEDIUM。标签：dp, knapsack, 0-1-knapsack。

## 题目描述
有 $n$ 件物品和一个容量为 $C$ 的背包。第 $i$ 件物品占用容量 $c_i$、价值 $w_i$，**每件最多取 1 件**。求背包能装下的最大总价值。

## 输入格式
第一行两个整数 $C, n$；
接下来 $n$ 行，每行两个整数 $c_i, w_i$。

## 输出格式
一行一个整数：最大总价值。

## 数据范围
$1 \le C \le 10^4$，$1 \le n \le 100$，$1 \le c_i \le C$，$1 \le w_i \le 10^5$。

## 思路提示
- 01 背包：`dp[j] = max(dp[j], dp[j-c] + w)`，容量**逆序**遍历保证每件至多取一次。
- 用「-1 表示不可达」初始化，最后取 `max(dp)` 即为答案。
$crA4BE0aA0$,
  $crBdaA5e99$[{"input": "500 30\n8 64\n83 69\n38 13\n10 23\n46 51\n43 38\n3 74\n72 79\n38 20\n19 46\n87 2\n92 40\n67 60\n9 88\n22 98\n15 76\n26 52\n84 80\n49 83\n3 11\n31 53\n28 1\n18 59\n75 90\n53 99\n82 90\n82 14\n79 78\n21 31\n43 76", "output": "1113"}]$crBdaA5e99$::jsonb,
  $crD1d92745${"typescript": "// 01 背包：容量逆序遍历，每件至多取一次。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const maxc = data[0], n = data[1];\n  const f: number[] = new Array(maxc + 1).fill(-1);\n  f[0] = 0;\n  let i = 2;\n  for (let k = 0; k < n; k++) {\n    const c = data[i], w = data[i + 1]; i += 2;\n    for (let j = maxc - c; j >= 0; j--) {\n      if (f[j] > -1 && f[j] + w > f[j + c]) f[j + c] = f[j] + w;\n    }\n  }\n  return String(Math.max(...f));\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 01 背包：容量逆序遍历，每件至多取一次，输出最大价值。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    maxc, n = int(data[0]), int(data[1])\n    f = [-1] * (maxc + 1); f[0] = 0\n    i = 2\n    for _ in range(n):\n        c, w = int(data[i]), int(data[i + 1]); i += 2\n        for j in range(maxc - c, -1, -1):\n            if f[j] > -1 and f[j] + w > f[j + c]:\n                f[j + c] = f[j] + w\n    print(max(f))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int maxc = sc.nextInt(), n = sc.nextInt();\n        int[] f = new int[maxc + 1];\n        Arrays.fill(f, -1); f[0] = 0;\n        for (int k = 0; k < n; k++) {\n            int c = sc.nextInt(), w = sc.nextInt();\n            for (int j = maxc - c; j >= 0; j--)\n                if (f[j] > -1 && f[j] + w > f[j + c]) f[j + c] = f[j] + w;\n        }\n        int res = 0;\n        for (int v : f) res = Math.max(res, v);\n        System.out.println(res);\n    }\n}\n"}$crD1d92745$::jsonb,
  $cr49cF6daB$[{"input": "500 30\n71 21\n50 39\n17 27\n38 32\n3 100\n36 87\n43 72\n94 75\n68 72\n84 30\n2 13\n44 34\n58 74\n63 50\n18 47\n49 20\n20 7\n23 83\n92 87\n66 9\n49 68\n1 73\n83 86\n44 60\n80 3\n84 93\n65 42\n60 39\n13 80\n33 18", "expected": "981"}, {"input": "500 30\n18 47\n37 61\n89 28\n86 38\n32 49\n21 85\n66 84\n61 47\n93 79\n39 25\n99 40\n92 1\n8 97\n5 3\n97 21\n48 21\n2 73\n5 72\n75 29\n42 84\n66 65\n61 91\n20 10\n18 6\n90 19\n13 34\n11 47\n88 81\n42 92\n17 17", "expected": "1033"}, {"input": "500 30\n55 40\n39 84\n5 49\n9 23\n31 52\n28 63\n65 6\n10 19\n19 90\n51 88\n99 53\n2 80\n96 88\n36 2\n19 23\n88 93\n90 60\n41 2\n79 12\n7 29\n5 15\n83 33\n50 48\n27 43\n12 87\n47 48\n66 96\n92 50\n84 98\n31 86", "expected": "1073"}]$cr49cF6daB$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr3b4F8c5d$["dp", "knapsack", "0-1-knapsack"]$cr3b4F8c5d$::jsonb)),
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
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '完全背包（Knapsack Unlimited）', 'cr-knapsackmulti', 'MEDIUM',
  $crA98A7C4c$# 完全背包（Knapsack Unlimited）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 4 Dynamic Programming Basics（动态规划入门）。难度：MEDIUM。标签：dp, knapsack, complete-knapsack。

## 题目描述
有 $n$ 种物品和一个容量为 $C$ 的背包。第 $i$ 种物品占用容量 $c_i$、价值 $w_i$，**每种可以取任意多件**（完全背包）。求背包能装下的最大总价值。

## 输入格式
第一行两个整数 $C, n$；
接下来 $n$ 行，每行两个整数 $c_i, w_i$。

## 输出格式
一行一个整数：最大总价值。

## 数据范围
$1 \le C \le 10^4$，$1 \le n \le 100$，$1 \le c_i \le C$，$1 \le w_i \le 10^5$。

## 思路提示
- 完全背包与 01 背包的唯一区别：容量**正序**遍历（`j` 从小到大），使同一种物品可以被重复放入。
- 其余（-1 初始化、取 max）与 01 背包一致。
$crA98A7C4c$,
  $cr79bBaDf9$[{"input": "500 30\n12 97\n38 73\n73 2\n14 49\n33 100\n26 85\n41 56\n46 30\n41 40\n31 17\n17 42\n34 57\n6 61\n49 79\n24 60\n45 80\n54 13\n49 33\n45 31\n81 24\n78 14\n88 45\n28 91\n81 69\n69 61\n7 60\n10 34\n54 92\n89 10\n58 20", "output": "5063"}]$cr79bBaDf9$::jsonb,
  $crA24E6250${"typescript": "// 完全背包：容量正序遍历，同一种可重复取。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const maxc = data[0], n = data[1];\n  const f: number[] = new Array(maxc + 1).fill(-1);\n  f[0] = 0;\n  let i = 2;\n  for (let k = 0; k < n; k++) {\n    const c = data[i], w = data[i + 1]; i += 2;\n    for (let j = 0; j <= maxc - c; j++) {\n      if (f[j] > -1 && f[j] + w > f[j + c]) f[j + c] = f[j] + w;\n    }\n  }\n  return String(Math.max(...f));\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 完全背包：容量正序遍历，同一种可重复取。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    maxc, n = int(data[0]), int(data[1])\n    f = [-1] * (maxc + 1); f[0] = 0\n    i = 2\n    for _ in range(n):\n        c, w = int(data[i]), int(data[i + 1]); i += 2\n        for j in range(maxc - c + 1):\n            if f[j] > -1 and f[j] + w > f[j + c]:\n                f[j + c] = f[j] + w\n    print(max(f))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int maxc = sc.nextInt(), n = sc.nextInt();\n        int[] f = new int[maxc + 1];\n        Arrays.fill(f, -1); f[0] = 0;\n        for (int k = 0; k < n; k++) {\n            int c = sc.nextInt(), w = sc.nextInt();\n            for (int j = 0; j <= maxc - c; j++)\n                if (f[j] > -1 && f[j] + w > f[j + c]) f[j + c] = f[j] + w;\n        }\n        int res = 0;\n        for (int v : f) res = Math.max(res, v);\n        System.out.println(res);\n    }\n}\n"}$crA24E6250$::jsonb,
  $cr2c3b3FDB$[{"input": "500 30\n29 22\n20 87\n88 45\n93 58\n87 88\n46 10\n46 72\n98 29\n76 29\n73 32\n80 82\n23 24\n65 62\n85 6\n16 83\n17 79\n87 6\n1 32\n14 74\n90 15\n28 94\n28 64\n75 54\n33 55\n72 22\n7 89\n1 100\n18 72\n67 91\n56 97", "expected": "50000"}, {"input": "500 30\n88 41\n60 82\n43 64\n23 13\n68 80\n87 76\n52 39\n20 20\n85 56\n1 44\n40 92\n2 32\n13 24\n17 55\n66 28\n51 63\n16 2\n82 46\n54 45\n86 48\n8 8\n81 75\n25 64\n20 80\n69 59\n39 58\n98 75\n45 24\n90 86\n30 77", "expected": "22000"}, {"input": "500 30\n4 91\n39 99\n40 55\n5 58\n26 47\n50 15\n82 95\n53 77\n98 80\n30 49\n51 19\n71 90\n48 45\n91 50\n55 7\n48 72\n16 27\n8 35\n60 92\n82 74\n92 35\n49 57\n56 100\n80 62\n11 4\n93 75\n4 72\n42 57\n78 38\n62 92", "expected": "11375"}]$cr2c3b3FDB$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crD3e5E60F$["dp", "knapsack", "complete-knapsack"]$crD3e5E60F$::jsonb)),
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
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '石子合并（Stone Merge）', 'cr-numbercombine', 'MEDIUM',
  $cr2c15aCFB$# 石子合并（Stone Merge）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 4 Dynamic Programming Basics（动态规划入门）。难度：MEDIUM。标签：dp, interval-dp, merge。

## 题目描述
给定 $n$ 个正整数排成一列。每次可以合并相邻两堆，合并代价为**两堆各自之和的乘积**，合并后形成一堆（和为二者之和）。求把所有数合并成一堆的最小总代价。

## 输入格式
第一行一个整数 $n$；
第二行 $n$ 个正整数 $a_1,a_2,\dots,a_n$。

## 输出格式
一行一个整数：最小合并代价。

## 数据范围
$1 \le n \le 100$，$1 \le a_i \le 100$。

## 思路提示
- 区间 DP：`f[i][j]` = 合并区间 $[i,j]$ 的最小代价；枚举分割点 $k$，代价 = `f[i][k] + f[k+1][j] + (sum[i..k]) * (sum[k+1..j])`。
- 前缀和快速计算任意区间和，复杂度 $O(n^3)$。
$cr2c15aCFB$,
  $craBE5Ab9b$[{"input": "30\n87 84 6 82 81 84 81 68 5 22 75 25 86 74 100 52 48 9 86 52 3 11 34 14 55 26 6 18 3 98", "output": "1034731"}]$craBE5Ab9b$::jsonb,
  $crca5CddC3${"typescript": "// 石子合并：区间 DP。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0];\n  const s: number[] = new Array(n + 1).fill(0);\n  for (let i = 1; i <= n; i++) s[i] = s[i - 1] + data[i];\n  const f: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));\n  for (let len = 2; len <= n; len++) {\n    for (let i = 1; i <= n - len + 1; i++) {\n      const j = i + len - 1;\n      let best = Infinity;\n      for (let k = i; k < j; k++) {\n        const v = f[i][k] + f[k + 1][j] + (s[k] - s[i - 1]) * (s[j] - s[k]);\n        if (v < best) best = v;\n      }\n      f[i][j] = best;\n    }\n  }\n  return String(f[1][n]);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 石子合并：区间 DP，合并代价 = 两堆和的乘积。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    a = [0] + [int(x) for x in data[1:1 + n]]\n    s = [0] * (n + 1)\n    for i in range(1, n + 1):\n        s[i] = s[i - 1] + a[i]\n    f = [[0] * (n + 1) for _ in range(n + 1)]\n    for length in range(2, n + 1):\n        for i in range(1, n - length + 2):\n            j = i + length - 1\n            best = 10 ** 18\n            for k in range(i, j):\n                v = f[i][k] + f[k + 1][j] + (s[k] - s[i - 1]) * (s[j] - s[k])\n                if v < best:\n                    best = v\n            f[i][j] = best\n    print(f[1][n])\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long[] s = new long[n + 1];\n        for (int i = 1; i <= n; i++) s[i] = s[i - 1] + sc.nextLong();\n        long[][] f = new long[n + 1][n + 1];\n        for (int len = 2; len <= n; len++)\n            for (int i = 1; i <= n - len + 1; i++) {\n                int j = i + len - 1;\n                long best = Long.MAX_VALUE;\n                for (int k = i; k < j; k++) {\n                    long v = f[i][k] + f[k + 1][j] + (s[k] - s[i - 1]) * (s[j] - s[k]);\n                    if (v < best) best = v;\n                }\n                f[i][j] = best;\n            }\n        System.out.println(f[1][n]);\n    }\n}\n"}$crca5CddC3$::jsonb,
  $crc4d8cF4E$[{"input": "30\n96 92 32 69 6 89 12 24 49 30 78 36 9 3 76 64 12 30 68 34 5 45 90 14 75 38 22 77 51 49", "expected": "901093"}, {"input": "30\n7 54 33 22 5 15 13 89 83 73 49 5 63 77 14 42 51 80 30 64 19 76 11 62 83 79 77 73 27 100", "expected": "1039990"}, {"input": "30\n99 93 3 8 40 10 39 30 82 46 76 99 78 42 4 91 1 44 81 99 29 40 43 78 40 87 12 16 48 55", "expected": "1091196"}]$crc4d8cF4E$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crb6eBB81d$["dp", "interval-dp", "merge"]$crb6eBB81d$::jsonb)),
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
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '爬楼梯（Jump Stairs）', 'cr-jump', 'EASY',
  $cr50A71b7c$# 爬楼梯（Jump Stairs）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 4 Dynamic Programming Basics（动态规划入门）。难度：EASY。标签：dp, stairs, counting。

## 题目描述
从位置 $0$ 出发跳向位置 $n$，每次可以跳 $1,2,3$ 格。有些位置被标记为**禁止停留**（踩到即失败）。求从 $0$ 到达 $n$ 的**不同跳法总数**；若 $n$ 本身被禁止，输出 `0`。

## 输入格式
第一行两个整数 $n, k$；
第二行 $k$ 个整数：禁止停留的位置。

## 输出格式
一行一个整数：跳法总数。

## 数据范围
$1 \le n \le 10^5$，$0 \le k \le n$，禁止位置在 $[0, n]$ 内。

## 思路提示
- `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]`（只累加非禁止位置）。
- 禁止位置跳过不计，起点 `dp[0] = 1`。
$cr50A71b7c$,
  $cr73BCbBA6$[{"input": "40 13\n1 6 11 12 14 17 19 21 24 29 30 32 38", "output": "64512"}]$cr73BCbBA6$::jsonb,
  $cr56bb2f81${"typescript": "// 爬楼梯：步长 1-3，跳过禁止位置。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0];\n  const f: number[] = new Array(n + 1).fill(0);\n  for (let i = 2; i < data.length; i++) f[data[i]] = -1;\n  if (f[n] === -1) return '0';\n  f[0] = 1;\n  for (let i = 1; i <= n; i++) {\n    if (f[i] === -1) continue;\n    for (let j = 1; j <= 3; j++) {\n      if (i - j >= 0 && f[i - j] !== -1) f[i] += f[i - j];\n    }\n  }\n  return String(f[n]);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 爬楼梯：步长 1-3，跳过禁止位置，输出方案数。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    f = [0] * (n + 1)\n    for x in data[2:]:\n        f[int(x)] = -1\n    if f[n] == -1:\n        print(0)\n        return\n    f[0] = 1\n    for i in range(1, n + 1):\n        if f[i] == -1:\n            continue\n        for j in range(1, 4):\n            if i - j >= 0 and f[i - j] != -1:\n                f[i] += f[i - j]\n    print(f[n])\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long[] f = new long[n + 1];\n        while (sc.hasNextInt()) {\n            int t = sc.nextInt();\n            if (t <= n) f[t] = -1;\n        }\n        if (f[n] == -1) { System.out.println(0); return; }\n        f[0] = 1;\n        for (int i = 1; i <= n; i++) {\n            if (f[i] == -1) continue;\n            for (int j = 1; j <= 3; j++)\n                if (i - j >= 0 && f[i - j] != -1) f[i] += f[i - j];\n        }\n        System.out.println(f[n]);\n    }\n}\n"}$cr56bb2f81$::jsonb,
  $cr35C1aeaf$[{"input": "40 13\n2 4 5 10 13 15 19 20 28 30 32 33 35", "expected": "39072"}, {"input": "40 13\n3 5 9 12 13 17 19 27 29 30 32 33 35", "expected": "45144"}, {"input": "40 13\n5 6 9 11 16 20 25 26 28 29 32 34 36", "expected": "34272"}]$cr35C1aeaf$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr2343CD7B$["dp", "stairs", "counting"]$cr2343CD7B$::jsonb)),
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
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '最大全 1 正方形（Max Square）', 'cr-maxsquare', 'MEDIUM',
  $cr5df8EFF1$# 最大全 1 正方形（Max Square）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 6 Advanced Dynamic Programming（高级动态规划）。难度：MEDIUM。标签：dp, matrix, square。

## 题目描述
给定一个 $n \times m$ 的 $01$ 矩阵，求其中**全为 1 的最大正方形**的边长。

## 输入格式
第一行两个整数 $n, m$；
接下来 $n$ 行，每行 $m$ 个整数（$0$ 或 $1$）。

## 输出格式
一行一个整数：最大全 1 正方形的边长。

## 数据范围
$1 \le n, m \le 100$。

## 思路提示
- `f[i][j]` = 以 $(i,j)$ 为右下角的最大全 1 正方形边长：
  `f[i][j] = min(f[i-1][j], f[i][j-1], f[i-1][j-1]) + 1`（当 `rect[i][j] == 1`）。
- 答案取所有 `f[i][j]` 的最大值，复杂度 $O(nm)$。
$cr5df8EFF1$,
  $crbFfaDBbE$[{"input": "25 30\n1 0 0 0 1 0 1 0 0 0 0 1 0 0 1 0 1 0 0 0 0 0 0 1 1 1 1 0 1 1\n1 0 1 1 1 0 0 0 1 0 1 1 0 1 1 1 1 0 0 1 1 1 1 0 1 1 1 0 0 1\n1 1 0 0 1 0 1 0 0 0 1 1 1 0 0 0 0 0 0 1 1 1 0 1 0 1 0 0 0 0\n1 1 1 0 1 1 1 1 0 0 1 1 0 0 1 0 0 0 0 0 0 1 1 0 1 1 1 0 1 0\n1 0 0 1 1 1 0 0 0 0 0 0 1 1 1 0 1 0 0 0 0 0 1 1 1 0 1 0 0 1\n1 1 0 0 1 1 1 0 0 0 0 1 1 1 0 0 0 1 1 1 0 1 1 0 1 1 0 1 1 1\n0 0 0 1 1 0 0 0 0 0 0 1 1 1 1 0 1 0 0 0 0 0 1 0 1 1 0 1 1 0\n0 1 1 1 0 1 0 1 1 0 1 0 0 0 1 1 0 0 1 1 0 0 0 1 0 0 0 1 0 1\n0 0 1 1 0 0 0 1 1 0 0 0 1 0 1 0 1 0 1 1 1 1 0 0 0 1 0 1 0 1\n0 0 1 0 0 0 0 0 1 1 0 1 1 1 0 1 1 0 0 1 1 0 0 0 1 0 0 1 1 1\n0 1 1 0 1 0 0 0 0 0 0 1 0 1 1 0 0 1 0 0 1 1 0 0 1 0 1 0 1 1\n0 1 0 0 0 0 1 0 1 0 0 1 0 0 1 1 1 1 0 0 1 1 0 0 0 0 0 1 1 1\n1 0 0 0 1 1 1 1 0 1 1 1 0 0 1 0 0 1 1 1 1 1 1 0 0 1 1 1 0 1\n0 1 0 1 0 0 1 0 0 1 0 0 0 0 0 0 0 1 0 0 0 1 0 1 1 1 1 0 0 1\n0 0 0 0 1 1 1 1 0 0 1 0 0 1 0 1 0 1 0 1 0 0 1 1 0 1 1 1 0 1\n0 1 1 1 0 0 0 0 0 1 0 0 1 0 0 0 1 1 1 1 0 1 0 1 1 1 1 1 1 0\n1 1 1 1 1 1 0 1 0 1 0 0 1 1 1 0 1 1 1 1 1 0 1 0 1 0 0 1 0 0\n0 0 0 0 1 0 0 1 1 0 1 0 0 0 0 1 0 0 0 0 1 1 1 0 0 1 0 0 1 0\n0 0 1 1 0 1 1 0 0 0 1 0 0 1 1 0 1 0 1 1 0 0 1 0 0 1 0 1 1 1\n1 1 0 0 1 0 0 0 1 0 0 0 0 0 1 0 0 0 1 0 1 1 0 0 1 0 0 1 1 1\n1 1 1 0 0 1 1 1 1 1 1 1 0 1 1 0 1 1 0 1 1 1 1 0 0 0 1 0 0 1\n0 0 0 1 1 0 1 1 0 0 0 1 0 1 0 1 0 0 1 0 0 0 0 1 1 1 1 1 0 1\n1 0 1 0 0 0 1 0 0 1 0 1 1 1 0 0 0 1 1 1 0 1 1 1 0 1 0 1 0 0\n0 1 0 1 1 0 0 0 1 1 0 1 1 1 0 1 1 0 0 1 1 0 1 1 0 0 1 0 1 0\n0 0 0 0 0 1 1 0 1 1 1 0 0 1 0 1 0 0 0 0 0 1 0 0 0 1 1 0 1 0", "output": "2"}]$crbFfaDBbE$::jsonb,
  $cr7EAF21bF${"typescript": "// 最大全 1 正方形：DP 边长。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0], m = data[1];\n  const f: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));\n  let res = 0, idx = 2;\n  for (let i = 1; i <= n; i++) {\n    for (let j = 1; j <= m; j++) {\n      const v = data[idx++];\n      if (v === 1) {\n        f[i][j] = Math.min(f[i - 1][j], f[i][j - 1], f[i - 1][j - 1]) + 1;\n        if (f[i][j] > res) res = f[i][j];\n      }\n    }\n  }\n  return String(res);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 最大全 1 正方形：DP 边长，f[i][j] = min(上,左,左上) + 1。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n, m = int(data[0]), int(data[1])\n    f = [[0] * (m + 1) for _ in range(n + 1)]\n    res = 0\n    idx = 2\n    for i in range(1, n + 1):\n        for j in range(1, m + 1):\n            v = int(data[idx]); idx += 1\n            if v == 1:\n                f[i][j] = min(f[i - 1][j], f[i][j - 1], f[i - 1][j - 1]) + 1\n                if f[i][j] > res:\n                    res = f[i][j]\n    print(res)\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), m = sc.nextInt();\n        int[][] f = new int[n + 1][m + 1];\n        int res = 0;\n        for (int i = 1; i <= n; i++)\n            for (int j = 1; j <= m; j++) {\n                int v = sc.nextInt();\n                if (v == 1) {\n                    f[i][j] = Math.min(Math.min(f[i - 1][j], f[i][j - 1]), f[i - 1][j - 1]) + 1;\n                    res = Math.max(res, f[i][j]);\n                }\n            }\n        System.out.println(res);\n    }\n}\n"}$cr7EAF21bF$::jsonb,
  $cr7f5C3D79$[{"input": "25 30\n0 1 0 0 1 1 0 1 0 1 0 0 1 0 1 0 0 1 0 1 1 1 1 1 1 1 0 0 1 1\n0 1 0 1 1 1 1 0 0 0 0 1 1 0 1 0 1 0 1 1 1 0 0 1 1 0 0 0 1 0\n0 0 0 1 1 1 0 1 0 0 0 0 1 1 0 0 1 1 1 1 0 0 1 1 1 1 0 1 0 0\n0 0 0 0 1 0 1 0 0 0 1 1 0 1 0 0 1 0 0 1 1 1 1 0 0 0 1 0 1 0\n0 0 1 0 0 0 0 0 0 0 0 1 1 1 0 0 0 0 1 0 0 1 1 0 0 1 1 1 1 1\n1 1 1 1 1 1 1 0 0 1 1 0 1 0 1 1 1 0 0 0 1 0 0 1 1 1 1 0 1 0\n0 1 1 0 0 1 0 1 1 0 0 0 0 0 0 1 1 1 0 1 1 0 1 1 1 0 1 0 1 1\n0 0 1 1 1 0 0 1 1 1 0 1 1 0 1 0 1 1 0 0 1 0 0 1 0 1 1 0 1 1\n0 1 1 0 1 0 0 1 1 1 0 0 1 0 0 1 1 0 0 1 1 1 0 0 1 0 0 1 0 1\n1 0 0 0 0 1 0 1 1 0 0 0 0 0 0 0 1 0 1 1 1 1 1 0 0 0 0 0 0 1\n1 1 0 0 1 1 0 0 0 0 0 0 1 0 1 0 0 0 1 1 1 0 1 1 1 1 1 0 0 0\n0 1 1 1 0 1 1 0 1 0 0 0 0 1 1 1 1 0 1 1 0 1 1 1 1 1 0 1 0 1\n1 0 0 0 1 1 0 1 1 1 0 1 1 1 0 1 0 0 0 1 1 1 1 0 1 1 0 0 0 0\n0 1 0 1 1 1 0 0 0 1 0 0 1 0 0 0 1 1 1 0 1 0 1 0 1 0 1 0 1 1\n0 0 1 0 1 1 0 0 1 0 0 1 1 0 0 1 0 0 0 1 0 1 1 0 1 0 1 0 0 0\n0 1 0 1 1 0 0 0 0 1 0 1 1 0 1 0 0 1 1 1 0 1 1 0 0 1 1 1 0 1\n1 1 0 1 1 1 1 1 0 1 0 1 0 0 0 0 0 0 0 0 1 1 0 1 0 1 1 1 0 0\n0 1 1 1 1 1 1 1 0 1 1 0 1 1 0 1 0 1 1 0 0 1 1 1 0 0 0 0 1 0\n0 0 0 1 0 0 0 0 1 1 0 1 1 1 1 0 0 1 0 0 0 1 0 1 0 0 0 0 1 1\n0 1 0 0 1 0 0 1 1 1 0 0 1 1 1 0 0 1 1 1 1 1 0 0 0 0 0 1 0 1\n0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 1 0 1 0 1 0 1 1 1 1\n1 0 1 1 0 0 1 1 0 1 0 1 1 1 0 0 0 0 0 0 1 0 1 1 1 1 0 0 1 1\n0 1 1 1 0 0 1 1 0 1 1 1 0 0 0 1 1 1 0 1 0 0 0 0 0 1 0 1 1 1\n0 1 0 0 1 0 0 1 1 1 0 0 1 0 1 1 0 0 0 1 0 0 1 1 1 1 0 1 1 0\n0 0 0 1 1 1 0 0 1 0 0 0 1 0 1 0 1 0 1 1 1 0 1 0 0 0 0 1 0 1", "expected": "2"}, {"input": "25 30\n0 0 1 1 0 0 0 0 0 0 1 0 0 1 1 0 0 1 0 0 1 1 0 1 1 0 1 0 1 1\n0 1 0 0 0 0 0 0 1 0 1 0 1 0 0 0 1 1 1 1 0 1 0 0 0 0 0 1 0 1\n0 0 1 0 1 0 0 0 1 0 1 0 1 1 1 1 1 1 1 1 1 0 1 1 0 1 1 0 1 0\n0 1 0 1 1 0 0 0 1 0 1 1 1 1 0 1 1 0 1 1 1 1 0 1 0 0 1 1 0 0\n1 1 1 0 1 0 0 1 1 1 1 1 1 0 1 0 0 1 1 0 0 0 0 1 1 1 1 0 1 0\n0 1 1 1 1 0 1 0 1 0 1 0 0 0 0 1 1 1 0 0 1 0 0 0 1 1 0 0 1 1\n0 1 0 0 0 0 1 0 0 1 0 0 1 0 1 1 0 0 0 0 0 1 0 0 1 1 0 1 0 0\n1 0 1 1 0 1 0 1 0 1 0 1 0 0 1 1 0 0 1 0 1 0 1 1 0 1 1 0 1 1\n1 1 0 0 0 0 1 0 0 1 1 1 0 1 0 0 0 0 1 1 0 0 0 0 1 1 0 0 0 1\n0 0 0 1 1 1 1 1 1 1 1 0 1 0 1 0 1 1 0 1 0 1 1 1 1 1 1 0 1 1\n0 1 0 0 0 1 0 1 0 1 0 0 1 0 1 1 0 0 0 0 0 1 0 0 1 1 1 0 0 0\n1 1 1 0 0 0 1 1 0 1 0 1 0 1 0 1 0 1 0 1 1 0 1 1 0 1 0 1 1 0\n1 0 0 0 0 0 0 1 0 0 1 0 1 0 0 1 0 0 0 0 1 1 0 1 0 1 1 0 1 1\n0 0 1 0 1 1 0 0 1 1 1 1 0 1 0 0 1 1 1 0 0 0 0 0 1 0 0 1 0 0\n1 0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 0 0 0 1 0 1 1 0 0 1 1 1 0 1\n1 1 1 1 1 0 0 1 1 1 0 1 0 0 0 1 1 1 0 0 0 1 1 0 1 0 1 0 1 1\n1 1 1 1 1 1 1 0 1 0 1 0 0 0 0 1 1 1 0 1 1 1 0 0 1 1 1 0 0 0\n0 1 1 1 1 0 0 1 1 0 0 1 1 1 1 0 1 1 1 0 1 1 1 0 0 0 0 0 0 1\n1 0 0 1 0 1 0 1 0 1 1 0 0 1 1 0 0 1 1 1 0 0 1 0 0 0 0 0 1 0\n0 1 0 1 0 0 0 1 1 0 0 1 1 1 0 0 0 1 0 0 0 0 1 1 1 1 1 0 1 1\n1 1 0 1 0 0 1 1 1 1 0 1 0 0 1 0 1 0 0 0 1 1 1 0 0 1 0 1 1 0\n0 1 1 1 0 1 0 1 0 0 0 1 0 0 1 1 0 1 0 0 1 1 0 1 1 0 1 1 0 1\n0 0 1 0 1 0 1 0 1 0 1 0 0 0 1 0 1 1 1 0 0 0 1 0 1 0 0 0 1 0\n1 0 1 1 0 1 1 0 1 1 1 1 1 0 0 0 0 1 1 1 1 0 0 1 0 0 0 0 0 0\n1 0 0 0 1 0 0 1 1 0 0 1 0 1 0 1 0 1 1 0 0 0 0 1 0 1 0 1 0 1", "expected": "3"}, {"input": "25 30\n0 0 0 0 1 0 0 0 1 1 1 1 0 0 0 0 1 1 0 1 0 1 0 1 1 0 1 0 0 1\n1 1 0 0 1 1 0 1 0 0 1 0 1 0 1 0 1 1 1 1 1 1 1 1 1 1 0 1 1 0\n0 1 0 1 0 0 0 0 1 1 0 1 0 1 1 1 0 1 1 1 0 1 0 1 0 0 1 1 0 1\n0 1 1 1 0 0 0 1 1 1 1 1 0 0 0 1 1 0 1 1 0 0 1 1 0 0 1 1 1 1\n1 1 1 1 0 1 1 1 1 0 0 1 1 0 0 1 0 0 1 0 0 0 0 0 0 0 1 0 0 1\n0 0 0 1 0 1 0 0 0 0 1 0 0 0 0 0 0 1 1 1 1 1 1 0 1 0 0 0 0 0\n1 0 1 1 0 1 1 0 0 0 0 0 0 1 1 1 1 0 0 0 0 1 1 0 1 0 1 0 1 1\n1 0 0 1 0 0 0 0 1 0 1 0 1 0 0 0 0 0 1 1 0 0 1 1 1 1 1 0 1 0\n1 1 0 0 0 1 0 1 0 0 1 1 1 1 1 0 0 1 0 1 0 0 0 0 0 1 0 0 1 1\n1 0 1 0 0 0 1 0 0 0 1 1 1 1 0 1 0 1 1 0 1 0 1 0 1 1 1 0 0 0\n0 0 1 1 1 1 0 0 1 1 0 1 1 1 1 1 0 1 0 1 1 0 1 0 1 1 1 0 0 0\n1 0 1 0 0 0 0 0 1 0 0 0 1 1 0 1 0 1 0 1 0 1 1 0 1 0 1 0 1 1\n1 0 1 0 0 0 1 0 0 0 1 0 1 0 0 1 1 0 0 1 1 0 0 1 1 0 0 1 0 1\n1 1 0 0 0 1 1 0 1 0 0 0 1 1 1 1 0 1 0 0 0 1 0 0 1 0 0 1 0 1\n1 1 1 0 0 0 1 0 0 1 0 0 1 0 0 1 1 0 0 1 0 1 1 0 1 1 1 1 1 1\n1 1 1 1 0 1 1 1 1 1 0 1 0 0 0 0 1 0 0 0 1 0 0 1 0 0 1 1 1 0\n0 0 1 1 0 0 1 0 0 1 0 1 1 1 0 0 1 1 0 1 1 1 0 0 1 0 0 0 1 0\n0 0 1 1 1 0 0 0 1 1 1 1 1 1 1 1 1 0 1 1 1 1 1 1 1 0 0 1 1 0\n0 1 0 0 0 0 1 1 1 1 0 1 1 1 1 0 0 1 1 0 1 1 0 0 0 1 0 1 1 1\n1 1 0 0 0 0 0 0 1 0 1 0 0 0 0 0 0 1 1 1 1 1 0 1 0 0 1 1 0 1\n1 1 0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 1 0 0 1 1 1 0 0 1 1 1\n0 1 1 1 0 0 0 1 0 1 0 0 0 0 0 1 0 0 1 0 0 0 0 1 1 1 0 1 1 1\n0 1 0 0 1 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 1 0 1 1 1 0 0 1 1 0\n0 1 0 1 0 0 1 0 1 1 1 0 1 1 0 0 0 1 0 1 1 0 0 1 0 1 1 1 1 1\n1 0 1 0 1 0 0 1 1 0 0 0 0 0 1 0 0 1 1 1 0 0 1 1 0 0 0 0 1 1", "expected": "3"}]$cr7f5C3D79$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crac2FBc6E$["dp", "matrix", "square"]$crac2FBc6E$::jsonb)),
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
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '整除判断（Divisible）', 'cr-divisible', 'MEDIUM',
  $cr36A4C6Ab$# 整除判断（Divisible）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 6 Advanced Dynamic Programming（高级动态规划）。难度：MEDIUM。标签：dp, modulo, divisibility。

## 题目描述
给定 $m$ 组数据。每组有 $n$ 个整数，可以在每个数前选择放 `+` 或 `-`，问是否存在一种符号组合，使表达式结果能被 $k$ 整除。

## 输入格式
第一行一个整数 $m$（组数）；
每组：第一行两个整数 $n, k$；第二行 $n$ 个整数（可为负）。

## 输出格式
每组输出一行：`Divisible` 或 `Not divisible`。

## 数据范围
$1 \le m \le 10$，$1 \le n \le 10^4$，$1 \le k \le 100$，$|a_i| \le 10^4$。

## 思路提示
- 只关心结果模 $k$ 的余数：`dp` 记录当前可达的余数集合，每步 `+a` 与 `-a` 两种转移，滚动数组优化。
- 最后若余数 $0$ 可达则输出 `Divisible`。
$cr36A4C6Ab$,
  $cr75bcA3c0$[{"input": "3\n20 3\n90 -26 -77 -94 21 -41 -45 -8 -91 27 -89 -75 -57 -68 96 77 16 -3 -92 3\n20 5\n-44 -23 -2 82 -83 98 33 10 67 33 -35 63 58 -23 73 84 -49 -10 40 -88\n20 4\n-57 -20 -64 83 69 59 82 49 -48 -34 -48 19 -11 -23 66 43 14 -69 -67 10", "output": "Divisible\nDivisible\nNot divisible"}]$cr75bcA3c0$::jsonb,
  $crfa8ad5c9${"typescript": "// 整除判断：DP 余数可达性。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  let i = 1;\n  const m = data[0];\n  const out: string[] = [];\n  for (let g = 0; g < m; g++) {\n    const n = data[i], k = data[i + 1]; i += 2;\n    const nums = data.slice(i, i + n).map(x => Math.abs(x) % k); i += n;\n    let cur: boolean[] = new Array(k).fill(false);\n    cur[nums[0]] = true;\n    for (let t = 1; t < n; t++) {\n      const nxt: boolean[] = new Array(k).fill(false);\n      for (let j = 0; j < k; j++) {\n        if (cur[j]) {\n          nxt[(j + nums[t]) % k] = true;\n          nxt[(j - nums[t] + k) % k] = true;\n        }\n      }\n      cur = nxt;\n    }\n    out.push(cur[0] ? 'Divisible' : 'Not divisible');\n  }\n  return out.join('\\n');\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 整除判断：DP 余数可达性，滚动数组。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    m = int(data[0]); i = 1; out = []\n    for _ in range(m):\n        n = int(data[i]); k = int(data[i + 1]); i += 2\n        nums = [abs(int(x)) % k for x in data[i:i + n]]; i += n\n        cur = [False] * k; cur[nums[0]] = True\n        for x in nums[1:]:\n            nxt = [False] * k\n            for j in range(k):\n                if cur[j]:\n                    nxt[(j + x) % k] = True\n                    nxt[(j - x) % k] = True\n            cur = nxt\n        out.append('Divisible' if cur[0] else 'Not divisible')\n    print('\\n'.join(out))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int m = sc.nextInt();\n        StringBuilder sb = new StringBuilder();\n        for (int g = 0; g < m; g++) {\n            int n = sc.nextInt(), k = sc.nextInt();\n            int[] nums = new int[n];\n            for (int i = 0; i < n; i++) nums[i] = Math.abs(sc.nextInt()) % k;\n            boolean[] cur = new boolean[k];\n            cur[nums[0]] = true;\n            for (int t = 1; t < n; t++) {\n                boolean[] nxt = new boolean[k];\n                for (int j = 0; j < k; j++)\n                    if (cur[j]) {\n                        nxt[(j + nums[t]) % k] = true;\n                        nxt[(j - nums[t] + k) % k] = true;\n                    }\n                cur = nxt;\n            }\n            sb.append(cur[0] ? \"Divisible\\n\" : \"Not divisible\\n\");\n        }\n        System.out.print(sb.toString());\n    }\n}\n"}$crfa8ad5c9$::jsonb,
  $cr58F9cfE4$[{"input": "3\n20 7\n13 -29 6 40 -70 -95 84 28 -61 89 -13 -95 23 -25 -88 -85 75 -6 94 -20\n20 8\n-76 7 23 25 63 -60 28 63 68 -91 89 24 39 23 -85 32 -14 -5 34 62\n20 7\n29 -30 47 -10 -37 -9 71 -81 15 52 29 -53 -44 -78 31 2 -79 -15 -54 -40", "expected": "Divisible\nNot divisible\nDivisible"}, {"input": "3\n20 9\n-58 29 77 48 11 -39 41 87 -9 23 73 -35 29 29 20 74 -11 -56 -98 53\n20 10\n-60 -32 -20 -52 99 90 97 -20 -56 67 -97 -73 67 51 23 70 14 -22 -92 91\n20 8\n13 1 -36 12 94 52 -19 94 52 12 71 68 -30 1 45 27 -5 -73 36 -46", "expected": "Divisible\nNot divisible\nNot divisible"}, {"input": "3\n20 9\n-15 34 92 -71 98 71 -73 -83 -72 21 32 31 19 33 -60 17 90 -54 90 -39\n20 10\n-75 86 57 -100 -78 -37 75 -53 100 -98 49 -62 -52 21 -11 57 -58 47 -90 -74\n20 11\n-18 52 32 82 -28 -8 14 54 -4 54 5 -58 -6 59 -70 -85 -43 72 29 -27", "expected": "Divisible\nDivisible\nDivisible"}]$cr58F9cfE4$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cre153B4ac$["dp", "modulo", "divisibility"]$cre153B4ac$::jsonb)),
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
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '单词拆分（Word Break）', 'cr-wordbreak', 'MEDIUM',
  $crd0030E1a$# 单词拆分（Word Break）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 6 Advanced Dynamic Programming（高级动态规划）。难度：MEDIUM。标签：dp, string, word-break。

## 题目描述
给定一个字符串 $s$ 和一个单词表，判断 $s$ 能否由单词表中的若干单词**首尾拼接**而成（每个单词可用任意次，允许重复）。

## 输入格式
第一行：字符串 $s$（小写字母）；
第二行：单词个数 $n$；
接下来 $n$ 行：每行一个单词（小写字母）。

## 输出格式
一行：`1`（能拆分）或 `0`（不能）。

## 数据范围
$1 \le |s| \le 300$，$1 \le n \le 100$，单词长度 $1 \sim 20$。

## 思路提示
- `ok[i]` = 前缀 $s[0..i]$ 能否拆分；枚举结尾单词 `w`，若 `ok[i-len(w)]` 且 `s` 的对应后缀等于 `w`，则 `ok[i] = true`。
- 复杂度 $O(|s| \times n \times \text{len}(w))$。
$crd0030E1a$,
  $cr9Bb9D4DC$[{"input": "jprribjzqt\n5\nn\njpom\nibjf\nq\njprr", "output": "0"}]$cr9Bb9D4DC$::jsonb,
  $cr348D6dE9${"typescript": "// 单词拆分：dp[i] = 前缀能否由词表拼出。\nfunction solve(input: string): string {\n  const lines = input.trim().split(/\\n/);\n  const s = lines[0].trim();\n  if (!s) return '1';\n  const n = Number(lines[1].trim());\n  const words = lines.slice(2, 2 + n).map(w => w.trim());\n  const m = s.length;\n  const ok: boolean[] = new Array(m).fill(false);\n  for (let i = 0; i < m; i++) {\n    for (const w of words) {\n      const t = w.length;\n      if (t === i + 1 || (t < i + 1 && ok[i - t])) {\n        if (s.slice(i - t + 1, i + 1) === w) { ok[i] = true; break; }\n      }\n    }\n  }\n  return ok[m - 1] ? '1' : '0';\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 单词拆分：dp[i] = 前缀 s[0..i] 能否由词表拼出。\nimport sys\n\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    if not lines or not lines[0].strip():\n        print('1')\n        return\n    s = lines[0].strip()\n    n = int(lines[1].strip())\n    words = [w.strip() for w in lines[2:2 + n]]\n    m = len(s)\n    ok = [False] * m\n    for i in range(m):\n        for w in words:\n            t = len(w)\n            if t == i + 1 or (t < i + 1 and ok[i - t]):\n                if s[i - t + 1:i + 1] == w:\n                    ok[i] = True\n                    break\n    print('1' if ok[m - 1] else '0')\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        if (s.isEmpty()) { System.out.println(1); return; }\n        int n = Integer.parseInt(sc.nextLine());\n        String[] words = new String[n];\n        for (int i = 0; i < n; i++) words[i] = sc.nextLine().trim();\n        int m = s.length();\n        boolean[] ok = new boolean[m];\n        for (int i = 0; i < m; i++) {\n            for (String w : words) {\n                int t = w.length();\n                if (t == i + 1 || (t < i + 1 && ok[i - t])) {\n                    if (s.substring(i - t + 1, i + 1).equals(w)) { ok[i] = true; break; }\n                }\n            }\n        }\n        System.out.println(ok[m - 1] ? 1 : 0);\n    }\n}\n"}$cr348D6dE9$::jsonb,
  $cr850DC8bE$[{"input": "urbfhnrpysbsb\n7\nnofbxh\nesimup\nhnrpy\nurbf\na\nsb\nosnxl", "expected": "1"}, {"input": "nyvxojpo\n8\nic\no\nn\nmeq\nlwixs\ntdy\nsjiw\nyvx", "expected": "0"}, {"input": "xhumektumekt\n6\nujkikb\nant\nxh\numekt\nu\nkxsf", "expected": "1"}]$cr850DC8bE$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr78860Cf0$["dp", "string", "word-break"]$cr78860Cf0$::jsonb)),
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
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '音量调节（Change Volume）', 'cr-changevolume', 'EASY',
  $crf6bE237A$# 音量调节（Change Volume）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 2 Greedy Algorithm（贪心算法）。难度：EASY。标签：dp, greedy, volume。

## 题目描述
一个播放器的音量初始为 $begin$，有 $n$ 首歌，第 $i$ 首歌播放前可以**调高或调低** $c_i$ 个单位。全程音量必须保持在 $[0, maxLevel]$ 内。求全部 $n$ 首歌播放完后能达到的**最大音量**；若任何顺序都无法完成（某步必然越界），输出 `-1`。

## 输入格式
第一行三个整数 $n, begin, maxLevel$；
第二行 $n$ 个整数 $c_1,c_2,\dots,c_n$。

## 输出格式
一行一个整数：最终最大可达音量，或 `-1`。

## 数据范围
$1 \le n \le 50$，$0 \le begin \le maxLevel \le 10^3$，$1 \le c_i \le 10^3$。

## 思路提示
- DP 记录「每首歌后可达的音量集合」：从当前每个可达音量 $v$，转移 `v+c_i` 与 `v-c_i`（越界跳过）。
- 最后从大到小找第一个可达音量；无任何可达则输出 `-1`。
$crf6bE237A$,
  $cr547c4aCf$[{"input": "20 50 100\n10 1 5 22 4 19 4 23 2 15 23 30 14 16 13 14 15 27 11 13", "output": "99"}]$cr547c4aCf$::jsonb,
  $crdebdb7A5${"typescript": "// 音量调节：DP 记录可达音量集合。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0], begin = data[1], maxl = data[2];\n  const c = data.slice(3, 3 + n);\n  let cur: boolean[] = new Array(maxl + 1).fill(false);\n  cur[begin] = true;\n  for (const x of c) {\n    const nxt: boolean[] = new Array(maxl + 1).fill(false);\n    for (let lv = 0; lv <= maxl; lv++) {\n      if (cur[lv]) {\n        if (lv + x <= maxl) nxt[lv + x] = true;\n        if (lv - x >= 0) nxt[lv - x] = true;\n      }\n    }\n    cur = nxt;\n  }\n  for (let lv = maxl; lv >= 0; lv--) if (cur[lv]) return String(lv);\n  return '-1';\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 音量调节：DP 记录每首歌后可达音量集合。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n, begin, maxl = int(data[0]), int(data[1]), int(data[2])\n    c = [int(x) for x in data[3:3 + n]]\n    cur = [False] * (maxl + 1); cur[begin] = True\n    for x in c:\n        nxt = [False] * (maxl + 1)\n        for lv in range(maxl + 1):\n            if cur[lv]:\n                if lv + x <= maxl:\n                    nxt[lv + x] = True\n                if lv - x >= 0:\n                    nxt[lv - x] = True\n        cur = nxt\n    for lv in range(maxl, -1, -1):\n        if cur[lv]:\n            print(lv)\n            return\n    print(-1)\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), begin = sc.nextInt(), maxl = sc.nextInt();\n        int[] c = new int[n];\n        for (int i = 0; i < n; i++) c[i] = sc.nextInt();\n        boolean[] cur = new boolean[maxl + 1];\n        cur[begin] = true;\n        for (int x : c) {\n            boolean[] nxt = new boolean[maxl + 1];\n            for (int lv = 0; lv <= maxl; lv++)\n                if (cur[lv]) {\n                    if (lv + x <= maxl) nxt[lv + x] = true;\n                    if (lv - x >= 0) nxt[lv - x] = true;\n                }\n            cur = nxt;\n        }\n        for (int lv = maxl; lv >= 0; lv--)\n            if (cur[lv]) { System.out.println(lv); return; }\n        System.out.println(-1);\n    }\n}\n"}$crdebdb7A5$::jsonb,
  $crC84dcBfA$[{"input": "20 50 100\n14 26 27 24 7 29 11 10 8 19 28 30 9 24 19 17 1 18 18 4", "expected": "99"}, {"input": "20 50 100\n8 7 1 26 21 24 8 13 18 6 2 24 14 29 21 19 3 19 21 20", "expected": "100"}, {"input": "20 50 100\n25 5 15 7 4 16 21 12 25 2 17 26 19 13 28 4 3 18 23 29", "expected": "100"}]$crC84dcBfA$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crdF72CE9e$["dp", "greedy", "volume"]$crdF72CE9e$::jsonb)),
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
  '跳石头（Stone Jump）', 'cr-stonejump', 'MEDIUM',
  $crdB1B05Cc$# 跳石头（Stone Jump）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 2 Greedy Algorithm（贪心算法）。难度：MEDIUM。标签：binary-search, greedy, river。

## 题目描述
一条笔直河道起点 $0$、终点 $L$，河中有 $n$ 块石头（位置严格递增）。最多可以**移走 $m$ 块石头**（不能移起点和终点）。求移走后，从起点到终点**最短跳跃距离的最大可能值**。

## 输入格式
第一行三个整数 $L, n, m$；
接下来 $n$ 行，每行一个整数：石头位置（$0 < d_i < L$，递增）。

## 输出格式
一行一个整数：最大化的最短跳跃距离。

## 数据范围
$1 \le L \le 10^9$，$0 \le n \le 5\times10^4$，$0 \le m \le n$。

## 思路提示
- 二分答案 $gap$：贪心验证「若最短跳跃距离 $\ge gap$，最少需移走多少块石头」——相邻石头（或起点/终点）间距小于 $gap$ 就移走后者。
- 若最少移走数 $\le m$ 则 $gap$ 可行，二分求最大可行值。
$crdB1B05Cc$,
  $cr2f76Ca2c$[{"input": "10000 25 4\n90\n771\n1368\n1444\n1611\n2351\n2414\n3034\n4473\n4766\n4966\n5238\n5361\n5534\n6238\n6260\n6267\n7427\n7882\n8826\n8832\n8973\n9133\n9204\n9979", "output": "63"}]$cr2f76Ca2c$::jsonb,
  $crf5EF5f96${"typescript": "// 跳石头：二分答案 + 贪心验证。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const l = data[0], n = data[1], m = data[2];\n  const d = data.slice(3, 3 + n);\n  if (n === 0) return String(l);\n  const cnt = (gap: number): number => {\n    let count = 0, prev = 0;\n    for (const x of d) {\n      if (x - prev < gap) count++;\n      else prev = x;\n    }\n    if (l - d[n - 1] < gap) count++;\n    return count;\n  };\n  let left = 1, right = l, ans = 0;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (cnt(mid) <= m) { ans = mid; left = mid + 1; }\n    else right = mid - 1;\n  }\n  return String(ans);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 跳石头：二分答案 + 贪心验证最少移走数。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    l, n, m = int(data[0]), int(data[1]), int(data[2])\n    d = [int(x) for x in data[3:3 + n]]\n    if n == 0:\n        print(l)\n        return\n    def cnt(gap):\n        count = 0; prev = 0\n        for x in d:\n            if x - prev < gap:\n                count += 1\n            else:\n                prev = x\n        if l - d[-1] < gap:\n            count += 1\n        return count\n    left, right, ans = 1, l, 0\n    while left <= right:\n        mid = (left + right) // 2\n        if cnt(mid) <= m:\n            ans = mid; left = mid + 1\n        else:\n            right = mid - 1\n    print(ans)\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long l = sc.nextLong();\n        int n = sc.nextInt(), m = sc.nextInt();\n        long[] d = new long[n];\n        for (int i = 0; i < n; i++) d[i] = sc.nextLong();\n        if (n == 0) { System.out.println(l); return; }\n        long left = 1, right = l, ans = 0;\n        while (left <= right) {\n            long mid = (left + right) / 2;\n            long count = 0, prev = 0;\n            for (long x : d) {\n                if (x - prev < mid) count++;\n                else prev = x;\n            }\n            if (l - d[n - 1] < mid) count++;\n            if (count <= m) { ans = mid; left = mid + 1; }\n            else right = mid - 1;\n        }\n        System.out.println(ans);\n    }\n}\n"}$crf5EF5f96$::jsonb,
  $cr4cde9dDA$[{"input": "10000 25 7\n625\n924\n1434\n1561\n1642\n1699\n1866\n1890\n1975\n2267\n2802\n3551\n4778\n4814\n5119\n5401\n5588\n6051\n6659\n7243\n8354\n9473\n9500\n9704\n9782", "expected": "187"}, {"input": "10000 25 2\n232\n280\n519\n666\n1069\n1341\n1534\n1646\n1731\n1817\n2603\n3430\n4015\n4146\n4736\n5304\n5325\n6138\n6502\n6575\n6897\n7323\n8279\n9424\n9642", "expected": "73"}, {"input": "10000 25 5\n275\n488\n501\n531\n790\n1421\n2064\n2402\n2429\n2550\n2690\n3766\n5816\n6021\n6508\n7009\n7212\n7448\n7487\n7724\n8276\n9143\n9214\n9318\n9411", "expected": "93"}]$cr4cde9dDA$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crc9f8bbaF$["binary-search", "greedy", "river"]$crc9f8bbaF$::jsonb)),
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
  (SELECT id FROM categories WHERE slug = 'greedy'),
  '三值序列排序（Sort Three-Valued Sequence）', 'cr-sortthree', 'EASY',
  $cr24A11247$# 三值序列排序（Sort Three-Valued Sequence）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 2 Greedy Algorithm（贪心算法）。难度：EASY。标签：greedy, sorting, swap。

## 题目描述
给定一个只含 $1,2,3$ 的序列，每次操作可以**交换任意两个位置**的元素。求把它排成非降序（所有 1 在前、2 居中、3 在后）所需的最少交换次数。

## 输入格式
第一行一个整数 $n$；
第二行 $n$ 个整数（每个为 $1,2,3$）。

## 输出格式
一行一个整数：最少交换次数。

## 数据范围
$1 \le n \le 10^5$。

## 思路提示
- 排序后三段：1 区、2 区、3 区。统计错位对：1 区里的 2/3、2 区里的 1/3、3 区里的 1/2。
- 能一次交换解决的（1↔2、1↔3、2↔3）先直接配对；剩下的等量循环错位，每次需 2 次交换。
$cr24A11247$,
  $cre38009AC$[{"input": "40\n1 3 2 1 2 2 1 2 1 1 3 3 1 3 2 1 2 2 3 1 2 2 1 2 2 1 3 3 1 2 2 3 3 1 1 2 1 1 3 3", "output": "12"}]$cre38009AC$::jsonb,
  $cr82dc131F${"typescript": "// 三值排序：统计错位对，直接交换 + 循环错位。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0];\n  const a = data.slice(1, 1 + n);\n  const c1 = a.filter(x => x === 1).length;\n  const c2 = a.filter(x => x === 2).length;\n  let x12 = 0, x13 = 0, x21 = 0, x23 = 0, x31 = 0, x32 = 0;\n  for (let i = 0; i < c1; i++) { if (a[i] === 2) x12++; if (a[i] === 3) x13++; }\n  for (let i = c1; i < c1 + c2; i++) { if (a[i] === 1) x21++; if (a[i] === 3) x23++; }\n  for (let i = c1 + c2; i < n; i++) { if (a[i] === 1) x31++; if (a[i] === 2) x32++; }\n  const direct = Math.min(x12, x21) + Math.min(x13, x31) + Math.min(x23, x32);\n  return String(direct + 2 * Math.abs(x12 - x21));\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 三值排序：统计错位对，直接交换配对 + 循环错位 2 步。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    a = [int(x) for x in data[1:1 + n]]\n    c1 = sum(1 for x in a if x == 1)\n    c2 = sum(1 for x in a if x == 2)\n    x12 = sum(1 for i in range(c1) if a[i] == 2)\n    x13 = sum(1 for i in range(c1) if a[i] == 3)\n    x21 = sum(1 for i in range(c1, c1 + c2) if a[i] == 1)\n    x23 = sum(1 for i in range(c1, c1 + c2) if a[i] == 3)\n    x31 = sum(1 for i in range(c1 + c2, n) if a[i] == 1)\n    x32 = sum(1 for i in range(c1 + c2, n) if a[i] == 2)\n    direct = min(x12, x21) + min(x13, x31) + min(x23, x32)\n    print(direct + 2 * abs(x12 - x21))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] a = new int[n];\n        int c1 = 0, c2 = 0;\n        for (int i = 0; i < n; i++) { a[i] = sc.nextInt(); if (a[i] == 1) c1++; else if (a[i] == 2) c2++; }\n        int x12 = 0, x13 = 0, x21 = 0, x23 = 0, x31 = 0, x32 = 0;\n        for (int i = 0; i < c1; i++) { if (a[i] == 2) x12++; if (a[i] == 3) x13++; }\n        for (int i = c1; i < c1 + c2; i++) { if (a[i] == 1) x21++; if (a[i] == 3) x23++; }\n        for (int i = c1 + c2; i < n; i++) { if (a[i] == 1) x31++; if (a[i] == 2) x32++; }\n        int direct = Math.min(x12, x21) + Math.min(x13, x31) + Math.min(x23, x32);\n        System.out.println(direct + 2 * Math.abs(x12 - x21));\n    }\n}\n"}$cr82dc131F$::jsonb,
  $crf9afdddA$[{"input": "40\n3 1 2 3 3 3 3 1 2 3 1 3 1 1 3 1 2 2 2 2 2 2 3 3 2 1 1 2 1 2 3 2 2 3 2 3 1 1 2 1", "expected": "15"}, {"input": "40\n1 2 1 2 1 3 1 3 3 2 2 1 3 1 3 1 2 1 1 3 2 1 2 2 1 1 1 2 3 2 3 3 2 3 1 1 2 3 2 1", "expected": "13"}, {"input": "40\n2 1 3 2 1 2 1 2 2 3 3 2 3 3 3 3 1 3 1 1 3 3 3 3 2 3 1 2 1 3 1 3 3 2 3 1 2 1 2 1", "expected": "17"}]$crf9afdddA$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr68c7dED2$["greedy", "sorting", "swap"]$cr68c7dED2$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
