const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

function isEmptySolution(solutions) {
  if (!solutions) return true;
  if (Array.isArray(solutions) && solutions.length === 0) return true;
  if (typeof solutions === 'object' && Object.keys(solutions).length === 0) return true;
  return false;
}

// 提取最内层的 {} 块
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

const SUBSTANTIVE_TOKENS = [
  // 注意：def/function/class/var/let/const 等「声明/签名」不构成实现，不能当作实质逻辑
  /\breturn\s+[^;{}]+/i, // return 带返回值（return; 空 return 不算）
  /\bfor\s*\(/i,
  /\bwhile\s*\(/i,
  /\bif\s*\(/i,
  /\belse\b/i,
  /\bswitch\s*\(/i,
  /\bcase\s+/i,
  /\bbreak\b/i,
  /\bcontinue\b/i,
  /[+\-*/%]=/,
  /\+\+|--/,
  /\b(System\.out|console\.|print\(|printf\(|println\()/i,
  /\b(select|from|where|group\s+by|order\s+by|join|having|insert|update|delete)\b/i,
  /\b(map|filter|reduce|sort|push|pop|shift|unshift|slice|splice)\s*\(/i,
  /\b(int|long|float|double|String|bool|char|vector|List|int\[\]|string)\s+\w+\s*=\s*[^;{]+/i,
];

function hasSubstantiveLogic(code) {
  return SUBSTANTIVE_TOKENS.some((re) => re.test(code));
}

function isStubCode(code) {
  if (!code || typeof code !== 'string') return true;
  const cleaned = stripComments(code);
  if (cleaned.length === 0) return true;

  // 如果完全没有实质性算法逻辑，认为是空壳/占位符
  if (!hasSubstantiveLogic(cleaned)) return true;

  // 检查最内层 {} 是否都为空
  const innerBlocks = extractInnerBlocks(cleaned);
  if (innerBlocks.length > 0) {
    const allInnerEmpty = innerBlocks.every((block) => {
      const content = block.slice(1, -1).replace(/\s/g, '');
      return content.length === 0 || content === ';';
    });
    if (allInnerEmpty) return true;
  }

  // 有效字符太少
  const effectiveChars = cleaned.replace(/\s/g, '').length;
  if (effectiveChars < 50) return true;

  return false;
}

function anyLanguageIsStub(solutions) {
  if (isEmptySolution(solutions)) return true;
  const codes = [];
  if (solutions.codeSnippets && Array.isArray(solutions.codeSnippets)) {
    codes.push(...solutions.codeSnippets.map((s) => s.code || s));
  } else {
    codes.push(...Object.values(solutions).filter((v) => typeof v === 'string'));
  }
  if (codes.length === 0) return true;
  // 只要任一语言是空壳，就认为这道题需要补抓
  return codes.some(isStubCode);
}

function allLanguagesAreStubs(solutions) {
  if (isEmptySolution(solutions)) return true;
  const codes = [];
  if (solutions.codeSnippets && Array.isArray(solutions.codeSnippets)) {
    codes.push(...solutions.codeSnippets.map((s) => s.code || s));
  } else {
    codes.push(...Object.values(solutions).filter((v) => typeof v === 'string'));
  }
  if (codes.length === 0) return true;
  return codes.every(isStubCode);
}

async function main() {
  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true, solutions: true },
    orderBy: { slug: 'asc' },
  });

  const total = problems.length;
  const empty = problems.filter((p) => isEmptySolution(p.solutions));
  const allStub = problems.filter((p) => !isEmptySolution(p.solutions) && allLanguagesAreStubs(p.solutions));
  const anyStub = problems.filter((p) => !isEmptySolution(p.solutions) && anyLanguageIsStub(p.solutions));

  console.log('总题数:', total);
  console.log('solution字段完全为空:', empty.length);
  console.log('所有语言都是空壳:', allStub.length);
  console.log('至少一个语言是空壳:', anyStub.length);
  console.log('合计缺真实题解:', empty.length + anyStub.length);
  console.log('占比:', ((empty.length + anyStub.length) / total * 100).toFixed(1) + '%');

  if (anyStub.length > 0) {
    console.log('\n至少一个语言为空壳的题目:');
    anyStub.forEach((p, i) => {
      const langs = typeof p.solutions === 'object' ? Object.keys(p.solutions) : [];
      console.log(`${i + 1}. ${p.slug} | ${p.title} | 语言: ${langs.join(', ')}`);
    });
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
