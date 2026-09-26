# -*- coding: utf-8 -*-
"""把 cr_solutions.py 里 SOL_TS/SOL_JAVA 的反引号定界符改写为 Python 三单引号，
并还原块内被转义的 JS 模板串（\\` -> ` ，\\$ -> $）。SOL_PY 不动。"""
import os

src = os.path.join(os.path.dirname(__file__), 'cr_solutions.py')
text = open(src, encoding='utf-8').read()
lines = text.split('\n')
out = []
mode = None  # None | 'ts' | 'java'

for line in lines:
    s = line.rstrip('\n')
    is_ts = line.startswith("SOL_TS['")
    is_java = line.startswith("SOL_JAVA['")
    if (is_ts or is_java) and '`' in line:
        # 开口：把本行首个反引号（及前导转义反斜杠）替换为三单引号
        idx = line.index('`')
        if idx > 0 and line[idx - 1] == '\\':
            newline = line[:idx - 1] + "'''" + line[idx + 1:]
        else:
            newline = line[:idx] + "'''" + line[idx + 1:]
        out.append(newline)
        mode = 'ts' if is_ts else 'java'
        continue
    if mode is not None and s == '`':
        out.append("'''")
        mode = None
        continue
    if mode is not None:
        fixed = line.replace('\\`', '`').replace('\\$', '$')
        out.append(fixed)
        continue
    out.append(line)

open(src, 'w', encoding='utf-8').write('\n'.join(out))
print("transformed; mode left open:", mode)
