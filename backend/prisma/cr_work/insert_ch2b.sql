-- INSERT ch2 第二批 5 题。幂等可重跑。
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'greedy'),
  '机器工厂（Machine Factory）', 'cr-machinefactory', 'MEDIUM',
  $cre743FafA$# 机器工厂（Machine Factory）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 2 Greedy Algorithm（贪心算法）。难度：MEDIUM。标签：greedy, inventory, production。

## 题目描述
某工厂连续 $n$ 周生产机器。第 $i$ 周生产一台机器的成本为 $p_i$，本周需交付 $y_i$ 台。本周生产不完的可提前生产并**存入仓库**，每台每周仓储费为 $s$。求满足所有交付需求的最小总成本。

## 输入格式
第一行两个整数 $n, s$；
接下来 $n$ 行，每行两个整数 $p_i, y_i$。

## 输出格式
一行一个整数：最小总成本。

## 数据范围
$1 \le n \le 10^5$，$1 \le s, p_i \le 10^4$，$1 \le y_i \le 10^5$。

## 思路提示
- 维护「本周可用最低单价」`min_p`：`min_p = min(min_p + s, p_i)`——要么用上周库存（加仓储费），要么本周现产。
- 本周成本 = `min_p * y_i`，累加即答案。
$cre743FafA$,
  $crf9dcfCe1$[{"input": "30 5\n69 36\n35 6\n12 2\n22 22\n56 34\n79 8\n47 36\n91 5\n44 22\n20 33\n10 43\n12 48\n26 41\n41 21\n32 2\n79 43\n74 37\n41 25\n62 50\n80 15\n77 18\n94 45\n18 39\n26 8\n18 20\n92 38\n68 21\n18 13\n94 33\n56 25", "output": "24185"}]$crf9dcfCe1$::jsonb,
  $cr8b3AafB5${"typescript": "// 机器工厂：贪心维护本周最低单价。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0], s = data[1];\n  let total = 0, minP = Infinity, i = 2;\n  for (let k = 0; k < n; k++) {\n    const p = data[i], y = data[i + 1]; i += 2;\n    minP = Math.min(minP + s, p);\n    total += minP * y;\n  }\n  return String(total);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 机器工厂：贪心维护本周最低单价（生产 or 上周库存+仓储）。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n, s = int(data[0]), int(data[1])\n    total = 0\n    min_p = 10 ** 18\n    i = 2\n    for _ in range(n):\n        p, y = int(data[i]), int(data[i + 1]); i += 2\n        min_p = min(min_p + s, p)\n        total += min_p * y\n    print(total)\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), s = sc.nextInt();\n        long total = 0, minP = Long.MAX_VALUE / 2;\n        for (int k = 0; k < n; k++) {\n            long p = sc.nextLong(), y = sc.nextLong();\n            minP = Math.min(minP + s, p);\n            total += minP * y;\n        }\n        System.out.println(total);\n    }\n}\n"}$cr8b3AafB5$::jsonb,
  $cr3a90a148$[{"input": "30 5\n85 35\n72 6\n72 21\n12 36\n21 6\n64 20\n70 37\n97 13\n26 15\n81 49\n36 38\n70 2\n22 33\n72 34\n34 16\n22 17\n10 46\n50 5\n72 36\n64 25\n98 7\n23 45\n51 48\n22 42\n21 37\n27 1\n37 39\n40 12\n51 9\n23 11", "expected": "21656"}, {"input": "30 5\n66 46\n79 16\n83 2\n97 39\n74 13\n61 30\n22 1\n49 25\n19 12\n70 22\n54 21\n36 41\n18 1\n75 12\n83 10\n29 46\n84 8\n46 38\n87 10\n53 32\n80 39\n77 4\n38 21\n27 30\n95 11\n75 21\n36 18\n59 20\n76 25\n30 1", "expected": "27128"}, {"input": "30 5\n38 35\n84 11\n70 12\n35 16\n51 9\n85 26\n47 21\n14 15\n67 8\n100 45\n52 19\n91 43\n82 38\n22 14\n28 23\n33 42\n46 6\n74 20\n34 21\n86 6\n38 15\n56 21\n80 50\n48 26\n36 40\n48 16\n59 50\n72 23\n45 49\n34 18", "expected": "28183"}]$cr3a90a148$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr57eC5bD1$["greedy", "inventory", "production"]$cr57eC5bD1$::jsonb)),
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
  '分段（Segmentation）', 'cr-segmentation', 'MEDIUM',
  $cr27d77DeA$# 分段（Segmentation）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 2 Greedy Algorithm（贪心算法）。难度：MEDIUM。标签：binary-search, greedy, partition。

