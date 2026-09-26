/**
 * java-tracer.ts
 * 针对 LeetCode 题解的轻量 Java 解释器：逐语句执行，生成行号 + 变量快照步骤。
 * 支持常见子集：class/方法、类型声明、泛型、for/while/if、数组/ArrayList/HashMap、
 * 常用库方法（Arrays.sort、String、Math 等）、双大括号初始化。
 * 复用 solution-tracer 的 Env / 信号 / 工具函数。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Env, ReturnSignal, BreakSignal, ContinueSignal,
  deepCopy, stringify, type TraceStep, type TraceResult,
} from './solution-tracer';

// ─── 分词器 ─────────────────────────────────────────────────────────────────

interface JTok { type: 'name' | 'num' | 'str' | 'char' | 'op' | 'eof'; val: string; num?: number; line: number }

const JAVA_OPS = [
  '>>>', '<<=', '>>=', '&&', '||', '==', '!=', '<=', '>=', '++', '--', '+=', '-=', '*=', '/=', '%=',
  '&=', '|=', '^=', '->', '<<',
  '+', '-', '*', '/', '%', '=', '<', '>', '!', '~', '&', '|', '^', '?', ':',
  '(', ')', '[', ']', '{', '}', ',', '.', ';',
];

function tokenizeJava(src: string): JTok[] {
  const toks: JTok[] = [];
  let i = 0, line = 1;
  const n = src.length;
  const push = (type: JTok['type'], val: string, num?: number) => toks.push({ type, val, num, line });
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    // 注释
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
      i += 2; continue;
    }
    // 字符串
    if (c === '"') {
      let j = i + 1, s = '';
      while (j < n && src[j] !== '"') {
        if (src[j] === '\\') { s += unescape(src[j + 1]); j += 2; }
        else { if (src[j] === '\n') line++; s += src[j]; j++; }
      }
      push('str', s); i = j + 1; continue;
    }
    // 字符
    if (c === "'") {
      let j = i + 1, s = '';
      while (j < n && src[j] !== "'") {
        if (src[j] === '\\') { s += unescape(src[j + 1]); j += 2; }
        else { s += src[j]; j++; }
      }
      push('char', s); i = j + 1; continue;
    }
    // 数字
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1]))) {
      let j = i;
      while (j < n && /[0-9._xXa-fA-FlLdDfF]/.test(src[j])) j++;
      let raw = src.slice(i, j);
      raw = raw.replace(/[lLdDfF]$/, ''); // 去掉 long/double 后缀
      push('num', raw, Number(raw)); i = j; continue;
    }
    // 标识符
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < n && /[\w$]/.test(src[j])) j++;
      push('name', src.slice(i, j)); i = j; continue;
    }
    // 运算符（长优先）。'>' 始终单字符（'>>' 拆成两个 '>'，兼容嵌套泛型）
    let matched = false;
    for (const op of JAVA_OPS) {
      if (op === '>' ) continue; // '>' 单独处理
      if (src.startsWith(op, i)) { push('op', op); i += op.length; matched = true; break; }
    }
    if (!matched) {
      if (c === '>') { push('op', '>'); i++; }
      else i++; // 跳过未知字符
    }
  }
  toks.push({ type: 'eof', val: '', line });
  return toks;
}

function unescape(c: string): string {
  switch (c) {
    case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r';
    case '\\': return '\\'; case "'": return "'"; case '"': return '"';
    case '0': return '\0'; default: return c;
  }
}

// ─── 表达式解析器（递归下降） ───────────────────────────────────────────────

class JavaExprParser {
  toks: JTok[];
  pos = 0;
  constructor(toks: JTok[]) { this.toks = toks; }

  peek(o = 0): JTok { return this.toks[this.pos + o] ?? { type: 'eof', val: '', line: 0 }; }
  next(): JTok { return this.toks[this.pos++]; }
  isOp(v: string, o = 0): boolean { return this.peek(o).type === 'op' && this.peek(o).val === v; }
  eatOp(v: string): boolean { if (this.isOp(v)) { this.pos++; return true; } return false; }
  isName(v: string, o = 0): boolean { return this.peek(o).type === 'name' && this.peek(o).val === v; }

  parse(): any { return this.parseAssign(); }

  private parseAssign(): any {
    const left = this.parseTernary();
    const t = this.peek();
    if (t.type === 'op' && ['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='].includes(t.val)) {
      this.next();
      const value = this.parseAssign();
      return { t: 'assign', op: t.val, target: left, value };
    }
    return left;
  }
  private parseTernary(): any {
    const cond = this.parseOr();
    if (this.eatOp('?')) {
      const cons = this.parseAssign();
      this.eatOp(':');
      const alt = this.parseAssign();
      return { t: 'ternary', cond, cons, alt };
    }
    return cond;
  }
  private parseOr(): any {
    let l = this.parseAnd();
    while (this.isOp('||')) { this.next(); l = { t: 'logic', op: '||', left: l, right: this.parseAnd() }; }
    return l;
  }
  private parseAnd(): any {
    let l = this.parseBitOr();
    while (this.isOp('&&')) { this.next(); l = { t: 'logic', op: '&&', left: l, right: this.parseBitOr() }; }
    return l;
  }
  private parseBitOr(): any {
    let l = this.parseBitXor();
    while (this.isOp('|') && !this.isOp('||')) { this.next(); l = { t: 'bin', op: '|', left: l, right: this.parseBitXor() }; }
    return l;
  }
  private parseBitXor(): any {
    let l = this.parseBitAnd();
    while (this.isOp('^')) { this.next(); l = { t: 'bin', op: '^', left: l, right: this.parseBitAnd() }; }
    return l;
  }
  private parseBitAnd(): any {
    let l = this.parseEquality();
    while (this.isOp('&') && !this.isOp('&&')) { this.next(); l = { t: 'bin', op: '&', left: l, right: this.parseEquality() }; }
    return l;
  }
  private parseEquality(): any {
    let l = this.parseRelational();
    for (;;) {
      if (this.isOp('==') || this.isOp('!=')) {
        const op = this.next().val;
        l = { t: 'cmp', op, left: l, right: this.parseRelational() };
      } else break;
    }
    return l;
  }
  private parseRelational(): any {
    let l = this.parseShift();
    for (;;) {
      if (this.isOp('<') || this.isOp('>') || this.isOp('<=') || this.isOp('>=')) {
        const op = this.next().val;
        l = { t: 'cmp', op, left: l, right: this.parseShift() };
      } else if (this.isName('instanceof')) { this.next(); this.parseShift(); /* 忽略类型 */ }
      else break;
    }
    return l;
  }
  private parseShift(): any {
    let l = this.parseAdditive();
    while (this.isOp('<<') || this.isOp('>>>')) {
      const op = this.next().val;
      l = { t: 'bin', op, left: l, right: this.parseAdditive() };
    }
    return l;
  }
  private parseAdditive(): any {
    let l = this.parseMultiplicative();
    while (this.isOp('+') || this.isOp('-')) {
      const op = this.next().val;
      l = { t: 'bin', op, left: l, right: this.parseMultiplicative() };
    }
    return l;
  }
  private parseMultiplicative(): any {
    let l = this.parseUnary();
    while (this.isOp('*') || this.isOp('/') || this.isOp('%')) {
      const op = this.next().val;
      l = { t: 'bin', op, left: l, right: this.parseUnary() };
    }
    return l;
  }
  private parseUnary(): any {
    if (this.isOp('!') || this.isOp('~') || this.isOp('-') || this.isOp('+')) {
      const op = this.next().val;
      return { t: 'unary', op, operand: this.parseUnary() };
    }
    if (this.isOp('++') || this.isOp('--')) {
      const op = this.next().val;
      return { t: 'pre', op, operand: this.parseUnary() };
    }
    // 类型转换 (int) x
    if (this.isOp('(')) {
      const save = this.pos;
      this.next();
      if (this.peek().type === 'name' && PRIMITIVES.has(this.peek().val) && this.peek(1).type === 'op' && this.peek(1).val === ')') {
        this.next(); this.next(); // 吃掉 type 和 )
        return { t: 'cast', operand: this.parseUnary() };
      }
      this.pos = save;
    }
    return this.parsePostfix();
  }
  private parsePostfix(): any {
    let node = this.parsePrimary();
    for (;;) {
      if (this.isOp('(')) {
        this.next();
        const args: any[] = [];
        while (!this.isOp(')') && this.peek().type !== 'eof') {
          args.push(this.parseAssign());
          if (!this.eatOp(',')) break;
        }
        this.eatOp(')');
        node = { t: 'call', func: node, args };
      } else if (this.isOp('[')) {
        this.next();
        const index = this.parseAssign();
        this.eatOp(']');
        node = { t: 'sub', value: node, index };
      } else if (this.isOp('.')) {
        this.next();
        const attr = this.next().val;
        node = { t: 'attr', value: node, attr };
      } else if (this.isOp('++') || this.isOp('--')) {
        const op = this.next().val;
        node = { t: 'post', op, operand: node };
      } else break;
    }
    return node;
  }
  private parsePrimary(): any {
    const tok = this.peek();
    if (tok.type === 'num') { this.next(); return { t: 'num', value: tok.num }; }
    if (tok.type === 'str') { this.next(); return { t: 'str', value: tok.val }; }
    if (tok.type === 'char') { this.next(); return { t: 'char', value: tok.val }; }
    if (tok.type === 'name') {
      if (tok.val === 'true') { this.next(); return { t: 'bool', value: true }; }
      if (tok.val === 'false') { this.next(); return { t: 'bool', value: false }; }
      if (tok.val === 'null') { this.next(); return { t: 'null' }; }
      if (tok.val === 'new') return this.parseNew();
      this.next();
      return { t: 'name', id: tok.val };
    }
    if (this.isOp('(')) {
      this.next();
      const e = this.parseAssign();
      this.eatOp(')');
      return e;
    }
    // 容错
    this.next();
    return { t: 'num', value: 0 };
  }

  /** 解析 new 表达式 */
  private parseNew(): any {
    this.next(); // 'new'
    // 基础类型名（可能带包名前缀 a.b.C）
    let base = this.next().val;
    while (this.eatOp('.')) base = this.next().val;
    // 泛型
    if (this.isOp('<')) this.skipGenerics();
    // 数组
    if (this.isOp('[')) {
      this.next();
      if (this.isOp(']')) {
        // new int[]{...}
        this.next();
        this.eatOp('{');
        const elts: any[] = [];
        while (!this.isOp('}') && this.peek().type !== 'eof') {
          elts.push(this.parseAssign());
          if (!this.eatOp(',')) break;
        }
        this.eatOp('}');
        // 可能还有后续维度 []
        return { t: 'newarr', elts };
      }
      const size = this.parseAssign();
      this.eatOp(']');
      return { t: 'newsized', base, size };
    }
    // 构造器参数
    const args: any[] = [];
    if (this.eatOp('(')) {
      while (!this.isOp(')') && this.peek().type !== 'eof') {
        args.push(this.parseAssign());
        if (!this.eatOp(',')) break;
      }
      this.eatOp(')');
    }
    // 双大括号初始化 new HashMap<>() {{ ... }}
    let initBlock: any[] | null = null;
    if (this.isOp('{') && this.isOp('{', 1)) {
      this.next(); this.next(); // 吃掉 {{
      initBlock = [];
      // 解析内部语句直到 }}
      while (!(this.isOp('}') && this.isOp('}', 1)) && this.peek().type !== 'eof') {
        initBlock.push(this.parseInitStmt());
      }
      this.eatOp('}'); this.eatOp('}');
    }
    return { t: 'newobj', base, args, initBlock };
  }

  /** 双大括号内的简单语句（put(k,v); 等） */
  private parseInitStmt(): any {
    const e = this.parseAssign();
    this.eatOp(';');
    return e;
  }

  /** 跳过平衡的泛型 <...>（'>' 已被拆成单字符） */
  skipGenerics(): void {
    if (!this.isOp('<')) return;
    let depth = 0;
    for (;;) {
      const t = this.peek();
      if (t.type === 'eof') break;
      if (t.type === 'op' && t.val === '<') depth++;
      else if (t.type === 'op' && t.val === '>') { depth--; if (depth === 0) { this.next(); break; } }
      this.next();
    }
  }
}

