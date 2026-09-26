-- 补齐迁移历史：tutorials 表已于 2026-08-04 手动 DROP，未走迁移。
DROP TABLE IF EXISTS "tutorials" CASCADE;

-- 补齐此前通过 `prisma db push` 添加的三个索引（schema.prisma 的 @@index）。
CREATE INDEX IF NOT EXISTS "problems_category_id_idx" ON "problems"("category_id");
CREATE INDEX IF NOT EXISTS "progress_problem_id_idx" ON "progress"("problem_id");
CREATE INDEX IF NOT EXISTS "notes_user_id_idx" ON "notes"("user_id");
