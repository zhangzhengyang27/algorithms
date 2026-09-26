# 项目地图 · 算法可视化学习平台

> 一份给「接手项目的工程师 / 后续 Agent」看的工程地图。面向个人学习者的算法可视化学习平台：可视化动画 + Markdown 教程 + 题库 + 进度追踪。
> 配套：`README.md`（快速开始）、`docs/lessons-learned-2026-07-28-tutorial-authoring.md`（内容工程方法论）、`docs/superpowers/`（设计 spec + 实施 plan）。

---

## 1. 它是什么

三大核心能力：

- **可视化**：90+ 个交互式可视化面板（排序 / 搜索 / 数组 / 链表 / 栈 / 队列 / 各类树 / 图论 / 动态规划 / 字符串 / 数论 / 计算几何…）。
- **教程**：`frontend/src/app/tutorials/` 下 90+ 个路由页，Markdown 渲染 + 跨文档跳转 + Mermaid 图 + Python/TS 双语。
- **题库 + 进度**：LeetCode 风格题目、笔记、学习进度（需登录）。

根目录的 `merge-sort-*.png` 等是可视化/教程页截图。

---

## 2. 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · Zustand · Monaco 编辑器 · Mermaid 11 |
| 后端 | NestJS 11 · Node 22 · Prisma 6 · PostgreSQL 17 · Passport/JWT · Swagger |
| 工程 | pnpm（前后端各自 lock 文件）· ESLint 9 · Jest / ts-jest |

---

## 3. 目录结构

```
algorithms/
├── frontend/
│   └── src/
│       ├── app/            # 页面路由
│       │   ├── page.tsx        # 首页
│       │   ├── tutorials/      # 90+ 教程路由页
│       │   ├── visualizer/     # 90+ 可视化路由页
│       │   ├── problems/       # 题库（~20）
│       │   ├── progress/       # 进度页
│       │   ├── login/ settings/
│       │   ├── globals.css  layout.tsx
│       ├── components/
│       │   ├── editor/        # Monaco 封装 code-editor.tsx
│       │   ├── tutorial/      # markdown-content / mermaid-diagram / related-resources / table-of-contents / tutorial-sidebar / code-tabs
│       │   ├── visualizer/    # ★ 90+ 个 *-panel.tsx + 引擎 stepper.tsx + code-panel.tsx
│       │   └── ui/            # main-layout / top-nav / theme-provider / solution-tabs
│       ├── lib/
│       │   ├── algorithms/    # graph.ts · searching.ts · sorting.ts · data-structures/ · *.test.ts
│       │   ├── visualizers/   # sorting-visualizer.ts（引擎辅助）
│       │   ├── api.ts  api-client.ts     # 前端 API 客户端（base = /api/v1）
│       │   ├── tutorial-resources.ts     # 跨文档跳转统一注册表
│       │   ├── tutorial-page.tsx  tutorial-list.ts
│       │   ├── mermaid-server.ts         # 服务端 mermaid 语法预校验
│       │   └── remark-code-tabs.ts
│       ├── store/  types/
├── backend/
│   └── src/
│       ├── main.ts          # 启动 + CORS + 全局 ValidationPipe + Swagger(/api/docs)
│       ├── app.module.ts
│       ├── common/          # guards/jwt-auth.guard.ts · decorators/current-user.decorator.ts
│       ├── prisma/          # prisma.service.ts
│       └── modules/
│           ├── auth/        # controller · service · module · strategies/jwt.strategy.ts
│           ├── tutorials/   # controller · service · module  （CRUD，读公开）
│           ├── problems/  categories/  progress/  notes/   # 各含 controller/service/module
│       └── prisma/          # schema.prisma · seed.ts · sync-tutorials.ts
└── docs/
    ├── lessons-learned-2026-07-28-tutorial-authoring.md
    └── superpowers/{plans,specs}/
```

---

## 4. 前端可视化引擎（重点）

核心文件：`frontend/src/components/visualizer/stepper.tsx`。这是所有可视化面板共用的**「帧预计算 + 播放器」**引擎。

### 4.1 Schema（在此文件内定义）