const PRIMITIVES = new Set(['int', 'long', 'short', 'byte', 'char', 'boolean', 'double', 'float', 'void']);

function parseJavaExpr(toks: JTok[], start: number): { node: any; end: number } {
  const p = new JavaExprParser(toks);
  p.pos = start;
  const node = p.parse();
  return { node, end: p.pos };
}

// ─── 语句解析 ───────────────────────────────────────────────────────────────

interface JStmt { t: string; line: number; [k: string]: any }

class JavaParser {
  toks: JTok[];
  pos = 0;
  constructor(toks: JTok[]) { this.toks = toks; }

  peek(o = 0): JTok { return this.toks[this.pos + o] ?? { type: 'eof', val: '', line: 0 }; }
  next(): JTok { return this.toks[this.pos++]; }
  isOp(v: string, o = 0): boolean { return this.peek(o).type === 'op' && this.peek(o).val === v; }
  eatOp(v: string): boolean { if (this.isOp(v)) { this.pos++; return true; } return false; }
  isName(v: string, o = 0): boolean { return this.peek(o).type === 'name' && this.peek(o).val === v; }
  isKw(...kws: string[]): boolean { return this.peek().type === 'name' && kws.includes(this.peek().val); }

  /** 解析 class 体，返回方法列表 */
  parseClassMembers(): { name: string; params: { type: string; name: string }[]; body: JStmt[]; line: number }[] {
    const methods: any[] = [];
    // 跳过 class 名和可能的 extends/implements，直到 '{'
    while (!this.isOp('{') && this.peek().type !== 'eof') this.next();
    this.eatOp('{');
    while (!this.isOp('}') && this.peek().type !== 'eof') {
      const m = this.parseMember();
      if (m) methods.push(m);
    }
    this.eatOp('}');
    return methods;
  }

