/**
 * solution-tracer.ts
 * 基于 acorn AST 的轻量 JavaScript 解释器，逐语句执行 LeetCode 题解代码，
 * 生成带行号 + 变量快照的执行步骤序列，供可视化播放器使用。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { parse } from 'acorn';
import tsBlankSpace from 'ts-blank-space';

// ─── 公共类型 ───────────────────────────────────────────────────────────────

export interface TraceStep {
  /** 当前执行行（1-based） */
  line: number;
  /** 变量快照（深拷贝） */
  vars: Record<string, any>;
  /** 步骤描述 */
  desc: string;
  /** 是否为最终结果步骤 */
  done?: boolean;
}

export interface TraceResult {
  steps: TraceStep[];
  /** 函数返回值 */
  result: any;
  codeLines: string[];
  /** 是否因步数上限被截断 */
  truncated: boolean;
}

// ─── 执行信号 ───────────────────────────────────────────────────────────────

class ReturnSignal { constructor(public value: any) {} }
class BreakSignal {}
class ContinueSignal {}
export { ReturnSignal, BreakSignal, ContinueSignal };

// ─── 环境（作用域链） ───────────────────────────────────────────────────────

export class Env {
  private vars = new Map<string, any>();
  constructor(public parent: Env | null = null) {}

  get(name: string): any {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- 需沿作用域链向上遍历
    let e: Env | null = this;
    while (e) {
      if (e.vars.has(name)) return e.vars.get(name);
      e = e.parent;
    }
    return undefined;
  }

  has(name: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- 需沿作用域链向上遍历
    let e: Env | null = this;
    while (e) {
      if (e.vars.has(name)) return true;
      e = e.parent;
    }
    return false;
  }

  set(name: string, value: any): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- 需沿作用域链向上遍历
    let e: Env | null = this;
    while (e) {
      if (e.vars.has(name)) { e.vars.set(name, value); return; }
      e = e.parent;
    }
    this.vars.set(name, value);
  }

  define(name: string, value: any): void {
    this.vars.set(name, value);
  }

  /** 收集当前作用域链中所有用户变量（排除函数/内置对象） */
  collect(): Record<string, any> {
    const out: Record<string, any> = {};
    const chain: Env[] = [];
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- 需沿作用域链向上遍历
    let e: Env | null = this;
    while (e) { chain.push(e); e = e.parent; }
    // 从外层到内层，内层覆盖外层
    for (let i = chain.length - 1; i >= 0; i--) {
      for (const [k, v] of chain[i].vars) {
        if (k.startsWith('__') || k === 'arguments') continue;
        if (typeof v === 'function') continue;
        out[k] = v;
      }
    }
    return out;
  }
}

// ─── 工具函数 ───────────────────────────────────────────────────────────────

export function deepCopy(v: any, depth = 0): any {
  if (v === null || typeof v !== 'object') return v;
  if (depth > 4) return Array.isArray(v) ? `[…${v.length}]` : '{…}';
  if (Array.isArray(v)) return v.map(x => deepCopy(x, depth + 1));
  const out: Record<string, any> = {};
  for (const k of Object.keys(v)) out[k] = deepCopy(v[k], depth + 1);
  return out;
}

export function stringify(v: any, maxLen = 60): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'function') return 'ƒ';
  try {
    const s = JSON.stringify(v);
    return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s;
  } catch { return String(v); }
}

// ─── 解释器 ─────────────────────────────────────────────────────────────────

const MAX_STEPS = 500;
const MAX_ITERATIONS = 200_000;

class Interpreter {
  steps: TraceStep[] = [];
  truncated = false;
  private source: string;
  private iterCount = 0;
  /** 换行位置数组：lineStarts[i] 为第 i+1 行的起始下标 */
  private lineStarts: number[] = [];

  constructor(source: string) {
    this.source = source;
    this.lineStarts = [0];
    for (let i = 0; i < source.length; i++) {
      if (source[i] === '\n') this.lineStarts.push(i + 1);
    }
  }

