# 发布部署手册（DEPLOYMENT.md）

> 面向「发布 AI / 接手工程师」的速查手册。目标是让接手者不踩已知的坑，快速完成构建、启动、数据库与内容部署。
> 最后更新：2026-08-15。

---

## 1. 环境变量

### 后端 `backend/.env`

| 变量 | 值（示例） | 说明 |
|------|-----------|------|
| `DATABASE_URL` | `postgresql://<user>@localhost/algo_platform?schema=public` | PostgreSQL 连接串 |
| `JWT_SECRET` | 强随机串 | **必须**设置，且不能是占位符 `your-super-secret-jwt-key-change-in-production`（启动会报错拒绝） |
| `JWT_EXPIRES_IN` | `7d` | 默认 7 天 |
| `PORT` | `40001` | 后端监听端口 |
| `FRONTEND_ORIGIN` | `https://your-domain` | CORS 白名单，默认 `http://localhost:4000`；同源代理部署下可留空 |
| `TRUST_PROXY` | `1` | 反代后**必设**，否则限流按代理 IP 合并；非数字会退化为 0（见 §7） |
| `SEED_DEMO_PASSWORD` | 自定义 | 仅 `prisma:seed` 用；不设则回落 `demo123`（README 公开值，只可用于本地） |
| `SEED_ADMIN_PASSWORD` | 自定义 | 仅 `prisma:seed` 用；**`NODE_ENV=production` 且未设时 seed 直接报错退出**，不会创建 ADMIN |

> ⚠️ **seed 不再随容器启动自动执行**。`backend/Dockerfile` 的 CMD 已摘掉 `pnpm prisma:seed`——它会在每个新库上建出 `admin@example.com`（`role=ADMIN`，默认口令 `admin123` 且写在 README 里）。需要种子数据时手动跑：
>
> ```bash
> docker compose exec -e SEED_ADMIN_PASSWORD='<强口令>' backend pnpm prisma:seed
> ```
>
> 存量库里若已存在 `admin@example.com`，请立刻改密或降权（它对应的正是这次移除的风险）。

### 前端 `frontend/.env.local`

| 变量 | 值（示例） | 说明 |
|------|-----------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:40001` | 同时驱动前端 baseURL 和 next.config 代理目标；设了会覆盖默认 40001 |

> 鉴权是 **httpOnly cookie**（`access_token`）+ 可选 `Authorization: Bearer` 双通道，前端用 `credentials: 'include'`，无需手动在 header 里塞 token。

---

## 2. 数据库

- 库名：`algo_platform`（schema=public）
- 引擎：PostgreSQL 15（Homebrew `postgresql@15`）
- **PostgreSQL 需手动启动**（brew services 里不自启）。启动方式：

```bash
rm -f /opt/homebrew/var/postgresql@15/postmaster.pid   # 仅当锁文件 PID 指向非 postgres 进程时才删
/opt/homebrew/opt/postgresql@15/bin/pg_ctl -D /opt/homebrew/var/postgresql@15 \
  -l /opt/homebrew/var/log/postgresql@15.log -o "-c listen_addresses='localhost'" start
```

### ⚠️ 迁移注意事项（最重要的坑）

- 项目有 **Prisma 迁移历史 drift**：`tutorials` 表曾在 2026-08-04 手动 `DROP`，没走迁移历史。
- **不要用 `npx prisma migrate dev`**——它会检测到 drift 并强制要求 `migrate reset`，从而**清空全部数据**。
- 修改 `schema.prisma` 后，同步数据库请用：`npx prisma db push`（安全，按 schema 直接同步，不生成迁移文件、不重置）。
- 迁移历史已通过 `20260815153000_resolve_drift` 迁移（`DROP tutorials` + 3 个索引）**标记为 applied** 对齐。当前 `npx prisma migrate status` 应显示 `Database schema is up to date!`。
- 若未来必须恢复 `migrate dev`：先确认 drift 已消除；必要时用 `prisma migrate resolve --applied <name>` 手动标记已应用的迁移，而不是 reset。

### 数据库备份 / 导出

- 备份目录：`backups/`（**应加入 `.gitignore`，含真实数据勿提交**）。
- 导出三件套（schema / 数据 / custom dump）：

```bash
pg_dump -d algo_platform --schema-only --no-owner --no-privileges -f backups/algo_platform_schema.sql
pg_dump -d algo_platform --no-owner --no-privileges -f backups/algo_platform_full.sql
pg_dump -d algo_platform -F c --no-owner --no-privileges -f backups/algo_platform.dump
```

- 恢复：`pg_restore -d algo_platform backups/algo_platform.dump`（custom）或 `psql -d algo_platform -f backups/algo_platform_full.sql`。

---

## 3. 构建与启动

```bash
# 后端（包管理器统一用 pnpm，两端各有 pnpm-lock.yaml；不要用 npm install，会绕过锁文件）
cd backend && pnpm install --frozen-lockfile
pnpm run build            # nest build（tsc）
pnpm run start:prod       # = node dist/src/main.js，正式启动方式

# ⚠️ 不要用 `pnpm run start`（= nest start）：它会把 dist 当自己的产物重写，
#    与 start:prod 的二进制入口不是一条路径。

# 需要种子数据时（不再随启动自动执行）：
#   pnpm run prisma:seed   # 只在空库上生效；生产必须带 SEED_ADMIN_PASSWORD，否则报错退出

