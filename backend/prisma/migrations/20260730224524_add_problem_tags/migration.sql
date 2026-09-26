-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
