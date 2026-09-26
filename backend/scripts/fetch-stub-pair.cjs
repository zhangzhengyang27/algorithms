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
  const blocks = extractAllBlocks(content).filter((b) => b.code.length > 20);
  const byLang = {};
  for (const b of blocks) {
    let lang = null;
    if (['java', 'python', 'javascript', 'sql', 'mysql', 'postgresql', 'pgsql'].includes(b.hint)) {
      lang = b.hint === 'pgsql' ? 'postgresql' : b.hint;
    } else {
      lang = classify(b.code);
    }
    if (!lang) continue;
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
        variables: { questionSlug: lcSlug, first: 3, skip: 0, orderBy: 'DEFAULT' },
      }),
    });
    const data = await res.json();
    const edges = data?.data?.questionSolutionArticles?.edges;
    if (!edges || edges.length === 0) return null;
    // 遍历前3篇文章，取第一个有代码的
    for (const edge of edges) {
      const content = edge.node.content;
      if (!content) continue;
      const out = pickSolutions(content);
      if (Object.keys(out).length) return out;
    }
    return null;
  } catch (e) {
    console.error(`  ✗ 请求失败 [${lcSlug}]: ${e.message}`);
    return null;
  }
}

async function main() {
  const targets = [
    { slug: 'array-prototype-last', lcSlug: 'array-prototype-last' },
    { slug: 'fei-bo-na-qi-shu-lie-lcof', lcSlug: 'fei-bo-na-qi-shu-lie-lcof' },
  ];

  for (const t of targets) {
    const p = await prisma.problem.findUnique({ where: { slug: t.slug }, select: { id: true, slug: true, title: true } });
    if (!p) {
      console.log(`✗ ${t.slug} 数据库中不存在`);
      continue;
    }
    const result = await fetchSolution(t.lcSlug);
    if (!result) {
      console.log(`✗ ${t.slug} - 未找到题解`);
      continue;
    }
    await prisma.problem.update({ where: { id: p.id }, data: { solutions: result } });
    console.log(`✓ ${t.slug} (${Object.keys(result).join('+')})`);
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
