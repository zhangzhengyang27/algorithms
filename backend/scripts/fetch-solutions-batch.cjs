/**
 * 批量补抓「空壳/占位符」题解。
 *
 * 问题根源：数据库里大量 problem.solutions 存的是 LeetCode starter template
 * （空函数体），不是真实题解。本脚本用 questionSolutionArticles 匿名 GraphQL
 * 拉取真实用户题解，严格过滤空壳后写回。
 *
 * 特性：
 *  - 严格空壳检测（复用 scan-solution-quality.cjs 的 isStubCode）
 *  - 多语言提取（java/python/javascript/sql/cpp/c/go），支持带后缀围栏
 *  - 合并策略：保留已有「非空壳」语言，仅用真实代码替换空壳/缺失的语言
 *  - 限速 + 抖动，429/网络错误指数退避，天然可续跑（已好的题不会进入 targets）
 *
 * 运行: cd backend && node scripts/fetch-solutions-batch.cjs
 *   可选参数: --limit N   只处理前 N 道（调试用）
 *            --force     忽略现有，强制重抓全部（不推荐）
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

// 实时进度文档：刷新即可看到批量抓取是否在运行
const LOG_FILE = '/Users/xiaoye/Desktop/algorithms/SOLUTION_FETCH_PROGRESS.md';
function logLine(s) { try { fs.appendFileSync(LOG_FILE, s + '\n'); } catch (e) { /* ignore */ } }
function out(s) { console.log(s); logLine(s); }

const GRAPHQL_URL = 'https://leetcode.cn/graphql';
const QUERY = `
  query questionSolutionArticles($questionSlug: String!, $first: Int, $skip: Int, $orderBy: SolutionArticleOrderBy) {
    questionSolutionArticles(questionSlug: $questionSlug, first: $first, skip: $skip, orderBy: $orderBy) {
      edges { node { title content } }
    }
  }
`;

// DB slug → LeetCode slug（与历史脚本保持一致）
const SLUG_MAP = {
  'smallest-k-numbers': 'zui-xiao-de-kge-shu-lcof',
  'intersection-of-arrays': 'two-sum',
  'top-k-frequent': 'top-k-frequent-elements',
  'reverse-pairs': 'shu-zu-zhong-de-ni-xu-dui-lcof',
  'trap-rain-water': 'trapping-rain-water',
  'find-min-rotated': 'find-minimum-in-rotated-sorted-array',
  'squares-of-sorted-array': 'squares-of-a-sorted-array',
  'remove-duplicates': 'remove-duplicates-from-sorted-array',
  'is-ugly': 'ugly-number',
  'longest-substring-without-repeating': 'longest-substring-without-repeating-characters',
  'reverse-array': 'reverse-string',
  'intersect': 'intersection-of-two-arrays-ii',
  'int-to-roman': 'integer-to-roman',
  'reverse-words': 'reverse-words-in-a-string',
  'remove-nth-node': 'remove-nth-node-from-end-of-list',
  'four-sum-ii': '4sum-ii',
  'intersection-of-linked-lists': 'intersection-of-two-linked-lists',
  'largest-rectangle-histogram': 'largest-rectangle-in-histogram',
  'implement-queue-stacks': 'implement-queue-using-stacks',
  'min-depth-binary-tree': 'minimum-depth-of-binary-tree',
  'inorder-traversal': 'binary-tree-inorder-traversal',
  'best-time-to-buy-sell-stock': 'best-time-to-buy-and-sell-stock',
  'right-side-view': 'binary-tree-right-side-view',
  'lowest-common-ancestor': 'lowest-common-ancestor-of-a-binary-tree',
  'zigzag-level-order': 'binary-tree-zigzag-level-order-traversal',
  'kth-smallest-bst': 'kth-smallest-element-in-a-bst',
  'kth-largest-element': 'kth-largest-element-in-an-array',
  'excel-column-number': 'excel-sheet-column-number',
  'n-th-tribonacci': 'n-th-tribonacci-number',
  'bitwise-and-range': 'bitwise-and-of-numbers-range',
  'binary-alternating-bits': 'binary-number-with-alternating-bits',
  'queue-reconstruction': 'queue-reconstruction-by-height',
  'min-size-subarray-sum': 'minimum-size-subarray-sum',
  'three-sum': '3sum',
  'copy-list-random': 'copy-list-with-random-pointer',
  'validate-bst': 'validate-binary-search-tree',
  'surround-regions': 'surrounded-regions',
  'pacific-atlantic': 'pacific-atlantic-water-flow',
  'best-time-to-buy-sell-stock-ii': 'best-time-to-buy-and-sell-stock-ii',
  'two-sum-ii': 'two-sum-ii-input-array-is-sorted',
  'three-sum-closest': '3sum-closest',
  'excel-column-title': 'excel-sheet-column-title',
  'implement-strstr': 'find-the-index-of-the-first-occurrence-in-a-string',
  'happy-number': 'happy-number',
  'eval-rpn': 'evaluate-reverse-polish-notation',
  'preorder-traversal': 'binary-tree-preorder-traversal',
  'sort-characters-frequency': 'sort-characters-by-frequency',
  'restore-ip': 'restore-ip-addresses',
  'first-unique-char': 'first-unique-character-in-a-string',
  'roman-to-int': 'roman-to-integer',
  'postorder-traversal': 'binary-tree-postorder-traversal',
  'average-of-levels': 'average-of-levels-in-binary-tree',
  'implement-trie': 'implement-trie-prefix-tree',
  'level-order-traversal': 'binary-tree-level-order-traversal',
  'range-sum-bst': 'range-sum-of-bst',
  'letter-combinations': 'letter-combinations-of-a-phone-number',
  'minimum-arrows': 'minimum-number-of-arrows-to-burst-balloons',
  'product-except-self': 'product-of-array-except-self',
  'max-depth-binary-tree': 'maximum-depth-of-binary-tree',
};