  private parseMember(): any {
    // 跳过修饰符
    while (this.isKw('public', 'private', 'protected', 'static', 'final', 'abstract', 'synchronized', 'native', 'strictfp')) this.next();
    // 注解 @Override
    if (this.isOp('@')) { this.next(); this.next(); }
    const line = this.peek().line;
    // 构造器：Name( ... ) { }（无返回类型）
    // 方法：Type name( ... ) { }
    // 字段：Type name [= ...] ;
    const save = this.pos;
    // 解析返回类型（可能是泛型/数组）
    this.parseType();
    // 方法名
    if (this.peek().type !== 'name') {
      // 可能是构造器（parseType 吃掉了名字）或出错；跳到下个 ';' 或 '}'
      this.pos = save;
      this.skipToMemberEnd();
      return null;
    }
    const name = this.next().val;
    if (this.isOp('(')) {
      // 方法
      this.next();
      const params: { type: string; name: string }[] = [];
      while (!this.isOp(')') && this.peek().type !== 'eof') {
        const ptype = this.parseType();
        // 可变参数 int... nums
        if (this.isOp('.') && this.isOp('.', 1) && this.isOp('.', 2)) { this.next(); this.next(); this.next(); }
        const pname = this.peek().type === 'name' ? this.next().val : '?';
        params.push({ type: ptype, name: pname });
        if (!this.eatOp(',')) break;
      }
      this.eatOp(')');
      // throws X, Y
      if (this.isKw('throws')) { while (!this.isOp('{') && this.peek().type !== 'eof') this.next(); }
      const body = this.parseBlock();
      return { name, params, body, line };
    }
    // 字段：跳到 ';'
    this.skipToMemberEnd();
    return null;
  }

  /** 解析类型，返回类型字符串（主要用于跳过） */
  private parseType(): string {
    let s = '';
    if (this.peek().type === 'name') { s += this.next().val; while (this.eatOp('.')) s += '.' + (this.peek().type === 'name' ? this.next().val : ''); }
    // 泛型
    if (this.isOp('<')) {
      let depth = 0;
      for (;;) {
        const t = this.peek();
        if (t.type === 'eof') break;
        if (t.type === 'op' && t.val === '<') depth++;
        else if (t.type === 'op' && t.val === '>') { depth--; this.next(); if (depth === 0) break; continue; }
        this.next();
      }
      s += '<…>';
    }
    // 数组 []
    while (this.isOp('[') && this.isOp(']', 1)) { this.next(); this.next(); s += '[]'; }
    return s;
  }

