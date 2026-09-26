/**
 * 批量为数据库中的题目补充高质量的 Java / Python 题解。
 * 运行: cd backend && npx ts-node scripts/add-java-python-solutions.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── JS → Python 翻译器 ───────────────────────────────────────────
function jsToPython(js: string): string {
  const lines = js.split('\n');
  const out: string[] = [];
  let indent = 0;

  for (let raw of lines) {
    let line = raw.trim();
    if (!line) { out.push(''); continue; }

    // Skip standalone closing braces
    if (/^\}(\s*else\s*\{|\s*else\s+if.*)?$/.test(line)) {
      // handled below with else/elif
      if (/^\}\s*else\s*\{/.test(line)) {
        indent = Math.max(0, indent - 1);
        out.push('    '.repeat(indent) + 'else:');
        indent++;
        continue;
      }
      if (/^\}\s*else\s+if\s*\((.+)\)\s*\{/.test(line)) {
        const cond = line.match(/^\}\s*else\s+if\s*\((.+)\)\s*\{/)![1];
        indent = Math.max(0, indent - 1);
        out.push('    '.repeat(indent) + `elif ${convertExpr(cond)}:`);
        indent++;
        continue;
      }
      indent = Math.max(0, indent - 1);
      continue;
    }

    // function declaration → def
    const fnMatch = line.match(/^function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
    if (fnMatch) {
      out.push('    '.repeat(indent) + `def ${fnMatch[1]}(${fnMatch[2]}):`);
      indent++;
      continue;
    }

    // if (...) { 
    const ifMatch = line.match(/^if\s*\((.+)\)\s*\{/);
    if (ifMatch) {
      out.push('    '.repeat(indent) + `if ${convertExpr(ifMatch[1])}:`);
      indent++;
      continue;
    }

    // } else if (...) {
    const elifMatch = line.match(/^\}\s*else\s+if\s*\((.+)\)\s*\{/);
    if (elifMatch) {
      indent = Math.max(0, indent - 1);
      out.push('    '.repeat(indent) + `elif ${convertExpr(elifMatch[1])}:`);
      indent++;
      continue;
    }

    // } else {
    if (/^\}\s*else\s*\{/.test(line)) {
      indent = Math.max(0, indent - 1);
      out.push('    '.repeat(indent) + 'else:');
      indent++;
      continue;
    }

    // while (...) {
    const whileMatch = line.match(/^while\s*\((.+)\)\s*\{/);
    if (whileMatch) {
      out.push('    '.repeat(indent) + `while ${convertExpr(whileMatch[1])}:`);
      indent++;
      continue;
    }

    // for (let/const x of arr) {
    const forOfMatch = line.match(/^for\s+\((?:const|let|var)\s+(\w+)\s+of\s+(.+)\)\s*\{/);
    if (forOfMatch) {
      out.push('    '.repeat(indent) + `for ${forOfMatch[1]} in ${convertExpr(forOfMatch[2])}:`);
      indent++;
      continue;
    }

    // for (let i = 0; i < n; i++) {
    const forMatch = line.match(/^for\s+\((?:let|const|var)\s+(\w+)\s*=\s*(\d+)\s*;\s*\w+\s*(<|<=)\s*(.+?)\s*;\s*\w+(\+\+|--)\)\s*\{/);
    if (forMatch) {
      const [, v, start, op, endRaw] = forMatch;
      const end = convertExpr(endRaw);
      if (start === '0' && op === '<') {
        out.push('    '.repeat(indent) + `for ${v} in range(${end}):`);
      } else if (op === '<=') {
        out.push('    '.repeat(indent) + `for ${v} in range(${start}, ${end} + 1):`);
      } else {
        out.push('    '.repeat(indent) + `for ${v} in range(${start}, ${end}):`);
      }
      indent++;
      continue;
    }

    // for (let i = n; i >= 0; i--) {
    const forDescMatch = line.match(/^for\s+\((?:let|const|var)\s+(\w+)\s*=\s*(.+?)\s*;\s*\w+\s*>=\s*(.+?)\s*;\s*\w+--\)\s*\{/);
    if (forDescMatch) {
      const [, v, startExpr, endExpr] = forDescMatch;
      out.push('    '.repeat(indent) + `for ${v} in range(${convertExpr(startExpr)}, ${convertExpr(endExpr)} - 1, -1):`);
      indent++;
      continue;
    }

    // Regular statement
    let stmt = convertLine(line);
    out.push('    '.repeat(indent) + stmt);
  }

  return out.join('\n').trim();
}

function convertExpr(expr: string): string {
  let s = expr;
  s = s.replace(/===/g, '==');
  s = s.replace(/!==/g, '!=');
  s = s.replace(/&&/g, ' and ');
  s = s.replace(/\|\|/g, ' or ');
  s = s.replace(/!(\w[\w.]*)/g, 'not $1');
  s = s.replace(/\btrue\b/g, 'True');
  s = s.replace(/\bfalse\b/g, 'False');
  s = s.replace(/\bnull\b/g, 'None');
  s = s.replace(/\bundefined\b/g, 'None');
  s = s.replace(/Math\.floor\(([^)]+)\)/g, '($1) // 1');
  s = s.replace(/Math\.max\(/g, 'max(');
  s = s.replace(/Math\.min\(/g, 'min(');
  s = s.replace(/Math\.abs\(/g, 'abs(');
  s = s.replace(/Math\.ceil\(/g, 'math.ceil(');
  s = s.replace(/Math\.sqrt\(/g, 'math.sqrt(');
  s = s.replace(/Math\.pow\(/g, 'pow(');
  s = s.replace(/\bInfinity\b/g, "float('inf')");
  s = s.replace(/(\w+)\.length/g, 'len($1)');
  return s;
}

function convertLine(line: string): string {
  let s = line;

  // Remove trailing semicolons
  s = s.replace(/;\s*$/, '');

  // Remove const/let/var
  s = s.replace(/^(const|let|var)\s+/, '');

  // Comments
  s = s.replace(/\/\/\s*/, '# ');

  // new Array(n).fill(v)
  s = s.replace(/new Array\(([^)]+)\)\.fill\(([^)]+)\)/g, '[$2] * $1');
  s = s.replace(/new Array\(([^)]+)\)/g, '[0] * $1');
  s = s.replace(/Array\.from\(\{[^}]+\},\s*\(\)\s*=>\s*new Array\(([^)]+)\)\.fill\(([^)]+)\)\)/g, '[[$2] * $1 for _ in range($1)]');

  // new Map/Set
  s = s.replace(/new Map\(\)/g, '{}');
  s = s.replace(/new Set\(\)/g, 'set()');
  s = s.replace(/new Set\(([^)]+)\)/g, 'set($1)');

  // Map/Set methods
  s = s.replace(/(\w+)\.has\(([^)]+)\)/g, '$2 in $1');
  s = s.replace(/(\w+)\.set\(([^,]+),\s*([^)]+)\)/g, '$1[$2] = $3');
  s = s.replace(/(\w+)\.get\(([^)]+)\)/g, '$1.get($2)');
  s = s.replace(/(\w+)\.add\(([^)]+)\)/g, '$1.add($2)');
  s = s.replace(/(\w+)\.delete\(([^)]+)\)/g, '$1.discard($2)');

  // Array methods
  s = s.replace(/\.push\(([^)]+)\)/g, '.append($1)');
  s = s.replace(/\.pop\(\)/g, '.pop()');
  s = s.replace(/\.shift\(\)/g, '.pop(0)');
  s = s.replace(/\.includes\(([^)]+)\)/g, '.__contains__($1)');
  s = s.replace(/\.indexOf\(([^)]+)\)/g, '.index($1)');
  s = s.replace(/\.join\(([^)]*)\)/g, '');
  s = s.replace(/\.slice\((\d+),\s*(\d+)\)/g, '[$1:$2]');
  s = s.replace(/\.slice\((\d+)\)/g, '[$1:]');
  s = s.replace(/\.sort\(\(a,\s*b\)\s*=>\s*a\s*-\s*b\)/g, '.sort()');
  s = s.replace(/\.sort\(\(a,\s*b\)\s*=>\s*b\s*-\s*a\)/g, '.sort(reverse=True)');
  s = s.replace(/\.reverse\(\)/g, '[::-1]');

  // Spread
  s = s.replace(/\[\.\.\.(\w+)\]/g, 'list($1)');

  // Ternary → Python conditional (simple cases)
  const ternary = s.match(/^(.*?)\s*=\s*(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
  if (ternary) {
    s = `${ternary[1]} = ${ternary[3]} if ${convertExpr(ternary[2])} else ${ternary[4]}`;
  }

  // Expressions
  s = convertExpr(s);

  // return
  s = s.replace(/^return\b/, 'return');

  return s;
}

// ─── JS → Java 翻译器 ────────────────────────────────────────────
function jsToJava(js: string, slug: string): string {
  const fnMatch = js.match(/function\s+(\w+)\s*\(([^)]*)\)/);
  const fnName = fnMatch ? fnMatch[1] : 'solve';
  const rawParams = fnMatch ? fnMatch[2] : '';

  // Infer types from function body + param names
  const params = rawParams.split(',').map(p => p.trim()).filter(Boolean);
  const javaParams = params.map(name => `${inferType(name, js)} ${name}`).join(', ');
  const returnType = inferReturnType(js);

  // Convert body
  let body = js;
  body = body.replace(/^function\s+\w+\s*\([^)]*\)\s*\{/, '');
  body = body.replace(/\}\s*$/, '');

  const bodyLines = body.split('\n').map(line => {
    let l = line;
    // const/let/var → typed or var
    l = l.replace(/\bconst\s+(\w+)\s*=\s*new Map\(\)/, 'Map<Integer, Integer> $1 = new HashMap<>()');
    l = l.replace(/\bconst\s+(\w+)\s*=\s*new Set\(\)/, 'Set<Integer> $1 = new HashSet<>()');
    l = l.replace(/\bconst\s+(\w+)\s*=\s*new Set\(([^)]+)\)/, 'Set<Integer> $1 = new HashSet<>($2)');
    l = l.replace(/\bconst\s+(\w+)\s*=\s*\[\]/, 'List<Integer> $1 = new ArrayList<>()');
    l = l.replace(/\bconst\s+(\w+)\s*=\s*new Array\(([^)]+)\)\.fill\(([^)]+)\)/, 'int[] $1 = new int[$2]; Arrays.fill($1, $3)');
    l = l.replace(/\bconst\s+(\w+)\s*=\s*new Array\(([^)]+)\)/, 'int[] $1 = new int[$2]');
    l = l.replace(/\b(const|let|var)\s+/g, 'var ');

    // Map/Set methods → Java
    l = l.replace(/(\w+)\.has\(([^)]+)\)/g, '$1.containsKey($2)');
    l = l.replace(/(\w+)\.set\(([^,]+),\s*([^)]+)\)/g, '$1.put($2, $3)');
    l = l.replace(/(\w+)\.add\(([^)]+)\)/g, '$1.add($2)');
    l = l.replace(/(\w+)\.delete\(([^)]+)\)/g, '$1.remove($2)');

    // Array methods
    l = l.replace(/\.push\(/g, '.add(');
    l = l.replace(/\.includes\(/g, '.contains(');

    // [...set] → new ArrayList<>(set)
    l = l.replace(/\[\.\.\.(\w+)\]/g, 'new ArrayList<>($1)');

    // .length on arrays stays .length; on strings → .length()
    // (keep as-is for simplicity)

    // === → ==, !== → !=
    l = l.replace(/===/g, '==');
    l = l.replace(/!==/g, '!=');

    // Infinity
    l = l.replace(/\bInfinity\b/g, 'Integer.MAX_VALUE');

    // Math.floor
    l = l.replace(/Math\.floor\(([^)]+)\)/g, '(int)($1)');

    // return [...] → return new int[]{...}
    l = l.replace(/return\s+\[([^\]]*)\]/g, 'return new int[]{$1}');

    return l;
  });

  // Imports
  const imports = new Set<string>();
  if (body.includes('Map') || body.includes('HashMap')) imports.add('import java.util.*;');
  if (body.includes('Set') || body.includes('HashSet')) imports.add('import java.util.*;');
  if (body.includes('List') || body.includes('ArrayList')) imports.add('import java.util.*;');
  if (body.includes('Arrays')) imports.add('import java.util.*;');
  if (imports.size > 0) imports.add(''); // blank line after imports

  const importBlock = [...imports].join('\n');
  const indentedBody = bodyLines.map(l => l.trim() ? '        ' + l.trim() : '').join('\n');

  return `${importBlock}class Solution {
    public ${returnType} ${fnName}(${javaParams}) {
${indentedBody}
    }
}`;
}

