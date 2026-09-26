const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TARGETS = [
  'analyze-subscription-conversion',
  'find-books-with-polarized-opinions',
  'find-invalid-ip-addresses',
  'percentage-of-users-attended-a-contest',
];

async function fetchSolution(page, slug) {
  const listUrl = `https://leetcode.cn/problems/${slug}/solutions/`;
  console.log(`  打开列表页: ${listUrl}`);
  await page.goto(listUrl, { waitUntil: 'load', timeout: 60000 });
  await sleep(2500);

  const firstSolutionHref = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/solutions/"]'));
    for (const a of links) {
      const href = a.getAttribute('href');
      if (href && href.includes('/solutions/') && href.split('/solutions/')[1] && href.split('/solutions/')[1].length > 0) {
        return href;
      }
    }
    return null;
  });

  if (!firstSolutionHref) {
    console.log(`  ✗ ${slug} 未找到题解链接`);
    return null;
  }

  const detailUrl = firstSolutionHref.startsWith('http') ? firstSolutionHref : `https://leetcode.cn${firstSolutionHref}`;
  console.log(`  打开详情页: ${detailUrl}`);
  await page.goto(detailUrl, { waitUntil: 'load', timeout: 60000 });
  await sleep(2500);

  const code = await page.evaluate(() => {
    const codeBlocks = Array.from(document.querySelectorAll('pre, code'));
    const texts = [];
    for (const block of codeBlocks) {
      const text = block.innerText || block.textContent;
      if (text && text.length > 20) texts.push(text);
    }
    const sql = texts.find((t) => /\b(SELECT|FROM|WHERE|GROUP\s+BY|ORDER\s+BY|JOIN|HAVING)\b/i.test(t));
    if (sql) return sql;
    return texts.sort((a, b) => b.length - a.length)[0] || null;
  });

  if (!code) {
    console.log(`  ✗ ${slug} 未找到代码块`);
    return null;
  }

  return { sql: code };
}

async function main() {
  const problems = await prisma.problem.findMany({
    where: { slug: { in: TARGETS } },
    select: { id: true, slug: true, title: true },
  });

  console.log(`待重试 SQL 题数: ${problems.length}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  let success = 0;
  let failed = 0;

  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    console.log(`\n[${i + 1}/${problems.length}] ${p.slug}`);
    try {
      const result = await fetchSolution(page, p.slug);
      if (!result) {
        failed++;
        continue;
      }
      await prisma.problem.update({
        where: { id: p.id },
        data: { solutions: { sql: result.sql } },
      });
      console.log(`  ✓ ${p.slug} 已保存 SQL (${result.sql.length} 字符)`);
      success++;
    } catch (e) {
      console.log(`  ✗ ${p.slug} 异常: ${e.message}`);
      failed++;
    }
    await sleep(3000);
  }

  await browser.close();
  await prisma.$disconnect();

  console.log(`\n═════════════════════`);
  console.log(`重试完成! 成功: ${success}, 失败: ${failed}, 总计: ${problems.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