  private skipToMemberEnd(): void {
    // 跳到分号（字段）或配对的 '}'（构造器/初始化块）
    let depth = 0;
    while (this.peek().type !== 'eof') {
      if (this.isOp('{')) { depth++; this.next(); continue; }
      if (this.isOp('}')) {
        if (depth === 0) break;
        depth--; this.next();
        if (depth === 0) break;
        continue;
      }
      if (this.isOp(';') && depth === 0) { this.next(); break; }
      this.next();
    }
  }

  parseBlock(): JStmt[] {
    const stmts: JStmt[] = [];
    if (!this.eatOp('{')) return stmts;
    while (!this.isOp('}') && this.peek().type !== 'eof') {
      stmts.push(this.parseStmt());
    }
    this.eatOp('}');
    return stmts;
  }

  parseStmt(): JStmt {
    const line = this.peek().line;
    if (this.isOp('{')) {
      return { t: 'block', body: this.parseBlock(), line };
    }
    if (this.isKw('if')) return this.parseIf();
    if (this.isKw('for')) return this.parseFor();
    if (this.isKw('while')) {
      this.next();
      this.eatOp('(');
      const test = this.parseExprHere();
      this.eatOp(')');
      const body = this.parseStmtBody();
      return { t: 'while', test, body, line };
    }
    if (this.isKw('return')) {
      this.next();
      let value = null;
      if (!this.isOp(';')) value = this.parseExprHere();
      this.eatOp(';');
      return { t: 'return', value, line };
    }
    if (this.isKw('break')) { this.next(); this.eatOp(';'); return { t: 'break', line }; }
    if (this.isKw('continue')) { this.next(); this.eatOp(';'); return { t: 'continue', line }; }
    if (this.isOp(';')) { this.next(); return { t: 'empty', line }; }

    // 声明 or 表达式语句
    const decl = this.tryParseDeclaration();
    if (decl) return decl;
    const e = this.parseExprHere();
    this.eatOp(';');
    return { t: 'expr', value: e, line };
  }

  private parseStmtBody(): JStmt[] {
    if (this.isOp('{')) return this.parseBlock();
    return [this.parseStmt()];
  }

  private parseIf(): JStmt {
    const line = this.peek().line;
    this.next(); // 'if'
    this.eatOp('(');
    const test = this.parseExprHere();
    this.eatOp(')');
    const body = this.parseStmtBody();
    let orelse: JStmt[] = [];
    if (this.isKw('else')) {
      this.next();
      if (this.isKw('if')) orelse = [this.parseIf()];
      else orelse = this.parseStmtBody();
    }
    return { t: 'if', test, body, orelse, line };
  }

  private parseFor(): JStmt {
    const line = this.peek().line;
    this.next(); // 'for'
    this.eatOp('(');
    // 增强 for: for (Type x : arr)
    const save = this.pos;
    const maybeType = this.parseType();
    if (this.peek().type === 'name' && this.isOp(':', 1)) {
      const varName = this.next().val;
      this.eatOp(':');
      const iter = this.parseExprHere();
      this.eatOp(')');
      const body = this.parseStmtBody();
      return { t: 'foreach', varName, iter, body, line };
    }
    this.pos = save;
    // 经典 for: for (init; cond; update)
    let init: JStmt | null = null;
    if (!this.isOp(';')) {
      const d = this.tryParseDeclaration();
      if (d) init = d;
      else { init = { t: 'expr', value: this.parseExprHere(), line }; }
    }
    this.eatOp(';');
    let test: any = null;
    if (!this.isOp(';')) test = this.parseExprHere();
    this.eatOp(';');
    let update: any = null;
    if (!this.isOp(')')) update = this.parseExprHere();
    this.eatOp(')');
    const body = this.parseStmtBody();
    return { t: 'for', init, test, update, body, line };
  }

  /** 尝试解析变量声明；不是声明则返回 null（恢复位置） */
  private tryParseDeclaration(): JStmt | null {
    const save = this.pos;
    const line = this.peek().line;
    // var 关键字（Java 10+）
    if (this.isKw('var')) { this.next(); }
    else {
      this.parseType();
    }
    if (this.peek().type !== 'name') { this.pos = save; return null; }
    const firstName = this.next().val;
    if (!this.isOp('=') && !this.isOp(';') && !this.isOp(',')) { this.pos = save; return null; }
    // 是声明
    const decls: { name: string; init: any }[] = [];
    let curName = firstName;
    for (;;) {
      let init: any = null;
      if (this.eatOp('=')) init = this.parseExprHere();
      decls.push({ name: curName, init });
      if (this.eatOp(',')) {
        if (this.peek().type === 'name') curName = this.next().val;
        else break;
      } else break;
    }
    this.eatOp(';');
    return { t: 'decl', decls, line };
  }

  private parseExprHere(): any {
    const p = new JavaExprParser(this.toks);
    p.pos = this.pos;
    const node = p.parse();
    this.pos = p.pos;
    return node;
  }
}

// ─── 解释器 ─────────────────────────────────────────────────────────────────

const MAX_STEPS = 500;
const MAX_ITER = 200_000;
const MAX_CALL_DEPTH = 300;

