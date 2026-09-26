/**
 * python-tracer.ts
 * 针对 LeetCode 题解的轻量 Python 解释器：逐语句执行，生成行号 + 变量快照步骤。
 * 支持常见子集：缩进块、def/class、for/while/if、range/enumerate、列表/字典、
 * 元组解包、负索引、in 成员判断、常用内置函数。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Env, ReturnSignal, BreakSignal, ContinueSignal,
  deepCopy, stringify, type TraceStep, type TraceResult,
} from './solution-tracer';

// ─── 分词器 ─────────────────────────────────────────────────────────────────

interface Tok { type: 'name' | 'num' | 'str' | 'op' | 'eof'; val: string; num?: number }

const PY_OPS = ['**', '//', '<<', '>>', '<=', '>=', '==', '!=', '+=', '-=', '*=', '/=', '%=', '->',
  '+', '-', '*', '/', '%', '<', '>', '=', '(', ')', '[', ']', '{', '}', ',', '.', ':', '|', '^', '&', '~'];

function tokenizePy(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === ' ' || c === '\t') { i++; continue; }
    // 注释
    if (c === '#') break;
    // 字符串
    if (c === '"' || c === "'") {
      const quote = c;
      let j = i + 1, s = '';
      while (j < n && src[j] !== quote) {
        if (src[j] === '\\') { s += src[j + 1]; j += 2; }
        else { s += src[j]; j++; }
      }
      toks.push({ type: 'str', val: s });
      i = j + 1;
      continue;
    }
    // 数字
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1]))) {
      let j = i;
      while (j < n && /[0-9._xXabcdefABCDEF]/.test(src[j])) j++;
      const raw = src.slice(i, j);
      toks.push({ type: 'num', val: raw, num: Number(raw) });
      i = j;
      continue;
    }
    // 标识符/关键字
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[\w]/.test(src[j])) j++;
      toks.push({ type: 'name', val: src.slice(i, j) });
      i = j;
      continue;
    }
    // 运算符
    let matched = false;
    for (const op of PY_OPS) {
      if (src.startsWith(op, i)) {
        toks.push({ type: 'op', val: op });
        i += op.length;
        matched = true;
        break;
      }
    }
    if (!matched) i++; // 跳过未知字符
  }
  toks.push({ type: 'eof', val: '' });
  return toks;
}

// ─── 表达式解析器（递归下降） ───────────────────────────────────────────────

class PyExprParser {
  private toks: Tok[];
  private pos = 0;
  constructor(toks: Tok[]) { this.toks = toks; }

  private peek(): Tok { return this.toks[this.pos] ?? { type: 'eof', val: '' }; }
  private next(): Tok { return this.toks[this.pos++]; }
  private isOp(v: string): boolean { return this.peek().type === 'op' && this.peek().val === v; }
  private eatOp(v: string): boolean { if (this.isOp(v)) { this.pos++; return true; } return false; }

  parse(): any {
    const first = this.parseExpr();
    // 顶层逗号元组：a, b = b, a + b 的右侧
    if (this.isOp(',')) {
      const elts = [first];
      while (this.eatOp(',')) {
        if (this.peek().type === 'eof') break;
        elts.push(this.parseExpr());
      }
      return { t: 'tuple', elts };
    }
    return first;
  }

  // 表达式（最低优先级：lambda 不支持，从 or 开始）
  private parseExpr(): any { return this.parseOr(); }

  private parseOr(): any {
    let left = this.parseAnd();
    while (this.peek().type === 'name' && this.peek().val === 'or') {
      this.next();
      const right = this.parseAnd();
      left = { t: 'logic', op: 'or', left, right };
    }
    return left;
  }
  private parseAnd(): any {
    let left = this.parseNot();
    while (this.peek().type === 'name' && this.peek().val === 'and') {
      this.next();
      const right = this.parseNot();
      left = { t: 'logic', op: 'and', left, right };
    }
    return left;
  }
  private parseNot(): any {
    if (this.peek().type === 'name' && this.peek().val === 'not') {
      this.next();
      return { t: 'unary', op: 'not', operand: this.parseNot() };
    }
    return this.parseCompare();
  }
  private parseCompare(): any {
    let left = this.parseBitOr();
    const cmpOps = ['==', '!=', '<=', '>=', '<', '>'];
    for (;;) {
      if (this.peek().type === 'name' && this.peek().val === 'in') {
        this.next();
        left = { t: 'cmp', op: 'in', left, right: this.parseBitOr() };
      } else if (this.peek().type === 'name' && this.peek().val === 'not' &&
                 this.toks[this.pos + 1]?.type === 'name' && this.toks[this.pos + 1]?.val === 'in') {
        this.pos += 2;
        left = { t: 'cmp', op: 'notin', left, right: this.parseBitOr() };
      } else if (this.peek().type === 'name' && this.peek().val === 'is') {
        this.next();
        let negate = false;
        if (this.peek().type === 'name' && this.peek().val === 'not') { this.next(); negate = true; }
        left = { t: 'cmp', op: negate ? 'isnot' : 'is', left, right: this.parseBitOr() };
      } else if (cmpOps.includes(this.peek().val) && this.peek().type === 'op') {
        const op = this.next().val;
        left = { t: 'cmp', op, left, right: this.parseBitOr() };
      } else break;
    }
    return left;
  }
  private parseBitOr(): any {
    let left = this.parseBitXor();
    while (this.isOp('|')) { this.next(); left = { t: 'bin', op: '|', left, right: this.parseBitXor() }; }
    return left;
  }
  private parseBitXor(): any {
    let left = this.parseBitAnd();
    while (this.isOp('^')) { this.next(); left = { t: 'bin', op: '^', left, right: this.parseBitAnd() }; }
    return left;
  }
  private parseBitAnd(): any {
    let left = this.parseShift();
    while (this.isOp('&')) { this.next(); left = { t: 'bin', op: '&', left, right: this.parseShift() }; }
    return left;
  }
  private parseShift(): any {
    let left = this.parseAdd();
    while (this.isOp('<<') || this.isOp('>>')) {
      const op = this.next().val;
      left = { t: 'bin', op, left, right: this.parseAdd() };
    }
    return left;
  }
  private parseAdd(): any {
    let left = this.parseMul();
    while (this.isOp('+') || this.isOp('-')) {
      const op = this.next().val;
      left = { t: 'bin', op, left, right: this.parseMul() };
    }
    return left;
  }
  private parseMul(): any {
    let left = this.parseUnary();
    while (this.isOp('*') || this.isOp('/') || this.isOp('//') || this.isOp('%')) {
      const op = this.next().val;
      left = { t: 'bin', op, left, right: this.parseUnary() };
    }
    return left;
  }
  private parseUnary(): any {
    if (this.isOp('-') || this.isOp('+') || this.isOp('~')) {
      const op = this.next().val;
      return { t: 'unary', op, operand: this.parseUnary() };
    }
    return this.parsePower();
  }
  private parsePower(): any {
    const base = this.parsePostfix();
    if (this.isOp('**')) {
      this.next();
      return { t: 'bin', op: '**', left: base, right: this.parseUnary() };
    }
    return base;
  }
  private parsePostfix(): any {
    let node = this.parseAtom();
    for (;;) {
      if (this.isOp('(')) {
        this.next();
        const args: any[] = [];
        while (!this.isOp(')') && this.peek().type !== 'eof') {
          if (this.isOp('*') || this.isOp('**')) { this.next(); } // 解包参数
          args.push(this.parseExpr());
          if (!this.eatOp(',')) break;
        }
        this.eatOp(')');
        node = { t: 'call', func: node, args };
      } else if (this.isOp('[')) {
        this.next();
        // 支持切片 a[i:j]
        const parts: any[] = [];
        const cur = this.isOp(':') ? null : this.parseExpr();
        parts.push(cur);
        while (this.eatOp(':')) {
          parts.push(this.isOp(']') || this.isOp(':') ? null : this.parseExpr());
        }
        this.eatOp(']');
        node = parts.length === 1
          ? { t: 'sub', value: node, index: parts[0] }
          : { t: 'slice', value: node, parts };
      } else if (this.isOp('.')) {
        this.next();
        const attr = this.next().val;
        node = { t: 'attr', value: node, attr };
      } else break;
    }
    return node;
  }
  private parseAtom(): any {
    const tok = this.peek();
    if (tok.type === 'num') { this.next(); return { t: 'num', value: tok.num }; }
    if (tok.type === 'str') { this.next(); return { t: 'str', value: tok.val }; }
    if (tok.type === 'name') {
      this.next();
      if (tok.val === 'True') return { t: 'bool', value: true };
      if (tok.val === 'False') return { t: 'bool', value: false };
      if (tok.val === 'None') return { t: 'none' };
      return { t: 'name', id: tok.val };
    }
    if (this.isOp('(')) {
      this.next();
      if (this.isOp(')')) { this.next(); return { t: 'tuple', elts: [] }; }
      const first = this.parseExpr();
      if (this.eatOp(',')) {
        const elts = [first];
        while (!this.isOp(')') && this.peek().type !== 'eof') {
          elts.push(this.parseExpr());
          if (!this.eatOp(',')) break;
        }
        this.eatOp(')');
        return { t: 'tuple', elts };
      }
      this.eatOp(')');
      return first;
    }
    if (this.isOp('[')) {
      this.next();
      // 空列表 []
      if (this.isOp(']')) { this.next(); return { t: 'list', elts: [] }; }
      // 列表推导式 [expr for x in iter (if cond)]
      const firstElt = this.parseExpr();
      if (this.peek().type === 'name' && this.peek().val === 'for') {
        this.next(); // 'for'
        const varName = this.next().val;
        this.next(); // 'in'
        const iter = this.parseExpr();
        let cond: any = null;
        if (this.peek().type === 'name' && this.peek().val === 'if') {
          this.next();
          cond = this.parseExpr();
        }
        this.eatOp(']');
        return { t: 'comprehension', elt: firstElt, var: varName, iter, cond };
      }
      // 普通列表
      const elts: any[] = [firstElt];
      while (this.eatOp(',')) {
        if (this.isOp(']') || this.peek().type === 'eof') break;
        elts.push(this.parseExpr());
      }
      this.eatOp(']');
      return { t: 'list', elts };
    }
    if (this.isOp('{')) {
      this.next();
      const keys: any[] = [], values: any[] = [];
      while (!this.isOp('}') && this.peek().type !== 'eof') {
        const k = this.parseExpr();
        this.eatOp(':');
        const v = this.parseExpr();
        keys.push(k); values.push(v);
        if (!this.eatOp(',')) break;
      }
      this.eatOp('}');
      return { t: 'dict', keys, values };
    }
    // 容错：跳过
    this.next();
    return { t: 'num', value: 0 };
  }
}

function parsePyExpr(src: string): any {
  return new PyExprParser(tokenizePy(src)).parse();
}

/** 剩离三引号文档字符串（保留换行以维持行号），避免干扰分词器 */
function stripDocstrings(code: string): string {
  return code.replace(/('''|""")([\s\S]*?)\1/g, m => '""' + (m.match(/\n/g) ?? []).join(''));
}

// ─── 语句解析（基于缩进） ───────────────────────────────────────────────────

interface PyLine { indent: number; text: string; lineNo: number }

/** 把代码拆成逻辑行：合并括号未闭合的续行，去掉空行/纯注释行 */
function logicalLines(code: string): PyLine[] {
  const raw = code.split('\n');
  const out: PyLine[] = [];
  let i = 0;
  while (i < raw.length) {
    const line = raw[i];
    const indent = line.length - line.trimStart().length;
    let text = line.trim();
    const lineNo = i + 1;
    if (!text || text.startsWith('#')) { i++; continue; }
    // 合并续行（括号不平衡）
    let depth = bracketDepth(text);
    while (depth > 0 && i + 1 < raw.length) {
      i++;
      text += ' ' + raw[i].trim();
      depth = bracketDepth(text);
    }
    // 去掉行尾注释（简单处理：不在字符串内的 #）
    text = stripTrailingComment(text);
    out.push({ indent, text, lineNo });
    i++;
  }
  return out;
}

function bracketDepth(s: string): number {
  let d = 0, inStr: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (c === inStr && s[i - 1] !== '\\') inStr = null; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '#' ) break;
    if ('([{'.includes(c)) d++;
    if (')]}'.includes(c)) d--;
  }
  return d;
}

function stripTrailingComment(s: string): string {
  let inStr: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (c === inStr && s[i - 1] !== '\\') inStr = null; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '#') return s.slice(0, i).trim();
  }
  return s;
}

interface PyStmt {
  t: string; line: number;
  [k: string]: any;
}

class PyParser {
  private lines: PyLine[];
  private pos = 0;
  constructor(lines: PyLine[]) { this.lines = lines; }

  parseProgram(): PyStmt[] {
    return this.parseBlock(0);
  }

  private parseBlock(minIndent: number): PyStmt[] {
    const stmts: PyStmt[] = [];
    while (this.pos < this.lines.length) {
      const ln = this.lines[this.pos];
      if (ln.indent < minIndent) break;
      if (ln.indent > minIndent && stmts.length === 0) {
        // 第一行就更深，用它作为基准
        return this.parseBlock(ln.indent);
      }
      if (ln.indent !== minIndent) break;
      stmts.push(this.parseStmt());
    }
    return stmts;
  }

  private parseStmt(): PyStmt {
    const ln = this.lines[this.pos];
    const text = ln.text;
    const line = ln.lineNo;

    // 复合语句（以 : 结尾）
    if (text.startsWith('def ')) {
      this.pos++;
      const m = text.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*(?:->.*?)?:/);
      const name = m?.[1] ?? '?';
      const params = (m?.[2] ?? '').split(',').map(p => p.trim().split(':')[0].trim()).filter(p => p && p !== 'self');
      const body = this.parseBlock(ln.indent + 1);
      return { t: 'def', name, params, body, line };
    }
    if (text.startsWith('class ')) {
      this.pos++;
      const m = text.match(/^class\s+(\w+)/);
      const body = this.parseBlock(ln.indent + 1);
      return { t: 'class', name: m?.[1] ?? '?', body, line };
    }
    if (text.startsWith('for ')) {
      this.pos++;
      const m = text.match(/^for\s+(.+?)\s+in\s+(.+):$/);
      const target = m?.[1] ?? '';
      const iter = parsePyExpr(m?.[2] ?? '');
      const body = this.parseBlock(ln.indent + 1);
      return { t: 'for', target, iter, body, line };
    }
    if (text.startsWith('while ')) {
      this.pos++;
      const m = text.match(/^while\s+(.+):$/);
      const test = parsePyExpr(m?.[1] ?? '');
      const body = this.parseBlock(ln.indent + 1);
      return { t: 'while', test, body, line };
    }
    if (text.startsWith('if ') || text === 'if:') {
      return this.parseIf(ln.indent);
    }
    if (text.startsWith('return')) {
      this.pos++;
      const rest = text.slice(6).trim();
      return { t: 'return', value: rest ? parsePyExpr(rest) : null, line };
    }
    if (text === 'break') { this.pos++; return { t: 'break', line }; }
    if (text === 'continue') { this.pos++; return { t: 'continue', line }; }
    if (text === 'pass') { this.pos++; return { t: 'pass', line }; }

    // 简单语句
    this.pos++;
    // 增强赋值
    const augM = text.match(/^([\w.\[\]\-]+)\s*(\+=|-=|\*=|\/=|\/\/=|%=|\*\*=|>>=|<<=|&=|\|=|\^=)\s*(.+)$/);
    if (augM) {
      return { t: 'augassign', target: augM[1], op: augM[2], value: parsePyExpr(augM[3]), line };
    }
    // 赋值（含元组解包 a, b = ...）
    const eqIdx = findAssignEq(text);
    if (eqIdx > 0) {
      const lhs = text.slice(0, eqIdx).trim();
      const rhs = text.slice(eqIdx + 1).trim();
      return { t: 'assign', targets: lhs.split(',').map(s => s.trim()), value: parsePyExpr(rhs), line };
    }
    // 表达式语句
    return { t: 'expr', value: parsePyExpr(text), line };
  }

  private parseIf(indent: number): PyStmt {
    const ln = this.lines[this.pos];
    const m = ln.text.match(/^if\s+(.+):$/);
    const test = parsePyExpr(m?.[1] ?? 'True');
    const line = ln.lineNo;
    this.pos++;
    const body = this.parseBlock(indent + 1);
    const root: PyStmt = { t: 'if', test, body, orelse: [], line };
    let tail = root;
    // elif / else 链：逐个挂在 tail.orelse 上
    while (this.pos < this.lines.length && this.lines[this.pos].indent === indent) {
      const t = this.lines[this.pos].text;
      if (t.startsWith('elif ')) {
        const em = t.match(/^elif\s+(.+):$/);
        const etest = parsePyExpr(em?.[1] ?? 'True');
        const eline = this.lines[this.pos].lineNo;
        this.pos++;
        const ebody = this.parseBlock(indent + 1);
        const elifNode: PyStmt = { t: 'if', test: etest, body: ebody, orelse: [], line: eline };
        tail.orelse = [elifNode];
        tail = elifNode;
      } else if (t === 'else:') {
        this.pos++;
        tail.orelse = this.parseBlock(indent + 1);
        break;
      } else break;
    }
    return root;
  }
}

/** 找到赋值等号位置（排除 ==、!=、<=、>= 和函数调用里的 =） */
function findAssignEq(text: string): number {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ('([{'.includes(c)) depth++;
    if (')]}'.includes(c)) depth--;
    if (depth === 0 && c === '=') {
      const prev = text[i - 1], next = text[i + 1];
      if (prev === '=' || next === '=' || prev === '!' || prev === '<' || prev === '>' || prev === ':' || next === ':') continue;
      if ('+-*/%'.includes(prev) && text.slice(i - 2, i + 1).match(/[+\-*/%]=/)) continue;
      return i;
    }
  }
  return -1;
}

// ─── 解释器 ─────────────────────────────────────────────────────────────────

const MAX_STEPS = 500;
const MAX_ITER = 200_000;
const MAX_CALL_DEPTH = 300;

class PyInterpreter {
  steps: TraceStep[] = [];
  truncated = false;
  private source: string;
  private iter = 0;
  private callDepth = 0;

  constructor(source: string) { this.source = source; }

  private guard() { if (++this.iter > MAX_ITER) throw new Error('执行超限（可能死循环）'); }

  private record(line: number, env: Env, desc: string, done = false) {
    if (this.steps.length >= MAX_STEPS) { this.truncated = true; return; }
    this.steps.push({ line, vars: deepCopy(env.collect()), desc, done });
  }

  execBody(body: PyStmt[], env: Env) { for (const s of body) this.exec(s, env); }

  exec(node: PyStmt, env: Env): void {
    this.guard();
    switch (node.t) {
      case 'def': {
        env.define(node.name, this.makeFn(node.params, node.body, env));
        break;
      }
      case 'class': {
        // 把方法提取出来
        for (const m of node.body) {
          if (m.t === 'def') env.define(m.name, this.makeFn(m.params, m.body, env));
        }
        break;
      }
      case 'assign': {
        const val = this.eval(node.value, env);
        const targets: string[] = node.targets;
        if (targets.length === 1) {
          this.assignTarget(targets[0], val, env);
          this.record(node.line, env, `${targets[0]} = ${stringify(this.lookupTarget(targets[0], env))}`);
        } else {
          // 元组解包
          const vals = Array.isArray(val) ? val : [val];
          targets.forEach((tg: string, i: number) => this.assignTarget(tg, vals[i], env));
          this.record(node.line, env, `${targets.join(', ')} = ${stringify(vals)}`);
        }
        break;
      }
      case 'augassign': {
        const cur = this.lookupTarget(node.target, env);
        const rhs = this.eval(node.value, env);
        const nv = this.applyAug(node.op, cur, rhs);
        this.assignTarget(node.target, nv, env);
        this.record(node.line, env, `${node.target} ${node.op} ${stringify(rhs)} → ${stringify(nv)}`);
        break;
      }
      case 'expr': {
        const val = this.eval(node.value, env);
        const desc = this.describeExpr(node.value, val, env);
        if (desc) this.record(node.line, env, desc);
        break;
      }
      case 'if': {
        if (this.truthy(this.eval(node.test, env))) {
          this.execBody(node.body, env);
        } else if (node.orelse?.length) {
          this.execBody(node.orelse, env);
        }
        break;
      }
      case 'for': {
        const iterable = this.toIterable(this.eval(node.iter, env));
        const loopEnv = new Env(env);
        for (const item of iterable) {
          this.guard();
          this.bindTarget(node.target, item, loopEnv);
          this.record(node.line, loopEnv, `for ${node.target} = ${stringify(item)}`);
          try {
            this.execBody(node.body, loopEnv);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        break;
      }
      case 'while': {
        while (this.truthy(this.eval(node.test, env))) {
          this.guard();
          this.record(node.line, env, `while …`);
          try {
            this.execBody(node.body, env);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        break;
      }
      case 'return': {
        const val = node.value ? this.eval(node.value, env) : undefined;
        this.record(node.line, env, `return ${stringify(val)}`, true);
        throw new ReturnSignal(val);
      }
      case 'break': throw new BreakSignal();
      case 'continue': throw new ContinueSignal();
      case 'pass': break;
      default: break;
    }
  }

  private makeFn(params: string[], body: PyStmt[], closure: Env): any {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- 普通函数闭包内需要访问解释器实例
    const interp = this;
    return function (this: any, ...args: any[]) {
      if (++interp.callDepth > MAX_CALL_DEPTH) { interp.callDepth--; throw new Error('递归过深（可能无限递归）'); }
      try {
        const fnEnv = new Env(closure);
        params.forEach((p, i) => fnEnv.define(p, args[i]));
        try {
          interp.execBody(body, fnEnv);
        } catch (e) {
          if (e instanceof ReturnSignal) return e.value;
          throw e;
        }
        return undefined;
      } finally {
        interp.callDepth--;
      }
    };
  }

  // ─── 目标赋值（支持 a、a[i]、a.attr） ───
  private assignTarget(target: string, value: any, env: Env): void {
    const sub = target.match(/^(\w+)\[(.+)\]$/);
    if (sub) {
      const obj = env.get(sub[1]);
      const idx = this.evalIndex(sub[2], obj, env);
      if (Array.isArray(obj)) obj[idx] = value;
      else if (obj && typeof obj === 'object') obj[String(idx)] = value;
      return;
    }
    const attr = target.match(/^(\w+)\.(\w+)$/);
    if (attr) {
      const obj = env.get(attr[1]);
      if (obj && typeof obj === 'object') obj[attr[2]] = value;
      return;
    }
    env.set(target, value);
  }
  private lookupTarget(target: string, env: Env): any {
    const sub = target.match(/^(\w+)\[(.+)\]$/);
    if (sub) {
      const obj = env.get(sub[1]);
      const idx = this.evalIndex(sub[2], obj, env);
      return Array.isArray(obj) ? obj[idx] : obj?.[sub[2]];
    }
    return env.get(target);
  }
  private bindTarget(target: string, value: any, env: Env): void {
    if (target.includes(',')) {
      const parts = target.split(',').map(s => s.trim());
      const vals = Array.isArray(value) ? value : [value];
      parts.forEach((p, i) => env.define(p, vals[i]));
    } else {
      env.define(target.trim(), value);
    }
  }
  private evalIndex(idxSrc: string, obj: any, env: Env): number {
    const idx = this.eval(parsePyExpr(idxSrc), env);
    if (Array.isArray(obj) && idx < 0) return obj.length + idx;
    return idx;
  }

  private applyAug(op: string, cur: any, rhs: any): any {
    switch (op) {
      case '+=': return cur + rhs;
      case '-=': return cur - rhs;
      case '*=': return cur * rhs;
      case '/=': return cur / rhs;
      case '//=': return Math.floor(cur / rhs);
      case '%=': return cur % rhs;
      case '**=': return cur ** rhs;
      case '>>=': return cur >> rhs;
      case '<<=': return cur << rhs;
      case '&=': return cur & rhs;
      case '|=': return cur | rhs;
      case '^=': return cur ^ rhs;
      default: return rhs;
    }
  }

  private truthy(v: any): boolean {
    if (v === null || v === undefined || v === false) return false;
    if (v === 0) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return Object.keys(v).length > 0;
    if (typeof v === 'string') return v.length > 0;
    return true;
  }

  private toIterable(v: any): any[] {
    if (typeof v === 'string') return [...v];
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') return Object.keys(v);
    return [];
  }

  private describeExpr(node: any, val: any, env: Env): string | null {
    if (node?.t === 'call') {
      const fn = node.func;
      if (fn?.t === 'attr' && ['append', 'pop', 'sort', 'reverse', 'insert', 'remove', 'push', 'add'].includes(fn.attr)) {
        const objName = fn.value?.id ?? '?';
        return `${objName}.${fn.attr}(...) → ${stringify(env.get(objName))}`;
      }
    }
    return null;
  }

  // ─── 表达式求值 ───
  eval(node: any, env: Env): any {
    this.guard();
    if (!node) return undefined;
    switch (node.t) {
      case 'num': return node.value;
      case 'str': return node.value;
      case 'bool': return node.value;
      case 'none': return null;
      case 'name': return this.resolveName(node.id, env);
      case 'list': return node.elts.map((e: any) => this.eval(e, env));
      case 'comprehension': {
        const iterable = this.toIterable(this.eval(node.iter, env));
        const out: any[] = [];
        const loopEnv = new Env(env);
        for (const item of iterable) {
          this.bindTarget(node.var, item, loopEnv);
          if (node.cond && !this.truthy(this.eval(node.cond, loopEnv))) continue;
          out.push(this.eval(node.elt, loopEnv));
        }
        return out;
      }
      case 'tuple': return node.elts.map((e: any) => this.eval(e, env));
      case 'dict': {
        const obj: Record<string, any> = {};
        node.keys.forEach((k: any, i: number) => { obj[String(this.eval(k, env))] = this.eval(node.values[i], env); });
        return obj;
      }
      case 'bin': return this.evalBin(node.op, this.eval(node.left, env), this.eval(node.right, env));
      case 'unary': {
        const v = this.eval(node.operand, env);
        if (node.op === '-') return -v;
        if (node.op === '+') return +v;
        if (node.op === 'not') return !this.truthy(v);
        if (node.op === '~') return ~v;
        return v;
      }
      case 'logic': {
        if (node.op === 'and') { const l = this.eval(node.left, env); return this.truthy(l) ? this.eval(node.right, env) : l; }
        if (node.op === 'or') { const l = this.eval(node.left, env); return this.truthy(l) ? l : this.eval(node.right, env); }
        return undefined;
      }
      case 'cmp': {
        const l = this.eval(node.left, env), r = this.eval(node.right, env);
        switch (node.op) {
          case '==': return l == r;
          case '!=': return l != r;
          case '<': return l < r;
          case '>': return l > r;
          case '<=': return l <= r;
          case '>=': return l >= r;
          case 'in': return this.member(l, r);
          case 'notin': return !this.member(l, r);
          case 'is': return l === r;
          case 'isnot': return l !== r;
          default: return false;
        }
      }
      case 'sub': {
        const obj = this.eval(node.value, env);
        let idx = this.eval(node.index, env);
        if (typeof obj === 'string' || Array.isArray(obj)) {
          if (idx < 0) idx = obj.length + idx;
          return obj[idx];
        }
        return obj?.[idx];
      }
      case 'slice': {
        const obj = this.eval(node.value, env);
        const arr = typeof obj === 'string' ? [...obj] : (Array.isArray(obj) ? obj : []);
        const n = arr.length;
        const norm = (v: any, def: number) => {
          if (v === null || v === undefined) return def;
          const x = this.eval(v, env);
          return x < 0 ? Math.max(0, n + x) : Math.min(n, x);
        };
        const start = norm(node.parts[0], 0);
        const end = norm(node.parts[1], n);
        return arr.slice(start, end);
      }
      case 'attr': {
        const obj = this.eval(node.value, env);
        return this.getAttr(obj, node.attr, env);
      }
      case 'call': return this.evalCall(node, env);
      default: return undefined;
    }
  }

  private member(needle: any, hay: any): boolean {
    if (typeof hay === 'string') return hay.includes(String(needle));
    if (Array.isArray(hay)) return hay.includes(needle);
    if (hay && typeof hay === 'object') return String(needle) in hay;
    return false;
  }

  private resolveName(id: string, env: Env): any {
    if (env.has(id)) return env.get(id);
    const builtins: Record<string, any> = {
      True: true, False: false, None: null,
      len: (x: any) => (typeof x === 'string' || Array.isArray(x)) ? x.length : (x && typeof x === 'object' ? Object.keys(x).length : 0),
      range: (...a: number[]) => {
        let start = 0, end = 0, step = 1;
        if (a.length === 1) end = a[0];
        else if (a.length >= 2) { start = a[0]; end = a[1]; if (a[2]) step = a[2]; }
        const out: number[] = [];
        if (step > 0) for (let i = start; i < end; i += step) out.push(i);
        else if (step < 0) for (let i = start; i > end; i += step) out.push(i);
        return out;
      },
      enumerate: (x: any) => this.toIterable(x).map((v, i) => [i, v]),
      list: (x?: any) => x ? this.toIterable(x) : [],
      dict: () => ({}),
      set: () => ({}),
      str: (x: any) => String(x),
      int: (x: any) => Math.trunc(Number(x)),
      float: (x: any) => Number(x),
      abs: (x: number) => Math.abs(x),
      max: (...a: any[]) => { const arr = a.length === 1 && a[0] !== null && typeof a[0] === 'object' || a.length === 1 && Array.isArray(a[0]) || a.length === 1 && typeof a[0] === 'string' ? this.toIterable(a[0]) : a; return Math.max(...arr); },
      min: (...a: any[]) => { const arr = a.length === 1 && a[0] !== null && typeof a[0] === 'object' || a.length === 1 && Array.isArray(a[0]) || a.length === 1 && typeof a[0] === 'string' ? this.toIterable(a[0]) : a; return Math.min(...arr); },
      sum: (x: any) => this.toIterable(x).reduce((s: number, v: any) => s + v, 0),
      sorted: (x: any) => [...this.toIterable(x)].sort((p, q) => (p < q ? -1 : p > q ? 1 : 0)),
      reversed: (x: any) => [...this.toIterable(x)].reverse(),
      ord: (c: string) => c.charCodeAt(0),
      chr: (n: number) => String.fromCharCode(n),
      bool: (x: any) => this.truthy(x),
      divmod: (a: number, b: number) => [Math.floor(a / b), a % b],
      pow: (a: number, b: number, m?: number) => m ? (a ** b) % m : a ** b,
      zip: (...arrs: any[]) => { const its = arrs.map(a => this.toIterable(a)); const n = Math.min(...its.map(a => a.length)); return Array.from({ length: n }, (_, i) => its.map(a => a[i])); },
      map: (f: any, x: any) => this.toIterable(x).map(v => f(v)),
      filter: (f: any, x: any) => this.toIterable(x).filter(v => f(v)),
      all: (x: any) => this.toIterable(x).every(v => this.truthy(v)),
      any: (x: any) => this.toIterable(x).some(v => this.truthy(v)),
    };
    return (builtins as any)[id];
  }

  private getAttr(obj: any, attr: string, env: Env): any {
    if (obj === null || obj === undefined) return undefined;
    // 列表方法
    if (Array.isArray(obj)) {
      const methods: Record<string, any> = {
        append: (v: any) => { obj.push(v); return null; },
        pop: (i?: number) => i === undefined ? obj.pop() : obj.splice(i < 0 ? obj.length + i : i, 1)[0],
        sort: (key?: any, reverse?: boolean) => {
          obj.sort((a, b) => {
            const ka = key ? key(a) : a, kb = key ? key(b) : b;
            return ka < kb ? -1 : ka > kb ? 1 : 0;
          });
          if (reverse) obj.reverse();
          return null;
        },
        reverse: () => { obj.reverse(); return null; },
        insert: (i: number, v: any) => { obj.splice(i, 0, v); return null; },
        remove: (v: any) => { const i = obj.indexOf(v); if (i >= 0) obj.splice(i, 1); return null; },
        index: (v: any) => obj.indexOf(v),
        count: (v: any) => obj.filter(x => x === v).length,
        copy: () => [...obj],
        extend: (x: any[]) => { obj.push(...x); return null; },
      };
      if (methods[attr]) return methods[attr];
      return (obj as any)[attr];
    }
    // 字符串方法
    if (typeof obj === 'string') {
      const smethods: Record<string, any> = {
        lower: () => obj.toLowerCase(), upper: () => obj.toUpperCase(),
        strip: () => obj.trim(), lstrip: () => obj.replace(/^\s+/, ''), rstrip: () => obj.replace(/\s+$/, ''),
        split: (sep?: string) => sep ? obj.split(sep) : obj.split(/\s+/),
        join: (arr: any) => this.toIterable(arr).join(obj),
        replace: (a: string, b: string) => obj.split(a).join(b),
        startswith: (p: string) => obj.startsWith(p), endswith: (p: string) => obj.endsWith(p),
        find: (p: string) => obj.indexOf(p), count: (p: string) => obj.split(p).length - 1,
        isdigit: () => /^\d+$/.test(obj), isalpha: () => /^[a-zA-Z]+$/.test(obj),
        format: (...a: any[]) => { let i = 0; return obj.replace(/\{\}/g, () => String(a[i++])); },
      };
      if (smethods[attr]) return smethods[attr];
      return (obj as any)[attr];
    }
    // 字典方法
    if (typeof obj === 'object') {
      const dmethods: Record<string, any> = {
        get: (k: any, d?: any) => (String(k) in obj ? obj[String(k)] : d),
        keys: () => Object.keys(obj), values: () => Object.values(obj),
        items: () => Object.entries(obj),
        pop: (k: any, d?: any) => { const v = String(k) in obj ? obj[String(k)] : d; delete obj[String(k)]; return v; },
        update: (x: any) => { Object.assign(obj, x); return null; },
        setdefault: (k: any, d: any) => { if (!(String(k) in obj)) obj[String(k)] = d; return obj[String(k)]; },
        add: (v: any) => { obj[String(v)] = true; return null; }, // set 近似
      };
      if (dmethods[attr]) return dmethods[attr];
      return obj[attr];
    }
    return (obj as any)[attr];
  }

  private evalBin(op: string, l: any, r: any): any {
    switch (op) {
      case '+': return Array.isArray(l) ? [...l, ...r] : l + r;
      case '-': return l - r;
      case '*': return typeof l === 'string' ? l.repeat(r) : l * r;
      case '/': return l / r;
      case '//': return Math.floor(l / r);
      case '%': return ((l % r) + r) % r; // Python 取模
      case '**': return l ** r;
      case '|': return l | r;
      case '^': return l ^ r;
      case '&': return l & r;
      case '<<': return l << r;
      case '>>': return l >> r;
      default: return undefined;
    }
  }

  private evalCall(node: any, env: Env): any {
    // 方法调用
    if (node.func.t === 'attr') {
      // self.method(...) → 解析器已将 self 从参数剥离，类方法以方法名存于环境，直接按名查找（支持递归/辅助方法）
      if (node.func.value?.t === 'name' && node.func.value.id === 'self') {
        const fn = env.get(node.func.attr);
        const selfArgs = node.args.map((a: any) => this.eval(a, env));
        if (typeof fn === 'function') return fn(...selfArgs);
        return undefined;
      }
      const obj = this.eval(node.func.value, env);
      const fn = this.getAttr(obj, node.func.attr, env);
      const args = node.args.map((a: any) => this.eval(a, env));
      if (typeof fn === 'function') return fn(...args);
      return undefined;
    }
    const fn = this.eval(node.func, env);
    const args = node.args.map((a: any) => this.eval(a, env));
    if (typeof fn === 'function') return fn(...args);
    return undefined;
  }
}

// ─── 主入口 ─────────────────────────────────────────────────────────────────

export function tracePythonSolution(code: string, args: any[], fnName?: string): TraceResult {
  code = stripDocstrings(code);
  const codeLines = code.split('\n');
  const lines = logicalLines(code);
  const ast = new PyParser(lines).parseProgram();

  // 收集所有候选主函数（class 方法 / 顶层 def）。
  // 很多题解会把辅助函数定义在主函数之前，因此不能只取第一个，
  // 应优先按测试用例的函数名 fnName 匹配，匹配不到再退回到第一个候选。
  const candidates: { name: string; params: string[]; body: PyStmt[]; line: number }[] = [];
  for (const stmt of ast) {
    if (stmt.t === 'class') {
      for (const m of stmt.body) {
        if (m.t === 'def') candidates.push({ name: m.name, params: m.params, body: m.body, line: m.line });
      }
    } else if (stmt.t === 'def') {
      candidates.push({ name: stmt.name, params: stmt.params, body: stmt.body, line: stmt.line });
    }
  }

  const matched = (fnName && candidates.find(c => c.name === fnName)) ?? candidates[0];
  if (!matched) throw new Error('未找到题解主函数');
  const mainName = matched.name;
  const mainParams = matched.params;
  const mainBody = matched.body;
  const mainLine = matched.line;

  const interp = new PyInterpreter(code);
  const globalEnv = new Env(null);

  // 执行顶层定义（def / class / 全局常量赋值）
  for (const stmt of ast) {
    if (stmt.t === 'def') interp.exec(stmt, globalEnv);
    else if (stmt.t === 'class') interp.exec(stmt, globalEnv);
    else if (stmt.t === 'assign' || stmt.t === 'augassign') interp.exec(stmt, globalEnv);
  }

  const mainFn = globalEnv.get(mainName);
  if (typeof mainFn !== 'function') throw new Error(`函数 ${mainName} 未定义`);

  interp.steps.push({ line: mainLine, vars: {}, desc: `调用 ${mainName}(${args.map(a => stringify(a, 40)).join(', ')})` });

  let result: any;
  try {
    result = mainFn(...args);
  } catch (e) {
    if (e instanceof ReturnSignal) result = e.value;
    else throw e;
  }

  if (!interp.steps.some(s => s.done)) {
    interp.steps.push({ line: mainLine, vars: {}, desc: `返回 ${stringify(result)}`, done: true });
  }

  return { steps: interp.steps, result, codeLines, truncated: interp.truncated };
}