# 前端
cd frontend && pnpm install --frozen-lockfile
pnpm build               # 生产构建（含 137 篇教程 + 126 个可视化静态生成）
pnpm start               # 生产运行
# 开发：pnpm dev
```

---

## 4. 端口与代理

- 后端：`40001`（`PORT` 环境变量可覆盖）。
- 前端：Next.js 通过 `next.config.ts` 的 rewrites 把 `/api/v1/*` 代理到 `${NEXT_PUBLIC_API_URL ?? http://localhost:40001}`，浏览器只访问前端，不跨域。
- **本机 3000 端口可能被其他项目占用**（历史上有个「仿小红书小程序」后端跑在 3000），排查时别把 3000 当成本项目后端。

---

## 5. 内容系统（教程 / 可视化）

- 教程 **100% 本地 `.md`**：`frontend/src/app/tutorials/*.md`（共 137 篇），前端 `loadTutorialIndex()` 直接扫描文件，不依赖后端 tutorials 表。
- 标题取**首个 H1**（缺失会退化为 slug，例如 `merge-sort`）；分类优先 frontmatter，否则回退 `lib/tutorial-list.ts` 的 `TUTORIAL_CATEGORY_MAP`。
- **每篇必须在 `lib/tutorial-resources.ts` 注册**，否则底部「相关教程/可视化/配套练习」卡片不渲染。
- **正文不要手写「## 相关阅读」章节**（会与自动卡片重复）。
- `TUTORIAL_LIST` 控制「上一篇/下一篇」与 roadmap；新增 `.md` 需同步登记。
- 内容写作规范原先记在 `.cursor/rules/algorithm-content-craft.md`，该文件未随仓库发布；上述四条是它的可执行子集，其余约定看 `frontend/src/app/tutorials/` 里既有的 137 篇即可对照。

---

## 6. 发布前检查清单

- [ ] 前端 `pnpm build` 通过（0 错误）
- [ ] 后端 `pnpm build` 通过（0 错误）
- [ ] 前端 `pnpm typecheck` / `pnpm lint` / `pnpm test` 全绿（CI 同口径，见 `.github/workflows/ci.yml`）
- [ ] `npx prisma migrate status` 显示 `Database schema is up to date!`
- [ ] 环境变量齐全（`DATABASE_URL` / `JWT_SECRET` / `JWT_EXPIRES_IN` / `PORT` / `NEXT_PUBLIC_API_URL`；反代后 `TRUST_PROXY=1`）
- [ ] 生产库里**不存在**默认口令的 `admin@example.com` / `demo@example.com`（seed 已不随启动执行；跑过的话请改密或降权）
- [ ] `NODE_ENV=production` 下 `/api/docs` 返回 404（Swagger 只在非生产挂载）
- [ ] `backups/` 已加入 `.gitignore`（避免误提交数据）
- [ ] 数据库已按需导出到 `backups/`

---

## 7. 已知坑速查

| 坑 | 正确做法 |
|----|----------|
| `prisma migrate dev` 要求 reset | 改用 `npx prisma db push` |
| 后端 `pnpm run start` 与 `start:prod` 混用 | 生产统一 `pnpm run build && pnpm run start:prod` |
| PostgreSQL 连不上 | brew postgresql@15 需手动 `pg_ctl start` |
| 3000 端口不通 | 本项目后端在 40001，3000 可能是别的项目 |
| 教程页面标题显示成 slug | 该 `.md` 首行不是 `# 标题` |
| 教程底部没有相关资源卡片 | 该 slug 没在 `lib/tutorial-resources.ts` 注册 |
| `app.set('trust proxy')` 报 TS2339 | `main.ts` 需用 `NestFactory.create<NestExpressApplication>(AppModule)` 并 import `@nestjs/platform-express` |
| `TRUST_PROXY` 填了非数字 | `main.ts` 的 `resolveTrustProxy()` 会退回 0（不信任代理头），不会再把 NaN 传给 proxy-addr 逐请求 500 |
| 新库一起容器就多了 ADMIN 账号 | seed 已从 `backend/Dockerfile` 的 CMD 摘掉；确需种子数据时手动执行并带 `SEED_ADMIN_PASSWORD` |
| 登出后旧令牌仍可用 | `users.token_version` + JWT 的 `tv` 声明做吊销；**部署本次改动须先 `prisma migrate deploy`**，否则旧令牌全部失效且新字段缺失 |
| 题解执行器仍是同源 JS 通道 | `problem-solver.tsx` 在 blob Worker 里跑入库代码，Worker 与页面同源，可发起带 cookie 的请求。彻底隔离需把执行器放到**独立源**（如 `runner.<domain>`）；本轮只摘掉了 `code-editor.tsx` 的主线程 `eval` 兜底 |
| `problems/<未知 slug>` 是软 404（HTTP 200） | **未修**。根因是 `app/loading.tsx` 让该路由走流式渲染，静态壳先以 200 冲出，之后 `notFound()` 无法回改状态；`tutorials/[slug]` 能真 404 是因为 `dynamicParams=false` 在路由层就拒绝。要修需二选一：加 `middleware.ts` 在流开始前返回 404，或构建期枚举全部题目 slug（当前库 2124 题，代价不可接受）。详见 `PROJECT_MAP.md` §8 第 56 项 |

---

_本手册基于 2026-08-15 实际排查整理，覆盖前端、后端、数据库、内容系统四大块。_
