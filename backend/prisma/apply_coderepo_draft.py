#!/usr/bin/env python3
# 读 coderepo-problems.draft.json，生成可重跑的 SQL（dollar-quoting 转义）。
# 输出 prisma/coderepo-insert.sql，由 psql -f 执行。
import json, uuid, os

HERE = os.path.dirname(__file__)
DRAFT = os.path.join(HERE, "coderepo-problems.draft.json")
SQL = os.path.join(HERE, "coderepo-insert.sql")
TAG = "coderepo"  # dollar-quote 分隔符

NEW_CATS = [
    ("balanced-bst", "平衡二叉搜索树", "平衡二叉搜索树（AVL / 红黑 / Splay / Treap）详解与实战", 29),
    ("segment-tree", "线段树", "线段树与树状数组（Segment Tree / BIT）", 30),
    ("trie", "字典树", "字典树（Trie）及其应用", 31),
]

def q(text):
    # dollar-quoting：内容无需转义
    return f"${TAG}${text}${TAG}$"

def jq(obj):
    return f"${TAG}${json.dumps(obj, ensure_ascii=False)}${TAG}$::jsonb"

def main():
    recs = json.load(open(DRAFT, encoding="utf-8"))
    out = []
    out.append("-- 新建三分类（可重跑）")
    cat_rows = []
    for slug, name, desc, order in NEW_CATS:
        cid = str(uuid.uuid4())
        cat_rows.append(
            f"  ('{cid}', '{slug}', {q(name)}, {q(desc)}, 'tree', {order}, now(), now())"
        )
    out.append("INSERT INTO categories (id, slug, name, description, icon, \"order\", created_at, updated_at) VALUES")
    out.append(",\n".join(cat_rows))
    out.append("ON CONFLICT (slug) DO NOTHING;")
    out.append("")
    out.append(f"-- 插入 {len(recs)} 道题（ON CONFLICT (slug) DO NOTHING 可重跑）")
    for r in recs:
        pid = str(uuid.uuid4())
        cat = r["categorySlug"]
        tags = "ARRAY[" + ", ".join(f"'{t}'" for t in r["tags"]) + "]::text[]"
        out.append(
            "INSERT INTO problems (id, category_id, title, slug, difficulty, description_md, "
            "examples, solutions, hints, time_limit, memory_limit, test_cases, default_code, "
            "tags, created_at, updated_at) VALUES ("
            f"'{pid}', (SELECT id FROM categories WHERE slug='{cat}'), "
            f"{q(r['title'])}, {q(r['slug'])}, 'MEDIUM', {q(r['descriptionMd'])}::text, "
            f"{jq(r['examples'])}, {jq(r['solutions'])}, NULL, 2000, 256, "
            f"{jq(r['testCases'])}, NULL, {tags}, now(), now()) "
            "ON CONFLICT (slug) DO NOTHING;"
        )
    open(SQL, "w", encoding="utf-8").write("\n".join(out) + "\n")
    print(f"SQL 已写出: {SQL}  ({len(recs)} 题 + {len(NEW_CATS)} 分类)")

if __name__ == "__main__":
    main()
