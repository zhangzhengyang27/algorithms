# 项目地图 · 算法可视化学习平台

> 一份给「接手项目的工程师 / 后续 Agent」看的工程地图。面向个人学习者的算法可视化学习平台：可视化动画 + Markdown 教程 + 题库 + 进度追踪。
> 配套：`README.md`（快速开始）、`docs/DEPLOYMENT.md`（构建与发布）、`frontend/docs/design-system.md`（视觉规范）。
>
> 校正说明：本文曾引用 `docs/lessons-learned-2026-07-28-tutorial-authoring.md` 与 `docs/superpowers/{plans,specs}/`，这两份文档在 2026-08-16 的文件丢失事件中已不在仓库内，且从未纳入版本控制，无法找回。下方所有事实均以当前磁盘状态复核。

---

## 1. 它是什么

核心能力（数字为 2026-09-26 按磁盘实测）：

- **可视化**：`components/visualizer/` 下 **126 个 `*-panel.tsx`**（另有 `binary-search-panel2.tsx`），由 `app/visualizer/<slug>/page.tsx` **127 个静态路由**逐页挂载；覆盖排序 / 搜索 / 数组 / 链表 / 栈 / 队列 / 各类树 / 图论 / 动态规划 / 字符串 / 数论 / 计算几何。
- **教程**：`app/tutorials/` 下 **137 个 `.md`**，由**单个动态路由** `app/tutorials/[slug]/page.tsx` 渲染（不是「每个教程一个路由页」），配 Markdown + 跨文档跳转 + Mermaid + Python/TS 双语代码页签。
- **题库**：`app/problems/` **19 个页面**，含题面、题解页签、公司频次、在线判题。
- **在线运行**：`lib/java-tracer.ts`(1171 行) · `lib/python-tracer.ts`(1037 行) · `lib/solution-tracer.ts`(842 行) 三个前端「模拟执行器」，把代码跑成可视化步骤。这是全项目最大且最零测试的单体。
- **学习闭环**：`/progress`（进度 + 活动日历）、`/wrong-book`（错题本）、`/study-plan`（学习路线）、`/roadmap`（技能地图）、`/stats`（统计面板）。

---

## 2. 技术栈

| 层 | 技术 |
|----|------|
| 前端 | **Next.js 16** (App Router) · React 19.2 · TypeScript 5.9 · Tailwind CSS 4 · Zustand · Monaco 编辑器 · Mermaid |
| 后端 | NestJS 11.1 · Prisma 6.19 · PostgreSQL · Passport/JWT · Swagger · @nestjs/throttler |
| 工程 | **pnpm 10**（前后端各自 workspace + lock 文件）· ESLint 9 · Jest / ts-jest |

> ⚠️ 版本口径需澄清（截至本文校正时仍未统一）：
> 1. 两个 Dockerfile 都钉 `node:22-slim`，但 `package.json` 无 `engines` 字段；本机 `node -v` 为 **v24.14.0**，即**本地开发运行时 ≠ 生产镜像运行时**。
> 2. 旧版本文曾写「Next.js 15」，实际 `frontend/package.json` 声明 `next: ^16` 且安装的是 16.2.12。
> 3. `README.md` 写 PostgreSQL 17，`docker-compose.yml` 注释写 dev-stack PG 16 —— 真实版本取决于 NAS 上的实例，未在仓库内固定。
> 4. `backend/devDependencies` 里有 `eslint-config-next@16`（Next.js 专用预设出现在 NestJS 后端），是复制粘贴残留；后端也没有 `lint` 脚本，因此该依赖当前完全无用。

---

## 3. 目录结构

