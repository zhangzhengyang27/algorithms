import { EXTRA_PROBLEMS, HELPERS, type ExtraProblem } from './problems-extra.data';

let problems = 0;
let bad = 0;
for (const p of EXTRA_PROBLEMS as ExtraProblem[]) {
  problems++;
  const code = (p.helpers ? HELPERS : '') + p.solution;
  let fn: (...a: any[]) => any;
  try {
    fn = new Function(`${code}\n return solve;`)() as any;
  } catch (e) {
    console.log(`COMPILE FAIL ${p.slug}: ${(e as Error).message}`);
    bad++;
    continue;
  }
  const arity = fn.length;
  if (p.cases.length === 0) {
    console.log(`NO CASES ${p.slug}`);
    bad++;
  }
  p.cases.forEach((args, i) => {
    if (!Array.isArray(args)) {
      console.log(`CASE NOT ARRAY ${p.slug} #${i}`);
      bad++;
      return;
    }
    if (args.length !== arity) {
      console.log(`ARITY MISMATCH ${p.slug} #${i}: expected ${arity}, got ${args.length} -> ${JSON.stringify(args).slice(0, 80)}`);
      bad++;
      return;
    }
    try {
      fn(...(args as any[]));
    } catch (e) {
      console.log(`RUN FAIL ${p.slug} #${i}: ${(e as Error).message}`);
      bad++;
    }
  });
}
console.log(`\nChecked ${problems} problems, ${bad} problems/checks with issues.`);
