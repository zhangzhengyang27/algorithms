/**
 * 从 LeetCode CN 批量导入全部免费题目到数据库。
 * 
 * 用法:
 *   npx ts-node scripts/import-all-leetcode.ts list      # 阶段A: 获取题目列表
 *   npx ts-node scripts/import-all-leetcode.ts detail    # 阶段B: 获取详情并入库
 *   npx ts-node scripts/import-all-leetcode.ts solutions # 阶段C: 获取题解
 *   npx ts-node scripts/import-all-leetcode.ts all       # 依次执行 A→B→C
 */
import { PrismaClient } from '@prisma/client';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const GRAPHQL_URL = 'https://leetcode.cn/graphql';
const SCRIPTS_DIR = __dirname;
const QUEUE_FILE = path.join(SCRIPTS_DIR, 'import-queue.json');
const PROGRESS_FILE = path.join(SCRIPTS_DIR, 'import-progress.json');

const nhm = new NodeHtmlMarkdown();

// ─── 分类映射 ───────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  'array': 'array',
  'hash-table': 'hash-table',
  'dynamic-programming': 'dynamic-programming',
  'string': 'string',
  'tree': 'binary-tree',
  'binary-tree': 'binary-tree',
  'binary-search-tree': 'binary-tree',
  'graph': 'graph-search',
  'backtracking': 'backtracking',
  'greedy': 'greedy',
  'two-pointers': 'two-pointers',
  'stack': 'stack',
  'monotonic-stack': 'stack',
  'linked-list': 'linked-list',
  'math': 'math',
  'bit-manipulation': 'bit-manipulation',
  'heap-priority-queue': 'heap',
  'heap': 'heap',
  'sliding-window': 'sliding-window',
  'design': 'design',
  'divide-and-conquer': 'divide-and-conquer',
  'sorting': 'sorting',
  'binary-search': 'searching',
  'depth-first-search': 'graph-search',
  'breadth-first-search': 'graph-search',
  'union-find': 'graph-search',
  'trie': 'data-structures',
  'segment-tree': 'data-structures',
  'binary-indexed-tree': 'data-structures',
  'queue': 'data-structures',
  'recursion': 'algorithms',
  'simulation': 'algorithms',
  'enumeration': 'algorithms',
  'prefix-sum': 'array',
  'ordered-set': 'data-structures',
  'number-theory': 'math',
  'combinatorics': 'math',
  'geometry': 'math',
  'game-theory': 'algorithms',
  'interactive': 'algorithms',
  'concurrency': 'algorithms',
  'shell': 'algorithms',
  'database': 'algorithms',
};

// ─── 工具函数 ───────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function graphqlRequest(query: string, variables: any, retries = 3): Promise<any> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.cn/problemset/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        body: JSON.stringify({ query, variables }),
      });

      if (res.status === 429) {
        const wait = (attempt + 1) * 5000;
        console.log(`  ⚠ 限流，等待 ${wait}ms...`);
        await sleep(wait);
        continue;
      }

      const data = await res.json() as any;
      if (data.errors) {
        console.error('  GraphQL error:', data.errors[0]?.message);
        return null;
      }
      return data.data;
    } catch (e: any) {
      if (attempt < retries - 1) {
        await sleep(2000);
        continue;
      }
      console.error(`  ✗ 请求失败: ${e.message}`);
      return null;
    }
  }
  return null;
}

function htmlToMarkdown(html: string): string {
  if (!html) return '';
  let md = nhm.translate(html);
  // 清理多余空行
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function parseTestCases(exampleTestcases: string, funcName: string): any[] {
  if (!exampleTestcases) return [];
  // LeetCode 格式: 每组用例的参数用换行分隔，多组用例之间也用换行分隔
  // 需要知道参数个数来分组 - 从 codeSnippet 推断
  const lines = exampleTestcases.split('\n').filter(l => l.trim() !== '');
  
  // 简单策略：尝试从 defaultCode 推断参数数量
  // 如果无法推断，每行作为独立用例
  return lines.map(line => ({
    input: `${funcName}(${line.trim()})`,
    expected: '',
  }));
}

function parseTestCasesWithParamCount(exampleTestcases: string, paramCount: number, funcName: string): any[] {
  if (!exampleTestcases || paramCount <= 0) return [];
  const lines = exampleTestcases.split('\n').filter(l => l.trim() !== '');
  const cases: any[] = [];
  
  for (let i = 0; i + paramCount <= lines.length; i += paramCount) {
    const params = lines.slice(i, i + paramCount).map(l => l.trim());
    cases.push({
      input: `${funcName}(${params.join(', ')})`,
      expected: '',
    });
  }
  return cases;
}

function extractCode(content: string, lang: string): string | null {
  const regex = new RegExp('```' + lang + '[^\\n]*\\n([\\s\\S]*?)```', 'gi');
  const matches: string[] = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    const code = m[1].trim();
    if (code.length > 20) matches.push(code);
  }
  if (matches.length === 0) return null;
  if (matches.length >= 2) return matches[0] + '\n\n' + matches[1];
  return matches[0];
}