## 题目描述
给定 $n$ 个正整数，要求按原顺序分成**不超过 $m$ 段**（每段连续），使得「所有段中元素和的最大值」尽可能小。输出这个最小值。

## 输入格式
第一行两个整数 $n, m$；
第二行 $n$ 个正整数 $a_1,a_2,\dots,a_n$。

## 输出格式
一行一个整数：最小化后的最大段和。

## 数据范围
$1 \le m \le n \le 10^5$，$1 \le a_i \le 10^9$。

## 思路提示
- 二分答案 $ub$：贪心验证「每段和不超过 $ub$ 时最少分成几段」——顺序扫，装得下就装，否则开新段。
- 若最少段数 $\le m$ 则 $ub$ 可行，二分求最小可行值。
$cr27d77DeA$,
  $crD52EDca4$[{"input": "30 9\n31 23 2 51 12 54 39 82 88 89 4 71 20 37 37 70 10 13 43 82 60 65 41 31 38 87 45 86 51 47", "output": "184"}]$crD52EDca4$::jsonb,
  $crD71F09aE${"typescript": "// 分段：二分最小最大段和。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0], m = data[1];\n  const a = data.slice(2, 2 + n);\n  const seg = (ub: number): number => {\n    let count = 0, segs = 1;\n    for (const x of a) {\n      if (x > ub) return Infinity;\n      if (count + x <= ub) count += x;\n      else { count = x; segs++; }\n    }\n    return segs;\n  };\n  let l = Math.max(...a), r = a.reduce((s, v) => s + v, 0);\n  while (l < r) {\n    const mid = Math.floor((l + r) / 2);\n    if (seg(mid) <= m) r = mid;\n    else l = mid + 1;\n  }\n  return String(l);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 分段：二分最小最大段和，贪心验证段数。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n, m = int(data[0]), int(data[1])\n    a = [int(x) for x in data[2:2 + n]]\n    def seg(ub):\n        count = 0; segs = 1\n        for x in a:\n            if x > ub:\n                return 10 ** 18\n            if count + x <= ub:\n                count += x\n            else:\n                count = x; segs += 1\n        return segs\n    l, r = max(a), sum(a)\n    while l < r:\n        mid = (l + r) // 2\n        if seg(mid) <= m:\n            r = mid\n        else:\n            l = mid + 1\n    print(l)\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), m = sc.nextInt();\n        long[] a = new long[n];\n        long l = 0, r = 0;\n        for (int i = 0; i < n; i++) { a[i] = sc.nextLong(); r += a[i]; l = Math.max(l, a[i]); }\n        while (l < r) {\n            long mid = (l + r) / 2;\n            long count = 0; int segs = 1;\n            for (long x : a) {\n                if (x > mid) { segs = Integer.MAX_VALUE; break; }\n                if (count + x <= mid) count += x;\n                else { count = x; segs++; }\n            }\n            if (segs <= m) r = mid;\n            else l = mid + 1;\n        }\n        System.out.println(l);\n    }\n}\n"}$crD71F09aE$::jsonb,
  $crAe1c8DC0$[{"input": "30 10\n46 49 11 88 8 20 28 82 52 55 70 34 8 78 41 85 73 84 100 15 74 23 47 37 29 62 23 66 96 82", "expected": "190"}, {"input": "30 3\n77 63 68 84 61 53 26 15 47 24 65 21 13 22 68 19 25 71 42 10 37 56 35 89 99 86 20 98 63 1", "expected": "494"}, {"input": "30 5\n45 78 54 2 94 26 55 6 65 61 71 47 70 67 22 84 46 28 60 21 77 7 63 34 49 60 33 49 23 70", "expected": "305"}]$crAe1c8DC0$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr1a04Ec6d$["binary-search", "greedy", "partition"]$cr1a04Ec6d$::jsonb)),
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
  '逃离孤岛（Island Escape）', 'cr-islandescape', 'MEDIUM',
  $crE83e23Fe$# 逃离孤岛（Island Escape）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 2 Greedy Algorithm（贪心算法）。难度：MEDIUM。标签：greedy, simulation, magic。

