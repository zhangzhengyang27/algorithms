# 前端 Next.js 多阶段构建
# 关键：build 阶段必须显式设 NEXT_PUBLIC_API_URL=http://backend:40001。
#      否则会读到源码里的 .env.local（localhost:40001）并被 next build 内联进镜像，
#      导致运行时 rewrites 代理到错误地址（ECONNREFUSED）。real env 会覆盖 .env 文件。

FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app
ENV CI=true
COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./
RUN pnpm install --no-frozen-lockfile
COPY . .
# 决定 rewrites 代理目标的真实后端地址（compose 服务名，运行时由 frontend 容器解析到 backend 容器）。
# 必须在 pnpm build 之前、且在 .env.local 被 COPY 进来之后设置——real env 会覆盖 .env.local 里的 localhost:40001。
ENV NEXT_PUBLIC_API_URL=http://backend:40001
# next build 较重（137 教程 + 126 可视化 SSG + Monaco/Mermaid），加大内存上限
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN pnpm build

FROM node:22-slim AS run
ENV NODE_ENV=production
ENV CI=true
RUN corepack enable
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
# 教程详情页(读取 searchParams)与首页在运行时为动态 SSR，会通过
# process.cwd()/src/app/tutorials 读取 .md 源文件。运行容器必须包含 src/，
# 否则 readFile/readdir 抛 ENOENT，导致 "Server Components render" 崩溃。
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/.npmrc ./.npmrc
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
EXPOSE 4000
CMD ["pnpm", "start", "-p", "4000"]