```ts
export interface VizStep<TState> {
  state: TState;          // 当前帧的状态快照
  description: string;    // 这一步的文字说明
  highlights?: string[];  // 高亮语义标签
  codeLine?: number;      // 联动高亮的代码行（双栏模式用）
}

interface BaseProps<TState> {
  steps: VizStep<TState>[];   // 全部步骤（预计算好的帧序列）
  initialState: TState;       // 初始态（显式，不要 null）
  render: (state: TState, step: VizStep<TState>) => ReactNode; // 渲染函数
  minValue?: number; maxValue?: number;
  headerActions?: ReactNode;  // 输入控件（文本框 / PlusMinusInput）
  codeLines?: string[];       // 双栏模式：左侧代码
  codeTitle?: string;
}
```

### 4.2 播放器 `Stepper<TState>`

通用组件，负责所有交互，各 panel 不再重复造轮子：

- 状态：`current`（当前帧索引）、`isPlaying`、`speed`（1000/500/250/100 ms = 0.5x/1x/2x/4x）。
- 自动播放：`useEffect` + `setTimeout(speed)` 逐帧推进，到末尾自动停止。
- 控件：播放/暂停、重置、上一步、下一步、速度下拉、进度条拖动（`input[type=range]`）。
- 渲染：调用 `render(state, step)` 画当前帧；若传了 `codeLines` 则切换为**双栏布局**，右侧 `<CodePanel>` 按 `step.codeLine` 高亮对应代码行（代码-动画联动）。

辅助组件：`PlusMinusInput`（调节输入长度）。

### 4.3 每个 panel 的标准范式（以 `array-panel.tsx` 为例）

1. 自定义 `TState`（如 `ArrayState`：cells/length/ptr/moving/highlightIdx/phase/message）。
2. 写**纯函数** `buildSteps(inputs): VizStep<TState>[]`，用本地 `snap()` 克隆 state 并 `steps.push(...)` 预计算所有帧。
3. Panel 组件内用 `useState` 持有输入（seed / 插入 / 删除等），`useMemo(() => buildSteps(...), [deps])` 算 `steps`，并构造 `initial`。
4. `<Stepper<ArrayState> steps={steps} initialState={initial} codeLines={...} headerActions={...} render={(state) => <.../>} />`。
5. `render` 内用 `clsx` 依据 `state` 字段（isPtr/isFrom/isTo/isHl…）给格子/节点上色。

> 关键设计：**「预计算全部帧，再像翻书一样来回翻」**，而非逐步 mutate。这保证了进度条可任意拖动、可重置、可被测试。

---

## 5. 后端架构（重点）

NestJS 模块化：`app.module.ts` 汇总 `AuthModule / TutorialsModule / ProblemsModule / CategoriesModule / ProgressModule / NotesModule` + 全局 `ConfigModule` + `PrismaService`。各业务模块均为标准 `controller/service/module` 三层；`problems/categories/progress/notes` 走公开或带 Guard 的 CRUD。

### 5.1 鉴权流程（auth 模块）

- 路由：`POST /auth/register`、`POST /auth/login`、`POST /auth/refresh`（需 `JwtAuthGuard`）。
- `AuthService`：
  - `register`：查重 → `bcrypt.hash(pw, 10)` → 建用户 → `generateToken`。
  - `login`：`bcrypt.compare` 校验 → `generateToken`。
  - `refresh`：由 `JwtAuthGuard` 注入的 `user.id` 重新签发。
  - `generateToken`：`jwtService.sign({ sub: userId })`；`sanitizeUser` 剥掉 `passwordHash`。
- `AuthModule`：`JwtModule.registerAsync`（secret 取 `JWT_SECRET`，过期取 `JWT_EXPIRES_IN` 默认 `7d`）。
- `JwtStrategy`：用 `ExtractJwt.fromAuthHeaderAsBearerToken()` 取 token，校验 `sub` → 查用户并剥 `passwordHash`。
- `JwtAuthGuard extends AuthGuard('jwt')`；`CurrentUser` 装饰器取 `request.user`。

> ✅ `jwt.strategy.ts` 的 `secretOrKey` 已改为 env 缺失即抛错（`throw`），不再回退 `'default-secret'`。

