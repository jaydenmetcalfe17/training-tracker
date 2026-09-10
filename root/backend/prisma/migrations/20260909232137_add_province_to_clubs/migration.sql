-- AlterTable
ALTER TABLE "auth_sessions" RENAME CONSTRAINT "session_pkey" TO "auth_sessions_pkey";

-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "province" VARCHAR(25);