const KEEP_LANGS = ['java', 'python', 'javascript', 'sql', 'cpp', 'c', 'go'];

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function stripComments(code) {
  if (!code) return '';
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/#.*$/gm, '')
    .replace(/--.*$/gm, '')
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
    .trim();
}

const SUBSTANTIVE_TOKENS = [
  // 注意：def/function/class/var/let/const 等「声明/签名」不构成实现，不能当作实质逻辑
  /\breturn\s+[^;{}]+/i, // return 带返回值（return; 空 return 不算）
  /\bfor\s*\(/i,         // for 循环
  /\bwhile\s*\(/i,       // while 循环
  /\bif\s*\(/i,          // if
  /\belse\b/i,           // else
  /\bswitch\s*\(/i,      // switch
  /\bcase\s+/i,          // case
  /\bbreak\b/i,          // break
  /\bcontinue\b/i,       // continue
  /[+\-*/%]=/,           // 复合赋值 (+= -= *= /= %=)
  /\+\+|--/,             // 自增/自减
  /\b(System\.out|console\.|print\(|printf\(|println\()/i, // 输出语句
  /\b(select|from|where|group\s+by|order\s+by|join|having|insert|update|delete)\b/i, // SQL
  /\b(map|filter|reduce|sort|push|pop|shift|unshift|slice|splice)\s*\(/i, // 数组高阶方法
  /\b(int|long|float|double|String|bool|char|vector|List|int\[\]|string)\s+\w+\s*=\s*[^;{]+/i, // 变量声明并赋值（函数体内有代码）
];

function hasSubstantiveLogic(code) { return SUBSTANTIVE_TOKENS.some((re) => re.test(code)); }

// 提取最内层的 {} 块（与 scan 一致）
function extractInnerBlocks(code) {
  const blocks = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (code[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        blocks.push(code.substring(start, i + 1));
        start = -1;
      }
    }
  }
  return blocks;
}

function isStubCode(code) {
  if (!code || typeof code !== 'string') return true;
  const cleaned = stripComments(code);
  if (cleaned.length === 0) return true;
  if (!hasSubstantiveLogic(cleaned)) return true;
  // 最内层 {} 全空 → 空壳（如 class Solution { void f() {} }）
  const innerBlocks = extractInnerBlocks(cleaned);
  if (innerBlocks.length > 0) {
    const allInnerEmpty = innerBlocks.every((block) => {
      const content = block.slice(1, -1).replace(/\s/g, '');
      return content.length === 0 || content === ';';
    });
    if (allInnerEmpty) return true;
  }
  const effectiveChars = cleaned.replace(/\s/g, '').length;
  if (effectiveChars < 50) return true;
  return false;
}

function isEmptySolution(solutions) {
  if (!solutions) return true;
  if (Array.isArray(solutions) && solutions.length === 0) return true;
  if (typeof solutions === 'object' && Object.keys(solutions).length === 0) return true;
  return false;
}

// 只要任一语言是空壳，就认为需要补抓
function anyLanguageIsStub(solutions) {
  if (isEmptySolution(solutions)) return true;
  const codes = Object.values(solutions).filter((v) => typeof v === 'string');
  if (codes.length === 0) return true;
  return codes.some(isStubCode);
}

function extractAllBlocks(content) {
  const re = /```([^\n]*)\n([\s\S]*?)```/g;
  const out = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    out.push({ hint: m[1].trim().toLowerCase(), code: m[2].trim() });
  }
  return out;
}

function classify(code) {
  const c = code.toLowerCase();
  if (/\b(select|from|where|group by|order by|join|having|insert|update|delete)\b/.test(c) && !/\bclass\s+\w/.test(c) && !/^\s*def\s/.test(c)) return 'sql';
  if (/\bpublic\s+class\b/.test(c) || /\bclass\s+\w+\s*\{/.test(c)) return 'java';
  if (/^\s*def\s/.test(c)) return 'python';
  if (/function\s+\w+|const\s+\w+\s*=|=>\s*\{|console\.\w+/.test(c) && !/\bclass\s/.test(c)) return 'javascript';
  if (/^\s*#include\b/.test(c) || /\b(std::|cout|<iostream)/.test(c)) return 'cpp';
  if (/^\s*(func\s|package\s|import\s)/.test(c) && /\bfunc\b/.test(c)) return 'go';
  // 其他语言（不在可渲染集合，仅用于「识别错标」）：rust / c#
  if (/\bimpl\b[^]*\bfn\b|\bpub\s+fn\b|let\s+mut\b|\bmatch\s+\w+\s*\{/.test(code)) return 'rust';
  if (/\busing\s+system|console\.writeline|\bnamespace\s+\w+|public\s+static\s+void\s+main/.test(c)) return 'csharp';
  return null;
}

const LANG_ALIASES = {
  java: 'java', python: 'python', python3: 'python', javascript: 'javascript',
  js: 'javascript', sql: 'sql', mysql: 'sql', postgresql: 'sql', pgsql: 'sql',
  cpp: 'cpp', 'c++': 'cpp', c: 'c', go: 'go', golang: 'go',
};

function pickSolutions(content) {
  const blocks = extractAllBlocks(content).filter((b) => b.code.length > 30 && !isStubCode(b.code));
  const byLang = {};
  for (const b of blocks) {
    const hintBase = b.hint.split(/\s+/)[0];
    const hintLang = LANG_ALIASES[hintBase];
    const detected = classify(b.code);
    let lang = null;
    if (detected && detected !== hintLang && hintLang) {
      // 代码实际语言与围栏声明不一致：若实际语言可渲染则信任内容，否则丢弃（避免错标）
      if (KEEP_LANGS.includes(detected)) lang = detected;
      else continue;
    } else if (hintLang && KEEP_LANGS.includes(hintLang)) {
      lang = hintLang;
    } else if (detected && KEEP_LANGS.includes(detected)) {
      lang = detected;
    } else {
      continue;
    }
    if (!byLang[lang] || b.code.length > byLang[lang].length) byLang[lang] = b.code;
  }
  return byLang;
}

async function fetchSolution(lcSlug) {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: `https://leetcode.cn/problems/${lcSlug}/solution/`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { questionSlug: lcSlug, first: 20, skip: 0, orderBy: 'DEFAULT' },
      }),
    });
    if (res.status === 429) return { rateLimited: true };
    const data = await res.json();
    const edges = data?.data?.questionSolutionArticles?.edges;
    if (!edges || edges.length === 0) return null;
    const merged = {};
    for (const edge of edges) {
      const content = edge.node.content;
      if (!content) continue;
      const picked = pickSolutions(content);
      for (const [lang, code] of Object.entries(picked)) {
        if (!merged[lang] || code.length > merged[lang].length) merged[lang] = code;
      }
    }
    return Object.keys(merged).length ? merged : null;
  } catch (e) {
    return { error: e.message };
  }
}

// 合并：保留已有「非空壳且未错标」的语言，用真实代码覆盖/补充（抓回的优先）
function mergeSolutions(existing, fetched) {
  const merged = {};
  // 1. 先放入已有非空壳、且未错标的语言
  if (existing && typeof existing === 'object') {
    for (const [lang, code] of Object.entries(existing)) {
      if (typeof code !== 'string') continue;
      if (isStubCode(code)) continue;
      // 错标检测：内容明显是 rust/csharp 但键不是对应语言 → 丢弃
      const det = classify(code);
      if (det && det !== lang && (det === 'rust' || det === 'csharp')) continue;
      merged[lang] = code;
    }
  }
  // 2. 用抓回的真实代码覆盖/补充（优先抓回的，更干净）
  for (const [lang, code] of Object.entries(fetched)) {
    if (!isStubCode(code)) merged[lang] = code;
  }
  const hasReal = Object.values(merged).some((c) => !isStubCode(c));
  return hasReal ? { merged, added: Object.keys(fetched).length } : null;
}

async function main() {
  const args = process.argv.slice(2);
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : Infinity;
  const force = args.includes('--force');
  const sanitize = args.includes('--sanitize');

  // 清理模式：全量扫描，删除「内容语言与键名不符」的错标键（如 Rust 错标成 javascript）
  if (sanitize) {
    const all = await prisma.problem.findMany({ select: { id: true, slug: true, solutions: true } });
    let cleaned = 0;
    for (const p of all) {
      if (isEmptySolution(p.solutions)) continue;
      const sol = p.solutions;
      let changed = false;
      for (const [lang, code] of Object.entries(sol)) {
        if (typeof code !== 'string') continue;
        const det = classify(code);
        if (det && det !== lang && (det === 'rust' || det === 'csharp')) {
          delete sol[lang];
          changed = true;
          console.log(`  清理错标: ${p.slug} 键 ${lang} 实际为 ${det}`);
        }
      }
      if (changed) {
        if (Object.keys(sol).some((l) => typeof sol[l] === 'string' && !isStubCode(sol[l]))) {
          await prisma.problem.update({ where: { id: p.id }, data: { solutions: sol } });
          cleaned++;
        } else {
          console.log(`  ⚠ ${p.slug} 清理后无真实语言，保留原值`);
        }
      }
    }
    console.log(`\n清理完成，共修正 ${cleaned} 题。`);
    await prisma.$disconnect();
    return;
  }

  const all = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true, solutions: true },
    orderBy: { slug: 'asc' },
  });

  let targets;
  if (force) {
    targets = all;
  } else {
    targets = all.filter((p) => anyLanguageIsStub(p.solutions));
  }

  if (limit !== Infinity) targets = targets.slice(0, limit);

  if (fs.existsSync(LOG_FILE)) {
    // 续跑：保留历史进度，追加一段续跑标记
    fs.appendFileSync(LOG_FILE, `\n\n## 续跑 @ ${new Date().toLocaleString()}\n- 本次目标空壳题: ${targets.length}\n- 状态: **RUNNING**\n\n---\n`);
  } else {
    fs.writeFileSync(LOG_FILE, `# 题解批量补抓进度\n\n- 状态: **RUNNING**\n- 启动: ${new Date().toLocaleString()}\n- 目标空壳题: ${targets.length}\n- 刷新本文件即可查看实时进度（每处理一题追加一行，每 25 题一个汇总）\n\n---\n`);
  }
  out(`目标空壳题: ${targets.length}，开始批量抓取（可续跑）...`);
  out('起始时间: ' + new Date().toLocaleString());

  let success = 0, skipped = 0, failed = 0, rateLimited = 0;
  const failedSlugs = [];
  let backoff = 0;

  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    const lcSlug = SLUG_MAP[p.slug] || p.slug;
    const result = await fetchSolution(lcSlug);

    if (result && result.rateLimited) {
      rateLimited++;
      backoff = Math.min(backoff + 1, 5);
      const wait = 10000 * backoff;
      out(`[${i + 1}/${targets.length}] ⚠ 触发限流，退避 ${(wait / 1000)}s (${p.slug})`);
      await sleep(wait);
      i--; // 重试当前题
      continue;
    }
    if (result && result.error) {
      out(`[${i + 1}/${targets.length}] ✗ ${p.slug} - 网络错误: ${result.error}`);
      failed++; failedSlugs.push(p.slug);
      await sleep(1000 + Math.random() * 1000);
      continue;
    }
    if (!result) {
      out(`[${i + 1}/${targets.length}] ✗ ${p.slug} - 未找到真实题解`);
      failed++; failedSlugs.push(p.slug);
      await sleep(600 + Math.random() * 600);
      continue;
    }

    const merged = mergeSolutions(p.solutions, result);
    if (!merged) {
      out(`[${i + 1}/${targets.length}] ✗ ${p.slug} - 抓回仍是空壳，跳过`);
      failed++; failedSlugs.push(p.slug);
      await sleep(600 + Math.random() * 600);
      continue;
    }

    await prisma.problem.update({ where: { id: p.id }, data: { solutions: merged.merged } });
    const langs = Object.keys(merged.merged).join('+');
    out(`[${i + 1}/${targets.length}] ✓ ${p.slug} (${(merged.added ? '+' : '') + langs})`);
    success++;
    backoff = 0;
    if ((i + 1) % 25 === 0) {
      out(`\n## 进度汇总 @ ${new Date().toLocaleTimeString()}\n- 已处理 ${i + 1}/${targets.length}\n- 成功 ${success}, 失败 ${failed}, 限流 ${rateLimited}\n- 剩余 ${targets.length - (i + 1)}\n`);
    }
    await sleep(1200 + Math.random() * 800);
  }

  out(`\n═══════════════════════`);
  out(`完成! 成功写回: ${success}, 跳过/失败: ${failed}, 限流次数: ${rateLimited}`);
  out('结束时间: ' + new Date().toLocaleString());
  if (failedSlugs.length) {
    out(`\n未补齐的题目 (${failedSlugs.length}):`);
    failedSlugs.forEach((s) => out(`  - ${s}`));
  }
  try { fs.appendFileSync(LOG_FILE, `\n\n> 状态更新: **DONE** @ ${new Date().toLocaleString()}\n`); } catch (e) {}
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