// ─── 阶段 A: 获取题目列表 ───────────────────────────────────────────
async function phaseList() {
  console.log('═══ 阶段 A: 获取 LeetCode 题目列表 ═══\n');

  const LIST_QUERY = `
    query problemsetQuestionList($limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList(limit: $limit, skip: $skip, filters: $filters) {
        total
        hasMore
        questions {
          frontendQuestionId
          title
          titleSlug
          difficulty
          paidOnly
          topicTags { name slug nameTranslated }
        }
      }
    }
  `;

  const allQuestions: any[] = [];
  const BATCH = 200;
  let skip = 0;
  let total = 0;

  while (true) {
    const data = await graphqlRequest(LIST_QUERY, { limit: BATCH, skip, filters: {} });
    if (!data?.problemsetQuestionList) break;

    const { questions, total: t, hasMore } = data.problemsetQuestionList;
    total = t;
    allQuestions.push(...questions);
    console.log(`  获取 ${skip + questions.length}/${total} 题...`);

    if (!hasMore || questions.length === 0) break;
    skip += BATCH;
    await sleep(300);
  }

  // 过滤免费题目
  const freeQuestions = allQuestions.filter(q => !q.paidOnly);
  console.log(`\n总题目: ${allQuestions.length}, 免费: ${freeQuestions.length}`);

  // 排除已存在的
  const existing = await prisma.problem.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map(p => p.slug));
  const newQuestions = freeQuestions.filter(q => !existingSlugs.has(q.titleSlug));
  console.log(`已存在: ${existingSlugs.size}, 待导入: ${newQuestions.length}`);

  // 保存队列
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(newQuestions, null, 2));
  console.log(`\n✓ 队列已保存到 ${QUEUE_FILE}`);

  return newQuestions;
}

// ─── 阶段 B: 获取详情并入库 ─────────────────────────────────────────
async function phaseDetail() {
  console.log('═══ 阶段 B: 获取题目详情并入库 ═══\n');

  if (!fs.existsSync(QUEUE_FILE)) {
    console.log('请先运行 list 阶段生成队列文件');
    return;
  }

  const queue: any[] = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'));
  
  // 加载进度
  let progress: { completed: string[] } = { completed: [] };
  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  const completedSet = new Set(progress.completed);
  const pending = queue.filter(q => !completedSet.has(q.titleSlug));
  console.log(`队列: ${queue.length}, 已完成: ${completedSet.size}, 待处理: ${pending.length}\n`);

  // 预加载分类
  const categories = await prisma.category.findMany();
  const catBySlug = new Map(categories.map(c => [c.slug, c.id]));
  const createdCats = new Map<string, string>();

  async function getCategoryId(tagSlug: string): Promise<string> {
    const mappedSlug = CATEGORY_MAP[tagSlug] || 'algorithms';
    if (catBySlug.has(mappedSlug)) return catBySlug.get(mappedSlug)!;
    if (createdCats.has(mappedSlug)) return createdCats.get(mappedSlug)!;
    
    // 创建新分类
    const cat = await prisma.category.create({
      data: { name: mappedSlug, slug: mappedSlug },
    });
    catBySlug.set(cat.slug, cat.id);
    createdCats.set(mappedSlug, cat.id);
    return cat.id;
  }

  const DETAIL_QUERY = `
    query questionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        difficulty
        content
        translatedTitle
        translatedContent
        topicTags { name slug translatedName }
        hints
        exampleTestcases
        codeSnippets { lang langSlug code }
      }
    }
  `;

  let success = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i++) {
    const q = pending[i];
    const progressStr = `[${completedSet.size + i + 1}/${queue.length}]`;

    const data = await graphqlRequest(DETAIL_QUERY, { titleSlug: q.titleSlug });
    const detail = data?.question;

    if (!detail) {
      console.log(`${progressStr} ✗ ${q.titleSlug} - 获取失败`);
      failed++;
      await sleep(500);
      continue;
    }

    try {
      // 提取信息
      const title = detail.translatedTitle || detail.title;
      const slug = detail.titleSlug;
      const difficulty = (detail.difficulty || 'MEDIUM').toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD';
      const content = detail.translatedContent || detail.content || '';
      const descriptionMd = htmlToMarkdown(content);

      // 分类
      const firstTag = detail.topicTags?.[0]?.slug || 'algorithms';
      const categoryId = await getCategoryId(firstTag);

      // 代码模板
      const jsSnippet = detail.codeSnippets?.find((s: any) => s.langSlug === 'javascript');
      const defaultCode = jsSnippet?.code || '';

      // 从 defaultCode 推断函数名和参数数量
      let funcName = 'solve';
      let paramCount = 1;
      const funcMatch = defaultCode.match(/(?:var|function)\s+(\w+)\s*(?:=\s*function)?\s*\(([^)]*)\)/);
      if (funcMatch) {
        funcName = funcMatch[1];
        paramCount = funcMatch[2].split(',').filter((p: string) => p.trim()).length;
      }

      // 测试用例
      const testCases = parseTestCasesWithParamCount(
        detail.exampleTestcases || '', paramCount, funcName
      );

      // 题解 (先用代码模板作为 JS 题解)
      const solutions: Record<string, string> = {};
      if (jsSnippet?.code) solutions.javascript = jsSnippet.code;
      const javaSnippet = detail.codeSnippets?.find((s: any) => s.langSlug === 'java');
      if (javaSnippet?.code) solutions.java = javaSnippet.code;
      const pySnippet = detail.codeSnippets?.find((s: any) => s.langSlug === 'python3');
      if (pySnippet?.code) solutions.python = pySnippet.code;

      // 入库
      await prisma.problem.create({
        data: {
          title,
          slug,
          difficulty,
          descriptionMd,
          examples: [],
          solutions: solutions as any,
          hints: detail.hints || [],
          testCases: testCases as any,
          defaultCode,
          categoryId,
        },
      });

      success++;
      if (success % 10 === 0 || success <= 5) {
        console.log(`${progressStr} ✓ ${slug} [${difficulty}]`);
      }
    } catch (e: any) {
      if (e.code === 'P2002') {
        // 唯一约束冲突，跳过
        console.log(`${progressStr} ⏭ ${q.titleSlug} (已存在)`);
      } else {
        console.log(`${progressStr} ✗ ${q.titleSlug} - ${e.message}`);
        failed++;
      }
    }

    // 保存进度
    progress.completed.push(q.titleSlug);
    completedSet.add(q.titleSlug);
    if (progress.completed.length % 50 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
    }

    await sleep(500);
  }

  // 最终保存进度
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
  console.log(`\n═══════════════════════════════════════`);
  console.log(`阶段B完成! 成功: ${success}, 失败: ${failed}`);
}

