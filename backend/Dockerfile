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
# binaries.prisma.sh 已不再提供 6.19.3 对应的引擎 commit（c2990dca...），
# postinstall 会在下载上静默挂死。这里注入离线引擎并用官方环境变量指定路径，
# pnpm install 的 postinstall、prisma generate、运行期 migrate deploy 全部离线化。
COPY docker-engines/ /prisma-engines/
ENV PRISMA_QUERY_ENGINE_LIBRARY=/prisma-engines/libquery_engine-debian-openssl-3.0.x.so.node \
    PRISMA_SCHEMA_ENGINE_BINARY=/prisma-engines/schema-engine-debian-openssl-3.0.x
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
# 引擎二进制随镜像携带（migrate deploy 在启动时运行，不能依赖外网）
COPY --from=build /prisma-engines /prisma-engines
ENV PRISMA_QUERY_ENGINE_LIBRARY=/prisma-engines/libquery_engine-debian-openssl-3.0.x.so.node \
    PRISMA_SCHEMA_ENGINE_BINARY=/prisma-engines/schema-engine-debian-openssl-3.0.x
# 保留全量 node_modules，使 ts-node / prisma CLI 在运行时可用（用于 seed）
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/.npmrc ./.npmrc
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
EXPOSE 40001
# 启动时先等 PG 就绪（最多重试 10 次），再 migrate + 运行。
# 注意：seed 已从启动流程中摘掉——它会创建 role=ADMIN 的 admin@example.com，
# 自动跑在每次启动上等于给新库发一个公开口令的后门账号。需要种子数据时手动执行：
#   docker compose exec backend pnpm prisma:seed
CMD ["sh", "-c", "for i in $(seq 1 10); do pnpm prisma migrate deploy && break || sleep 5; done; node dist/src/main.js"]