### 5.2 教程同步机制（git-as-CMS）

教程的**真相源是 git 里的 `.md` 文件**（`frontend/src/app/tutorials/*.md`），数据库 `Tutorial` 表只是派生缓存，供 API 查询。

脚本 `backend/prisma/sync-tutorials.ts`：

1. 扫描 `frontend/src/app/tutorials/*.md`，用首行 `# ` 解析标题。
2. 按 `CATEGORY_MAP`（slug → 中文分类名）归类；分类不存在则 `ensureCategory` 自动建。
3. 按 `TUTORIAL_ORDER` 数组下标赋 `order`（学习路径顺序）。
4. `prisma.tutorial.upsert({ where: { slug }, ... isPublished: true })` 写库。
5. 运行：`cd backend && npx ts-node prisma/sync-tutorials.ts`。

> ⚠️ 维护点：新增教程必须同步在 `sync-tutorials.ts` 的 `CATEGORY_MAP` 和 `TUTORIAL_ORDER` 里登记，否则分类/顺序会落默认。

---

## 6. 数据模型（Prisma，7 个 model）

`User` · `Category` · `Tutorial`（`contentMd` 存 Markdown）· `Problem`（`difficulty` EASY/MEDIUM/HARD；`examples/solutions/hints/testCases` 用 `Json`）· `Progress`（`status` NOT_STARTED/ATTEMPTING/COMPLETED，唯一约束 `[userId, problemId]`）· `Note`。关系支持「用户—题目—进度—笔记」闭环。

---

## 7. 前后端如何连接

- 前端 `:3000` → `lib/api.ts` 把请求拼到 `/api/v1` 前缀 → `next.config.ts` 的 `rewrites` 把 `/api/v1/*` 反向代理到后端 `:40001`。
- JWT 放在 `Authorization: Bearer <token>` 头；`api-client.ts` 封装 `TutorialsApi / ProblemsApi / CategoriesApi / ProgressApi / NotesApi / AuthApi`。
- 因走同源代理，**浏览器不直接跨域**，所以后端 `main.ts` 里 `CORS origin: 'http://localhost:4000'` 实际是冗余/遗留配置（前端跑在 3000）。

---

## 8. 已知不一致 / 待办（踩坑记录）

| # | 项 | 状态 |
|---|----|------|
| 1 | README 端口过时（原写后端 Swagger `3001`） | ✅ 已修正为 `40001` + 代理说明 |
| 2 | README 种子命令 `npx prisma db seed` 会失败（缺 `prisma.seed` 配置） | ✅ 已改为 `npm run prisma:seed` + 补教程同步步骤 |
| 3 | README 功能清单严重偏小（只写 6 排序 + 二分） | ✅ 已补「90+ 可视化面板」 |
| 4 | `jwt.strategy.ts` secret 缺失回退 `'default-secret'` | ✅ 已修复：缺失即抛错 |
| 5 | `api-client.ts` 的 `refresh` 期望返回 `{accessToken}`，但 `AuthService.refresh` 返回 `{token}` | ✅ 已修复：前端类型对齐为 `{ token, user }` |
| 6 | 后端 `main.ts` CORS origin `4000` 与实际 `3000` 不符 | ✅ 已修复：前端端口改 `4000`，与 CORS 对齐 |
| 7 | `frontend/frontend/` 疑似误建的嵌套目录 | ✅ 已删除（空目录） |

---

## 9. 常用命令（已核对）

```bash
# 前端（:3000）
cd frontend && npm install && npm run dev
npm run build / npm run start / npm run lint / npm run typecheck

# 后端（:40001）
cd backend && npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npx ts-node prisma/sync-tutorials.ts   # 同步教程进 DB（git-as-CMS）
npm run dev / npm run build / npm run start:prod

# 数据库
createdb algo_platform   # PostgreSQL 17
# .env: DATABASE_URL / JWT_SECRET / JWT_EXPIRES_IN / PORT=40001
```

---

_生成日期：2026-07-29 · 基于对 frontend/backend 源码与 README 的实际读取。_
