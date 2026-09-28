-- 令牌吊销：JWT 里带 tv 声明，登出/改密时递增本列即可让已发令牌立刻失效
-- AlterTable
ALTER TABLE "users" ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 0;
