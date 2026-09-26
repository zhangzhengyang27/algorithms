# -*- coding: utf-8 -*-
"""根据 coderepo-problems.final.json 生成 UPDATE SQL（按 slug 更新核心字段）。
用美元引号避免 JSON/代码内的引号、反斜杠转义问题。"""
import json, os, random, string

FINAL = os.path.join(os.path.dirname(__file__), '..', 'coderepo-problems.final.json')
OUT = os.path.join(os.path.dirname(__file__), 'update_coderepo.sql')
data = json.load(open(FINAL, encoding='utf-8'))

def tag():
    return 'cr' + ''.join(random.choice(string.hexdigits) for _ in range(8))

sqls = []
for p in data:
    t_desc = tag(); t_ex = tag(); t_sol = tag(); t_tc = tag(); t_tags = tag()
    desc = p['descriptionMd']
    examples = json.dumps(p['examples'], ensure_ascii=False)
    solutions = json.dumps(p['solutions'], ensure_ascii=False)
    test_cases = json.dumps(p['testCases'], ensure_ascii=False)
    tags = json.dumps(p.get('tags', []), ensure_ascii=False)
    slug = p['slug'].replace("'", "''")
    sql = (
        f"UPDATE problems SET\n"
        f"  description_md = ${t_desc}${desc}${t_desc}$,\n"
        f"  examples = ${t_ex}${examples}${t_ex}$::jsonb,\n"
        f"  solutions = ${t_sol}${solutions}${t_sol}$::jsonb,\n"
        f"  test_cases = ${t_tc}${test_cases}${t_tc}$::jsonb,\n"
        f"  tags = ARRAY(SELECT jsonb_array_elements_text(${t_tags}${tags}${t_tags}$::jsonb)),\n"
        f"  updated_at = CURRENT_TIMESTAMP\n"
        f"WHERE slug = '{slug}';\n"
    )
    sqls.append(sql)

header = "-- 更新 37 题 coderepo 题目：description_md / solutions / examples / test_cases / tags\n"
open(OUT, 'w', encoding='utf-8').write(header + '\n'.join(sqls))
print("wrote", OUT, "statements:", len(sqls))
