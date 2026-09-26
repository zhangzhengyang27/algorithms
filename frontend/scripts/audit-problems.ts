/**
 * 题目数据质量审计脚本
 * 排查与 one-away-lcci 同类的问题：
 *  A. 测试用例参数个数 ≠ 题解主函数参数个数（参数错位，必然出错）
 *  B. 测试用例函数名 ≠ 题解主函数名（参考项）
 *  C. 测试用例中的特征取值在题目描述里完全找不到（疑似用例来自别的题，如 one-away 的 horse/ros）
 *
 * 用法: npx tsx scripts/audit-problems.ts [show]
 *   show 参数输出全部明细，否则只输出汇总 + 前若干条。
 */
import { parse } from 'acorn';
import tsBlankSpace from 'ts-blank-space';
import { parseTestInput } from '../src/lib/solution-tracer';

const API = 'http://localhost:40001/problems?take=10000';
const SHOW_ALL = process.argv.includes('show');

interface Problem {
  slug: string;
  title: string;
  descriptionMd: string;
  solutions: Record<string, string>;
  testCases: { input: string; expected: string }[];
}

/** 与 traceSolution 一致的主函数检测：收集所有候选，优先按用例函数名 fnName 匹配，返回 { name, arity } */
function detectJsMain(code: string, fnName?: string): { name: string; arity: number } | null {
  let executable = code;
  try { parse(code, { ecmaVersion: 2022, sourceType: 'script' }); }
  catch { try { executable = tsBlankSpace(code); } catch { return null; } }

  let ast: any;
  try { ast = parse(executable, { ecmaVersion: 2022, sourceType: 'script' }); }
  catch { return null; }

  const candidates: { name: string; arity: number }[] = [];
  for (const stmt of ast.body) {
    if (stmt.type === 'FunctionDeclaration' && stmt.id) {
      candidates.push({ name: stmt.id.name, arity: stmt.params.length });
    } else if (stmt.type === 'VariableDeclaration') {
      const decl = stmt.declarations[0];
      if (decl?.init && (decl.init.type === 'FunctionExpression' || decl.init.type === 'ArrowFunctionExpression')) {
        candidates.push({ name: decl.id.name, arity: decl.init.params.length });
      }
    } else if (stmt.type === 'ClassDeclaration' && stmt.body?.body?.length > 0) {
      for (const m of stmt.body.body) {
        if (m.type === 'MethodDefinition' && m.kind === 'method' && m.key?.name !== 'constructor') {
          candidates.push({ name: m.key.name, arity: m.value.params.length });
        }
      }
    }
  }
  const matched = (fnName ? candidates.find(c => c.name === fnName) : undefined) ?? candidates[0];
  return matched ?? null;
}

/** 从测试用例参数里提取"特征取值"：长度≥2的字符串、绝对值≥10的数字 */
function distinctiveTokens(args: any[]): string[] {
  const tokens: string[] = [];
  const walk = (v: any) => {
    if (typeof v === 'string') { if (v.length >= 2) tokens.push(v); }
    else if (typeof v === 'number') { if (Math.abs(v) >= 10) tokens.push(String(v)); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  args.forEach(walk);
  return tokens;
}

async function main() {
  const res = await fetch(API);
  const problems: Problem[] = await res.json();
  console.log(`共拉取 ${problems.length} 道题\n`);

  const arityMismatch: string[] = [];      // A 类：参数个数不匹配
  const fnNameMismatch: string[] = [];      // B 类：函数名不一致
  const wrongProblem: string[] = [];        // C 类：疑似用例来自别的题
  const noTestCase: string[] = [];          // 无可解析用例
  const noJsSolution: string[] = [];        // 无 JS 题解（无法审计 A/B）

  for (const p of problems) {
    const sols = p.solutions ?? {};
    const js = sols.javascript ?? sols.js ?? '';

    // 找第一个可解析的测试用例
    let parsed: { fnName: string; args: any[] } | null = null;
    for (const tc of p.testCases ?? []) {
      try { parsed = parseTestInput(tc.input); break; } catch { /* skip */ }
    }
    if (!parsed) { noTestCase.push(p.slug); continue; }

    // ── C 类：特征取值是否出现在描述里 ──
    const allTokens: string[] = [];
    for (const tc of p.testCases ?? []) {
      try { allTokens.push(...distinctiveTokens(parseTestInput(tc.input).args)); } catch { /* skip */ }
    }
    if (allTokens.length > 0) {
      const desc = p.descriptionMd ?? '';
      const hit = allTokens.some(t => desc.includes(t));
      if (!hit) wrongProblem.push(`${p.slug}  [用例特征值: ${[...new Set(allTokens)].slice(0, 4).join(', ')}]`);
    }

    // ── A / B 类：需要 JS 题解 ──
    if (!js) { noJsSolution.push(p.slug); continue; }
    const main = detectJsMain(js, parsed.fnName);
    if (!main) continue; // 解析失败，跳过

    if (parsed.args.length !== main.arity) {
      arityMismatch.push(`${p.slug}  [用例 ${parsed.fnName} 传 ${parsed.args.length} 参, 题解 ${main.name} 需 ${main.arity} 参]`);
    }
    if (parsed.fnName !== main.name) {
      fnNameMismatch.push(`${p.slug}  [用例调用 ${parsed.fnName}, 题解主函数 ${main.name}]`);
    }
  }

  // ─── 输出 ───
  console.log(`═══ A 类：参数个数不匹配（必然出错）${arityMismatch.length} 道 ═══`);
  (SHOW_ALL ? arityMismatch : arityMismatch.slice(0, 40)).forEach(s => console.log(`  ${s}`));
  if (!SHOW_ALL && arityMismatch.length > 40) console.log(`  … 还有 ${arityMismatch.length - 40} 道`);

  console.log(`\n═══ C 类：疑似用例来自别的题（特征值不见于描述）${wrongProblem.length} 道 ═══`);
  (SHOW_ALL ? wrongProblem : wrongProblem.slice(0, 40)).forEach(s => console.log(`  ${s}`));
  if (!SHOW_ALL && wrongProblem.length > 40) console.log(`  … 还有 ${wrongProblem.length - 40} 道`);

  console.log(`\n═══ B 类：函数名不一致（参考）${fnNameMismatch.length} 道 ═══`);
  (SHOW_ALL ? fnNameMismatch : fnNameMismatch.slice(0, 20)).forEach(s => console.log(`  ${s}`));
  if (!SHOW_ALL && fnNameMismatch.length > 20) console.log(`  … 还有 ${fnNameMismatch.length - 20} 道`);

  console.log(`\n═══ 其他 ═══`);
  console.log(`  无可解析测试用例: ${noTestCase.length} 道`);
  console.log(`  无 JS 题解（未审计 A/B）: ${noJsSolution.length} 道`);
}

main().catch(e => { console.error(e); process.exit(1); });
