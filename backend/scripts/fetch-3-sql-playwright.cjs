/**
 * 针对 3 道「LeetCode 匿名 GraphQL 无题解(edges:0)、但页面可渲染」的 SQL 专项题，
 * 用渲染浏览器(Playwright)从题解详情页提取 SQL 写回 {sql} 兜底，避免空壳。
 */
const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SLUGS = [
  'analyze-subscription-conversion',
  'find-invalid-ip-addresses',
  'find-emotionally-consistent-users',
];

function isSqlCode(t) {
  return /\b(SELECT|FROM|WHERE|GROUP\s+BY|ORDER\s+BY|JOIN|HAVING|INSERT|UPDATE|DELETE|WITH|LIMIT|COUNT|CASE)\b/i.test(t);
}

async function extractSql(page, slug) {
  await page.goto('https://leetcode.cn/problems/' + slug + '/solutions/', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3500);
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/solutions/"]'))
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && h.split('/solutions/')[1] && h.split('/solutions/')[1].length > 0);
  });
  const first = links[0];
  if (!first) return null;
  await page.goto('https://leetcode.cn' + first, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3500);
  const sql = await page.evaluate(() => {
    const blocks = Array.from(document.querySelectorAll('pre, code'));
    const texts = [];
    for (const b of blocks) {
      const t = (b.innerText || b.textContent || '').trim();
      if (t && t.length > 30) texts.push(t);
    }
    const isSql = (t) => /\b(SELECT|FROM|WHERE|GROUP\s+BY|ORDER\s+BY|JOIN|HAVING|INSERT|UPDATE|DELETE|WITH|LIMIT|COUNT|CASE)\b/i.test(t);
    const sqlBlock = texts.find(isSql);
    return sqlBlock || null;
  });
  return sql;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  for (const slug of SLUGS) {
    try {
      const sql = await extractSql(page, slug);
      if (sql) {
        await prisma.problem.update({ where: { slug }, data: { solutions: { sql } } });
        console.log('✓', slug, '| SQL 写回，长度', sql.length);
      } else {
        console.log('✗', slug, '| 页面未提取到 SQL');
      }
    } catch (e) {
      console.log('✗', slug, '| 错误:', e.message);
    }
    await page.waitForTimeout(1500);
  }
  await browser.close();
  await prisma.$disconnect();
  console.log('\n完成。');
}

main().catch((e) => { console.error(e); process.exit(1); });