class JavaInterpreter {
  steps: TraceStep[] = [];
  truncated = false;
  private iter = 0;
  private callDepth = 0;
  selfObj: any = null; // 双大括号初始化时的目标对象

  private guard() { if (++this.iter > MAX_ITER) throw new Error('执行超限（可能死循环）'); }

  private record(line: number, env: Env, desc: string, done = false) {
    if (this.steps.length >= MAX_STEPS) { this.truncated = true; return; }
    this.steps.push({ line, vars: deepCopy(env.collect()), desc, done });
  }

  execBody(body: JStmt[], env: Env) { for (const s of body) this.exec(s, env); }
  
    /** 调用一个已解析的类方法（支持同类辅助方法调用 / 递归），返回其返回值 */
    invokeMethod(method: { name: string; params: any[]; body: JStmt[]; line: number }, args: any[], globalEnv: Env): any {
      if (++this.callDepth > MAX_CALL_DEPTH) { this.callDepth--; throw new Error('递归过深（可能无限递归）'); }
      try {
        const fnEnv = new Env(globalEnv);
        method.params.forEach((p, i) => fnEnv.define(p.name, args[i]));
        this.record(method.line, fnEnv, `调用 ${method.name}(${args.map(a => stringify(a, 30)).join(', ')})`);
        try {
          this.execBody(method.body, fnEnv);
        } catch (e) {
          if (e instanceof ReturnSignal) return e.value;
          throw e;
        }
        return undefined;
      } finally {
        this.callDepth--;
      }
    }

  exec(node: JStmt, env: Env): void {
    this.guard();
    switch (node.t) {
      case 'decl': {
        const names: string[] = [];
        for (const d of node.decls) {
          const val = d.init ? this.eval(d.init, env) : this.defaultValue();
          env.define(d.name, val);
          names.push(`${d.name} = ${stringify(val)}`);
        }
        this.record(node.line, env, names.join(', '));
        break;
      }
      case 'expr': {
        const val = this.eval(node.value, env);
        const desc = this.describeExpr(node.value, val, env);
        if (desc) this.record(node.line, env, desc);
        break;
      }
      case 'if': {
        if (this.truthy(this.eval(node.test, env))) this.execBody(node.body, env);
        else if (node.orelse?.length) this.execBody(node.orelse, env);
        break;
      }
      case 'for': {
        const loopEnv = new Env(env);
        if (node.init) this.exec(node.init, loopEnv);
        while (node.test ? this.truthy(this.eval(node.test, loopEnv)) : true) {
          this.guard();
          this.record(node.line, loopEnv, 'for …');
          try { this.execBody(node.body, loopEnv); }
          catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) { /* fallthrough to update */ }
            else throw e;
          }
          if (node.update) this.eval(node.update, loopEnv);
        }
        break;
      }
      case 'foreach': {
        const iterable = this.toIterable(this.eval(node.iter, env));
        const loopEnv = new Env(env);
        for (const item of iterable) {
          this.guard();
          loopEnv.define(node.varName, item);
          this.record(node.line, loopEnv, `for ${node.varName} = ${stringify(item)}`);
          try { this.execBody(node.body, loopEnv); }
          catch (e) {
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
          this.record(node.line, env, 'while …');
          try { this.execBody(node.body, env); }
          catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        break;
      }
      case 'block': this.execBody(node.body, new Env(env)); break;
      case 'return': {
        const val = node.value ? this.eval(node.value, env) : undefined;
        this.record(node.line, env, `return ${stringify(val)}`, true);
        throw new ReturnSignal(val);
      }
      case 'break': throw new BreakSignal();
      case 'continue': throw new ContinueSignal();
      case 'empty': break;
      default: break;
    }
  }

  private defaultValue(): any { return 0; }

  /** 构造器第一个参数的值（用于 StringBuilder/String/Integer 等） */
  private arg0(node: any, env: Env): any {
    return node.args?.length ? this.eval(node.args[0], env) : '';
  }

  private truthy(v: any): boolean {
    if (v === null || v === undefined || v === false) return false;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    return true;
  }

  private toIterable(v: any): any[] {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') return [...v];
    if (v instanceof Map) return [...v.keys()];
    if (v instanceof Set) return [...v];
    return [];
  }

