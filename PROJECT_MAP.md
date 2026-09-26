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
| 10 | `backend/package.json` 的 `prisma:migrate` 脚本 = `prisma migrate dev`，即文档自己禁止的清库命令 | ⚠️ **未修**，见 §9 危险提示 |
| 11 | `backend/devDependencies` 含 `eslint-config-next@16`（Next 专用预设），且后端无 `lint` 脚本 | ⚠️ 未修，属无效依赖 |
| 12 | 本地 node v24 与 Dockerfile `node:22-slim` 不一致；`package.json` 无 `engines` 约束 | ⚠️ 未修，CI 暂按 22（与生产镜像对齐） |
| 13 | `next.config.ts` rewrite 兜底 host 为 compose 服务名 `http://backend:40001`，新克隆无 `.env.local` 则 API 全挂 | ⚠️ 未修，见 §7 |
| 14 | 测试覆盖与资产规模严重不匹配：126 个可视化面板 + 3050 行 tracer 代码，前端仅 2 个测试文件 41 例；后端 2 个 spec 12 例 | ⚠️ 未修，已加 CI 门禁但门禁只能守住「已有 53 例」 |
| 15 | `frontend/` 此前无 `test` 脚本（有 `jest.config.cjs` 却无入口） | ✅ 已补 `"test": "jest"` |
| 16 | `.env.example` 与 `docker-compose.yml` 注释里写了内网真实地址与库用户名 | ✅ 已改为占位符；真实地址仅存在于不入库的 `backend/.env` |
| 17 | README 声明 MIT 但无 `LICENSE` 文件 | ✅ 已补（版权行取自 git identity，若不符请改） |

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

> 🚨 **危险：`backend/package.json` 的 `prisma:migrate` 脚本值是 `prisma migrate dev`。**
> 这正是 `README.md` 与 `docs/DEPLOYMENT.md` 明令禁止、且注释写明「会触发 reset 清空数据」的命令，而它是仓库里**唯一**名为 migrate 的脚本 —— 照着脚本名敲就会清库。改动 schema 请显式用 `prisma db push`（开发）或 `prisma migrate deploy`（生产），并在修好这个脚本前把它当作陷阱。

> ⚠️ 旧版本文在此列的 `npx ts-node prisma/sync-tutorials.ts` 已随教程后端移除而不存在（文件已删），教程不再需要同步步骤。

> 说明：`.env` 需要 `DATABASE_URL` / `JWT_SECRET` / `JWT_EXPIRES_IN` / `PORT=40001`；前端本地开发还需 `frontend/.env.local` 的 `NEXT_PUBLIC_API_URL`（见 §7 陷阱）。

---

_初版生成：2026-07-29 · 最近一次按磁盘实测全面校正：2026-09-26（同日修复 #8/#15/#16/#17）。_