## 题目描述
一只青蛙在孤岛上，距离岸边 $s$ 米。它每秒可以执行三种动作之一：
- **闪现**：消耗 $10$ 点魔力，瞬间前进 $60$ 米；
- **走路**：前进 $17$ 米；
- **休息**：恢复 $4$ 点魔力。

初始有 $m$ 点魔力。问 $t$ 秒内能否到达岸边（前进距离 $\ge s$）。

## 输入格式
一行三个整数 $m, s, t$。

## 输出格式
若能到达：
```
Yes
所用秒数
```
否则：
```
No
最远前进距离
```

## 数据范围
$0 \le m \le 10^3$，$1 \le s \le 10^6$，$1 \le t \le 3\times10^5$。

## 思路提示
- 贪心：魔力够就闪现；不够时按「剩余时间 / 剩余距离」判断是否该走路，否则休息攒魔力。
- 逐秒模拟即可，输出首次到达时间或最终距离。
$crE83e23Fe$,
  $cr5278aaAa$[{"input": "5 495 22", "output": "No\n394"}]$cr5278aaAa$::jsonb,
  $cr04dcF894${"typescript": "// 逃离孤岛：逐秒贪心。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  let m = data[0], s = data[1], tt = data[2], dis = 0;\n  for (let i = 1; i <= tt; i++) {\n    if (m >= 10) { dis += 60; m -= 10; }\n    else if ((m < 2 && (tt - i < 3 || s - dis <= 102))\n      || (m < 6 && (tt - i < 2 || s - dis <= 34))\n      || (tt - i === 0 || s - dis <= 17)) {\n      dis += 17;\n    } else {\n      m += 4;\n    }\n    if (dis >= s) return 'Yes\\n' + i;\n  }\n  return 'No\\n' + dis;\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 逃离孤岛：逐秒贪心（闪现 > 走路 > 休息）。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    m, s, tt = int(data[0]), int(data[1]), int(data[2])\n    dis = 0\n    for i in range(1, tt + 1):\n        if m >= 10:\n            dis += 60; m -= 10\n        elif (m < 2 and (tt - i < 3 or s - dis <= 102)\n              or m < 6 and (tt - i < 2 or s - dis <= 34)\n              or (tt - i == 0 or s - dis <= 17)):\n            dis += 17\n        else:\n            m += 4\n        if dis >= s:\n            print('Yes')\n            print(i)\n            return\n    print('No')\n    print(dis)\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long m = sc.nextLong(), s = sc.nextLong();\n        int tt = sc.nextInt();\n        long dis = 0;\n        for (int i = 1; i <= tt; i++) {\n            if (m >= 10) { dis += 60; m -= 10; }\n            else if ((m < 2 && (tt - i < 3 || s - dis <= 102))\n                  || (m < 6 && (tt - i < 2 || s - dis <= 34))\n                  || (tt - i == 0 || s - dis <= 17)) {\n                dis += 17;\n            } else {\n                m += 4;\n            }\n            if (dis >= s) { System.out.println(\"Yes\"); System.out.println(i); return; }\n        }\n        System.out.println(\"No\");\n        System.out.println(dis);\n    }\n}\n"}$cr04dcF894$::jsonb,
  $cr9cAfa87E$[{"input": "334 1274 33", "expected": "Yes\n22"}, {"input": "270 1771 38", "expected": "Yes\n36"}, {"input": "378 1301 38", "expected": "Yes\n22"}]$cr9cAfa87E$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crF9Df35bc$["greedy", "simulation", "magic"]$crF9Df35bc$::jsonb)),
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
  '抄书（Book Copy）', 'cr-bookcopy', 'MEDIUM',
  $cr06e5cccc$# 抄书（Book Copy）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 2 Greedy Algorithm（贪心算法）。难度：MEDIUM。标签：binary-search, greedy, partition。

