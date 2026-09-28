# 算法可视化学习平台

> 一个面向个人学习者的算法可视化学习平台，支持可视化、Monaco 代码编辑器、Markdown 教程和题解库。

## 功能特性

- **126 个交互式可视化面板** - 覆盖排序 / 搜索 / 数组 / 链表 / 栈 / 队列 / 树（BST/AVL/红黑/B 树/线段树/树状数组/Treap/…）/ 图论 / 动态规划 / 字符串 / 数论 / 计算几何，共 127 个可视化路由页
- **137 篇算法教程** - Markdown 撰写，Mermaid 配图，Python/TS 双语代码页签，跨文档跳转与上/下篇导航
- **题库** - LeetCode 风格题目（19 个题页），含题解页签、公司出现频次、题目评论
- **Monaco 代码编辑器 + 在线执行** - 前端内置 Java/Python 模拟执行器，把代码运行过程逐步可视化
- **学习闭环** - 学习进度追踪（含活动日历）、错题本、学习计划、技能路线图、统计面板
- **账号与权限** - 注册/登录/JWT 刷新，`ADMIN` 角色才能增删改题目

## 技术栈

### 前端
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand (状态管理)
- Monaco 编辑器 · Mermaid

### 后端
- NestJS 11
- Prisma 6
- PostgreSQL（版本取决于你的实例，见 `PROJECT_MAP.md` §2 的口径说明）
- Passport / JWT · Swagger · @nestjs/throttler

> 生产镜像与本地开发都要求 Node 22+：Dockerfile 钉 `node:22-slim`，两端 `package.json` 有 `"engines": { "node": ">=22" }`（未开 `engine-strict`，故本地 v24 也放行）。

## 快速开始

### 安装依赖

包管理器用 **pnpm**（前后端各为独立 workspace，各有 `pnpm-lock.yaml`；不要混用 `npm install`，会绕过锁文件）：

```bash
# 前端
cd frontend && pnpm install --frozen-lockfile

# 后端
cd backend && pnpm install --frozen-lockfile
```

### 配置数据库

1. 确保 PostgreSQL 已运行（本地实测 Homebrew `postgresql@15`；`docker-compose.yml` 注释指向 NAS 上的 PG 16；实际以你的实例为准）
2. 创建数据库：
```bash
createdb algo_platform
```

3. 生成 client、应用迁移、灌种子数据：
```bash
cd backend
cp ../.env.example .env        # 然后填入真实 DATABASE_URL / JWT_SECRET
pnpm run prisma:generate
pnpm run prisma:migrate        # = prisma migrate deploy（应用已提交的迁移）
pnpm run prisma:seed           # 建 demo/admin 用户 + 3 分类 + 1 道题
# 题库的真实数据在下面三个脚本里，只跑 prisma:seed 的话「题库」几乎是空的：
npx ts-node prisma/sync-problems.ts        # 17 题：覆盖前端 17 个静态题目路由
npx ts-node prisma/seed-problems-extra.ts  # 再补 161 题 → 共 178
npx ts-node prisma/tag-problems.ts         # 题目标签（/problems/tags 与标签筛选靠它）
```

> 🔒 迁移脚本已提供安全映射：`pnpm run prisma:migrate` = `prisma migrate deploy`、`prisma:status` = `prisma migrate status`、`prisma:push` = `prisma db push`（改 schema 用后者）。
> **仍不要手敲 `prisma migrate dev`** —— 本项目存在过迁移 drift，它会强制 `migrate reset` 从而清空数据（详见 `docs/DEPLOYMENT.md`）。

4. 前端本地开发还需要一个后端不需要的变量（否则所有 API 调用会静默失败，见 `PROJECT_MAP.md` §7）：
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:40001
```

> 教程内容**不需要任何同步步骤**：真相源就是仓库里的 `frontend/src/app/tutorials/*.md`，由 `src/lib/tutorial-page.tsx` 在渲染时直接读取。
> （历史说明：早期是 git-as-CMS 模式，需跑 `backend/prisma/sync-tutorials.ts` 把 `.md` upsert 进 `Tutorial` 表并在 `CATEGORY_MAP`/`TUTORIAL_ORDER` 登记。该脚本、`TutorialsModule` 与 `Tutorial` model 已于 2026-08-04 一并移除，**新增教程只要放 `.md` 文件即可**。）

### 启动开发服务器

```bash
# 终端 1: 后端（:40001）
cd backend && pnpm dev

# 终端 2: 前端（:4000）
cd frontend && pnpm dev
```

访问 http://localhost:4000

## 项目结构

```
algorithms/
├── frontend/            # Next.js 16 前端
│   └── src/
│       ├── app/         # 页面路由：tutorials(137 篇 .md + 动态路由) · visualizer(127 页)
│       │               # problems · progress · wrong-book · study-plan · roadmap · stats · login · settings
│       ├── components/  # visualizer(127 个 *-panel*.tsx = 126 个面板 + code-panel 共享组件；stepper 是引擎) · tutorial · problem · editor · ui …
│       ├── lib/         # algorithms/ · java-tracer · python-tracer · solution-tracer · api / api-client
│       └── store/       # Zustand 状态
├── backend/             # NestJS 11 后端
│   ├── src/modules/     # auth · problems · categories · progress · notes · comments（共 6 个，教程模块已移除）
│   ├── src/common/      # jwt-auth.guard · roles.guard · current-user · roles 装饰器
│   └── prisma/          # schema.prisma(6 model) · migrations/ · seed.ts
└── docs/DEPLOYMENT.md   # 部署说明
```

> 完整工程地图（可视化引擎契约、鉴权流程、数据模型、前后端连接、已知陷阱）见 **[PROJECT_MAP.md](./PROJECT_MAP.md)**。

## 内容规模

- 教程 **137 篇** Markdown，覆盖排序、搜索、递归、链表/栈/队列/哈希、各类树（BST/AVL/红黑/B 树/线段树/树状数组/Treap/后缀自动机…）、图论、DP（背包/区间/状压/数位/树形）、字符串、数论、计算几何、复杂度分析。
- 可视化 **126 个面板 / 127 个路由页**（`components/visualizer/` 有 127 个 `*-panel*.tsx`，其中 `code-panel.tsx` 是共享的代码块组件）。
- 题库 **19 题**（数据在 PostgreSQL，非 git）。

## 演示账号

仅由 `pnpm prisma:seed` 在**空库**上创建；容器启动流程已不再自动跑 seed（见下）。

```
邮箱: demo@example.com   密码: demo123    # role=USER
邮箱: admin@example.com  密码: admin123   # role=ADMIN，仅用于本地开发
```

> ⚠️ 生产库不要用默认口令：`NODE_ENV=production` 且未设 `SEED_ADMIN_PASSWORD` 时 seed 会直接报错退出。
> 手动播种：`docker compose exec -e SEED_ADMIN_PASSWORD='<强口令>' backend pnpm prisma:seed`

## API 文档

后端启动后访问：http://localhost:40001/api/docs

> Swagger 会枚举全部路由，因此**只在非 production 挂载**（`NODE_ENV=production` 时该路径 404）。
> 前端通过 Next.js 重写代理把 `/api/v1/*` 转发到后端 `:40001`，浏览器只需访问前端 `:4000`，无需单独配置跨域。

## 发布部署

完整的构建、启动、环境变量、数据库迁移/备份与内容系统说明见 **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**。发布前务必先读，尤其注意：**不要用 `prisma migrate dev`（会触发 reset 清空数据），改 schema 请用 `prisma db push`**。

## 许可证

MIT — 详见 [LICENSE](./LICENSE)。
