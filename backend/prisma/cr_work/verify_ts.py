# -*- coding: utf-8 -*-
"""用 esbuild 把 SOL_TS[type] 原样转 CJS 后用 node 运行，对比 cr_ref expected。"""
import sys, os, subprocess, tempfile, json, re
sys.path.insert(0, os.path.dirname(__file__))
import cr_ref as R
import cr_solutions as S
import gen_cases as G

NODE = '/Users/xiaoye/.workbuddy/binaries/node/versions/22.22.2/bin/node'
NPX = '/Users/xiaoye/.workbuddy/binaries/node/versions/22.22.2/bin/npx'
draft = json.load(open(os.path.join(os.path.dirname(__file__), '..', 'coderepo-problems.draft.json'), encoding='utf-8'))

r = subprocess.run([NPX, '-y', 'esbuild', '--version'], capture_output=True, text=True, timeout=120)
print("esbuild:", r.stdout.strip() or r.stderr.strip())
esbuild_ok = r.returncode == 0

fails = []
for p in draft:
    slug = p['slug']; t = R.type_of(slug)
    inp = G.generate_input(t, slug)
    exp = R.solve(slug, inp)
    ts = S.SOL_TS[t]
    with tempfile.NamedTemporaryFile('w', suffix='.ts', delete=False, encoding='utf-8') as f:
        f.write(ts); fp = f.name
    cjs = fp[:-3] + '.cjs'
    if not esbuild_ok:
        os.unlink(fp); fails.append(('NO_ESBUILD', slug, '', '')); continue
    rb = subprocess.run([NPX, '-y', 'esbuild', fp, '--format=cjs', '--platform=node', '--outfile='+cjs],
                        capture_output=True, text=True, timeout=120)
    if rb.returncode != 0:
        fails.append(('ESBUILD', slug, rb.stderr[:200], '')); os.unlink(fp); continue
    try:
        rn = subprocess.run([NODE, cjs], input=inp, capture_output=True, text=True, timeout=60)
        got = rn.stdout if rn.returncode == 0 else 'ERR:'+rn.stderr[:300]
    except subprocess.TimeoutExpired:
        got = 'TIMEOUT'
    os.unlink(fp); os.unlink(cjs)
    if got.strip() != exp.strip():
        fails.append(('TS', slug, got[:80], exp[:80]))

print("TS checked:", len(draft)-len([f for f in fails if f[0]=='TS']), "/", len(draft))
for f in fails:
    print("FAIL", f[0], f[1])
    if f[2]: print("   got/err:", f[2])
