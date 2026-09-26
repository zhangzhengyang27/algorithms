# -*- coding: utf-8 -*-
"""ch2-6 经典判题类批量迁移：10 题 → problems 表 INSERT。

复用 cr_ref / cr_solutions / cr_desc / gen_cases 四件套。
每题生成 n_cases 个确定性测试用例 + 1 个示例；自检 cr_ref == SOL_PY；生成幂等 INSERT SQL。
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
    # (slug, title, difficulty, categorySlug, tags, n_cases, timeLimit)
    ('cr-knapsack01', '01 背包（Knapsack 0/1）', 'MEDIUM', 'dynamic-programming',
     ['dp', 'knapsack', '0-1-knapsack'], 3, 2000),
    ('cr-knapsackmulti', '完全背包（Knapsack Unlimited）', 'MEDIUM', 'dynamic-programming',
     ['dp', 'knapsack', 'complete-knapsack'], 3, 2000),
    ('cr-numbercombine', '石子合并（Stone Merge）', 'MEDIUM', 'dynamic-programming',
     ['dp', 'interval-dp', 'merge'], 3, 2000),
    ('cr-jump', '爬楼梯（Jump Stairs）', 'EASY', 'dynamic-programming',
     ['dp', 'stairs', 'counting'], 3, 2000),
    ('cr-maxsquare', '最大全 1 正方形（Max Square）', 'MEDIUM', 'dynamic-programming',
     ['dp', 'matrix', 'square'], 3, 2000),
    ('cr-divisible', '整除判断（Divisible）', 'MEDIUM', 'dynamic-programming',
     ['dp', 'modulo', 'divisibility'], 3, 2000),
    ('cr-wordbreak', '单词拆分（Word Break）', 'MEDIUM', 'dynamic-programming',
     ['dp', 'string', 'word-break'], 3, 2000),
    ('cr-changevolume', '音量调节（Change Volume）', 'EASY', 'dynamic-programming',
     ['dp', 'greedy', 'volume'], 3, 2000),
    ('cr-stonejump', '跳石头（Stone Jump）', 'MEDIUM', 'searching',
     ['binary-search', 'greedy', 'river'], 3, 2000),
    ('cr-sortthree', '三值序列排序（Sort Three-Valued Sequence）', 'EASY', 'greedy',
     ['greedy', 'sorting', 'swap'], 3, 2000),
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
    out = os.path.join(HERE, 'insert_ch26.sql')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('-- INSERT ch2-6 经典判题类 10 题。幂等可重跑。\n')
        for rec in recs:
            f.write(gen_sql(rec))
    print('wrote', out)
    with open(os.path.join(HERE, 'coderepo-problems-ch26.final.json'), 'w', encoding='utf-8') as f:
        json.dump(recs, f, ensure_ascii=False, indent=1)
    print('wrote coderepo-problems-ch26.final.json')