## 题目描述
$m$ 本书排成一排（第 $i$ 本有 $b_i$ 页），交给 $k$ 个抄写员，每人抄**连续的一段**，且每个人至少要抄一本。求一种分配，使**抄页数最多的人抄得尽量少**（即最小化最大抄写页数）。

若有多种最优方案，采用**靠后的人尽量多抄**的规则（从最后一本书开始向前分配）。

## 输入格式
第一行两个整数 $m, k$；
第二行 $m$ 个整数 $b_1,b_2,\dots,b_m$。

## 输出格式
$k$ 行，每行两个整数 `起 止`（1-indexed）：第 $i$ 个抄写员负责的书本区间。

## 数据范围
$1 \le k \le m \le 10^5$，$1 \le b_i \le 10^4$。

## 思路提示
- 二分答案 $t$（每人抄页数上限），贪心验证分段数 $\le k$；同时记录分段断点。
- 输出时按「从后往前贪心、前面的人尽量少」的规则给出区间（经典抄书规则，保证方案唯一）。
$cr06e5cccc$,
  $craDCDBbb3$[{"input": "30 7\n50 39 97 79 89 62 31 90 46 20 45 39 77 1 59 78 18 7 97 81 40 8 86 69 73 42 42 18 57 84", "output": "1 3\n4 6\n7 11\n12 16\n17 21\n22 25\n26 30"}]$craDCDBbb3$::jsonb,
  $cr4dE1360d${"typescript": "// 抄书：二分 + 从后往前贪心划分。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const m = data[0], k = data[1];\n  const b = data.slice(2, 2 + m);\n  const tot = b.reduce((s, v) => s + v, 0);\n  let l = Math.floor(tot / k), r = tot;\n  let resp: number[] = new Array(m + 1).fill(0);\n  let best = Infinity;\n  while (l < r) {\n    const mid = Math.floor((l + r) / 2);\n    let seg = 1, count = 0;\n    const period: number[] = new Array(m + 1).fill(0);\n    let ok = true;\n    for (let i = m - 1; i >= 0; i--) {\n      if (b[i] > mid) { seg = Infinity; ok = false; break; }\n      if (count + b[i] <= mid) count += b[i];\n      else { count = b[i]; period[seg] = i + 1; seg++; }\n    }\n    if (ok && seg === k && mid < best) { best = mid; resp = period.slice(); }\n    if (seg <= k) r = mid;\n    else l = mid + 1;\n  }\n  resp[0] = m; resp[k] = 0;\n  const out: string[] = [];\n  for (let i = k - 1; i >= 0; i--) out.push(`${resp[i + 1] + 1} ${resp[i]}`);\n  return out.join('\\n');\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 抄书：二分最小最大抄页数，从后往前贪心划分（靠后的人多抄）。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    m, k = int(data[0]), int(data[1])\n    b = [int(x) for x in data[2:2 + m]]\n    tot = sum(b)\n    l, r = tot // k, tot\n    resp = [0] * (m + 1)\n    best = 10 ** 18\n    while l < r:\n        mid = (l + r) // 2\n        seg = 1; count = 0\n        period = [0] * (m + 1)\n        for i in range(m - 1, -1, -1):\n            if b[i] > mid:\n                seg = 10 ** 18\n                break\n            if count + b[i] <= mid:\n                count += b[i]\n            else:\n                count = b[i]\n                period[seg] = i + 1\n                seg += 1\n        if seg == k and mid < best:\n            best = mid\n            resp = period[:]\n        if seg <= k:\n            r = mid\n        else:\n            l = mid + 1\n    resp[0] = m\n    resp[k] = 0\n    out = []\n    for i in range(k - 1, -1, -1):\n        out.append(f\"{resp[i + 1] + 1} {resp[i]}\")\n    print('\\n'.join(out))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int m = sc.nextInt(), k = sc.nextInt();\n        int[] b = new int[m];\n        long tot = 0;\n        for (int i = 0; i < m; i++) { b[i] = sc.nextInt(); tot += b[i]; }\n        long l = tot / k, r = tot;\n        int[] resp = new int[m + 1];\n        long best = Long.MAX_VALUE;\n        while (l < r) {\n            long mid = (l + r) / 2;\n            int seg = 1; long count = 0;\n            int[] period = new int[m + 1];\n            for (int i = m - 1; i >= 0; i--) {\n                if (b[i] > mid) { seg = Integer.MAX_VALUE; break; }\n                if (count + b[i] <= mid) count += b[i];\n                else { count = b[i]; period[seg] = i + 1; seg++; }\n            }\n            if (seg == k && mid < best) { best = mid; resp = period.clone(); }\n            if (seg <= k) r = mid;\n            else l = mid + 1;\n        }\n        resp[0] = m; resp[k] = 0;\n        StringBuilder sb = new StringBuilder();\n        for (int i = k - 1; i >= 0; i--) sb.append(resp[i + 1] + 1).append(' ').append(resp[i]).append('\\n');\n        System.out.print(sb.toString());\n    }\n}\n"}$cr4dE1360d$::jsonb,
  $cr766ea91d$[{"input": "30 5\n93 80 97 44 75 78 22 27 11 29 92 6 76 38 2 48 4 100 63 45 65 57 46 48 8 67 63 7 58 55", "expected": "1 4\n5 11\n12 18\n19 23\n24 30"}, {"input": "30 6\n58 51 74 72 27 40 22 29 78 31 63 26 100 88 89 90 44 98 3 74 63 83 15 26 90 2 32 42 7 78", "expected": "1 5\n6 12\n13 15\n16 18\n19 23\n24 30"}, {"input": "30 7\n38 60 60 78 19 98 84 41 56 66 59 50 91 4 12 99 32 89 29 81 92 13 57 90 4 21 15 22 83 9", "expected": "1 4\n5 8\n9 12\n13 16\n17 19\n20 23\n24 30"}]$cr766ea91d$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr5EcB87f0$["binary-search", "greedy", "partition"]$cr5EcB87f0$::jsonb)),
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
  '买干草（Buying Hay）', 'cr-buyinghay', 'MEDIUM',
  $crB116041A$# 买干草（Buying Hay）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 2 Greedy Algorithm（贪心算法）。难度：MEDIUM。标签：dp, knapsack, complete-knapsack。

