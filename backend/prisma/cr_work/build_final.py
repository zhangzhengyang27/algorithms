# -*- coding: utf-8 -*-
"""组装 coderepo-problems.final.json：
- description_md：精修模板（注入 title/difficulty/tags）
- solutions：{ typescript, python, java }
- testCases：中等规模生成输入 + cr_ref 重算 expected
- examples：输入保留，输出用 cr_ref 重算（修复原始 debug 残留）
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
import cr_ref as R
import cr_solutions as S
import cr_desc as D
import gen_cases as G

DRAFT = os.path.join(os.path.dirname(__file__), '..', 'coderepo-problems.draft.json')
OUT = os.path.join(os.path.dirname(__file__), '..', 'coderepo-problems.final.json')
data = json.load(open(DRAFT, encoding='utf-8'))

final = []
for p in data:
    slug = p['slug']; t = R.type_of(slug)
    # description_md（用 replace 避免模板里 \sqrt{n} 等 {n} 被 format 误当占位符）
    desc = (D.DESC[t]
            .replace('{title}', p['title'])
            .replace('{difficulty}', p['difficulty'])
            .replace('{tags}', ', '.join(p.get('tags', []))))
    # solutions
    solutions = {
        'typescript': S.SOL_TS[t],
        'python': S.SOL_PY[t],
        'java': S.SOL_JAVA[t],
    }
    # testCases：生成中等输入 + 重算 expected
    test_cases = []
    for _ in range(1):
        inp = G.generate_input(t, slug)
        exp = R.solve(slug, inp)
        test_cases.append({'input': inp, 'expected': exp})
    # examples：重算输出（保护：超长 / 格式异常则保留原始 output）
    examples = []
    for ex in (p.get('examples') or []):
        ein = ex.get('input', '')
        eout = ex.get('output', '')
        if ein.strip() and len(ein) <= 50000:
            try:
                eout = R.solve(slug, ein)
            except Exception:
                eout = ex.get('output', '')
        examples.append({'input': ein, 'output': eout})
    rec = {
        'slug': slug,
        'title': p['title'],
        'difficulty': p['difficulty'],
        'categorySlug': p.get('categorySlug'),
        'tags': p.get('tags', []),
        'source': p.get('source'),
        'descriptionMd': desc,
        'examples': examples,
        'testCases': test_cases,
        'solutions': solutions,
    }
    final.append(rec)

json.dump(final, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print("wrote", OUT, "records:", len(final))
# 抽样检查
s = final[0]
print("--- sample slug:", s['slug'])
print("desc head:\n", s['descriptionMd'][:200])
print("solutions lang keys:", list(s['solutions'].keys()))
print("testCase0 input head:", s['testCases'][0]['input'][:60])
print("testCase0 expected head:", s['testCases'][0]['expected'][:60])
print("examples count:", len(s['examples']), "example0 output head:", s['examples'][0]['output'][:60])