  private describeExpr(node: any, val: any, env: Env): string | null {
    if (node?.t === 'call' && node.func?.t === 'attr') {
      const objName = node.func.value?.id ?? '?';
      const m = node.func.attr;
      if (['add', 'put', 'push', 'pop', 'offer', 'poll', 'remove', 'sort', 'addLast', 'addFirst'].includes(m)) {
        const obj = this.eval(node.func.value, env);
        return `${objName}.${m}(...) → ${stringify(obj)}`;
      }
    }
    if (node?.t === 'assign' && node.target?.t === 'name') {
      return `${node.target.id} = ${stringify(val)}`;
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
      case 'char': return node.value;
      case 'bool': return node.value;
      case 'null': return null;
      case 'name': return env.get(node.id);
      case 'assign': {
        const val = this.eval(node.value, env);
        this.assignTo(node.target, val, env, node.op);
        return val;
      }
      case 'ternary': return this.truthy(this.eval(node.cond, env)) ? this.eval(node.cons, env) : this.eval(node.alt, env);
      case 'logic': {
        if (node.op === '&&') { const l = this.eval(node.left, env); return this.truthy(l) ? this.eval(node.right, env) : l; }
        const l = this.eval(node.left, env); return this.truthy(l) ? l : this.eval(node.right, env);
      }
      case 'bin': return this.evalBin(node.op, this.eval(node.left, env), this.eval(node.right, env));
      case 'cmp': {
        const l = this.eval(node.left, env), r = this.eval(node.right, env);
        switch (node.op) {
          case '==': return l === r || (typeof l === 'string' && typeof r === 'string' && l === r);
          case '!=': return !(l === r);
          case '<': return l < r; case '>': return l > r;
          case '<=': return l <= r; case '>=': return l >= r;
          default: return false;
        }
      }
      case 'unary': {
        const v = this.eval(node.operand, env);
        if (node.op === '!') return !this.truthy(v);
        if (node.op === '-') return -v;
        if (node.op === '+') return +v;
        if (node.op === '~') return ~v;
        return v;
      }
      case 'pre': {
        const cur = this.eval(node.operand, env);
        const nv = node.op === '++' ? cur + 1 : cur - 1;
        this.assignTo(node.operand, nv, env, '=');
        return nv;
      }
      case 'post': {
        const cur = this.eval(node.operand, env);
        const nv = node.op === '++' ? cur + 1 : cur - 1;
        this.assignTo(node.operand, nv, env, '=');
        return cur;
      }
      case 'cast': return this.eval(node.operand, env);
      case 'sub': {
        const obj = this.eval(node.value, env);
        const idx = this.eval(node.index, env);
        if (obj instanceof Map) return obj.get(idx);
        return obj?.[idx];
      }
      case 'attr': {
        const obj = this.eval(node.value, env);
        return this.getAttr(obj, node.attr);
      }
      case 'call': return this.evalCall(node, env);
      case 'newarr': return node.elts.map((e: any) => this.eval(e, env));
      case 'newsized': {
        const size = this.eval(node.size, env);
        return new Array(size).fill(0);
      }
      case 'newobj': return this.construct(node, env);
      default: return undefined;
    }
  }

  private assignTo(target: any, value: any, env: Env, op: string): void {
    if (target.t === 'name') {
      if (op === '=') env.set(target.id, value);
      else env.set(target.id, this.evalBin(op.slice(0, -1), env.get(target.id), value));
      return;
    }
    if (target.t === 'sub') {
      const obj = this.eval(target.value, env);
      const idx = this.eval(target.index, env);
      if (obj instanceof Map) {
        if (op === '=') obj.set(idx, value);
        else obj.set(idx, this.evalBin(op.slice(0, -1), obj.get(idx), value));
      } else if (obj) {
        if (op === '=') obj[idx] = value;
        else obj[idx] = this.evalBin(op.slice(0, -1), obj[idx], value);
      }
      return;
    }
    if (target.t === 'attr') {
      const obj = this.eval(target.value, env);
      if (obj) obj[target.attr] = value;
    }
  }

  private evalBin(op: string, l: any, r: any): any {
    switch (op) {
      case '+': return (Array.isArray(l) ? l.join('') : (typeof l === 'string' ? l : l)) + (Array.isArray(r) ? r.join('') : r);
      case '-': return l - r;
      case '*': return l * r;
      case '/': return Math.trunc(l / r); // Java 整数除法
      case '%': return l % r;
      case '&': return l & r; case '|': return l | r; case '^': return l ^ r;
      case '<<': return l << r; case '>>': return l >> r; case '>>>': return l >>> r;
      default: return undefined;
    }
  }

  private getAttr(obj: any, attr: string): any {
    if (obj === null || obj === undefined) return undefined;
    if (Array.isArray(obj)) {
      if (attr === 'length') return obj.length;
      return undefined;
    }
    if (typeof obj === 'string') {
      if (attr === 'length') return obj.length;
      return undefined;
    }
    if (obj instanceof Map) { if (attr === 'size') return obj.size; return undefined; }
    if (obj instanceof Set) { if (attr === 'size') return obj.size; return undefined; }
    return (obj as any)[attr];
  }

  private evalCall(node: any, env: Env): any {
    const args = node.args.map((a: any) => this.eval(a, env));
    // 方法调用 obj.method(...)
    if (node.func.t === 'attr') {
      const base = node.func.value;
      // 静态调用 Arrays.sort / Math.max / Integer.parseInt 等
      if (base.t === 'name' && STATIC_CLASSES.has(base.id)) {
        return this.staticCall(base.id, node.func.attr, args, env);
      }
      const obj = this.eval(base, env);
      return this.methodCall(obj, node.func.attr, args);
    }
    // 裸函数调用
    if (node.func.t === 'name') {
      const name = node.func.id;
      // 双大括号初始化中的隐式 this.put(...)
      if (this.selfObj && !env.has(name)) {
        return this.methodCall(this.selfObj, name, args);
      }
      const fn = env.get(name);
      if (typeof fn === 'function') return fn(...args);
      return undefined;
    }
    return undefined;
  }

  private construct(node: any, env: Env): any {
    const base = node.base;
    let obj: any;
    if (['HashMap', 'LinkedHashMap', 'TreeMap', 'Hashtable'].includes(base)) obj = new Map();
    else if (['HashSet', 'TreeSet', 'LinkedHashSet'].includes(base)) obj = new Set();
    else if (['ArrayList', 'LinkedList', 'List', 'Deque', 'Stack', 'ArrayDeque', 'Queue', 'Vector'].includes(base)) obj = [];
    else if (base === 'StringBuilder' || base === 'StringBuffer') obj = { __sb: true, s: this.arg0(node, env) };
    else if (base === 'String') obj = this.arg0(node, env);
    else if (base === 'Integer' || base === 'Long' || base === 'Double') obj = Number(this.arg0(node, env));
    else obj = {};
    // 双大括号初始化
    if (node.initBlock) {
      const prevSelf = this.selfObj;
      this.selfObj = obj;
      try {
        for (const stmt of node.initBlock) this.eval(stmt, env);
      } finally { this.selfObj = prevSelf; }
    }
    return obj;
  }

