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
# 后端
cd backend && npm install
npm run build            # nest build（tsc），可正常执行
npm run start:prod       # = node dist/src/main.js，正式启动方式

# ⚠️ 不要用 `npm run start`（= nest start webpack）：
#    它会清空 dist 并触发 sandbox 的批量删除守卫，导致启动被拦崩。

# 前端
cd frontend && pnpm install
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
- 详细内容规范见 `.cursor/rules/algorithm-content-craft.md`。

---

## 6. 发布前检查清单

- [ ] 前端 `pnpm build` 通过（0 错误）
- [ ] 后端 `npm run build` 通过（0 错误）
- [ ] `npx prisma migrate status` 显示 `Database schema is up to date!`
- [ ] 环境变量齐全（`DATABASE_URL` / `JWT_SECRET` / `JWT_EXPIRES_IN` / `PORT` / `NEXT_PUBLIC_API_URL`）
- [ ] `backups/` 已加入 `.gitignore`（避免误提交数据）
- [ ] 数据库已按需导出到 `backups/`

---

## 7. 已知坑速查

| 坑 | 正确做法 |
|----|----------|
| `prisma migrate dev` 要求 reset | 改用 `npx prisma db push` |
| 后端 `npm run start` 崩 | 用 `npm run build && npm run start:prod` |
| PostgreSQL 连不上 | brew postgresql@15 需手动 `pg_ctl start` |
| 3000 端口不通 | 本项目后端在 40001，3000 可能是别的项目 |
| 教程页面标题显示成 slug | 该 `.md` 首行不是 `# 标题` |
| 教程底部没有相关资源卡片 | 该 slug 没在 `lib/tutorial-resources.ts` 注册 |
| `app.set('trust proxy')` 报 TS2339 | `main.ts` 需用 `NestFactory.create<NestExpressApplication>(AppModule)` 并 import `@nestjs/platform-express` |
| 运行题目代码冻结页面 | 已在 Web Worker 中执行 + 3s 超时（`problem-solver.tsx`） |

---

_本手册基于 2026-08-15 实际排查整理，覆盖前端、后端、数据库、内容系统四大块。_
