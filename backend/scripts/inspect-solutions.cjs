const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const slugs = process.argv.slice(2);

async function main() {
  for (const slug of slugs) {
    const p = await prisma.problem.findUnique({
      where: { slug },
      select: { slug: true, title: true, solutions: true }
    });
    if (!p) {
      console.log(`✗ ${slug} 不存在`);
      continue;
    }
    console.log(`=== ${slug} | ${p.title} ===`);
    console.log(JSON.stringify(p.solutions, null, 2));
    console.log();
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