  // ─── Java 库方法 ───
  private methodCall(obj: any, method: string, args: any[]): any {
    if (obj === null || obj === undefined) return undefined;
    // StringBuilder
    if (obj && typeof obj === 'object' && obj.__sb) {
      switch (method) {
        case 'append': obj.s += args.map(String).join(''); return obj;
        case 'toString': return obj.s;
        case 'length': return obj.s.length;
        case 'charAt': return obj.s[args[0]];
        case 'reverse': obj.s = [...obj.s].reverse().join(''); return obj;
        case 'insert': obj.s = obj.s.slice(0, args[0]) + String(args[1]) + obj.s.slice(args[0]); return obj;
        case 'deleteCharAt': obj.s = obj.s.slice(0, args[0]) + obj.s.slice(args[0] + 1); return obj;
        case 'setLength': obj.s = obj.s.slice(0, args[0]); return obj;
        default: return undefined;
      }
    }
    // 字符串
    if (typeof obj === 'string') {
      switch (method) {
        case 'length': return obj.length;
        case 'charAt': return obj[args[0]];
        case 'substring': return args.length === 1 ? obj.slice(args[0]) : obj.slice(args[0], args[1]);
        case 'indexOf': return obj.indexOf(args[0], args[1]);
        case 'lastIndexOf': return obj.lastIndexOf(args[0]);
        case 'equals': return obj === args[0];
        case 'equalsIgnoreCase': return obj.toLowerCase() === String(args[0]).toLowerCase();
        case 'toCharArray': return [...obj];
        case 'split': return obj.split(args[0] === ' ' ? /\s+/ : escapeRe(String(args[0])));
        case 'trim': return obj.trim();
        case 'toLowerCase': return obj.toLowerCase();
        case 'toUpperCase': return obj.toUpperCase();
        case 'replace': return obj.split(args[0]).join(args[1]);
        case 'replaceAll': return obj.replace(new RegExp(args[0], 'g'), args[1]);
        case 'startsWith': return obj.startsWith(args[0]);
        case 'endsWith': return obj.endsWith(args[0]);
        case 'isEmpty': return obj.length === 0;
        case 'contains': return obj.includes(args[0]);
        case 'compareTo': return obj < args[0] ? -1 : obj > args[0] ? 1 : 0;
        default: return undefined;
      }
    }
    // Map
    if (obj instanceof Map) {
      switch (method) {
        case 'put': obj.set(args[0], args[1]); return null;
        case 'get': return obj.get(args[0]);
        case 'getOrDefault': return obj.has(args[0]) ? obj.get(args[0]) : args[1];
        case 'containsKey': return obj.has(args[0]);
        case 'containsValue': return [...obj.values()].includes(args[0]);
        case 'keySet': return [...obj.keys()];
        case 'values': return [...obj.values()];
        case 'entrySet': return [...obj.entries()].map(([k, v]) => ({ getKey: () => k, getValue: () => v, key: k, value: v }));
        case 'size': return obj.size;
        case 'isEmpty': return obj.size === 0;
        case 'remove': { const v = obj.get(args[0]); obj.delete(args[0]); return v; }
        case 'putIfAbsent': if (!obj.has(args[0])) obj.set(args[0], args[1]); return obj.get(args[0]);
        default: return undefined;
      }
    }
    // Set
    if (obj instanceof Set) {
      switch (method) {
        case 'add': obj.add(args[0]); return true;
        case 'contains': return obj.has(args[0]);
        case 'remove': return obj.delete(args[0]);
        case 'size': return obj.size;
        case 'isEmpty': return obj.size === 0;
        default: return undefined;
      }
    }
    // 数组 / List / Deque / Stack
    if (Array.isArray(obj)) {
      switch (method) {
        case 'add': obj.push(args[0]); return true;
        case 'addAll': obj.push(...args[0]); return true;
        case 'get': return obj[args[0]];
        case 'set': { const old = obj[args[0]]; obj[args[0]] = args[1]; return old; }
        case 'size': return obj.length;
        case 'isEmpty': return obj.length === 0;
        case 'contains': return obj.includes(args[0]);
        case 'indexOf': return obj.indexOf(args[0]);
        case 'remove': {
          if (typeof args[0] === 'number' && args.length === 1 && Number.isInteger(args[0])) return obj.splice(args[0], 1)[0];
          const i = obj.indexOf(args[0]); if (i >= 0) obj.splice(i, 1); return i >= 0;
        }
        case 'push': obj.push(args[0]); return null;       // Deque.push → 当作栈
        case 'pop': return obj.pop();
        case 'peek': return obj[obj.length - 1];
        case 'offer': obj.push(args[0]); return true;
        case 'poll': return obj.shift();
        case 'addFirst': obj.unshift(args[0]); return null;
        case 'addLast': obj.push(args[0]); return null;
        case 'getFirst': return obj[0];
        case 'getLast': return obj[obj.length - 1];
        case 'clear': obj.length = 0; return null;
        case 'subList': return obj.slice(args[0], args[1]);
        case 'toArray': return [...obj];
        case 'sort': obj.sort((a, b) => a - b); return null;
        default: return undefined;
      }
    }
    return undefined;
  }