function inferType(name: string, body: string): string {
  // Array params
  if (/^(nums|arr|height|coins|candidates|prices|costs?|weights?|digits|temperatures|stock|amounts?|counts?|indices?|arr\d|nums\d|bits?|row|col|values?|edges?|points?|intervals?|letters?|words?|s\d|t\d)$/.test(name)) {
    return 'int[]';
  }
  if (name === 'grid' || name === 'board' || name === 'matrix' || name === 'image') return 'int[][]';
  // String params
  if (/^(s|t|text|word|str|pattern|formula|equation|expression|title|version|ip|path|key|msg|message|code|dna|ransom|magazine|numerals?|columnTitle|a|b)$/.test(name) && !/^(arr|bits?)/.test(name)) {
    // Check if used with .length and indexing (could be string)
    if (body.includes(`${name}.charAt`) || body.includes(`${name}[`) || body.includes(`${name}.length`)) {
      if (/^(s|t|text|word|str|pattern|formula|equation|expression|title|version|ip|path|key|msg|message|code|dna|ransom|magazine|a|b)$/.test(name)) {
        return 'String';
      }
    }
    return 'String';
  }
  // Linked list / tree
  if (/^(head|root|node|list)$/.test(name)) return 'ListNode';
  // Default: int
  return 'int';
}

