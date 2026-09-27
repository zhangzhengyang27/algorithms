# 项目地图 · 算法可视化学习平台

> 一份给「接手项目的工程师 / 后续 Agent」看的工程地图。面向个人学习者的算法可视化学习平台：可视化动画 + Markdown 教程 + 题库 + 进度追踪。
> 配套：`README.md`（快速开始）、`docs/DEPLOYMENT.md`（构建与发布）、`frontend/docs/design-system.md`（视觉规范）。
>
> 校正说明：本文曾引用 `docs/lessons-learned-2026-07-28-tutorial-authoring.md` 与 `docs/superpowers/{plans,specs}/`，这两份文档在 2026-08-16 的文件丢失事件中已不在仓库内，且从未纳入版本控制，无法找回。下方所有事实均以当前磁盘状态复核。

---

## 1. 它是什么

核心能力（数字为 2026-09-26 按磁盘实测）：

- **可视化**：`components/visualizer/` 下 **127 个 `*-panel*.tsx`**——其中 `code-panel.tsx` 是被 stepper 等 4 处复用的代码块组件，所以真正的可视化面板是 **126 个**（125 个 `*-panel.tsx` + `binary-search-panel2.tsx`），由 `app/visualizer/<slug>/page.tsx` **127 个静态路由**逐页挂载；覆盖排序 / 搜索 / 数组 / 链表 / 栈 / 队列 / 各类树 / 图论 / 动态规划 / 字符串 / 数论 / 计算几何。
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
│   │   ├── visualizer/           # ★ 127 个 *-panel*.tsx = 126 个可视化面板 + code-panel（共享代码块组件）· 引擎 stepper.tsx
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
| 14 | 测试覆盖与资产规模严重不匹配：126 个可视化面板（127 个 `*-panel*.tsx` 减去共享的 code-panel）+ 3050 行 tracer 代码，此前前端仅 2 个测试文件 41 例；后端 2 个 spec 12 例 | 🔶 大幅改善：前端 41 → **740 例**（面板末帧 508 + 默认数据回归 8 + lib 层 graph 18 / sorting 63 / searching 5 + 数据结构 106 + 注册表绊线 13 + 三 tracer 正确性 19）。**面板侧缺口只剩 5 个，且都不在「面板内纯函数」这一档**——见第 26、41 项 |
| 15 | `frontend/` 此前无 `test` 脚本（有 `jest.config.cjs` 却无入口） | ✅ 已补 `"test": "jest"` |
| 16 | `.env.example` 与 `docker-compose.yml` 注释里写了内网真实地址与库用户名 | ✅ 已改为占位符；真实地址仅存在于不入库的 `backend/.env` |
| 17 | README 声明 MIT 但无 `LICENSE` 文件 | ✅ 已补（版权行取自 git identity，若不符请改） |
| 18 | **两个 `Stack` 实现的 `toArray()` 方向相反**：`ArrayStack` 自底向顶（`[1,2,3]`），`LinkedListStack` 自顶向底（`[3,2,1]`），却共用同一条 `Stack<T>` 接口 | ✅ 已统一为**自顶向底**（与 `pop()` 观察顺序一致，即原 LinkedListStack 的方向）：`ArrayStack.toArray()` 改为返回逆序，`toString()` 同步改成 `Stack: top -> [...]` 以免「top」标在末尾产生新误导。先前已查证两个实现在应用内**零调用方**，故无渲染面影响。契约测试已合并为一条 `describe.each` 同时跑两个实现——任何一侧再偏离就会红 |
| 19 | **`BSTMap` / `BSTSet` 名不符实且字符串键静默失效**：实现是两条平行数组 + 线性 `findIndex`，并非二叉树；不传比较器时默认 `a - b`，字符串相减得 `NaN`，`NaN === 0` 恒假 → `get`/`contains` 永远未命中，`add` 会不断追加同名键 | 🔶 默认比较器已改为 `defaultCompare`：数值走减法、其余走字符串序，`BSTMap` 与 `BSTSet` 都接上（`BSTSet` 原先把 `undefined` 透给 `BST` 从而吃到数值默认值）。测试已同时用 number 键与 string 键跑同一组契约——撤销该修复会让 7 例变红。**仍未改的是「名不符实」**：它并非二叉树而是平行数组 + 线性查找，改名是另一件事 |
| 20 | `UnionFind1-4` 的 `size` 语义是**元素个数 n**，不随 `union` 变化，接口未暴露连通分量数 | ⚠️ 教学易误解（含本文旧表述倾向）。要分量数需自行加 `count` 字段；测试已改为按 `find`/`isConnected` 断言连通关系 |
| 21 | `MapSum.sum(prefix)` 是「所有以该前缀开头的整词权重之和」，因此 `sum('ap')` 会把 `apt` 也算进去 | ✅ 非缺陷，但极易误读，已在测试中用注释钉住 |
| 22 | **CI 首跑在 `npx prisma validate` 处失败**（frontend job 全绿）：`prisma validate` 虽从不连库，却要求 `DATABASE_URL` **已定义**，未定义报 `P1012`。本地永远测不出来，因为 `backend/.env` 就在磁盘上，而它被 gitignore、CI 上不存在 | ✅ 已在 `ci.yml` 的 backend job 给 job 级占位 `DATABASE_URL`。复现与验证方式：把 schema 单独复制到无 `.env` 的目录跑 validate（必现 P1012）→ 再临时移走 `backend/.env` 跑完 validate/generate/build/test 四步（全 rc=0）后原样还原 |
| 23 | `visualizerRegistry` 用**字符串**按名字取命名导出（`mod[name]`），所以「面板里组件改名」「注册表写错文件名」「`tutorialToVisualizer` 指向不存在的 slug」这三类都**过不了运行时但过得了 `tsc`** —— 因为 `named(loader, "SortingPanel")` 的第二个参数是裸字符串，没有字面量约束 | ✅ 已加 `lib/visualizer-registry.test.ts`（13 例）作绊线。经漂移注入验证生效：改组件名 / 删面板文件 ×2 / 映射写错 slug ×3 种变体，全部被捕获。含「解析器自检」下限断言，防止正则失效导致空集合全过的假绿 |
| 24 | **三个 tracer 在 Jest 下连模块都加载不了**：`python-tracer`/`java-tracer` 都 `import { Env, deepCopy, stringify, … } from './solution-tracer'`，而 `solution-tracer` 引入 **ESM-only** 的 `ts-blank-space`（其 `package.json` 为 `"type": "module"`，无 CJS 产物）。Jest 默认不转换 node_modules，于是 3050 行「在线运行/判题」核心逻辑**结构性不可测**——这才是它零测试的真正原因，不是忘了写 | ✅ `jest.config.cjs` 加 `transformIgnorePatterns: ['node_modules/.pnpm/(?!ts-blank-space@)']` 与 `.js` 的 ts-jest 转换，**只放开这一个包**（pnpm 真实路径有两层 node_modules，按 `.pnpm/` 后的包名判定，否则要么不生效要么整个 node_modules 被编译）。既有 146 例无回归 |
| 25 | **`java-tracer` 里 `Integer.MAX_VALUE` / `MIN_VALUE` 恒为 `undefined`**：`staticCall()` 第 1069 行本来就有 `case 'MAX_VALUE'`，但它**只在 call 节点被调用**（第 894 行），而字段访问的求值路径是 `attr → env.get('Integer') → undefined → getAttr(undefined,…)`，永远走不到那个分支（即该分支原为死代码）。后果是**静默算错**而非报错：LC 121 最经典的 Java 写法（`int min = Integer.MAX_VALUE`）在这套执行器里恒返回 `0`，正确答案是 `5` | ✅ 已在 `attr` 分支加静态类字段兜底（局部变量优先，仅当 env 取不到且基名属 `STATIC_CLASSES` 才走静态解析）。仓库内 `.md`/题库数据里 `Integer.MAX_VALUE` 出现 48 处、`MIN_VALUE` 6 处，暴露面广。回归测试见 `tracers.test.ts`：撤销修复后该 2 例会失败（已实测） |
| 26 | **126 个可视化面板（127 个 `*-panel*.tsx`）在结构上无法单测**：§4 说每个面板的 `buildSteps(inputs): VizStep[]` 是纯函数——这本该是最理想的可测单元。实测形状高度统一：**118 / 126 是同一个顶层 `function buildSteps`**（另 3 个是 `buildXxxSteps` 之类，共 121 个有该形状；剩下 5 个没有该形状——4 个把帧交给 `src/lib/algorithms/`，1 个是共享组件 code-panel），但最初 **0 / 126 导出它**，外部只能拿到 React 组件 | 🔶 样板已立，已推进九批共 **122 个面板**：一 12（二分/数组/单调栈/LRU/并查集/Dijkstra/背包/KMP/堆/BST/前缀和/归并）、二 11（快排/堆排/希尔/计数/最大子数组/买卖股票/LIS/滑动窗口/双指针/跳跃游戏/打家劫舍）、三 12（Manacher/爬楼梯/汉诺塔/N皇后/全排列/幂集/AVL/Trie/哈希表/栈/队列/链表）、四 12（矩阵旋转/高斯消元/中国剩余定理/矩阵快速幂/Nim/后缀数组/八数码/Treap/红黑树/跳表/图的存储与遍历/回溯排列）、五 12（Bellman-Ford/Floyd-Warshall/Prim/Kruskal/拓扑排序/编辑距离/不同路径/组合总和/笛卡尔积/组合/扩展欧几里得/线段树）、六 12（接雨水/Fisher-Yates/布隆过滤器/凯撒密码/栅栏密码/线性查找/贪心区间调度/石子合并/二分图判定与匹配/树状数组/离散化/字符串哈希）、七 12（LCS/二维 0-1 背包 `knapsack`（与一批的 `dp-knapsack` 是两个文件）/单调队列滑动窗口最大/二分答案 LC2226/数论三件套（快速幂+辗转相除+埃氏筛）/组合数杨辉三角+全排列/状态机 DP（股票含冷冻期 LC309）/Tarjan 强连通/网络流最大流/Aho-Corasick 多模式匹配/树形 DP 最大独立集/2-SAT）、八 12（TSP 状压 DP/数位 DP/欧拉路径 Hierholzer/B 树/伸展树/柱状图最大矩形 LC84/分块查询+单点改/单调链凸包/扫描线面积并/归并逆序对/2×2 Hill 密码/加权随机）、九 27（A 组 18：二分进阶 first/last/死循环演示、位运算、分块表、环形队列 API、差分约束、二维表背包、十五数码 IDA*、哈希冲突三法、k-means、马踏棋盘、kNN、链表四合一、多项式哈希、TopK、递归阶乘/斐波那契、进阶排序三法、字符串四合一、复杂度曲线；B 组 8：LCA 倍增、CDQ 三维偏序、重链剖分、持久化线段树、懒标记线段树、Set/Map 脚本、树的直径与重心、带权并查集——这 8 个原本 `buildSteps()` 完全无参，本批把数据与演示脚本提成带默认值的入参后才可测；另 memoization 连 `buildNaiveTree`/`buildMemoTree` 一起导出后覆盖）。`lib/panel-frames.test.ts` 现有 **496 例**，另新增 `panel-defaults.test.ts` 8 例、`algorithms/graph.test.ts` 18 例、sorting 封装层 27 例（前端累计 **728 例**），断言「末帧状态 == 用另一套独立实现算出的真实答案」；参照全部现写且**刻意走不同算法路径**：BF 用 Dijkstra 校、FW 用逐源 Dijkstra + 对称性校、MST 用自写 Kruskal+DSU 校、exgcd 用贝祖恒等式校、线段树用朴素求和 + 「内部节点等于两子之和」校、旋转用 (r,c)→(n-1-c,r) 公式 + 四转还原校、布隆过滤器用「逐个查已插入元素必得可能存在」校无假阴性、字符串哈希同时校无假阳性与无假阴性——均不抄面板输出。第七批另加两条**自洽式**断言（不问「答案对不对」而问「面板内部两份表述是否互相印证」）：数论面板要求 `sieveIsPrime` 里为 true 的下标集合与 `sievePrimes` 完全一致；2-SAT 要求面板判定可满足时给出的赋值真的满足每一条子句（不只是 SAT/UNSAT 布尔值对）。**只剩 5 个，而且都不属于「面板内纯函数」这一档**（分母 127 = 126 个 `*-panel.tsx` + `binary-search-panel2.tsx`；实测「被测试引用」与「有导出 builder」两个集合都恰好 122 个，完全一致，没有导出了没测的、也没有测了没导出的）：
`binary-search-panel` / `sorting-panel` / `graph-search-panel` / `tree-traversal-panel` **根本没有 buildSteps**，帧来自 `src/lib/algorithms/`，已在 lib 层补测（第 41 项）；`code-panel` 是被 4 处复用的 CodeBlock 组件，不是可视化面板。第 27 项那道墙已扫清，第 29 项那类空输入问题在第 38、40 项接连兑现，第八批列出的「9 个无参面板」已在本批完成提参改造 |
| 27 | 给面板加 `export function buildSteps` **不是零影响的**：`visualizer-registry.tsx` 的 `named()` 形参写成 `Promise<Record<string, T extends ComponentType>>`，等于要求面板模块的**每一个**导出都是组件；多导出了一个返回 `VizStep[]` 的纯函数就会在 `next build` 的类型检查阶段直接失败（`Failed to type check`）。本地 `pnpm test`/`typecheck` 反而不一定先报——只有走完整 build 才暴露 | ✅ 已把 `named()` 的 loader 返回类型放宽为 `Promise<Record<string, unknown>>` 并按键名 `as T`。这**不损失任何检查强度**：按键名取组件本来就是裸字符串、类型层从未校验过（正是第 23 项那个盲区）。放宽后 build 复绿 |
| 28 | `heap-panel` 下沉结束的文案恒写「堆顶 X 已满足堆序」，但那里 `i` 是**正在下沉的节点下标**，交换后往往不是根（实测 `heap=[4,2,3,1]` 时提示「堆顶 2」，而真正的堆顶是 4）——对学习者是一句事实性误导 | ✅ 已改为按 `i === 0` 分叉：根节点仍写「堆顶」，否则写「下标 i 的 X」 |
| 29 | **空输入这一类没有防护，而且可达**：`counting-sort` / `maximum-subarray` / `lis` / `jump-game` 的输入框都是 `value.split(',').map(Number).filter(...)`，**填非数字文本就得到 `[]`**。后果：counting-sort 抛 `RangeError: Invalid array length`（`Math.max(...[])` 为 `-Infinity` → `new Array(-Infinity)`）整块面板崩掉；maximum-subarray 渲染「最大子数组和 = -Infinity」；lis 的 `maxLen` 同样 `-Infinity`；jump-game 渲染「从下标 0 跳到末尾（下标 -1）」 | 🔶 已修这 4 个：三个给一帧「输入为空…」提示，lis 的空序列 `maxLen` 取 0（数学上确定，非约定）。**同类面板应该还有**——目前只有被末帧测试覆盖到的这 4 个被查出来，推广到其余面板时预计会继续暴露。第九批又兑现两例：**`sorting-advanced` 的计数排序实现（与 `counting-sort-panel` 是两套代码）在空输入上同样抛 `RangeError: Invalid array length`**（`max = nums[0]` 为 undefined → `new Array(NaN)`），而它的输入框清空就能得到 `[]`，已补一帧「输入为空…」提示；`dp-state-compression` / `sweep-line` 的空输入崩溃见第 40 项（那两处不可达） |
| 30 | `best-time` 面板实现的是 **LC 122（不限笔数）** 的 `lastBuy/lastSold` 状态机，但路由页标题写的是「买卖股票的最佳时机」（那是 LC 121 的名字）且未说明可多笔。于是 `[7,1,5,3,6,4]` 上面板显示 `最大利润 = 7`，按 121 心算是 5，学习者会以为动画算错——**本轮写测试时就被绊了一次，差点当成 bug 报出去** | ✅ 算法本身无错，已改标题为「买卖股票的最佳时机 II（可多笔交易）」并在描述里点明与 121 的关系 |
| 31 | **`stack-panel` 的中间帧是从「空栈」算出来的**：入栈循环里写的是 `steps.push(push({ items: [], ... }, v))` —— 拿新建的空栈去做 push，而不是拿当前 state。于是已有 `[1]` 再入栈 `2` 时，动画会闪过一帧只显示 `[2]`（把已入栈的元素弄丢），下一帧又跳回 `[1,2]`。兄弟面板 `queue-panel` 写的是正确的 `const step = enqueue(state, v); state = step.state; steps.push(step);`，可反证这是笔误而非设计 | ✅ 已与 queue-panel 对齐。此缺陷由末帧测试的**相邻帧 state 差分**自动暴露（差分把这一帧误判成一次弹出，LIFO 序列断言随之失败），不是靠人眼看动画发现的 |
| 32 | 变异验证暴露出**测试自身**的盲区：`avl-panel` 的输入原本只有升序与乱序两组，而**升序插入只触发 RR 旋转**——把 LL 旋转的判断改成永不成立（`balance > 2`）时，测试照样全绿。一开始我怀疑这个「漏检」是变异打到了展示文案，读码确认第 101 行就是真守卫（第 103 行在同一 `if` 里 `return rotateRight`），所以漏检是真的 | ✅ 已补 LL（降序）、LR、RL 三类失衡形态，补齐后同一变异即被捕获。教训：**覆盖「输入形状」不等于覆盖「代码分支」**，断言写得再强也测不到没走到的分支 |
| 33 | **`red-black-tree-panel` 的两个旋转在「旋转对象就是根」时会丢子树**：`rotateLeft` 写成 `if (!x.parent) return y;` 提前返回，而把旧根挂回去的 `y.left = x; x.parent = y;` 写在这条 return **之后**，于是新根 y 从没接回 x —— x 连同它整棵左子树从树里消失。`rotateRight` 同形同病。后果：**升序插入 1..7 每次左旋都掉一棵子树，插完 7 个值末帧只剩 2 个节点**（`[6(B), 7(R)]`），而末帧文案还写着「✅ 插入完成，红黑树保持平衡」。降序同理。乱序 `[5,3,8,1,9,7]` 恰好不触发根旋转，所以此前一直没被发现 | ✅ 已把挂回子树的赋值移到提前返回之前（两个旋转各一处）。回归测试即 `panel-frames.test.ts` 的红黑树用例（中序有序 + 根为黑 + 无连续红 + 黑高一致 + 节点数守恒）；已实测**分别**撤销任一处修复都会导致用例失败，即两处的防护各自有效 |
| 34 | **同为「边表」入参，两个图面板的有向/无向约定不一致**：`bellman-ford-panel` 只按 `u→v` 单向松弛（从 3 出发时末帧 `[∞,∞,∞,0]`），而 `floyd-warshall-panel` 把同样形式的边表当**无向**图（其距离矩阵对称）。`prim`/`kruskal` 走无向（MST 本身是无向概念，合理）。学习者在一个面板里建立的直觉，到另一个面板会失效 | ✅ 已统一：BF 在 `buildSteps` 入口把每条边展开成两个方向（自环除外），与 floyd-warshall / prim / kruskal 一致，四个图面板对同一份边表现在给出相同的距离。新增用例「源点无出边时仍可到达其余点」专门守这条（撤销无向化后该例与 src=3 那条一起变红）。写测试时正是用无向参照跑 BF 失败才暴露出原不一致 |
| 35 | `combinations-panel` 对 `length = 0` 返回 **0 个组合**（末帧文案「组合完成，共 0 个」），而数学上 `C(n,0) = 1`（一个空组合） | ⚠️ 未修。该面板 UI 默认 `length = 2`，0 是否真能被用户选到**尚未证实**，故只记录不臆测修复；测试里也没给 k=0 编一个期望值 |
| 36 | `caesar-cipher-panel` 会把输入**整体转小写**再加密：`Hello, World!` → 密文 `khoor, zruog!`（大写 H 变 k，不保留原大小写）。经典凯撒密码通常保留大小写，而面板文案没提这一步 | ⚠️ 未改。是否保留大小写是产品选择（也可能作者刻意简化）。测试按「实际行为」写死了小写归一这条，所以将来若改成保大小写，用例会红、会强制确认。另注：`greedy` 面板的 `Interval` 是 `{start,end}` **对象**而非 `[start,end]` 数组，传数组会因为 `a.end` 为 undefined 让排序比较器静默返回 NaN、贪心一个都不选（本轮我先踩了这个坑） |
| 37 | **同样的数值默认比较器还留在 `bst.ts` 与 `heap.ts` 里**：`new BST<string>()` / `new MaxHeap<string>()` 不传比较器时依旧写死 `(a, b) => a - b`，字符串元素会得到 NaN 从而静默错序。本轮按决定只收敛了 `BSTMap`/`BSTSet` 两处 |
| 38 | **面板的「输入解析层」自己就能把答案算错，而末帧测试看不见它**：`buildSteps` 被喂的是组件 `useMemo` 里 split+filter 之后的数组，所以过滤器丢元素不会让任何一帧「不满足参照」——参照和面板拿到的是同一份被篡改后的输入。实测两处：**(a)** `dp-state-machine-panel` 的价格过滤器写 `n > 0`，把 0 当成非法值丢掉，而它自己的 placeholder 就是 LC309 官方样例 `1,2,3,0,2`：用户照着提示填，面板实际算的是 `[1,2,3,2]` → 显示 **2**，正确答案是 **3**（同一类还有 `safePrices = prices.length >= 2 ? prices : [1,2]`，填单个价格会被整段换成示例）；**(b)** `coordinate-compression-panel` 的过滤器写 `n > 0`，把 0 和**所有负数**丢掉——而「值域含负数/大数所以要离散化」正是这个面板的存在理由，用户填 `0,5,-3,5` 只会看到 `[5]` | ✅ (a) 已改 `n >= 0` 且长度阈值降到 1（`buildSteps([p])` 本来就能正确给出答案 0）；(b) 已去掉数值下界只留 `Number.isFinite`。**(a) 在真跑的 dev 服务上做了判别性 A/B**：`curl /visualizer/dp-state-machine` 的 SSR HTML 里价格格子修复前是 `1,2,3,2`（0 被丢掉），改回旧写法立刻又是 `1,2,3,2`，恢复后是 `1,2,3,0,2`——三次读数一致，证明这一行就是病灶。**(b) 只验到「`buildSteps` 能吃负数与 0」（新增 `[-7,0,3,-7,100]` 一例）＋解析表达式本身**，没能在浏览器里真的往输入框打字：连接器的标签页拿不到布局盒（所有元素 `offsetWidth === 0`、`main.innerText` 停在流式 `loading.tsx` 的「加载中…」），合成 `input` 事件不触发重渲染，dev 与 `next start` 生产构建两种模式下都一样，所以那条用户手输路径**尚未端到端验证**。**教训：末帧测试只锁住「纯函数部分」，输入框→参数这条链需要另外读码；`n > 0` 这种「防崩顺手加的下界」是高危审查点。**顺带记录同类无害项：`binary-search-answer`（木棒长度必须 ≥1）与 `sorting-advanced`（计数排序值域 0..999）的下界是问题本身的约束，不是 bug。
| 39 | 第七批的**变异验证账单**（12 个改动点，逐个按行号改、`cmp` 确认落盘、跑前先看基线是否 0 失败）：10 个被捕获，2 个「存活」经复查都是**等价变异/无效实验**而非漏检——**(a)** Tarjan 把栈上节点的 `low[u]=min(low[u], dfn[v])` 改成 `min(low[u], low[v])` 测不出：另写一版差分实验在 **4000 个随机有向图**上对比两种写法与「可达性闭包」参照，三方 100% 同解、两写法 100% 逐点一致，确认这是教科书两种等价写法；同理 `gcdSnap(a)`→`gcdSnap(b)` 只改中间帧文案，末帧的 `gcdResult` 由后续 `sieveSnap` 重新写入 `gcdFinal`，对末帧断言等价。**(b)** 网络流把 BFS 的穿越条件 `cap-flow > 0` 改成 `cap > 0` 后 jest worker 直接被**栈溢出打死**（增广循环不再终止），属于「变异体本身不可执行」；该面板的图是模块常量、`s=0/t=n-1` 由长度推导、无用户入口，所以不终止在真实产品里不可达。把 BFS 改成不终止之外，同文件的瓶颈值变异（`min(cap-flow)`→`min(cap)`）起初也存活——**那不是等价变异，是我的图太弱**：原两组容量的增广路互不重复用边，改成新图 `[[0,3,2,0],[0,0,2,2],[0,0,0,3],[0,0,0,0]]` 后同一变异立刻失败（面板会得 6、真值 5） | ✅ 已按上述结论处置：补第三组网络流容量、把数论测试从「可选字段 `if (primes)`」改成硬断言并加 gcd/筛法两组分支（`if (x) expect(...)` 这种写法一旦字段名写错就永远绿，是本批最危险的一条假阳性）。**教训：变异存活时先分「等价 / 无效 / 漏检」三态，别急着给面板加断言，也别急着宣布测试有效。****第八批续账（14 个改动点）**：12 捕获、2 个存活且都已定性——柱状图把弹出条件 `>` 改成 `>=` 是等价变异（面积与「最佳区间自洽」都不变；同一文件把宽度公式改错的变异立刻被捕获，证明断言有牙）；归并面板只改函数内局部 `inv` 的变异末帧看不见，原因见第 40 项 (b)。**本批我自己的期望错三处**（跑出来第一反应都当成面板缺陷，逐条读码后判负给自己）：B 树把「孩子数必须 = 键数+1」套到了叶子上（叶子应当是 0）；凸包暴力版把共线边界点也算进顶点集（面板只报转角，与 `refHullSet` 的极角间隙定义不符）；柱状图全零输入时面板用 `bestLeft = bestRight = -1` 当「无矩形」哨兵，我的区间自洽断言去读 `heights[-1]`。
| 40 | 第八批三个「只有读码才看得见」的项：**(a)** `dp-state-compression` 与 `sweep-line` 的 `buildSteps` 对空输入直接崩（`dp[1][0] = 0` 打在长度 1 的数组上 → `Cannot set properties of undefined`；`prevX = events[0][0]` → `reading '0'`）。两者当前 UI 都**不可达**（`dist` 是模块常量、`rects` 的 useState 没有 setter），但 `buildSteps` 已因测试变成对外可用的 API。**(b)** `divide-and-conquer` 同时维护「函数返回的 `inv`」与「全局 `totalInv`」两套计数，而调用点 `rec(0, n, 0)` **把返回值丢掉**——返回值那条链是死代码，展示值只来自全局累加器；所以「局部算错、全局没错」这类 bug 末帧与跨帧断言都看不见。**(c)** 分块面板的区间解析只钳位（`max(0,l)` / `min(n-1,r)`）而**不纠正 l > r**：填 `8,1` 会安静给出 `sum[8..1] = 0`（空区间的和确实是 0，不算错，但对学习者像坏了） | ✅ (a) 两处各加一帧「空输入」提示并配断言（与第 29 项同一手法）；(b) **当初把它叫「死代码」是我判错了**：`inv` 一路累加并出现在写回帧的文案「本段累计逆序对 ${inv}」里，是活的，真正没人用的只有最外层 `rec(0, n, 0)` 丢弃的那个返回值。第九批的处置是把它**接进 state**——`DCState` 新增 `invTotal`，每个写回帧带上本区间累计值，测试断言「`invTotal` == 我对原数组该区间独立数出的逆序对数」；此前那个 `inv += add` 的变异体（当时存活）现在会让 5 例里的 3 例立刻失败，牙齿补上了；(c) 不改行为，等产品决定（要么报错帧、要么自动交换 l/r）
| 41 | **§4「每个面板一个纯函数 `buildSteps`」对 4 个面板根本不成立，而且分母里混进了一个非面板**：`binary-search-panel` / `sorting-panel` / `graph-search-panel` / `tree-traversal-panel` 没有 buildSteps，帧来自 `src/lib/algorithms/` 的 `generateBinarySearchSteps` / `generateSortSteps` / `generateBFSSteps` / `generateDFSSteps` / `insertBST`；另 `code-panel` 是被 `stepper.tsx`、`binary-search-panel`、`graph-search-panel`、`tree-traversal-panel` 四处 import 的共享 CodeBlock 组件——**「126 个可视化面板」这个说法虚高 1** | ✅ 已在 lib 层补齐：新建 `lib/algorithms/graph.test.ts` 18 例（BFS/DFS 的访问顺序与我在同一邻接表上独立跑出的逐点一致、孤立分量不会被访问、深链必有 backtrack、BST 中序升序 + 查询守恒、`generateRandomBST(size)` 节点数 ≤ size 且升序）；`sorting.test.ts` 补 `generateSortSteps` 封装层 24 例（六算法 × 四输入：末步数组等于排序结果、元素守恒、**不改动调用方数组**）+ `generateRandomArray` 3 例。§1 的面板计数已按「125 个可视化面板 + `binary-search-panel2` + `code-panel` 是共享组件」校正 |
| 42 | 第九批把 8 个无参面板提成入参后，暴露三件只有外部数据才看得见的：**（a）** `cdq-divide-conquer` 自己不对第一维排序，输入不按 a 升序时 ans[] 直接算错（默认数据恰好升序，所以一直没人发现）；**（b）** `heavy-light-decomposition` 沿父指针 `for (x = v; x !== u; x = par[x]) seg.push(x)` 上跳，喂进**不是树**的数据（有孤立节点）就无限 push 到 `RangeError: Invalid array length` 崩面板；**（c）** `time-complexity-panel` 的曲线代入值（`Math.ceil(n * log2 n)` 等）**只存在于 message 文案里**，末帧 state 只有 visibleCount/activeN——把它的 ops 公式改成 `n * n`，测试照样全绿，这是本批唯一一次真漏检 | ✅ 三条全部落地（第九批续做）：**(a)** CDQ 现在在函数入口校验并给一帧「输入不合法」（空点集 / a 未按升序 / c 越出 [1, maxC] 三种情形各有明确文案），**(b)** HLD 校验「必须以 0 为根的合法树 + 查询对不越界 + 表长与权值等长」，非法输入给一帧提示而不是无限 push 崩面板（原来那个 `RangeError` 用例现在会命中「有 0 条父边」分支）；两者都用变异验证过牙齿（把校验条件改反，测试立刻红）。**(c)** `ComplexityState` 已新增 `curveOps: { name, ops }[]`，每个代入帧与总结帧都带上六条曲线在该 n 处的值；测试的期望值**只从曲线名推出闭式**（O(n log n) → ⌈n·log₂n⌉ 等），不读面板的 ops 实现——把 `Math.ceil(n * log2 n)` 改成 `n * n` 现在会让 3 例全红，当初那次真漏检已堵上。**本批变异账单：20 站点 19 捕获，1 存活即 (c)；续做之后再验 4 站点（CDQ 校验反置 / HLD 校验反置 / `inv += add + 1` / 复杂度公式改 n²）全部捕获，累计 24 站点 23 捕获。****另：`panel-defaults.test.ts` 那 8 条是为这次重构专门加的保险**——用无参调用跑面板的真实产品路径并与独立参照比对，既证明「只换标识符不动数值」的改造没改坏行为，也证明默认示例本身算得对（LCA、CDQ ans、重链点权和、持久化线段树第 k 小、懒标记区间和、Set/Map 末态、树的直径与重心、带权并查集势差） |
| 43 | **`/tutorials/[slug]` 一直是「动态路由」，而全部可视化页是静态的**：该页 `await searchParams`（`?category=`）把整条路由拖成按需渲染，`generateStaticParams()` 形同虚设；副作用是未知 slug 走动态渲染，`notFound()` 只能渲染出 404 界面，**HTTP 状态码却已经是流式冲刷出去的 200**（对照：未知 `/visualizer/*` 返回真正的 404）。另外只加 `dynamicParams = false` 治不了它——路由本身是动态的，这个开关不起作用（我按行试过，重启服务复测确认无效后回退了）。| ✅ 已按「查询参数交给客户端读」重构：`TutorialSidebar`（`?category=`）、`TutorialTabs`（`?view=`）、`TutorialPager`（`?category=`）改为挂载后用 `window.location.search` + `popstate` 同步，页面不再 `await searchParams` → 路由回到构建期预渲染（`●`），未知 slug 变回真 404。**改造中途踩到自己挖的坑**：第一版只把侧栏包进 `<Suspense>` 就静态化了，结果实测预渲染 HTML 里只剩 11 个 `<a>`、1 个 `<p>`、0 个 h2/h3——整篇正文被兜到客户端。改成上面的写法后复测：`<a>` 173、教程内链去重 137（=完整目录）、h2/h3 20、可见正文 7189 字符、代码块/表格 13，与动态版内容量同级；`/tutorials/array?category=数组` 仍 200 且内容完整。**教训：给「静态化」验收必须量 HTML 里的内容量，光看 200 和构建通过会漏掉「整页被 Suspense 吞掉」这种最坏结果** |
| 44 | **只跑 `prisma:seed` 的新库基本没有题库数据**：`seed.ts` 只建 2 个用户 + 3 分类 + **1 道题**，而前端有 17 个静态题目路由、题目列表页还有标签筛选——真实数据分别在三条手工脚本里（`sync-problems.ts` 17 题、`seed-problems-extra.ts` +161 → 178、`tag-problems.ts` 打标签），README 原先一个字没提；`/api/v1/problems/tags` 在未跑 `tag-problems` 时返回 `[]`，页面看起来就像「功能坏了」。另 `store` 里 `ProgressApi.upsert(...).catch(() => {})` 把写失败吞掉：本地 zustand 状态已变、服务端却没记上（cookie 过期/离线时静默丢进度），无任何提示 | ✅ README 安装段已补这三条脚本并写明顺序（`seed.ts` 有「已存在题目就跳过」的守卫，必须它先跑）；本轮在本地一次性库里实测跑通：178 题、20 分类、标签分布可查。🔶 `upsert` 静默失败属于产品决定（要不要提示/重试队列），未改，仅记录 |
| 45 | 把 291 个页面在浏览器里真点一遍之后，补出四条只有交互才看得见的事：**(a) 我上一轮的 Tab 改造自己有 bug**——`router.replace` 提交 URL 是异步的（实测点完约 100ms 内 `location.search` 才变），而 `notifyUrlChange()` 同步就跑完了，于是订阅者读到的还是旧值，点「可视化」页面不动。改成 `useUrlParam` 可写版（自己 `history.replaceState` + 同步通知）后才是确定性的。**（并且第一次我误判成「修好了还是没切」，是因为在同一次 `evaluate_script` 里点完立刻读 DOM，React 还没 flush——读状态必须换一次调用。）** **(b)** `?category=` 传一个不存在的分类时行为不一致：侧栏静默退回全量目录，而翻页器直接 `return null` 消失。**(c)** 题面「相关教程」的锚文本全是同一个「两数之和 · 讲解」（two-sum 有 4 条，分别指向 hash-table / interview-system / array / two-pointers），光看链接文字分不出差别。**(d)** `/visualizer/searching`、`/graphs`、`/trees` 三个聚合页的预渲染 HTML 近乎空（searching 只有 122 个可见字符），因为面板在 `useEffect` 里现造随机数组，SSR 阶段什么都没有 | ✅ (a) 已修并在浏览器复测：Tab 往返（可视化 ⇄ 讲解）、URL 同步、直达 `?view=visualizer` 会正确激活、切到可视化时正文层只是 `hidden` 不卸载、侧栏 142 条链接全程在。🔶 (b)(c)(d) 属既有行为，只记录未改：(b) 建议无效分类按「无分类」处理；(c) 锚文本带上教程名；(d) 要首屏可见得把示例数据从随机改成固定（或给 SSR 一个默认数组）。**同轮全量扫描（生产构建，291 页）：126 面板页播放器控件齐全、137 教程详情目录内链中位数 138、20 个标记全部定性（17 题目页 SSR 无标题属正常，其 17 个数据端点逐个 200 且含标题+用例；3 个聚合页即 (d)）**
| 46 | 视觉层（主题 / 响应式 / 图渲染）用 Playwright 真量了一遍：仓库没有这个依赖，但全局 `@playwright/cli` 自带 `playwright-core`，用 `executablePath` 指到缓存里的 `chromium-1243` 就能设视口、截图、量 `getComputedStyle`——比浏览器连接器强在**能改视口**。量出六件事：**(a)** 主题本身是通的：`/settings` 点「浅色」→ `<html class="light">`、`--bg #050506→#f7f8fa`、hljs 样式表换 `github.css`，localStorage 持久化，`layout.tsx` 内联脚本在首帧前加类所以不闪。**但 mermaid 图不跟主题**：`MermaidDiagram` 的 `themeVariables` 和容器 `bg-[#0a0a0a] border-[#222] text-gray-300` 全是写死暗色，浅色模式下教程里的流程图是白底上一块黑石板（截图为证）。**(c)** 390px 下三处横向溢出：`/tutorials` 聚合页 539px（分类条 `flex … overflow-x-auto` 所在的 grid 子项缺 `min-w-0`，被 `min-width:auto` 撑到 913px）、`/visualizer/dijkstra` 119px（`Stepper` 的 `headerActions` 容器不换行，装不下面板自带的 `w-64` 输入框；代码列同样缺 `min-w-0`，长代码行把列撑破）、`maximum-subarray` 51px / `searching` 14px（定宽格子行）。**(d)** `/settings` 五个开关三个是空的：`fontSize` 被 `code-editor.tsx` 写死成 `fontSize: 14`，`animationSpeed`、`soundEnabled` 在 store 之外零消费（面板播放速度是 `Stepper` 自己的 0.5x–4x 下拉，跟设置滑杆不是一回事）。**(e)** 每个页面都发一次 `/favicon.ico` 404（`src/app` 下没有任何图标文件）。**(f)** 关于页写「Next.js 15」，实装 16.2.12 | ✅ (b) 改成主题感知：`ensureInitialized(theme)` 换主题时重新 `mermaid.initialize`，render id 带自增序号（**mermaid 按 id 缓存图，不换 id 会拿回旧配色的 SVG**），容器/占位/报错三处颜色换成 `bg-surface border-edge text-ink-2/3`。复测：light 下 wrapper=`rgb(255,255,255)`、节点=`rgb(236,236,255)`，dark 侧数值一字不变（无回归）。**(c)** `headerActions` 加 `flex-wrap justify-end`、两列 grid 与 `<aside>` 加 `min-w-0`、两个面板的格子行加 `overflow-x-auto`；**271 页 × 390px 全量复扫，溢出页数 3 → 0**（127 面板页 + 137 教程 + 聚合页）。**(d)** `fontSize` 接进 Monaco，判别性 A/B：设置 12 / 22 → 编辑器实测 12px / 22px。`animationSpeed`（与面板下拉语义重叠）、`soundEnabled`（要真写音效）未动，只记录。**(e)(f)** 补 `src/app/icon.svg`（Next 自动产出 `<link rel="icon">`，404 消失）、版本号改 16。🔶 两条未改只记录：`--ink-3` 在两个主题下都不达 WCAG AA（dark 3.37:1、light 2.98–3.17:1，而它正是 10–13px 次要文字的默认色），以及 90/126 个面板用了 `text-*-200/300` 与 SVG 字面色 `fill="#e5e7eb"`（共 627 处），浅色主题下会糊——属于设计令牌层面的决定，没擅自改。**探针教训：自写的对比度扫描器把 `btn-gradient` 上的「启动可视化」判成 1.08:1 不可读，实际是渐变底 + 深色字、肉眼正常——`background-image` 不参与 `backgroundColor` 计算，自动扫描的首条样本必须人工看图复核**
| 47 | 按「令牌 + 面板字面色一起改」「接动画速度、留音效」两个拍板做完两层。**(a) 令牌**：`--ink-3` dark `#5d636d`→`#7b828c`（3.37→5.25:1）、light `#8b919b`→`#646b76`（2.98→5.06:1），light `--ok` `#059669`→`#047857`（3.77→5.0:1）。**(b) 浅色调色板回压**：全站 1602 处 `text-<色>-<100..500>` 是为深底设计的浅色，白底上只有 1.1–2.4:1；没有逐文件改类名，而是在 globals.css 加一组 `.light .text-x-200 { … }` 覆盖（彩相压到 700 阶、灰阶映射到 `--ink-2`/`--ink-3`），暗色主题一行不动、新面板自动继承；动手前先量了「同一 class 串里深底+浅字」的反例，只有 1 处（红黑树黑节点），先把它改成 `text-white` 免得被回压规则弄成黑底黑字。**(c) SVG 层是另一套颜色**：28 处 `fill="#9ca3af"` 一类属性字面量（**var() 不能写在 SVG 呈现属性里**，必须 `style={{ fill: 'var(--ink-3)' }}`）；再扫出 JS 色板（`fill={c.text}`、`nodeColor()`）里的一批，规律是**着色态的圆是 15–30% 透明色，浅色主题下等于浅底**，于是定规则：浅底配 `var(--ink)`、实心深色圆保留亮灰——命中 memoization / union-find-advanced / tarjan-scc / heavy-light / eulerian-path / network-flow / persistent-segment-tree / segment-tree-advanced / linked-list-problems 九个面板。**(d) animationSpeed 接线**：设置页滑杆=基准间隔、面板下拉=倍率，`interval = max(40, round(base / mult))`，下拉旁边直接显示 ms | ✅ 复测用两个自建扫描器（HTML WCAG + 几何感知 SVG 版，帧位取 0/50%/100%）：**浅色主题 10 个代表页 + 13 个面板全部 0 处不达标**（改前 home 29、problems 129、tutorial 192、面板 15–18；SVG 侧 memoization 86、tarjan 18、HLD 17、persistent-seg-tree 14、union-find 13 全清零）。暗色主题只剩 **3 处**：`bg-brand`/`bg-ok` 上的白字 3.18:1——要修得改主按钮观感，属口味决定，未动；另 tarjan 深绿 SCC 圆上白字 2.62:1 是改前 `#fff` 就有的问题，不是本次回归。速度实测：基准 1500ms → 3.2s 自动播放走 2 帧、300ms → 10 帧，4x 读数 375ms / 75ms。`soundEnabled` 按决定保持不接。电池：740 tests / tsc 0 / lint 0 errors / build 294 页。**探针两轮假阳性教训：① `background-image`（渐变）不参与 `backgroundColor` 计算；② Tailwind 的 `bg-x-600/80` 和 SVG 的 rgba 填充要按 `fill-opacity × rgba.a` 合成后再比色——第一版我只取 `fillOpacity` 当唯一 alpha，既把浅底浅字算成 1.00:1 的假数值，又漏掉 HLD 的 17 处，比色类探针必须配截图人工复核**

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
