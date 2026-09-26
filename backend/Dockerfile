# 后端 NestJS 多阶段构建
# 关键：bcrypt 是原生模块，build 阶段需 python3/make/g++ 编译；
#       runtime 阶段保留全量 node_modules（含 ts-node/prisma），以便 `pnpm prisma:seed` 可跑。

FROM node:22-slim AS build
RUN corepack enable \
 && apt-get update \
 && apt-get install -y python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV CI=true
COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./
RUN pnpm install --no-frozen-lockfile
COPY . .
# openssl 必须在 prisma generate 之前装好，否则 Prisma 检测不到版本、
# 会按 openssl-1.1.x 生成引擎，而 node:22-slim(Debian12) 只有 libssl3，导致引擎加载失败。
RUN apt-get update \
 && apt-get install -y openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN pnpm prisma generate \
 && pnpm build

FROM node:22-slim AS run
ENV NODE_ENV=production
ENV CI=true
RUN corepack enable \
 && apt-get update \
 && apt-get install -y openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# 保留全量 node_modules，使 ts-node / prisma CLI 在运行时可用（用于 seed）
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/.npmrc ./.npmrc
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
EXPOSE 40001
# 启动时先等 PG 就绪（最多重试 10 次），再 migrate + seed + 运行
CMD ["sh", "-c", "for i in $(seq 1 10); do pnpm prisma migrate deploy && break || sleep 5; done; pnpm prisma:seed; node dist/src/main.js"]
