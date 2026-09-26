/**
 * 针对「prune 后变空壳」的纯 SQL / 专项题，补抓 JS/Java/Python 三门语言。
 * 若 LeetCode 上该题为纯 SQL 题（无三门版本），则保留 sql 作为兜底，避免空壳。
 *
 * 运行: cd backend && node scripts/fetch-triplet-missing.cjs
 *   可选末尾传 slug 列表只处理指定题；不传则自动检测 solutions 为空的题。
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GRAPHQL_URL = 'https://leetcode.cn/graphql';
const QUERY = `
  query questionSolutionArticles($questionSlug: String!, $first: Int, $skip: Int, $orderBy: SolutionArticleOrderBy) {
    questionSolutionArticles(questionSlug: $questionSlug, first: $first, skip: $skip, orderBy: $orderBy) {
      edges { node { title content } }
    }
  }
`;

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
  /\breturn\b/i, /\bfor\s*\(/i, /\bwhile\s*\(/i, /\bif\s*\(/i, /\belse\b/i,
  /\bswitch\s*\(/i, /\bcase\s+/i, /\bbreak\b/i, /\bcontinue\b/i,
  /[+\-*/%]=?/, /\+\+|--/,
  /\b(System\.out|console\.|print\(|printf\(|println\()/i,
  /\b(select|from|where|group\s+by|order\s+by|join|having|insert|update|delete)\b/i,
  /\b(map|filter|reduce|sort|push|pop|shift|unshift|slice|splice)\s*\(/i,
  /\b(int|long|float|double|String|bool|char|vector|List|int\[\]|string)\s+\w+\s*=\s*[^;{]+/i,
];
function hasSubstantiveLogic(code) { return SUBSTANTIVE_TOKENS.some((re) => re.test(code)); }

function extractInnerBlocks(code) {
  const blocks = [];
  let depth = 0, start = -1;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') { if (depth === 0) start = i; depth++; }
    else if (code[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) { blocks.push(code.substring(start, i + 1)); start = -1; }
    }
  }
  return blocks;
}
function isStubCode(code) {
  if (!code || typeof code !== 'string') return true;
  const cleaned = stripComments(code);
  if (cleaned.length === 0) return true;
  if (!hasSubstantiveLogic(cleaned)) return true;
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
  if (/\bimpl\b[\s\S]*\bfn\b|\bpub\s+fn\b|let\s+mut\b|\bmatch\s+\w+\s*\{/.test(code)) return 'rust';
  if (/\busing\s+system|console\.writeline|\bnamespace\s+\w+|public\s+static\s+void\s+main/.test(c)) return 'csharp';
  return null;
}

const LANG_ALIASES = {
  java: 'java', python: 'python', python3: 'python', javascript: 'javascript',
  js: 'javascript', sql: 'sql', mysql: 'sql', postgresql: 'sql', pgsql: 'sql',
  cpp: 'cpp', 'c++': 'cpp', c: 'c', go: 'go', golang: 'go',
};
const KEEP_ALL = ['java', 'python', 'javascript', 'sql', 'cpp', 'c', 'go'];
const TRIPLET = ['javascript', 'java', 'python'];

function pickAllLangs(content) {
  const blocks = extractAllBlocks(content).filter((b) => b.code.length > 30 && !isStubCode(b.code));
  const byLang = {};
  for (const b of blocks) {
    const hintBase = b.hint.split(/\s+/)[0];
    const hintLang = LANG_ALIASES[hintBase];
    const detected = classify(b.code);
    let lang = null;
    if (detected && detected !== hintLang && hintLang) {
      lang = KEEP_ALL.includes(detected) ? detected : null;
    } else if (hintLang && KEEP_ALL.includes(hintLang)) {
      lang = hintLang;
    } else if (detected && KEEP_ALL.includes(detected)) {
      lang = detected;
    }
    if (!lang) continue;
    if (!byLang[lang] || b.code.length > byLang[lang].length) byLang[lang] = b.code;
  }
  return byLang;
}

async function fetchAllLangs(lcSlug) {
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
      const picked = pickAllLangs(content);
      for (const [lang, code] of Object.entries(picked)) {
        if (!merged[lang] || code.length > merged[lang].length) merged[lang] = code;
      }
    }
    return Object.keys(merged).length ? merged : null;
  } catch (e) {
    return { error: e.message };
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const args = process.argv.slice(2);
  let targets;
  if (args.length && args[0] !== '--all') {
    targets = args;
  } else {
    const problems = await prisma.problem.findMany({ select: { slug: true, solutions: true } });
    targets = problems
      .filter((p) => !p.solutions || Object.keys(p.solutions).length === 0)
      .map((p) => p.slug);
  }
  console.log('目标空壳题:', targets.length);
  let tripletOk = 0, sqlFallback = 0, stillEmpty = 0, failed = [];
  for (let i = 0; i < targets.length; i++) {
    const slug = targets[i];
    const all = await fetchAllLangs(slug);
    if (all && all.rateLimited) {
      console.log(`[${i + 1}/${targets.length}] ⚠ ${slug} 限流，退避 10s`);
      await sleep(10000);
      i--; continue;
    }
    if (all && all.error) {
      console.log(`[${i + 1}/${targets.length}] ✗ ${slug} 错误: ${all.error}`);
      stillEmpty++; failed.push(slug); await sleep(1000); continue;
    }
    if (!all) {
      console.log(`[${i + 1}/${targets.length}] ✗ ${slug} 未抓到`);
      stillEmpty++; failed.push(slug); await sleep(600); continue;
    }
    const triplet = {};
    for (const l of TRIPLET) if (all[l] && !isStubCode(all[l])) triplet[l] = all[l];
    let toWrite = null, mode = '';
    if (Object.keys(triplet).length > 0) { toWrite = triplet; mode = 'triplet'; tripletOk++; }
    else if (all.sql && !isStubCode(all.sql)) { toWrite = { sql: all.sql }; mode = 'sql-fallback'; sqlFallback++; }
    else { console.log(`[${i + 1}/${targets.length}] ✗ ${slug} 三门与SQL均无`); stillEmpty++; failed.push(slug); await sleep(600); continue; }
    await prisma.problem.update({ where: { slug }, data: { solutions: toWrite } });
    console.log(`[${i + 1}/${targets.length}] ✓ ${slug} [${mode}] ${Object.keys(toWrite).join('+')}`);
    await sleep(1200 + Math.random() * 800);
  }
  console.log(`\n完成: 三门补齐 ${tripletOk}, SQL兜底 ${sqlFallback}, 仍空 ${stillEmpty}`);
  if (failed.length) console.log('仍空 slug:', failed.join(', '));
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