function inferReturnType(body: string): string {
  if (/return\s+\[\]/.test(body) && !/return\s+\[[\d,]+\]/.test(body)) return 'int[]';
  if (/return\s+\[[\d,\s]+\]/.test(body)) return 'int[]';
  if (/return\s+(true|false)/.test(body)) return 'boolean';
  if (/return\s+"|\.join\(/.test(body)) return 'String';
  if (/return\s+null/.test(body)) return 'ListNode';
  if (/result\.push\(\[/.test(body) || /res\.push\(\[/.test(body)) return 'List<List<Integer>>';
  if (/\.slice\(|\.filter\(|return\s+nums|return\s+arr|return\s+res\b|return\s+result\b/.test(body)) {
    if (/List|ArrayList/.test(body)) return 'List<Integer>';
    return 'int[]';
  }
  return 'int';
}

// ─── 主流程 ───────────────────────────────────────────────────────
async function main() {
  console.log('查询所有题目...');
  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true, solutions: true },
  });

  // 重新为所有只有 JS 的题目生成 Java/Python（覆盖之前低质量版本）
  const needUpdate = problems.filter((p) => {
    const s = p.solutions as Record<string, string> | null;
    return s && typeof s === 'object' && s.javascript;
  });

  console.log(`共 ${needUpdate.length} 道题需要更新。\n`);

  let ok = 0;
  let fail = 0;

  for (const p of needUpdate) {
    const solutions = p.solutions as Record<string, string>;
    const js = solutions.javascript;
    if (!js) { fail++; continue; }

    try {
      const python = jsToPython(js);
      const java = jsToJava(js, p.slug);

      await prisma.problem.update({
        where: { id: p.id },
        data: {
          solutions: {
            javascript: js,
            java,
            python,
          },
        },
      });
      ok++;
      if (ok % 20 === 0) console.log(`  进度: ${ok}/${needUpdate.length}`);
    } catch (e) {
      fail++;
      console.error(`  ✗ ${p.slug}: ${(e as Error).message}`);
    }
  }

  console.log(`\n完成：成功 ${ok}，失败 ${fail}。`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