## 题目描述
农场需要至少 $h$ 磅干草。商店有 $n$ 种干草包，第 $i$ 种每包 $p_i$ 磅、售价 $c_i$ 元，**每种可以买任意多包**。求买到总量 $\ge h$ 磅所需的最小花费。

## 输入格式
第一行两个整数 $n, h$；
接下来 $n$ 行，每行两个整数 $p_i, c_i$。

## 输出格式
一行一个整数：最小花费。

## 数据范围
$1 \le n \le 100$，$1 \le h \le 10^4$，$1 \le p_i \le 100$，$1 \le c_i \le 10^3$。

## 思路提示
- 完全背包：`f[j]` = 恰好买 $j$ 磅的最小花费（每种无限取，容量**正序**遍历）。
- 允许超买：容量上限取 $h + \max(p_i) - 1$，答案 = `min(f[h..上限])`。
$crB116041A$,
  $cre954dF7f$[{"input": "20 300\n45 31\n60 147\n19 135\n58 78\n40 84\n23 175\n45 117\n64 163\n34 52\n14 81\n37 165\n31 97\n22 196\n11 122\n60 132\n25 124\n33 177\n43 137\n61 183\n61 197", "output": "217"}]$cre954dF7f$::jsonb,
  $crbA7c73ec${"typescript": "// 买干草：完全背包，允许超买。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0], h = data[1];\n  const ps: number[] = [], cs: number[] = [];\n  let i = 2;\n  let maxp = 0;\n  for (let k = 0; k < n; k++) { ps.push(data[i]); cs.push(data[i + 1]); maxp = Math.max(maxp, data[i]); i += 2; }\n  const H = h + maxp - 1;\n  const f: number[] = new Array(H + 1).fill(Infinity);\n  f[0] = 0;\n  for (let k = 0; k < n; k++) {\n    for (let j = 0; j <= H - ps[k]; j++) {\n      if (f[j] + cs[k] < f[j + ps[k]]) f[j + ps[k]] = f[j] + cs[k];\n    }\n  }\n  let res = Infinity;\n  for (let j = h; j <= H; j++) res = Math.min(res, f[j]);\n  return String(res);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 买干草：完全背包，f[j] = 恰好 j 磅的最小花费，允许超买。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n, h = int(data[0]), int(data[1])\n    ps = []; cs = []\n    i = 2\n    for _ in range(n):\n        ps.append(int(data[i])); cs.append(int(data[i + 1])); i += 2\n    maxp = max(ps)\n    H = h + maxp - 1\n    INF = 10 ** 18\n    f = [INF] * (H + 1); f[0] = 0\n    for p, c in zip(ps, cs):\n        for j in range(H - p + 1):\n            if f[j] + c < f[j + p]:\n                f[j + p] = f[j] + c\n    print(min(f[h:]))\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), h = sc.nextInt();\n        int[] ps = new int[n], cs = new int[n];\n        int maxp = 0;\n        for (int i = 0; i < n; i++) { ps[i] = sc.nextInt(); cs[i] = sc.nextInt(); maxp = Math.max(maxp, ps[i]); }\n        int H = h + maxp - 1;\n        long[] f = new long[H + 1];\n        Arrays.fill(f, Long.MAX_VALUE / 2);\n        f[0] = 0;\n        for (int i = 0; i < n; i++)\n            for (int j = 0; j <= H - ps[i]; j++)\n                if (f[j] + cs[i] < f[j + ps[i]]) f[j + ps[i]] = f[j] + cs[i];\n        long res = Long.MAX_VALUE / 2;\n        for (int j = h; j <= H; j++) res = Math.min(res, f[j]);\n        System.out.println(res);\n    }\n}\n"}$crbA7c73ec$::jsonb,
  $crDb5B97af$[{"input": "20 300\n55 132\n72 40\n30 143\n13 124\n26 159\n66 131\n67 161\n53 169\n67 183\n30 28\n20 145\n19 78\n78 28\n47 77\n52 37\n63 171\n77 111\n27 61\n53 25\n20 125", "expected": "112"}, {"input": "20 300\n80 27\n61 115\n45 156\n70 167\n58 135\n63 142\n17 59\n27 18\n55 140\n53 30\n46 140\n46 198\n65 44\n68 180\n61 134\n25 150\n25 187\n39 28\n26 165\n45 147", "expected": "108"}, {"input": "20 300\n76 57\n29 36\n77 47\n21 89\n29 148\n52 16\n21 115\n62 94\n47 129\n44 13\n33 195\n31 134\n16 153\n58 54\n21 30\n41 83\n68 106\n49 91\n19 11\n73 97", "expected": "91"}]$crDb5B97af$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crE70EF842$["dp", "knapsack", "complete-knapsack"]$crE70EF842$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