```
algorithms/
├── frontend/                     # Next.js 16 App Router（pnpm workspace 根）
│   ├── src/app/                  # 页面路由
│   │   ├── page.tsx                  # 首页（components/home/daily-problem.tsx 每日一题）
│   │   ├── tutorials/                # 137 个 .md + page.tsx 列表页 + [slug]/page.tsx 唯一动态路由
│   │   ├── visualizer/<slug>/page.tsx # 127 个静态路由，各挂一个 panel
│   │   ├── problems/                 # 19 个题目页
│   │   ├── progress/  wrong-book/  study-plan/  roadmap/  stats/
│   │   ├── login/  settings/
│   │   ├── error.tsx  global-error.tsx  loading.tsx  not-found.tsx
│   │   └── globals.css  layout.tsx
│   ├── src/components/
│   │   ├── visualizer/           # ★ 126 个 *-panel.tsx（+binary-search-panel2）· 引擎 stepper.tsx · code-panel.tsx
│   │   ├── tutorial/             # markdown-content · mermaid-diagram · related-resources · table-of-contents
│   │   │                        # tutorial-sidebar · tutorial-meta-panel · tutorial-pager · tutorial-tabs
│   │   │                        # tutorials-browser · code-tabs
│   │   ├── problem/              # problem-solver · problem-comments（评论）· company-frequency-badges
│   │   │                        # problem-related-links · problem-visualizer · solution-stepper
│   │   ├── editor/               # code-editor.tsx（Monaco 封装）
│   │   ├── home/  progress/  roadmap/  stats/  study-plan/  wrong-book/
│   │   ├── ui/                   # main-layout · top-nav · theme-provider · solution-tabs
│   │   └── progress-bootstrap.tsx
│   ├── src/lib/
│   │   ├── algorithms/           # graph.ts · searching.ts · sorting.ts · data-structures/
│   │   │                        # 仅 searching.test.ts + sorting.test.ts 两个测试
│   │   ├── java-tracer.ts (1171) · python-tracer.ts (1037) · solution-tracer.ts (842)  # 前端模拟执行器
│   │   ├── api.ts · api-client.ts        # 前端 API 客户端（base = /api/v1）
│   │   ├── tutorial-page.tsx             # 直接读本地 .md —— 教程真相源
│   │   ├── tutorial-list.ts · tutorial-meta.ts · tutorial-resources.ts
│   │   ├── visualizer-registry.tsx · visualizer-routes.ts
│   │   ├── study-plan.ts · company-frequency.ts · problems-cache.ts · problem-resources.ts
│   │   ├── mermaid-server.ts · rehype-mermaid.ts · remark-code-tabs.ts
│   │   └── （注：lib/visualizers/ 是空目录，旧文档提到的 sorting-visualizer.ts 并不存在）
│   └── src/store/  src/types/
│
├── backend/                      # NestJS 11（pnpm workspace 根）
│   ├── src/main.ts               # trust proxy · CORS(FRONTEND_ORIGIN) · 全局 ValidationPipe
│   │                            # （whitelist + forbidNonWhitelisted）· Swagger @ /api/docs · 无 setGlobalPrefix
│   ├── src/app.module.ts         # ConfigModule(全局) + ThrottlerModule(60次/分) + APP_GUARD(ThrottlerGuard)
│   ├── src/common/               # guards/jwt-auth.guard.ts · guards/roles.guard.ts
│   │                            # decorators/current-user.decorator.ts · decorators/roles.decorator.ts
│   ├── src/prisma/prisma.service.ts
│   └── src/modules/              # 6 个模块，均为 controller/service/module
│       ├── auth/                 # + strategies/jwt.strategy.ts
│       ├── problems/             # 写操作走 @Roles('ADMIN')；含 2 个 spec 测试
│       ├── categories/  progress/  notes/
│       └── comments/             # 题目评论（旧文档完全未记录）
│
└── docs/DEPLOYMENT.md            # 唯一存留的设计文档
    frontend/docs/design-system.md
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

NestJS 模块化：`app.module.ts` 汇总 **`AuthModule / ProblemsModule / CategoriesModule / ProgressModule / NotesModule / CommentsModule`（共 6 个）** + 全局 `ConfigModule` + `PrismaService`。另有：

- `ThrottlerModule.forRoot([{ttl:60_000, limit:60}])`，并以 `APP_GUARD` 全局挂 `ThrottlerGuard`，单端点用 `@Throttle()` 覆盖。
- 全局 `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })`，即多余字段会被拒绝。
- 路由前缀：`main.ts` **没有** `setGlobalPrefix`，控制器直接是 `@Controller('problems')` 这类裸路径。`/api/v1` 只是前端 rewrite 的别名（见 §7），后端本身无版本化。
- 写权限：`problems` 的创建/更新/删除用 `@UseGuards(JwtAuthGuard, RolesGuard) + @Roles('ADMIN')`；`progress/notes/comments(写)/auth(refresh)` 需登录；`categories/problems(读)` 公开。

> ⚠️ 本文旧版在此列出了 `TutorialsModule`，并声称有 7 个 model。**教程后端已被整体移除**，见 §5.2。

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

### 5.2 教程内容：真相源已从数据库改为本地 Markdown

旧机制（git-as-CMS via DB）：`backend/prisma/sync-tutorials.ts` 扫描 `.md` → 按 `CATEGORY_MAP`/`TUTORIAL_ORDER` upsert 进 `Tutorial` 表 → 前端调 `/api/v1/tutorials`。

**当前机制**：`frontend/src/lib/tutorial-page.tsx` 在渲染时直接读 `src/app/tutorials/*.md`（其源码注释原文：「这是本地真相源，不再依赖后端 /api/v1/tutorials」）。配套移除的东西：

| 被移除 | 现状 |
|--------|------|
| `backend/src/modules/tutorials/` | 目录不存在，`app.module.ts` 无引用 |
| `schema.prisma` 的 `model Tutorial` | 不存在（model 数 7 → 6） |
| `backend/prisma/sync-tutorials.ts` | 文件不存在 |
| `api-client.ts` 的 `TutorialsApi` | 已无导出 |

数据库层面的删除有迁移留痕：`migrations/20260815153000_resolve_drift/migration.sql` 首行注释「tutorials 表已于 2026-08-04 手动 DROP，未走迁移」，该迁移的作用是补齐漂移历史。

> 这是一次**自洽的架构收敛**（前端读文件，省掉一层同步与一张表），不是误删。代价是：教程不再有「已发布/草稿」状态、无 DB 侧学习顺序、API 也不再暴露教程；新增教程只需放 `.md` 文件，**不再需要在 `CATEGORY_MAP`/`TUTORIAL_ORDER` 登记**（旧 README 里那句维护要求已失效，见 §9）。

---

## 6. 数据模型（Prisma，**6 个 model + 3 个 enum**）

| model | 表名 | 要点 |
|-------|------|------|
| `User` | `users` | `email @unique`、`passwordHash`、`role: Role = USER`、`avatarUrl` |
| `Category` | `categories` | `slug @unique`、`order`，只与 `Problem` 建立关系（**教程已无关系**） |
| `Problem` | `problems` | `difficulty: Difficulty`、`descriptionMd`、`examples/solutions` 为必填 `Json`、`hints/testCases` 可空 `Json`、`defaultCode?`、`tags: String[]`、`timeLimit=2000/memoryLimit=256`、`@@index([categoryId])` |
| `Progress` | `progress` | `status: ProgressStatus`、`code?`、`@@unique([userId, problemId])`、`@@index([problemId])` |
| `Note` | `notes` | **`problemId` 可空** —— 支持不挂题目的独立笔记 |
| `Comment` | `comments` | 题目评论，关联 `User` + `Problem` |

enum：`Difficulty{EASY,MEDIUM,HARD}` · `ProgressStatus{NOT_STARTED,ATTEMPTING,COMPLETED}` · `Role{USER,ADMIN}`。

关系闭环为「用户—题目—进度—笔记—评论」。**旧文档所述的第 7 个 model `Tutorial`（`contentMd`）已随 §5.2 的架构收敛移除**，当前 `schema.prisma` 中不存在任何教程模型。

---

## 7. 前后端如何连接

- 前端开发端口是 **`:4000`**（`package.json` 里是 `next dev -p 4000`，不是 3000）。
- `lib/api.ts` 给请求加 `/api/v1` 前缀 → `next.config.ts` 的 `rewrites` 把 `/api/v1/:path*` 代理到 `${NEXT_PUBLIC_API_URL ?? 'http://backend:40001'}/:path*`，**并在此剥掉 `api/v1` 前缀**，正好对上后端裸路径 `@Controller('problems')`。
- JWT 放在 `Authorization: Bearer <token>`；`api-client.ts` 封装 `ProblemsApi / CategoriesApi / ProgressApi / NotesApi / CommentsApi / AuthApi`（**已无 `TutorialsApi`**）。
- 浏览器同源，不直接跨域；后端 `main.ts` 的 CORS 取 `FRONTEND_ORIGIN`，默认 `http://localhost:4000`，与前端端口一致。

> ⚠️ 本地开发陷阱：rewrite 的兜底值是 `http://backend:40001`（Docker compose 服务名）。该 host 在宿主机不存在，所以**新克隆仓库后必须先建 `frontend/.env.local` 并写 `NEXT_PUBLIC_API_URL=http://localhost:40001`，否则所有 API 调用静默失败**；而 `.env.local` 被 `.gitignore` 排除，仓库里只有 `.env.example`（其中并未包含这一项）。

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
| 8 | **`cd backend && pnpm install` 直接失败**：`ERR_PNPM_CONFIG_CONFLICT_BUILT_DEPENDENCIES`。根因是 pnpm 10.30 下 `package.json` 的 `pnpm.onlyBuiltDependencies` 与 `pnpm-workspace.yaml` 的 `dangerouslyAllowAllBuilds` 互斥（二者曾分别于 08-06 / 08-15 加入，互不知晓） | ✅ 已修复：移除该 flag，并把白名单补全为 `@prisma/client / @prisma/engines / bcrypt / prisma / unrs-resolver`（原 flag 是为绕开 prisma 构建脚本被拦而加的粗暴替代）。已实跑验证 install / `prisma validate` / build / test 全绿 |
| 9 | 本文自身长期过期：仍描述 `TutorialsModule`、7 个 model、`sync-tutorials.ts`、`TutorialsApi`、Next.js 15、前端 `:3000`、`lib/visualizers/sorting-visualizer.ts`、根目录截图 | ✅ 本文 §1/§2/§3/§5/§6/§7/§9 已按磁盘实测重写 |
| 10 | `backend/package.json` 的 `prisma:migrate` 脚本值是 `prisma migrate dev`，即文档自己禁止的清库命令，而它是仓库里唯一叫 migrate 的脚本 | ✅ 已改：`prisma:migrate` → `prisma migrate deploy`，并补 `prisma:status`（`migrate status`）与 `prisma:push`（`db push`，即 DEPLOYMENT.md 指定的改 schema 路径）。全仓已无任何可执行面调用 `migrate dev`，仅存于文档警告文字 |
| 11 | `backend/devDependencies` 含 `eslint-config-next@16`（Next 专用预设），且后端无 `lint` 脚本 | ✅ 已移除 `eslint-config-next` 与同样无用的 `@eslint/eslintrc`（后端无任何 eslint 配置文件，二者零引用；前端 `eslint.config.mjs` 确实 import 前者，保留）。锁文件已重建并通过 `--frozen-lockfile` |
| 12 | 本地 node v24 与 Dockerfile `node:22-slim` 不一致；`package.json` 无 `engines` 约束 | 🔶 两端已补 `"engines": { "node": ">=22" }`（取 `>=22` 是因为 v24 实测全绿，写死 22 反而会把本地开发判为非法）；未开 `engine-strict`，故仍为提示性约束 |
| 13 | `next.config.ts` rewrite 兜底 host 为 compose 服务名 `http://backend:40001`，新克隆无 `.env.local` 则 API 全挂 | ✅ 兜底改为 `http://localhost:40001`；生产由 compose 显式注入服务名，行为不变。`.env.example` 也补了该项说明 |
| 14 | 测试覆盖与资产规模严重不匹配：126 个可视化面板 + 3050 行 tracer 代码，此前前端仅 2 个测试文件 41 例；后端 2 个 spec 12 例 | 🔶 大幅改善：前端 41 → **165 例**（数据结构 92 + 注册表绊线 13 + 三 tracer 正确性 19，另含原有 41）。**剩余最大缺口是 126 个可视化面板**——见第 26 项的结构原因 |
| 15 | `frontend/` 此前无 `test` 脚本（有 `jest.config.cjs` 却无入口） | ✅ 已补 `"test": "jest"` |
| 16 | `.env.example` 与 `docker-compose.yml` 注释里写了内网真实地址与库用户名 | ✅ 已改为占位符；真实地址仅存在于不入库的 `backend/.env` |
| 17 | README 声明 MIT 但无 `LICENSE` 文件 | ✅ 已补（版权行取自 git identity，若不符请改） |
| 18 | **两个 `Stack` 实现的 `toArray()` 方向相反**：`ArrayStack` 自底向顶（`[1,2,3]`），`LinkedListStack` 自顶向底（`[3,2,1]`），却共用同一条 `Stack<T>` 接口 | ⚠️ 未修。任改一侧都可能翻转依赖它的面板渲染方向，需先确认调用方。新测试按现状**分别**锁定两侧，将来任何一方改动都会强制报错 |
| 19 | **`BSTMap` / `BSTSet` 名不符实且字符串键静默失效**：实现是两条平行数组 + 线性 `findIndex`，并非二叉树；不传比较器时默认 `a - b`，字符串相减得 `NaN`，`NaN === 0` 恒假 → `get`/`contains` 永远未命中，`add` 会不断追加同名键 | ⚠️ 未修。当前**无任何页面/组件引用**（仅 `data-structures/index.ts` 对外导出），所以生产影响面为零，但一旦被用就是静默错误。新测试改用 number 键走其受支持的契约——**没有**把该缺陷固化为「预期行为」 |
| 20 | `UnionFind1-4` 的 `size` 语义是**元素个数 n**，不随 `union` 变化，接口未暴露连通分量数 | ⚠️ 教学易误解（含本文旧表述倾向）。要分量数需自行加 `count` 字段；测试已改为按 `find`/`isConnected` 断言连通关系 |
| 21 | `MapSum.sum(prefix)` 是「所有以该前缀开头的整词权重之和」，因此 `sum('ap')` 会把 `apt` 也算进去 | ✅ 非缺陷，但极易误读，已在测试中用注释钉住 |
| 22 | **CI 首跑在 `npx prisma validate` 处失败**（frontend job 全绿）：`prisma validate` 虽从不连库，却要求 `DATABASE_URL` **已定义**，未定义报 `P1012`。本地永远测不出来，因为 `backend/.env` 就在磁盘上，而它被 gitignore、CI 上不存在 | ✅ 已在 `ci.yml` 的 backend job 给 job 级占位 `DATABASE_URL`。复现与验证方式：把 schema 单独复制到无 `.env` 的目录跑 validate（必现 P1012）→ 再临时移走 `backend/.env` 跑完 validate/generate/build/test 四步（全 rc=0）后原样还原 |
| 23 | `visualizerRegistry` 用**字符串**按名字取命名导出（`mod[name]`），所以「面板里组件改名」「注册表写错文件名」「`tutorialToVisualizer` 指向不存在的 slug」这三类都**过不了运行时但过得了 `tsc`** —— 因为 `named(loader, "SortingPanel")` 的第二个参数是裸字符串，没有字面量约束 | ✅ 已加 `lib/visualizer-registry.test.ts`（13 例）作绊线。经漂移注入验证生效：改组件名 / 删面板文件 ×2 / 映射写错 slug ×3 种变体，全部被捕获。含「解析器自检」下限断言，防止正则失效导致空集合全过的假绿 |
| 24 | **三个 tracer 在 Jest 下连模块都加载不了**：`python-tracer`/`java-tracer` 都 `import { Env, deepCopy, stringify, … } from './solution-tracer'`，而 `solution-tracer` 引入 **ESM-only** 的 `ts-blank-space`（其 `package.json` 为 `"type": "module"`，无 CJS 产物）。Jest 默认不转换 node_modules，于是 3050 行「在线运行/判题」核心逻辑**结构性不可测**——这才是它零测试的真正原因，不是忘了写 | ✅ `jest.config.cjs` 加 `transformIgnorePatterns: ['node_modules/.pnpm/(?!ts-blank-space@)']` 与 `.js` 的 ts-jest 转换，**只放开这一个包**（pnpm 真实路径有两层 node_modules，按 `.pnpm/` 后的包名判定，否则要么不生效要么整个 node_modules 被编译）。既有 146 例无回归 |
| 25 | **`java-tracer` 里 `Integer.MAX_VALUE` / `MIN_VALUE` 恒为 `undefined`**：`staticCall()` 第 1069 行本来就有 `case 'MAX_VALUE'`，但它**只在 call 节点被调用**（第 894 行），而字段访问的求值路径是 `attr → env.get('Integer') → undefined → getAttr(undefined,…)`，永远走不到那个分支（即该分支原为死代码）。后果是**静默算错**而非报错：LC 121 最经典的 Java 写法（`int min = Integer.MAX_VALUE`）在这套执行器里恒返回 `0`，正确答案是 `5` | ✅ 已在 `attr` 分支加静态类字段兜底（局部变量优先，仅当 env 取不到且基名属 `STATIC_CLASSES` 才走静态解析）。仓库内 `.md`/题库数据里 `Integer.MAX_VALUE` 出现 48 处、`MIN_VALUE` 6 处，暴露面广。回归测试见 `tracers.test.ts`：撤销修复后该 2 例会失败（已实测） |
| 26 | **126 个可视化面板在结构上无法单测**：§4 说每个面板的 `buildSteps(inputs): VizStep[]` 是纯函数——这本该是最理想的可测单元。实测形状高度统一：**118 / 126 是同一个顶层 `function buildSteps`**（另 3 个是 `buildXxxSteps` 之类，共 121 个有该形状），但 **0 / 126 导出它**，外部只能拿到 React 组件 | 🔶 样板已立，已推进四批共 **47 个面板**：一 12（二分/数组/单调栈/LRU/并查集/Dijkstra/背包/KMP/堆/BST/前缀和/归并）、二 11（快排/堆排/希尔/计数/最大子数组/买卖股票/LIS/滑动窗口/双指针/跳跃游戏/打家劫舍）、三 12（Manacher/爬楼梯/汉诺塔/N皇后/全排列/幂集/AVL/Trie/哈希表/栈/队列/链表）、四 12（矩阵旋转/高斯消元/中国剩余定理/矩阵快速幂/Nim/后缀数组/八数码/Treap/红黑树/跳表/图的存储与遍历/回溯排列）。`lib/panel-frames.test.ts` 现有 **173 例**，断言「末帧状态 == 用另一套独立实现算出的真实答案」（参照全部现写：`Array#sort`/`Array#indexOf`、朴素 Dijkstra、一维滚动 DP、独立回溯、`2^n`/`n!` 计数、独立 BFS 最短步、把解代回方程组验残差、按完全二叉树编号还原 (depth,pos)、相邻帧 state 差分推弹出序——均不抄面板输出）。**其余 71 个待做**；第 27 项那道墙已扫清，第 29 项那类空输入问题预计继续暴露 |
| 27 | 给面板加 `export function buildSteps` **不是零影响的**：`visualizer-registry.tsx` 的 `named()` 形参写成 `Promise<Record<string, T extends ComponentType>>`，等于要求面板模块的**每一个**导出都是组件；多导出了一个返回 `VizStep[]` 的纯函数就会在 `next build` 的类型检查阶段直接失败（`Failed to type check`）。本地 `pnpm test`/`typecheck` 反而不一定先报——只有走完整 build 才暴露 | ✅ 已把 `named()` 的 loader 返回类型放宽为 `Promise<Record<string, unknown>>` 并按键名 `as T`。这**不损失任何检查强度**：按键名取组件本来就是裸字符串、类型层从未校验过（正是第 23 项那个盲区）。放宽后 build 复绿 |
| 28 | `heap-panel` 下沉结束的文案恒写「堆顶 X 已满足堆序」，但那里 `i` 是**正在下沉的节点下标**，交换后往往不是根（实测 `heap=[4,2,3,1]` 时提示「堆顶 2」，而真正的堆顶是 4）——对学习者是一句事实性误导 | ✅ 已改为按 `i === 0` 分叉：根节点仍写「堆顶」，否则写「下标 i 的 X」 |
| 29 | **空输入这一类没有防护，而且可达**：`counting-sort` / `maximum-subarray` / `lis` / `jump-game` 的输入框都是 `value.split(',').map(Number).filter(...)`，**填非数字文本就得到 `[]`**。后果：counting-sort 抛 `RangeError: Invalid array length`（`Math.max(...[])` 为 `-Infinity` → `new Array(-Infinity)`）整块面板崩掉；maximum-subarray 渲染「最大子数组和 = -Infinity」；lis 的 `maxLen` 同样 `-Infinity`；jump-game 渲染「从下标 0 跳到末尾（下标 -1）」 | 🔶 已修这 4 个：三个给一帧「输入为空…」提示，lis 的空序列 `maxLen` 取 0（数学上确定，非约定）。**同类面板应该还有**——目前只有被末帧测试覆盖到的这 4 个被查出来，推广到其余面板时预计会继续暴露 |
| 30 | `best-time` 面板实现的是 **LC 122（不限笔数）** 的 `lastBuy/lastSold` 状态机，但路由页标题写的是「买卖股票的最佳时机」（那是 LC 121 的名字）且未说明可多笔。于是 `[7,1,5,3,6,4]` 上面板显示 `最大利润 = 7`，按 121 心算是 5，学习者会以为动画算错——**本轮写测试时就被绊了一次，差点当成 bug 报出去** | ✅ 算法本身无错，已改标题为「买卖股票的最佳时机 II（可多笔交易）」并在描述里点明与 121 的关系 |
| 31 | **`stack-panel` 的中间帧是从「空栈」算出来的**：入栈循环里写的是 `steps.push(push({ items: [], ... }, v))` —— 拿新建的空栈去做 push，而不是拿当前 state。于是已有 `[1]` 再入栈 `2` 时，动画会闪过一帧只显示 `[2]`（把已入栈的元素弄丢），下一帧又跳回 `[1,2]`。兄弟面板 `queue-panel` 写的是正确的 `const step = enqueue(state, v); state = step.state; steps.push(step);`，可反证这是笔误而非设计 | ✅ 已与 queue-panel 对齐。此缺陷由末帧测试的**相邻帧 state 差分**自动暴露（差分把这一帧误判成一次弹出，LIFO 序列断言随之失败），不是靠人眼看动画发现的 |
| 32 | 变异验证暴露出**测试自身**的盲区：`avl-panel` 的输入原本只有升序与乱序两组，而**升序插入只触发 RR 旋转**——把 LL 旋转的判断改成永不成立（`balance > 2`）时，测试照样全绿。一开始我怀疑这个「漏检」是变异打到了展示文案，读码确认第 101 行就是真守卫（第 103 行在同一 `if` 里 `return rotateRight`），所以漏检是真的 | ✅ 已补 LL（降序）、LR、RL 三类失衡形态，补齐后同一变异即被捕获。教训：**覆盖「输入形状」不等于覆盖「代码分支」**，断言写得再强也测不到没走到的分支 |
| 33 | **`red-black-tree-panel` 的两个旋转在「旋转对象就是根」时会丢子树**：`rotateLeft` 写成 `if (!x.parent) return y;` 提前返回，而把旧根挂回去的 `y.left = x; x.parent = y;` 写在这条 return **之后**，于是新根 y 从没接回 x —— x 连同它整棵左子树从树里消失。`rotateRight` 同形同病。后果：**升序插入 1..7 每次左旋都掉一棵子树，插完 7 个值末帧只剩 2 个节点**（`[6(B), 7(R)]`），而末帧文案还写着「✅ 插入完成，红黑树保持平衡」。降序同理。乱序 `[5,3,8,1,9,7]` 恰好不触发根旋转，所以此前一直没被发现 | ✅ 已把挂回子树的赋值移到提前返回之前（两个旋转各一处）。回归测试即 `panel-frames.test.ts` 的红黑树用例（中序有序 + 根为黑 + 无连续红 + 黑高一致 + 节点数守恒）；已实测**分别**撤销任一处修复都会导致用例失败，即两处的防护各自有效 |

---

## 9. 常用命令（2026-09-26 本机逐条实跑核对）

包管理器是 **pnpm**（前后端各为独立 workspace 根）。旧版本文写的 `npm install` 会绕过 `pnpm-lock.yaml`，不要混用。

```bash
# 安装（两端均验证通过，且 --frozen-lockfile 与锁文件一致）
cd frontend && pnpm install --frozen-lockfile
cd backend  && pnpm install --frozen-lockfile

# 前端（dev 端口 :4000）
pnpm dev | pnpm run build | pnpm start | pnpm run lint | pnpm run typecheck | pnpm test

# 后端（:40001）
pnpm run prisma:generate
pnpm run dev | pnpm run build | pnpm start:prod
pnpm test                      # jest --runInBand
npx prisma validate            # 不需要连库

# 数据库 / 迁移
createdb algo_platform
pnpm exec prisma migrate deploy      # ← 生产用这个
# ⚠️ 见下方危险提示
```

> ✅ 迁移脚本已对齐安全路径（2026-09-26）：`prisma:migrate` = `prisma migrate deploy`、`prisma:status` = `prisma migrate status`、`prisma:push` = `prisma db push`。
> 历史坑：`prisma:migrate` 一度指向 `prisma migrate dev`，而它正是下面这段禁止的命令 —— 照脚本名敲就会清库。

> 🚨 **仍然禁止 `prisma migrate dev`**（现仓库里已无任何脚本调用它，但手敲依然危险）：本项目存在过迁移历史 drift（`tutorials` 表 2026-08-04 手动 DROP），`migrate dev` 会检测到 drift 并强制要求 `migrate reset`，从而**清空全部数据**。改 schema 用 `prisma db push`，应用已提交的迁移用 `prisma migrate deploy`，核对状态用 `prisma migrate status`。

> ⚠️ 旧版本文在此列的 `npx ts-node prisma/sync-tutorials.ts` 已随教程后端移除而不存在（文件已删），教程不再需要同步步骤。

> 说明：`.env` 需要 `DATABASE_URL` / `JWT_SECRET` / `JWT_EXPIRES_IN` / `PORT=40001`；前端本地开发还需 `frontend/.env.local` 的 `NEXT_PUBLIC_API_URL`（见 §7 陷阱）。

---

_初版生成：2026-07-29 · 最近一次按磁盘实测全面校正：2026-09-26（同日修复 #8/#15/#16/#17）。_