  private src(node: any): string {
    const s = this.source.slice(node.start, node.end);
    return s.length > 40 ? s.slice(0, 39) + '…' : s;
  }

  private record(line: number, env: Env, desc: string, done = false) {
    if (this.steps.length >= MAX_STEPS) { this.truncated = true; return; }
    this.steps.push({ line, vars: deepCopy(env.collect()), desc, done });
  }

  private guard() {
    if (++this.iterCount > MAX_ITERATIONS) throw new Error('执行超限（可能存在死循环）');
  }

  // ─── 语句执行 ───

  execBody(body: any[], env: Env): void {
    for (const stmt of body) this.exec(stmt, env);
  }

  exec(node: any, env: Env): void {
    this.guard();
    switch (node.type) {
      case 'VariableDeclaration': {
        for (const decl of node.declarations) {
          const val = decl.init ? this.eval(decl.init, env) : undefined;
          const names = this.bindPattern(decl.id, val, env);
          // 函数声明不记录步骤（噪音）
          if (typeof val === 'function') continue;
          const line = this.lineOf(decl);
          this.record(line, env, names.length === 1 ? `${names[0]} = ${stringify(val)}` : `${names.join(', ')} 声明`);
        }
        break;
      }
      case 'ExpressionStatement': {
        const val = this.eval(node.expression, env);
        const line = this.lineOf(node);
        const desc = this.describeExpr(node.expression, val, env);
        if (desc) this.record(line, env, desc);
        break;
      }
      case 'IfStatement': {
        const test = this.eval(node.test, env);
        if (test) {
          this.exec(this.toBlock(node.consequent), env);
        } else if (node.alternate) {
          this.exec(this.toBlock(node.alternate), env);
        }
        break;
      }
      case 'ForStatement': {
        const loopEnv = new Env(env);
        if (node.init) {
          if (node.init.type === 'VariableDeclaration') this.exec(node.init, loopEnv);
          else this.eval(node.init, loopEnv);
        }
        while (!node.test || this.eval(node.test, loopEnv)) {
          this.guard();
          this.record(this.lineOf(node), loopEnv, `循环迭代 ${this.src(node.test || node)}`);
          try {
            this.exec(this.toBlock(node.body), loopEnv);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) { /* fall through to update */ }
            else throw e;
          }
          if (node.update) this.eval(node.update, loopEnv);
        }
        break;
      }
      case 'WhileStatement': {
        while (this.eval(node.test, env)) {
          this.guard();
          this.record(this.lineOf(node), env, `while ${this.src(node.test)}`);
          try {
            this.exec(this.toBlock(node.body), env);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        break;
      }
      case 'DoWhileStatement': {
        do {
          this.guard();
          try {
            this.exec(this.toBlock(node.body), env);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        } while (this.eval(node.test, env));
        break;
      }
      case 'ForInStatement': {
        const obj = this.eval(node.right, env);
        const loopEnv = new Env(env);
        for (const key in obj) {
          this.guard();
          this.bindPattern(node.left, key, loopEnv);
          this.record(this.lineOf(node), loopEnv, `for-in key=${key}`);
          try {
            this.exec(this.toBlock(node.body), loopEnv);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        break;
      }
      case 'ForOfStatement': {
        const iter = this.eval(node.right, env);
        const loopEnv = new Env(env);
        for (const item of iter) {
          this.guard();
          this.bindPattern(node.left, item, loopEnv);
          this.record(this.lineOf(node), loopEnv, `for-of item=${stringify(item)}`);
          try {
            this.exec(this.toBlock(node.body), loopEnv);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        break;
      }
      case 'ReturnStatement': {
        const val = node.argument ? this.eval(node.argument, env) : undefined;
        this.record(this.lineOf(node), env, `return ${stringify(val)}`, true);
        throw new ReturnSignal(val);
      }
      case 'BreakStatement': throw new BreakSignal();
      case 'ContinueStatement': throw new ContinueSignal();
      case 'BlockStatement': {
        const blockEnv = new Env(env);
        this.execBody(node.body, blockEnv);
        break;
      }
      case 'FunctionDeclaration': {
        env.define(node.id.name, this.makeFunction(node, env));
        break;
      }
      case 'EmptyStatement': break;
      case 'SwitchStatement': {
        const disc = this.eval(node.discriminant, env);
        let matched = false;
        let broke = false;
        for (const cs of node.cases) {
          if (!matched && cs.test !== null) {
            if (this.eval(cs.test, env) === disc) matched = true;
            else continue;
          }
          if (!matched && cs.test === null) matched = true; // fallthrough to default
          if (matched) {
            try {
              for (const s of cs.consequent) this.exec(s, env);
            } catch (e) {
              if (e instanceof BreakSignal) { broke = true; break; }
              throw e;
            }
          }
        }
        void broke;
        break;
      }
      case 'LabeledStatement':
        this.exec(node.body, env);
        break;
      case 'ThrowStatement':
        throw this.eval(node.argument, env);
      case 'TryStatement': {
        try {
          this.exec(node.block, env);
        } catch (e) {
          if (e instanceof ReturnSignal || e instanceof BreakSignal || e instanceof ContinueSignal) throw e;
          if (node.handler) {
            const catchEnv = new Env(env);
            if (node.handler.param) this.bindPattern(node.handler.param, e instanceof Error ? e.message : e, catchEnv);
            this.execBody(node.handler.body.body, catchEnv);
          }
        } finally {
          if (node.finalizer) this.exec(node.finalizer, env);
        }
        break;
      }
      default:
        // 未知语句类型，尝试作为表达式求值
        if (node.type.endsWith('Statement')) break;
        this.eval(node, env);
    }
  }

  private toBlock(node: any): any {
    return node.type === 'BlockStatement' ? node : { type: 'BlockStatement', body: [node] };
  }

  private lineOf(node: any): number {
    // 二分查找最后一个 <= node.start 的换行位置，+1 即行号（O(log n)）
    const pos = node.start;
    let lo = 0, hi = this.lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.lineStarts[mid] <= pos) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  }

  /** 解构绑定模式，返回绑定的变量名列表 */
  private bindPattern(pattern: any, value: any, env: Env): string[] {
    switch (pattern.type) {
      case 'VariableDeclaration': {
        // for-of / for-in 的 `const x of ...`：node.left 是 VariableDeclaration
        const names: string[] = [];
        for (const decl of pattern.declarations) {
          names.push(...this.bindPattern(decl.id, value, env));
        }
        return names;
      }
      case 'Identifier':
        env.define(pattern.name, value);
        return [pattern.name];
      case 'ObjectPattern': {
        const names: string[] = [];
        for (const prop of pattern.properties) {
          if (prop.type === 'RestElement') {
            const rest: Record<string, any> = { ...value };
            for (const p2 of pattern.properties) {
              if (p2.type === 'Property') delete rest[p2.key.name || p2.key.value];
            }
            names.push(...this.bindPattern(prop.argument, rest, env));
          } else {
            const key = prop.key.name ?? prop.key.value;
            names.push(...this.bindPattern(prop.value, value?.[key], env));
          }
        }
        return names;
      }
      case 'ArrayPattern': {
        const names: string[] = [];
        let idx = 0;
        for (const el of pattern.elements) {
          if (!el) { idx++; continue; }
          if (el.type === 'RestElement') {
            names.push(...this.bindPattern(el.argument, (value ?? []).slice(idx), env));
          } else {
            names.push(...this.bindPattern(el, value?.[idx], env));
            idx++;
          }
        }
        return names;
      }
      case 'AssignmentPattern':
        return this.bindPattern(pattern.left, value === undefined ? this.eval(pattern.right, env) : value, env);
      case 'MemberExpression':
        this.assignMember(pattern, value, env);
        return [];
      default:
        return [];
    }
  }

  // ─── 函数 ───

  makeFunction(node: any, closure: Env): any {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- 普通函数闭包内需要访问解释器实例
    const interp = this;
    const params = node.params;
    const body = node.body;
    const isExpr = body.type !== 'BlockStatement';

    const fn = function (this: any, ...args: any[]) {
      const fnEnv = new Env(closure);
      params.forEach((p: any, i: number) => {
        interp.bindPattern(p, args[i], fnEnv);
      });
      // arguments 对象
      fnEnv.define('arguments', args);
      if (isExpr) {
        return interp.eval(body, fnEnv);
      }
      try {
        interp.execBody(body.body, fnEnv);
      } catch (e) {
        if (e instanceof ReturnSignal) return e.value;
        throw e;
      }
      return undefined;
    };
    // 保留函数名
    if (node.id?.name) Object.defineProperty(fn, 'name', { value: node.id.name });
    return fn;
  }

  // ─── 表达式求值 ───

  eval(node: any, env: Env): any {
    this.guard();
    switch (node.type) {
      case 'Literal':
        // BigInt 字面量（1n）：acorn 把值存在 node.bigint，node.value 为 null
        if (node.bigint !== undefined) return BigInt(node.bigint);
        return node.value;
      case 'TemplateLiteral': {
        let s = '';
        for (let i = 0; i < node.quasis.length; i++) {
          s += node.quasis[i].value.cooked;
          if (i < node.expressions.length) s += String(this.eval(node.expressions[i], env));
        }
        return s;
      }
      case 'Identifier':
        if (node.name === 'undefined') return undefined;
        if (node.name === 'NaN') return NaN;
        if (node.name === 'Infinity') return Infinity;
        if (env.has(node.name)) return env.get(node.name);
        // 不回落 globalThis，避免把 window/document/localStorage 等泄漏进被追踪程序
        return this.getBuiltin(node.name);
      case 'AssignmentExpression':
        return this.evalAssignment(node, env);
      case 'BinaryExpression':
        return this.evalBinary(node.operator, this.eval(node.left, env), this.eval(node.right, env));
      case 'LogicalExpression': {
        const l = this.eval(node.left, env);
        if (node.operator === '&&') return l ? this.eval(node.right, env) : l;
        if (node.operator === '||') return l ? l : this.eval(node.right, env);
        return l ?? this.eval(node.right, env); // ??
      }
      case 'UnaryExpression': {
        if (node.operator === 'typeof') {
          try { return typeof this.eval(node.argument, env); } catch { return 'undefined'; }
        }
        const v = this.eval(node.argument, env);
        switch (node.operator) {
          case '-': return -v;
          case '+': return +v;
          case '!': return !v;
          case '~': return ~v;
          case 'void': return undefined;
          default: return v;
        }
      }
      case 'UpdateExpression': {
        const old = this.eval(node.argument, env);
        const next = node.operator === '++' ? old + 1 : old - 1;
        this.assign(node.argument, next, env);
        return node.prefix ? next : old;
      }
      case 'ConditionalExpression':
        return this.eval(node.test, env) ? this.eval(node.consequent, env) : this.eval(node.alternate, env);
      case 'MemberExpression': {
        const obj = this.eval(node.object, env);
        const prop = node.computed ? this.eval(node.property, env) : node.property.name;
        if (obj === null || obj === undefined) return undefined;
        const val = obj[prop];
        return typeof val === 'function' ? val.bind(obj) : val;
      }
      case 'OptionalMemberExpression': {
        const obj = this.eval(node.object, env);
        if (obj === null || obj === undefined) return undefined;
        const prop = node.computed ? this.eval(node.property, env) : node.property.name;
        const val = obj[prop];
        return typeof val === 'function' ? val.bind(obj) : val;
      }
      case 'CallExpression':
      case 'OptionalCallExpression':
        return this.evalCall(node, env);
      case 'NewExpression': {
        const ctor = this.eval(node.callee, env);
        const args = node.arguments.map((a: any) => this.eval(a, env));
        return new ctor(...args);
      }
      case 'ArrayExpression':
        return node.elements.map((el: any) =>
          el === null ? undefined :
          el.type === 'SpreadElement' ? this.eval(el.argument, env) :
          this.eval(el, env)
        ).flat();
      case 'ObjectExpression': {
        const obj: Record<string, any> = {};
        for (const prop of node.properties) {
          if (prop.type === 'SpreadElement') {
            Object.assign(obj, this.eval(prop.argument, env));
          } else {
            const key = prop.computed ? this.eval(prop.key, env) : (prop.key.name ?? prop.key.value);
            if (prop.kind === 'get' || prop.kind === 'set') continue;
            if (prop.value.type === 'FunctionExpression' || prop.value.type === 'ArrowFunctionExpression') {
              obj[key] = this.makeFunction(prop.value, env);
            } else {
              obj[key] = this.eval(prop.value, env);
            }
          }
        }
        return obj;
      }
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        return this.makeFunction(node, env);
      case 'SequenceExpression': {
        let v: any;
        for (const expr of node.expressions) v = this.eval(expr, env);
        return v;
      }
      case 'SpreadElement':
        return this.eval(node.argument, env);
      case 'TaggedTemplateExpression':
        return this.eval(node.quasi, env);
      case 'AwaitExpression':
        return this.eval(node.argument, env);
      case 'ChainExpression':
        return this.eval(node.expression, env);
      default:
        throw new Error(`不支持的表达式: ${node.type}`);
    }
  }

  private evalAssignment(node: any, env: Env): any {
    const rhs = this.eval(node.right, env);
    if (node.operator === '=') {
      this.assign(node.left, rhs, env);
      return rhs;
    }
    const lhs = this.eval(node.left, env);
    let result: any;
    switch (node.operator) {
      case '+=': result = lhs + rhs; break;
      case '-=': result = lhs - rhs; break;
      case '*=': result = lhs * rhs; break;
      case '/=': result = lhs / rhs; break;
      case '%=': result = lhs % rhs; break;
      case '**=': result = lhs ** rhs; break;
      case '&=': result = lhs & rhs; break;
      case '|=': result = lhs | rhs; break;
      case '^=': result = lhs ^ rhs; break;
      case '<<=': result = lhs << rhs; break;
      case '>>=': result = lhs >> rhs; break;
      case '>>>=': result = lhs >>> rhs; break;
      case '&&=': result = lhs && rhs; break;
      case '||=': result = lhs || rhs; break;
      case '??=': result = lhs ?? rhs; break;
      default: result = rhs;
    }
    this.assign(node.left, result, env);
    return result;
  }

  private assign(target: any, value: any, env: Env): void {
    if (target.type === 'Identifier') {
      env.set(target.name, value);
    } else if (target.type === 'MemberExpression' || target.type === 'OptionalMemberExpression') {
      this.assignMember(target, value, env);
    } else if (target.type === 'ObjectPattern' || target.type === 'ArrayPattern') {
      this.bindPattern(target, value, env);
    }
  }

  private assignMember(target: any, value: any, env: Env): void {
    const obj = this.eval(target.object, env);
    const prop = target.computed ? this.eval(target.property, env) : target.property.name;
    if (obj !== null && obj !== undefined) obj[prop] = value;
  }

  private evalBinary(op: string, l: any, r: any): any {
    switch (op) {
      case '+': return l + r;
      case '-': return l - r;
      case '*': return l * r;
      case '/': return l / r;
      case '%': return l % r;
      case '**': return l ** r;
      case '==': return l == r;
      case '!=': return l != r;
      case '===': return l === r;
      case '!==': return l !== r;
      case '<': return l < r;
      case '>': return l > r;
      case '<=': return l <= r;
      case '>=': return l >= r;
      case '&': return l & r;
      case '|': return l | r;
      case '^': return l ^ r;
      case '<<': return l << r;
      case '>>': return l >> r;
      case '>>>': return l >>> r;
      case 'in': return l in r;
      case 'instanceof': return l instanceof r;
      default: return undefined;
    }
  }

  private evalCall(node: any, env: Env): any {
    // 特殊处理：Math / JSON / console 等内置对象方法
    let fn: any;
    let thisArg: any = undefined;

    if (node.callee.type === 'MemberExpression' || node.callee.type === 'OptionalMemberExpression') {
      thisArg = this.eval(node.callee.object, env);
      if (thisArg === null || thisArg === undefined) {
        if (node.type === 'OptionalCallExpression') return undefined;
        throw new TypeError('Cannot read properties of null');
      }
      const prop = node.callee.computed ? this.eval(node.callee.property, env) : node.callee.property.name;
      fn = thisArg[prop];
      // 对内置方法绑定 this
      if (typeof fn === 'function') fn = fn.bind(thisArg);
    } else {
      fn = this.eval(node.callee, env);
    }

    if (typeof fn !== 'function') {
      throw new TypeError(`${this.src(node.callee)} 不是函数`);
    }

    // 展开参数
    const args: any[] = [];
    for (const a of node.arguments) {
      if (a.type === 'SpreadElement') args.push(...this.eval(a.argument, env));
      else args.push(this.eval(a, env));
    }

    return fn(...args);
  }

  private getBuiltin(name: string): any {
    const builtins: Record<string, any> = {
      Math, JSON, console: { log: () => {}, },
      parseInt, parseFloat, isNaN, isFinite,
      Array, Object, String, Number, Boolean,
      Map, Set, Infinity, NaN, undefined,
      BigInt,
    };
    return (builtins as any)[name];
  }

  /** 为赋值/调用等表达式生成步骤描述 */
  private describeExpr(node: any, val: any, env: Env): string | null {
    switch (node.type) {
      case 'AssignmentExpression':
        return `${this.src(node.left)} = ${stringify(this.eval(node.left, env))}`;
      case 'UpdateExpression':
        return `${this.src(node.argument)} → ${stringify(this.eval(node.argument, env))}`;
      case 'CallExpression': {
        // 只对 push/sort/splice 等有副作用的调用记录
        if (node.callee.type === 'MemberExpression') {
          const prop = node.callee.property?.name;
          if (['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill'].includes(prop)) {
            return `${this.src(node.callee)} → ${stringify(val)}`;
          }
        }
        return null;
      }
      default:
        return null;
    }
  }
}

// ─── 代码预处理（剥离 TypeScript 类型注解） ─────────────────────────────

/**
 * 许多“JavaScript”题解实际带有 TS 类型注解（如 nums: number[]）。
 * 先尝试直接解析纯 JS；失败时用 ts-blank-space 剥离类型（用空白替换，
 * 行列位置不变，保证行号与原始代码一致）。
 */
function prepareCode(code: string): string {
  try {
    parse(code, { ecmaVersion: 2022, sourceType: 'script' });
    return code;
  } catch {
    try {
      return tsBlankSpace(code);
    } catch {
      return code;
    }
  }
}

// ─── 主入口 ─────────────────────────────────────────────────────────────────

/**
 * 追踪执行一段题解代码。
 * @param code JavaScript 题解源码
 * @param args 函数调用参数（已解析好的 JS 值）
 */
export function traceSolution(code: string, args: any[], fnName?: string): TraceResult {
  // codeLines 用原始代码（供代码面板展示，保留类型注解可读性）；
  // 解析/执行用剥离后的代码（行号与原始代码一致）。
  const codeLines = code.split('\n');
  const executable = prepareCode(code);
  const ast: any = parse(executable, { ecmaVersion: 2022, sourceType: 'script' });

  // 收集所有候选主函数（顶层函数声明 / 赋值给变量的函数表达式 / 类方法）。
  // 很多题解会把辅助函数定义在主函数之前，因此不能只取第一个，
  // 应优先按测试用例的函数名 fnName 匹配，匹配不到再退回到第一个候选。
  const candidates: { name: string; node: any }[] = [];

  for (const stmt of ast.body) {
    if (stmt.type === 'FunctionDeclaration' && stmt.id) {
      candidates.push({ name: stmt.id.name, node: stmt });
    } else if (stmt.type === 'VariableDeclaration') {
      const decl = stmt.declarations[0];
      if (decl?.init && (decl.init.type === 'FunctionExpression' || decl.init.type === 'ArrowFunctionExpression')) {
        candidates.push({ name: decl.id.name, node: stmt });
      }
    } else if (stmt.type === 'ClassDeclaration' && stmt.body?.body?.length > 0) {
      for (const m of stmt.body.body) {
        if (m.type === 'MethodDefinition' && m.kind === 'method' && m.key?.name !== 'constructor') {
          candidates.push({ name: m.key.name, node: stmt });
        }
      }
    }
  }

  const matched = (fnName ? candidates.find(c => c.name === fnName) : undefined) ?? candidates[0];
  const mainName: string | null = matched?.name ?? null;
  const mainNode: any = matched?.node ?? null;

  if (!mainName) throw new Error('未找到题解主函数');

  const interp = new Interpreter(executable);
  const globalEnv = new Env(null);

  // 执行顶层声明
  for (const stmt of ast.body) {
    if (stmt.type === 'FunctionDeclaration') {
      globalEnv.define(stmt.id.name, interp.makeFunction(stmt, globalEnv));
    } else if (stmt.type === 'ClassDeclaration') {
      // 提取类方法为独立函数
      for (const m of stmt.body.body) {
        if (m.type === 'MethodDefinition' && m.kind === 'method' && m.key.name !== 'constructor') {
          globalEnv.define(m.key.name, interp.makeFunction(m.value, globalEnv));
        }
      }
    } else if (stmt.type === 'VariableDeclaration') {
      interp.exec(stmt, globalEnv);
    }
  }

  const mainFn = globalEnv.get(mainName);
  if (typeof mainFn !== 'function') throw new Error(`函数 ${mainName} 未定义`);

  // 记录初始步骤
  interp.steps.push({
    line: mainNode.loc?.start?.line ?? 1,
    vars: {},
    desc: `调用 ${mainName}(${args.map(a => stringify(a, 40)).join(', ')})`,
  });

  // 用行号记录初始步骤（重新计算）
  let startLine = 1;
  for (let i = 0; i < mainNode.start; i++) if (executable[i] === '\n') startLine++;
  interp.steps[0].line = startLine;

  // 执行主函数
  let result: any;
  try {
    result = mainFn(...args);
  } catch (e) {
    if (e instanceof ReturnSignal) {
      result = e.value;
    } else {
      throw e;
    }
  }

  // 最终步骤
  if (!interp.steps.some(s => s.done)) {
    interp.steps.push({
      line: startLine,
      vars: {},
      desc: `返回 ${stringify(result)}`,
      done: true,
    });
  }

  return { steps: interp.steps, result, codeLines, truncated: interp.truncated };
}

/**
 * 解析测试用例输入字符串，提取函数参数。
 * 例: "threeSum([-1,0,1,2,-1,-4])" → [-1,0,1,2,-1,-4][]
 */
export function parseTestInput(input: string): { fnName: string; args: any[] } {
  const m = input.match(/^(\w+)\(([\s\S]*)\)\s*$/);
  if (!m) throw new Error(`无法解析测试输入: ${input}`);
  const fnName = m[1];
  const argsStr = m[2].trim();
  if (!argsStr) return { fnName, args: [] };
  // 仅接受 JSON 字面量参数，避免用 new Function 求值任意代码
  try {
    const args = JSON.parse(`[${argsStr}]`);
    if (!Array.isArray(args)) throw new Error('参数不是数组');
    return { fnName, args };
  } catch {
    throw new Error(`无法解析参数（仅支持 JSON 字面量）: ${argsStr}`);
  }
}
