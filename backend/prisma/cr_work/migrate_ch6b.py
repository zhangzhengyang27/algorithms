# -*- coding: utf-8 -*-
"""ch6 收尾（最后一批）：BarnPainting / Caterpillar / Chocolate / Invader / King / PalinPath / StoneGameV → INSERT。

复用四件套；自检 cr_ref == SOL_PY；生成幂等 INSERT SQL。
"""
import sys, os, json, subprocess, tempfile, random, string
sys.path.insert(0, os.path.dirname(__file__))
import cr_ref as R
import cr_solutions as S
import cr_desc as D
import gen_cases as G

HERE = os.path.dirname(os.path.abspath(__file__))
PY = '/Users/xiaoye/.workbuddy/binaries/python/versions/3.13.12/bin/python3'

PROBLEMS = [
    ('cr-barnpainting', '谷仓涂色（Barn Painting）', 'MEDIUM', 'dynamic-programming',
     ['dp', 'tree-dp', 'coloring'], 3, 2000),
    ('cr-caterpillar', '毛毛虫（Caterpillar）', 'MEDIUM', 'dynamic-programming',
     ['dp', 'tree-dp', 'path'], 3, 2000),
    ('cr-chocolate', '巧克力（Chocolate）', 'HARD', 'dynamic-programming',
     ['dp', 'max-submatrix', 'kadane'], 3, 2000),
    ('cr-invader', '外星人入侵（Invader）', 'HARD', 'dynamic-programming',
     ['dp', 'interval-dp', 'invasion'], 3, 2000),
    ('cr-king', '国王放置（King）', 'MEDIUM', 'dynamic-programming',
     ['dp', 'state-compression', 'chessboard'], 3, 2000),
    ('cr-palinpath', '回文路径（Palindrome Path）', 'HARD', 'dynamic-programming',
     ['dp', 'palindrome', 'diagonal'], 3, 2000),
    ('cr-stonegamev', '石子游戏 V（Stone Game V）', 'MEDIUM', 'dynamic-programming',
     ['dp', 'interval-dp', 'game'], 3, 2000),
]

def build(p):
    slug, title, diff, cat, tags, n_cases, tl = p
    t = R.type_of(slug)
    assert t != 'unknown', slug
    desc = (D.DESC[t].replace('{title}', title).replace('{difficulty}', diff).replace('{tags}', ', '.join(tags)))
    solutions = {'typescript': S.SOL_TS[t], 'python': S.SOL_PY[t], 'java': S.SOL_JAVA[t]}
    test_cases = []
    for k in range(n_cases):
        inp = G.generate_input(t, slug + f'-tc{k}')
        exp = R.solve(slug, inp)
        test_cases.append({'input': inp, 'expected': exp})
    examples = [{'input': G.generate_input(t, slug + '-ex'), 'output': R.solve(slug, G.generate_input(t, slug + '-ex'))}]
    return {
        'slug': slug, 'title': title, 'difficulty': diff, 'categorySlug': cat,
        'tags': tags, 'timeLimit': tl, 'descriptionMd': desc, 'examples': examples,
        'testCases': test_cases, 'solutions': solutions,
    }

def verify(rec):
    fails = []
    with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False, encoding='utf-8') as f:
        f.write(rec['solutions']['python']); fp = f.name
    try:
        for i, tc in enumerate(rec['testCases']):
            r = subprocess.run([PY, fp], input=tc['input'], capture_output=True, text=True, timeout=120)
            got = r.stdout.strip() if r.returncode == 0 else 'ERR:' + r.stderr[:100]
            if got != tc['expected'].strip():
                fails.append((i, got, tc['expected']))
    finally:
        os.unlink(fp)
    return fails

def gen_sql(rec):
    def tag():
        return 'cr' + ''.join(random.choice(string.hexdigits) for _ in range(8))
    t_d = tag(); t_e = tag(); t_s = tag(); t_tc = tag(); t_tags = tag()
    desc = rec['descriptionMd']
    examples = json.dumps(rec['examples'], ensure_ascii=False)
    solutions = json.dumps(rec['solutions'], ensure_ascii=False)
    test_cases = json.dumps(rec['testCases'], ensure_ascii=False)
    tags = json.dumps(rec['tags'], ensure_ascii=False)
    slug = rec['slug'].replace("'", "''")
    return (
        f"INSERT INTO problems\n"
        f"(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,\n"
        f" time_limit, memory_limit, created_at, updated_at)\n"
        f"VALUES (\n"
        f"  gen_random_uuid(),\n"
        f"  (SELECT id FROM categories WHERE slug = '{rec['categorySlug']}'),\n"
        f"  '{rec['title']}', '{slug}', '{rec['difficulty']}',\n"
        f"  ${t_d}${desc}${t_d}$,\n"
        f"  ${t_e}${examples}${t_e}$::jsonb,\n"
        f"  ${t_s}${solutions}${t_s}$::jsonb,\n"
        f"  ${t_tc}${test_cases}${t_tc}$::jsonb,\n"
        f"  ARRAY(SELECT jsonb_array_elements_text(${t_tags}${tags}${t_tags}$::jsonb)),\n"
        f"  {rec['timeLimit']}, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP\n"
        f")\n"
        f"ON CONFLICT (slug) DO UPDATE SET\n"
        f"  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,\n"
        f"  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,\n"
        f"  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,\n"
        f"  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;\n"
    )

if __name__ == '__main__':
    recs = [build(p) for p in PROBLEMS]
    all_fail = []
    for rec in recs:
        fails = verify(rec)
        print(f"== {rec['slug']} ({R.type_of(rec['slug'])}) ==")
        for i, tc in enumerate(rec['testCases']):
            print(f"   tc{i}: exp={tc['expected'][:40]!r}")
        if fails:
            print('   VERIFY FAIL:', fails)
            all_fail.extend(fails)
        else:
            print('   VERIFY: cr_ref == SOL_PY OK')
    if all_fail:
        print('TOTAL FAIL:', len(all_fail))
        sys.exit(1)
    out = os.path.join(HERE, 'insert_ch6b.sql')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('-- INSERT ch6 收尾 7 题。幂等可重跑。\n')
        for rec in recs:
            f.write(gen_sql(rec))
    print('wrote', out)
    with open(os.path.join(HERE, 'coderepo-problems-ch6b.final.json'), 'w', encoding='utf-8') as f:
        json.dump(recs, f, ensure_ascii=False, indent=1)
    print('wrote coderepo-problems-ch6b.final.json')