  private staticCall(cls: string, method: string, args: any[], env: Env): any {
    if (cls === 'Arrays') {
      switch (method) {
        case 'sort': {
          const a = args[0];
          if (Array.isArray(a)) a.sort((x, y) => (typeof x === 'number' ? x - y : (x < y ? -1 : x > y ? 1 : 0)));
          return null;
        }
        case 'fill': { const a = args[0]; if (Array.isArray(a)) a.fill(args[1]); return null; }
        case 'copyOf': return Array.isArray(args[0]) ? args[0].slice(0, args[1]) : [];
        case 'asList': return [...args];
        case 'toString': return stringify(args[0]);
        case 'equals': return JSON.stringify(args[0]) === JSON.stringify(args[1]);
        case 'stream': return args[0];
        default: return undefined;
      }
    }
    if (cls === 'Math') {
      switch (method) {
        case 'max': return Math.max(...args); case 'min': return Math.min(...args);
        case 'abs': return Math.abs(args[0]); case 'pow': return Math.pow(args[0], args[1]);
        case 'sqrt': return Math.sqrt(args[0]); case 'floor': return Math.floor(args[0]);
        case 'ceil': return Math.ceil(args[0]); case 'round': return Math.round(args[0]);
        default: return undefined;
      }
    }
    if (cls === 'Integer' || cls === 'Long' || cls === 'Double' || cls === 'Float') {
      switch (method) {
        case 'parseInt': case 'valueOf': case 'parseIntRadix': return Number(args[0]);
        case 'toString': return String(args[0]);
        case 'MAX_VALUE': return Number.MAX_SAFE_INTEGER;
        case 'MIN_VALUE': return Number.MIN_SAFE_INTEGER;
        default: return undefined;
      }
    }
    if (cls === 'String') {
      if (method === 'valueOf') return String(args[0]);
      if (method === 'format') return String(args[1]);
      return undefined;
    }
    if (cls === 'Character') {
      switch (method) {
        case 'isDigit': return /\d/.test(String(args[0]));
        case 'isLetter': return /[a-zA-Z]/.test(String(args[0]));
        case 'isLetterOrDigit': return /[a-zA-Z0-9]/.test(String(args[0]));
        case 'isWhitespace': return /\s/.test(String(args[0]));
        case 'toUpperCase': return String(args[0]).toUpperCase();
        case 'toLowerCase': return String(args[0]).toLowerCase();
        case 'getNumericValue': return parseInt(String(args[0]), 36);
        default: return undefined;
      }
    }
    if (cls === 'Collections') {
      switch (method) {
        case 'sort': { const a = args[0]; if (Array.isArray(a)) a.sort((x, y) => x - y); return null; }
        case 'reverse': { const a = args[0]; if (Array.isArray(a)) a.reverse(); return null; }
        case 'max': return Math.max(...(args[0] as number[]));
        case 'min': return Math.min(...(args[0] as number[]));
        case 'emptyList': return [];
        default: return undefined;
      }
    }
    return undefined;
  }
}

const STATIC_CLASSES = new Set(['Arrays', 'Math', 'Integer', 'Long', 'Double', 'Float', 'String', 'Character', 'Collections', 'Boolean']);

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── 主入口 ─────────────────────────────────────────────────────────────────

/**
 * 追踪 Java 题解执行。
 * 从代码中提取 class，找到与 fnName 匹配的方法并执行。
 * 忽略 class 之外的内容（数据中偶有 Java 字段混入 JS 代码）。
 */
export function traceJavaSolution(code: string, fnName: string, args: any[]): TraceResult {
  const codeLines = code.split('\n');
  const toks = tokenizeJava(code);
  const parser = new JavaParser(toks);

  // 找到所有 class，解析其方法
  let methods: { name: string; params: any[]; body: JStmt[]; line: number }[] = [];
  for (let i = 0; i < toks.length; i++) {
    if (toks[i].type === 'name' && toks[i].val === 'class') {
      parser.pos = i + 1;
      try { methods = methods.concat(parser.parseClassMembers()); } catch { /* 忽略解析失败的 class */ }
      i = parser.pos;
    }
  }
  if (methods.length === 0) throw new Error('未找到 Java 类方法');

  // 优先匹配测试用例的函数名，否则取第一个方法
  const main = methods.find(m => m.name === fnName) ?? methods[0];

  const interp = new JavaInterpreter();
  const globalEnv = new Env(null);

  // 将同类的所有方法注册为可调用函数，支持辅助方法调用（如 oneInsert）与递归
  for (const m of methods) {
    globalEnv.define(m.name, (...callArgs: any[]) => interp.invokeMethod(m, callArgs, globalEnv));
  }

  interp.steps.push({
    line: main.line,
    vars: {},
    desc: `调用 ${main.name}(${args.map(a => stringify(a, 40)).join(', ')})`,
  });

  // 绑定参数
  const fnEnv = new Env(globalEnv);
  main.params.forEach((p, i) => fnEnv.define(p.name, args[i]));

  let result: any;
  try {
    interp.execBody(main.body, fnEnv);
  } catch (e) {
    if (e instanceof ReturnSignal) result = e.value;
    else throw e;
  }

  // StringBuilder 结果转字符串
  if (result && typeof result === 'object' && result.__sb) result = result.s;

  if (!interp.steps.some(s => s.done)) {
    interp.steps.push({ line: main.line, vars: {}, desc: `返回 ${stringify(result)}`, done: true });
  }

  return { steps: interp.steps, result, codeLines, truncated: interp.truncated };
}
