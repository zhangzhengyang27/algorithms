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
  return null;
}

function pickSolutions(content) {
  const blocks = extractAllBlocks(content).filter((b) => b.code.length > 30);
  const byLang = {};
  for (const b of blocks) {
    let lang = null;
    // 支持 "java [sol1-java]"、"python3 [sol1-python3]" 等带后缀的 hint
    const hintBase = b.hint.split(/\s+/)[0];
    const langSet = ['java', 'python', 'python3', 'javascript', 'js', 'sql', 'mysql', 'postgresql', 'pgsql', 'c++', 'cpp', 'c', 'go', 'golang'];
    if (langSet.includes(hintBase)) {
      if (hintBase === 'python3' || hintBase === 'python') lang = 'python';
      else if (hintBase === 'js') lang = 'javascript';
      else if (hintBase === 'cpp' || hintBase === 'c++') lang = 'cpp';
      else if (hintBase === 'golang') lang = 'go';
      else if (hintBase === 'pgsql') lang = 'postgresql';
      else if (hintBase === 'mysql') lang = 'sql';
      else lang = hintBase;
    } else {
      lang = classify(b.code);
    }
    if (!lang || !['java', 'python', 'javascript'].includes(lang)) continue;
    // 跳过明显是空壳的代码块
    const bodyOnly = b.code.replace(/\s/g, '');
    if (bodyOnly.length < 60) continue;
    // 每个语言保留最长的一块
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
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { questionSlug: lcSlug, first: 2, skip: 0, orderBy: 'DEFAULT' },
      }),
    });
    const data = await res.json();
    const edges = data?.data?.questionSolutionArticles?.edges;
    if (!edges || edges.length === 0) return null;
    for (const edge of edges) {
      const content = edge.node.content;
      if (!content) continue;
      const out = pickSolutions(content);
      if (Object.keys(out).length) return out;
    }
    return null;
  } catch (e) {
    console.error(`请求失败 [${lcSlug}]: ${e.message}`);
    return null;
  }
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.log('用法: node fetch-single-solution.cjs <slug>');
    process.exit(1);
  }
  const p = await prisma.problem.findUnique({ where: { slug }, select: { id: true, slug: true, title: true } });
  if (!p) {
    console.log(`✗ ${slug} 不存在`);
    process.exit(1);
  }
  const result = await fetchSolution(slug);
  if (!result) {
    console.log(`✗ ${slug} 未找到题解`);
    process.exit(1);
  }
  await prisma.problem.update({ where: { id: p.id }, data: { solutions: result } });
  console.log(`✓ ${slug} (${Object.keys(result).join('+')})`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
