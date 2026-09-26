# -*- coding: utf-8 -*-
"""ch5 续迁：8-Puzzle / 15-Puzzle / Stick → problems 表 INSERT。

- 复用 cr_ref / cr_solutions / cr_desc / gen_cases 四件套（新题型已注册）。
- 每题生成 n_cases 个确定性测试用例（不同 seed 后缀）+ 2 个示例（示例输出用 cr_ref 重算）。
- 自检：cr_ref.solve 与 SOL_PY 在全部测试输入上输出一致。
- 生成 INSERT ... ON CONFLICT DO UPDATE SQL（分类 searching，按 slug 幂等可重跑）。
"""
import sys, os, json, subprocess, tempfile, random, string
sys.path.insert(0, os.path.dirname(__file__))
import cr_ref as R
import cr_solutions as S
import cr_desc as D
import gen_cases as G

HERE = os.path.dirname(os.path.abspath(__file__))
PY = '/Users/xiaoye/.workbuddy/binaries/python/versions/3.13.12/bin/python3'
CATEGORY_SLUG = 'searching'   # 高级搜索 → categories.searching

PROBLEMS = [
    {
        'slug': 'cr-8puzzle', 'title': '八数码问题（8-Puzzle）', 'difficulty': 'MEDIUM',
        'tags': ['bfs', 'state-search', '8-puzzle', 'a-star'], 'n_cases': 3, 'timeLimit': 2000,
    },
    {
        'slug': 'cr-15puzzle', 'title': '十五数码问题（15-Puzzle）', 'difficulty': 'HARD',
        'tags': ['a-star', 'ida-star', 'state-search', '15-puzzle'], 'n_cases': 3, 'timeLimit': 10000,
    },
    {
        'slug': 'cr-stick', 'title': '木棒拼接（Stick）', 'difficulty': 'MEDIUM',
        'tags': ['dfs', 'backtracking', 'pruning', 'stick'], 'n_cases': 3, 'timeLimit': 2000,
    },
]

def build(p):
    t = R.type_of(p['slug'])
    assert t != 'unknown', p['slug']
    desc = (D.DESC[t]
            .replace('{title}', p['title'])
            .replace('{difficulty}', p['difficulty'])
            .replace('{tags}', ', '.join(p['tags'])))
    solutions = {
        'typescript': S.SOL_TS[t],
        'python': S.SOL_PY[t],
        'java': S.SOL_JAVA[t],
    }
    test_cases = []
    for k in range(p['n_cases']):
        inp = G.generate_input(t, p['slug'] + f'-tc{k}')
        exp = R.solve(p['slug'], inp)
        test_cases.append({'input': inp, 'expected': exp})
    examples = [
        {'input': G.generate_input(t, p['slug'] + '-ex'), 'output': R.solve(p['slug'], G.generate_input(t, p['slug'] + '-ex'))},
    ]
    return {
        'slug': p['slug'], 'title': p['title'], 'difficulty': p['difficulty'],
        'categorySlug': CATEGORY_SLUG, 'tags': p['tags'],
        'timeLimit': p.get('timeLimit', 2000),
        'descriptionMd': desc, 'examples': examples,
        'testCases': test_cases, 'solutions': solutions,
    }

def verify(rec):
    """SOL_PY 与 cr_ref 在每个测试输入上输出一致。"""
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
            print(f"   tc{i}: in={tc['input'][:70]!r}...  exp={tc['expected'][:40]!r}")
        if fails:
            print('   VERIFY FAIL:', fails)
            all_fail.extend(fails)
        else:
            print('   VERIFY: cr_ref == SOL_PY OK')
    if all_fail:
        print('TOTAL FAIL:', len(all_fail))
        sys.exit(1)
    out = os.path.join(HERE, 'insert_ch5.sql')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('-- INSERT ch5 续迁题：cr-8puzzle / cr-15puzzle / cr-stick。幂等可重跑。\n')
        for rec in recs:
            f.write(gen_sql(rec))
    print('wrote', out)
    with open(os.path.join(HERE, 'coderepo-problems-ch5.final.json'), 'w', encoding='utf-8') as f:
        json.dump(recs, f, ensure_ascii=False, indent=1)
    print('wrote coderepo-problems-ch5.final.json')
