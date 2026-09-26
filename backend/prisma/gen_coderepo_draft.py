#!/usr/bin/env python3
# 读 coderepo 的 .in/.out 配对，生成 37 题草稿 JSON（stdin/stdout 格式）。
# 纯只读扫描，不写库。输出 backend/prisma/coderepo-problems.draft.json。
import os, json, re
from collections import Counter

CODEREPO = "/Users/xiaoye/Desktop/20260803/{2}--资料/coderepo"
OUT = os.path.join(os.path.dirname(__file__), "coderepo-problems.draft.json")

def kebab(s):
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

def slug_for(rel_no_ext):
    return "cr-" + kebab(rel_no_ext)

def topic_title(rel):
    parts = rel.split("/")
    chapter = parts[0]
    parent = parts[-2]
    if parent == "data":
        if "Balanced BST" in chapter: return "平衡二叉搜索树"
        if "Almost-Balanced BST" in chapter: return "近似平衡二叉搜索树"
        if "Heap" in chapter: return "堆"
        return "数据结构"
    m = {
        "segtree": "线段树", "trie": "字典树", "triepractice": "字典树练习",
        "blocklist": "块状链表", "skiplist": "跳表", "ufs": "并查集",
        "pseudobst": "伪平衡二叉搜索树",
    }
    return m.get(parent, parent)

def cat_for(rel):
    if "Heap" in rel: return "heap"
    if "Balanced BST" in rel or "Almost-Balanced BST" in rel: return "balanced-bst"
    if "Multi-Dimension" in rel:
        if "/trie" in rel or "/triepractice" in rel: return "trie"
        return "segment-tree"
    if "Complex Linked" in rel: return "data-structures"
    if "Algorithm Project" in rel: return "data-structures"
    return "data-structures"

def main():
    pairs = []
    for root, _, files in os.walk(CODEREPO):
        for f in files:
            if f.endswith(".in"):
                in_p = os.path.join(root, f)
                out_p = in_p[:-3] + ".out"
                if os.path.exists(out_p):
                    rel = os.path.relpath(in_p, CODEREPO)
                    pairs.append((rel, in_p, out_p))
    pairs.sort()

    records = []
    for rel, in_p, out_p in pairs:
        fname = os.path.basename(in_p)[:-3]
        with open(in_p, encoding="utf-8", errors="replace") as fh:
            inn = fh.read().strip()
        with open(out_p, encoding="utf-8", errors="replace") as fh:
            outt = fh.read().strip()
        rel_no_ext = rel[:-3]
        cat = cat_for(rel)
        title = topic_title(rel)
        test_cases = [{"input": inn, "expected": outt}]
        examples = [{"input": (inn[:200] + ("..." if len(inn) > 200 else "")),
                     "output": (outt[:200] + ("..." if len(outt) > 200 else ""))}]
        desc = (
            f"# {title}\n\n"
            f"源自《算法进阶》配套代码库（coderepo）的实战题，章节：`{rel.split('/')[0]}`。\n\n"
            f"## 输入输出格式\n标准输入 / 标准输出（stdin / stdout）。\n\n"
            f"## 示例\n\n```\n{inn[:300]}\n-->\n{outt[:300]}\n```\n\n"
            f"> 注：本题为 stdin/stdout 形式，需平台支持该题型方可在线评测。\n"
        )
        records.append({
            "slug": slug_for(rel_no_ext),
            "title": title,
            "difficulty": "MEDIUM",
            "categorySlug": cat,
            "tags": [cat],
            "descriptionMd": desc,
            "examples": examples,
            "testCases": test_cases,
            "solutions": {},
            "source": f"coderepo/{rel}",
        })

    slugs = [r["slug"] for r in records]
    dup = [s for s, n in Counter(slugs).items() if n > 1]
    assert not dup, f"slug 冲突: {dup}"

    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(records, fh, ensure_ascii=False, indent=2)

    print(f"配对题数: {len(records)}  (slug 全部唯一: {not dup})")
    print("分类映射预览:", dict(Counter(r["categorySlug"] for r in records)))
    print(f"草稿已写出: {OUT}")

if __name__ == "__main__":
    main()