// ─── 阶段 C: 获取题解代码 ───────────────────────────────────────────
async function phaseSolutions() {
  console.log('═══ 阶段 C: 获取题解代码 ═══\n');

  const SOLUTION_QUERY = `
    query questionSolutionArticles($questionSlug: String!, $first: Int, $skip: Int, $orderBy: SolutionArticleOrderBy) {
      questionSolutionArticles(questionSlug: $questionSlug, first: $first, skip: $skip, orderBy: $orderBy) {
        edges { node { title content } }
      }
    }
  `;

  // 找出缺少完整题解的题目（没有 java 或 python 的实际代码）
  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, solutions: true },
  });

  const needSolutions = problems.filter(p => {
    const s = (p.solutions as Record<string, string>) || {};
    // 如果 java/python 只是代码模板（含空函数体），需要获取真实题解
    const javaNeedsUpdate = !s.java || s.java.includes('// Write your code here') || 
      (s.java.includes('{') && s.java.trim().endsWith('};'));
    const pyNeedsUpdate = !s.python || s.python.includes('pass') || s.python.includes('# Write your code');
    return javaNeedsUpdate || pyNeedsUpdate;
  });

  console.log(`需要补充题解: ${needSolutions.length} 道\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < needSolutions.length; i++) {
    const p = needSolutions[i];
    const progressStr = `[${i + 1}/${needSolutions.length}]`;

    const data = await graphqlRequest(SOLUTION_QUERY, {
      questionSlug: p.slug, first: 5, skip: 0, orderBy: 'DEFAULT',
    });

    const edges = data?.questionSolutionArticles?.edges || [];
    let java: string | null = null;
    let python: string | null = null;

    for (const edge of edges) {
      const content = edge.node.content as string;
      if (!content) continue;
      if (!java) java = extractCode(content, 'Java');
      if (!python) python = extractCode(content, 'Python');
      if (java && python) break;
    }

    if (!java && !python) {
      failed++;
      if (failed <= 10) console.log(`${progressStr} ✗ ${p.slug}`);
      await sleep(500);
      continue;
    }

    const existing = (p.solutions as Record<string, string>) || {};
    const updated = { ...existing };
    if (java) updated.java = java;
    if (python) updated.python = python;

    await prisma.problem.update({
      where: { id: p.id },
      data: { solutions: updated as any },
    });

    success++;
    if (success % 20 === 0 || success <= 5) {
      console.log(`${progressStr} ✓ ${p.slug}`);
    }
    await sleep(800);
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`阶段C完成! 成功: ${success}, 失败: ${failed}`);
}

// ─── 主入口 ─────────────────────────────────────────────────────────
async function main() {
  const phase = process.argv[2] || 'all';

  try {
    if (phase === 'list' || phase === 'all') {
      await phaseList();
      if (phase === 'all') console.log('\n');
    }
    if (phase === 'detail' || phase === 'all') {
      await phaseDetail();
      if (phase === 'all') console.log('\n');
    }
    if (phase === 'solutions' || phase === 'all') {
      await phaseSolutions();
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
