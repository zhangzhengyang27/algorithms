import { PrismaClient, Difficulty, ProgressStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 守卫：若库里已有题目数据，说明是已导入/生产状态，跳过样例 seed，
  // 避免污染已有数据（也避免重启容器时反复 upsert 样例数据）。
  const existingProblems = await prisma.problem.count();
  if (existingProblems > 0) {
    console.log(`Database already has ${existingProblems} problems, skipping seed.`);
    return;
  }

  // 新建库会在此创建 role=ADMIN 的账号，默认口令是公开的 README 值，
  // 所以生产环境必须显式提供 SEED_ADMIN_PASSWORD，否则宁可失败也不留下后门。
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error(
      'Refusing to seed in production without SEED_ADMIN_PASSWORD: ' +
        'set a strong value in the environment, or seed a non-production NODE_ENV and rotate the password afterwards.',
    );
  }

  // Create demo user（密码可通过 SEED_DEMO_PASSWORD 环境变量覆盖）
  const demoPassword = process.env.SEED_DEMO_PASSWORD ?? 'demo123';
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash,
      name: 'Demo User',
    },
  });

  console.log('Created user:', user.email);

  // Create admin user (role ADMIN) so RBAC-protected write endpoints are usable
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user: admin@example.com');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'sorting' },
      update: {},
      create: {
        name: '排序算法',
        slug: 'sorting',
        description: '各种排序算法的详解与可视化',
        icon: 'sort',
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'data-structures' },
      update: {},
      create: {
        name: '数据结构',
        slug: 'data-structures',
        description: '常见数据结构详解',
        icon: 'tree',
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'searching' },
      update: {},
      create: {
        name: '搜索算法',
        slug: 'searching',
        description: '搜索与查找算法',
        icon: 'search',
        order: 3,
      },
    }),
  ]);

  console.log('Created categories:', categories.length);

  // 教程内容已完全本地化（前端 src/app/tutorials/*.md 为真源），
  // 不再向数据库 seed 教程数据。

  // Create problems
  await Promise.all([
    prisma.problem.upsert({
      where: { slug: 'two-sum' },
      update: {},
      create: {
        categoryId: categories[2].id,
        title: '两数之和',
        slug: 'two-sum',
        difficulty: Difficulty.EASY,
        descriptionMd: '# 两数之和\n\n给定一个整数数组 nums 和一个整数目标值 target...',
        examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }],
        solutions: { javascript: 'function twoSum(nums, target) { const map = new Map(); ... }' },
        hints: ['使用哈希表存储已遍历的元素'],
      },
    }),
  ]);

  console.log('Created problems');

  // Create progress for demo user
  await prisma.progress.upsert({
    where: { userId_problemId: { userId: user.id, problemId: (await prisma.problem.findFirst())!.id } },
    update: {},
    create: {
      userId: user.id,
      problemId: (await prisma.problem.findFirst())!.id,
      status: ProgressStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  console.log('Created progress');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
