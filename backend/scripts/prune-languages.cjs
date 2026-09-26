const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const KEEP = ['javascript', 'java', 'python'];

async function main() {
  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, solutions: true },
  });

  let cleaned = 0;
  let emptied = 0;
  const emptySlugs = [];

  for (const p of problems) {
    const sol = p.solutions;
    if (!sol || typeof sol !== 'object') continue;
    const keys = Object.keys(sol);
    const keepKeys = keys.filter((k) => KEEP.includes(k));
    if (keepKeys.length === keys.length) continue; // 无需清理

    const newSol = {};
    for (const k of keepKeys) newSol[k] = sol[k];

    await prisma.problem.update({
      where: { id: p.id },
      data: { solutions: newSol },
    });
    cleaned++;
    if (keepKeys.length === 0) {
      emptied++;
      emptySlugs.push(p.slug);
    }
  }

  console.log('清理题目数:', cleaned);
  console.log('变空壳题目数:', emptied);
  if (emptySlugs.length) {
    console.log('空壳 slug 列表:');
    emptySlugs.forEach((s) => console.log('  -', s));
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
