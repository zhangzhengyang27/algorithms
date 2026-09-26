# -*- coding: utf-8 -*-
"""验证 + 重算：
1) 用 cr_ref 对 37 题每个 test case 复算 expected（判题真值）。
2) 用子进程跑 SOL_PY[type]，确认提供的 Python 解 == cr_ref expected（全 test case）。
3) 把复算后的 (slug, testCases) 落盘到 recomputed.json 供生成 final 用。
"""
import sys, os, json, subprocess, tempfile
sys.path.insert(0, os.path.dirname(__file__))
import cr_ref as R
import cr_solutions as S

PY = '/Users/xiaoye/.workbuddy/binaries/python/versions/3.13.12/bin/python3'
DRAFT = os.path.join(os.path.dirname(__file__), '..', 'coderepo-problems.draft.json')
data = json.load(open(DRAFT, encoding='utf-8'))

recomputed = []  # (slug, [ {input, expected}, ... ])
py_mismatch = []  # (slug, tc_idx)
expected_mismatch_vs_stored = []  # (slug, tc_idx) cr_ref != stored expected
total_tc = 0

for p in data:
    slug = p['slug']
    t = R.type_of(slug)
    new_tcs = []
    for idx, tc in enumerate(p['testCases']):
        inp = tc['input']
        exp = R.solve(slug, inp)
        total_tc += 1
        new_tcs.append({'input': inp, 'expected': exp})
        stored = tc.get('expected', '')
        if exp.strip() != (stored or '').strip():
            expected_mismatch_vs_stored.append((slug, idx))
        # 跑提供的 Python 解
        with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False, encoding='utf-8') as f:
            f.write(S.SOL_PY[t]); fp = f.name
        try:
            r = subprocess.run([PY, fp], input=inp, capture_output=True, text=True, timeout=60)
            got = r.stdout
            if r.returncode != 0:
                got = 'ERR:' + r.stderr[:200]
        except subprocess.TimeoutExpired:
            got = 'TIMEOUT'
        os.unlink(fp)
        if got.strip() != exp.strip():
            py_mismatch.append((slug, idx, got[:80], exp[:80]))
    recomputed.append((slug, new_tcs))

# 落盘
out = {slug: tcs for slug, tcs in recomputed}
json.dump(out, open(os.path.join(os.path.dirname(__file__), 'recomputed_tc.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

print(f"problems={len(data)} total_test_cases={total_tc}")
print(f"stored expected != cr_ref (需重算): {len(expected_mismatch_vs_stored)}")
print(f"SOL_PY mismatch vs cr_ref: {len(py_mismatch)}")
if py_mismatch:
    for m in py_mismatch[:20]:
        print("  PY MISMATCH", m[0], "tc", m[1], "got=", m[2], "exp=", m[3])
print("recomputed_tc.json written")
