/**
 * 三语言题解追踪器联合批量测试
 * 从后端拉取题目，对每道题的 javascript/java/python 题解分别执行追踪，统计覆盖率。
 */
import { traceSolution, parseTestInput } from '../src/lib/solution-tracer';
import { tracePythonSolution } from '../src/lib/python-tracer';
import { traceJavaSolution } from '../src/lib/java-tracer';

interface Problem {
  slug: string;
  title: string;
  solutions: Record<string, string>;
  testCases: { input: string; expected: string }[];
}

const API = 'http://localhost:40001/problems?take=100';

async function main() {
  const res = await fetch(API);
  const problems: Problem[] = await res.json();
  console.log(`共拉取 ${problems.length} 道题\n`);

  const langs: { key: string; label: string }[] = [
    { key: 'javascript', label: 'JavaScript' },
    { key: 'java', label: 'Java' },
    { key: 'python', label: 'Python' },
  ];

  for (const { key, label } of langs) {
    let total = 0, ok = 0;
    const fails: string[] = [];
    for (const p of problems) {
      const sols = p.solutions ?? {};
      let code = sols[key];
      if (key === 'javascript' && !code && sols['js']) code = sols['js'];
      if (!code) continue;
      total++;
      // 找第一个可解析的测试用例
      let parsed: ReturnType<typeof parseTestInput> | null = null;
      for (const tc of p.testCases ?? []) {
        try { parsed = parseTestInput(tc.input); break; } catch { /* skip */ }
      }
      if (!parsed) { fails.push(`${p.slug} (无用例)`); continue; }
      try {
        let r;
        if (key === 'java') r = traceJavaSolution(code, parsed.fnName, parsed.args);
        else if (key === 'python') r = tracePythonSolution(code, parsed.args, parsed.fnName);
        else r = traceSolution(code, parsed.args, parsed.fnName);
        if (r && r.steps && r.steps.length > 0) ok++;
        else fails.push(`${p.slug} (空步骤)`);
      } catch (e) {
        fails.push(`${p.slug} (${e instanceof Error ? e.message.slice(0, 60) : e})`);
      }
    }
    console.log(`【${label}】 ${ok}/${total} (${total ? Math.round(ok / total * 100) : 0}%)`);
    if (fails.length) {
      // 按错误类型聚合
      const byType = new Map<string, number>();
      for (const f of fails) {
        const m = f.match(/\((.+)\)$/);
        const key = m ? m[1].slice(0, 50) : '其他';
        byType.set(key, (byType.get(key) ?? 0) + 1);
      }
      console.log(`  失败 ${fails.length} 个，按类型:`);
      [...byType.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`   ${v}× ${k}`));
      if (process.env.SHOW_FAILS) fails.forEach(f => console.log(`   - ${f}`));
    }
    console.log('');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
