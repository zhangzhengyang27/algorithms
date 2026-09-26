import { PrismaClient, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const FRONTEND_PROBLEMS_DIR = path.resolve(
  __dirname,
  '../../frontend/src/app/problems',
);

/**
 * 从 TSX 源码中提取 `const problem = {...}` 的对象字面量并求值。
 * 用括号计数法，遇到字符串/模板字符串则进入字符串模式（跳过其内部），
 * 模板字符串内的 `${...}` 子表达式整体跳过，避免干扰顶层对象的括号平衡。
 */
function extractProblemObject(src: string): Record<string, any> | null {
  const marker = 'const problem =';
  const idx = src.indexOf(marker);
  if (idx === -1) return null;

  const start = src.indexOf('{', idx);
  if (start === -1) return null;

  let depth = 0;
  let inStr: string | null = null;
  let escaped = false;
  let i = start;

  for (; i < src.length; i++) {
    const ch = src[i];

    if (inStr) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      // 模板字符串内的 ${...} 子表达式整体跳过
      if (inStr === '`' && ch === '$' && src[i + 1] === '{') {
        let edepth = 1;
        i += 2;
        while (i < src.length && edepth > 0) {
          const c = src[i];
          if (c === '{') edepth++;
          else if (c === '}') edepth--;
          i++;
        }
        i--; // for 循环会再 +1
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        const block = src.slice(start, i + 1);
        try {
          return new Function(`return ${block}`)();
        } catch (e) {
          console.error('求值 problem 对象失败:', (e as Error).message);
          return null;
        }
      }
    }
  }
  return null;
}

/** 归一化 solutions：多语言对象原样保留；单语言字符串包成 { javascript } */
function normalizeSolutions(obj: Record<string, any>): Record<string, string> {
  if (obj.solutions && typeof obj.solutions === 'object') return obj.solutions;
  if (typeof obj.solution === 'string') return { javascript: obj.solution };
  return {};
}

/** 从已改为取数版的页面提取 DEFAULT_CODE 模板字符串（这些页面已无 const problem） */
function extractDefaultCode(src: string): string | null {
  const m = src.indexOf('const DEFAULT_CODE =');
  if (m === -1) return null;
  const start = src.indexOf('`', m);
  if (start === -1) return null;
  const end = src.indexOf('`', start + 1);
  if (end === -1) return null;
  return src.slice(start + 1, end);
}

async function main() {
  console.log('从前端题解页提取内容并填充 Problem 表...');

  // name -> id 映射（复用已建分类，缺失则补建）
  const cats = await prisma.category.findMany();
  const catIdByName: Record<string, string> = {};
  for (const c of cats) catIdByName[c.name] = c.id;

  const dirs = fs
    .readdirSync(FRONTEND_PROBLEMS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let updated = 0;
  let skipped = 0;

  for (const slug of dirs) {
    const file = path.join(FRONTEND_PROBLEMS_DIR, slug, 'page.tsx');
    if (!fs.existsSync(file)) {
      console.warn(`跳过 ${slug}：找不到 page.tsx`);
      skipped++;
      continue;
    }
    const src = fs.readFileSync(file, 'utf-8');
    const obj = extractProblemObject(src);
    if (!obj) {
      // 已改为取数版的页面：仅补 defaultCode
      const dc = extractDefaultCode(src);
      if (dc !== null) {
        await prisma.problem.update({
          where: { slug },
          data: { defaultCode: dc },
        });
        updated++;
        console.log(`  ✓ ${slug.padEnd(38)} (仅 defaultCode)`);
        continue;
      }
      console.warn(`跳过 ${slug}：未能提取 problem 对象`);
      skipped++;
      continue;
    }

    const categoryName: string = obj.category;
    let categoryId = catIdByName[categoryName];
    if (!categoryId) {
      const created = await prisma.category.create({
        data: {
          slug: categoryName,
          name: categoryName,
          description: `${categoryName}相关算法题目`,
          icon: 'code',
          order: 100 + Object.keys(catIdByName).length,
        },
      });
      categoryId = created.id;
      catIdByName[categoryName] = categoryId;
    }

    const difficulty =
      (obj.difficulty as Difficulty) in Difficulty
        ? (obj.difficulty as Difficulty)
        : Difficulty.MEDIUM;

    const data = {
      categoryId,
      title: obj.title ?? slug,
      difficulty,
      descriptionMd: obj.description ?? '',
      examples: [],
      solutions: normalizeSolutions(obj),
      hints: obj.hints ?? [],
      testCases: obj.testCases ?? [],
      defaultCode: obj.defaultCode ?? '',
    };

    await prisma.problem.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
    updated++;
    console.log(
      `  ✓ ${slug.padEnd(38)} 难度=${difficulty.padEnd(7)} 分类=${categoryName} 解法=${Object.keys(data.solutions).length}种`,
    );
  }

  console.log(`\n完成：更新 ${updated} 题，跳过 ${skipped} 题。`);
  const total = await prisma.problem.count();
  console.log(`Problem 表现共 ${total} 条记录。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
