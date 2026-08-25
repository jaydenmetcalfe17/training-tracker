/*
  Warnings:

  - A unique constraint covering the columns `[aca_id]` on the table `athletes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fis_id]` on the table `athletes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[athlete_id,session_id]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.
  - Made the column `athlete_id` on table `attendance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `session_id` on table `attendance` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "parents" DROP CONSTRAINT "fk_athlete";

-- DropForeignKey
ALTER TABLE "parents" DROP CONSTRAINT "fk_user";

-- AlterTable
ALTER TABLE "athletes" ADD COLUMN     "aca_id" INTEGER,
ADD COLUMN     "fis_id" INTEGER;

-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "drill_runs" INTEGER,
ADD COLUMN     "educational_course_runs" INTEGER,
ADD COLUMN     "freeski_runs" INTEGER,
ADD COLUMN     "race_runs" INTEGER,
ADD COLUMN     "race_training_course_runs" INTEGER,
ALTER COLUMN "athlete_id" SET NOT NULL,
ALTER COLUMN "session_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "clubs" (
    "club_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("club_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "team_id" SERIAL NOT NULL,
    "club_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "team_memberships" (
    "team_membership_id" SERIAL NOT NULL,
    "athlete_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "start_date" DATE,
    "end_date" DATE,

    CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("team_membership_id")
);

-- CreateTable
CREATE TABLE "coach_memberships" (
    "coach_membership_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,

    CONSTRAINT "coach_memberships_pkey" PRIMARY KEY ("coach_membership_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubs_name_key" ON "clubs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_club_id_name_key" ON "teams"("club_id", "name");

-- CreateIndex
CREATE INDEX "team_memberships_athlete_id_idx" ON "team_memberships"("athlete_id");

-- CreateIndex
CREATE INDEX "team_memberships_team_id_idx" ON "team_memberships"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_athlete_id_team_id_start_date_key" ON "team_memberships"("athlete_id", "team_id", "start_date");

-- CreateIndex
CREATE INDEX "coach_memberships_user_id_idx" ON "coach_memberships"("user_id");

-- CreateIndex
CREATE INDEX "coach_memberships_team_id_idx" ON "coach_memberships"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "coach_memberships_user_id_team_id_key" ON "coach_memberships"("user_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "athletes_aca_id_key" ON "athletes"("aca_id");

-- CreateIndex
CREATE UNIQUE INDEX "athletes_fis_id_key" ON "athletes"("fis_id");

-- CreateIndex
CREATE INDEX "attendance_athlete_id_idx" ON "attendance"("athlete_id");

-- CreateIndex
CREATE INDEX "attendance_session_id_idx" ON "attendance"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_athlete_id_session_id_key" ON "attendance"("athlete_id", "session_id");

-- CreateIndex
CREATE INDEX "invites_athlete_id_idx" ON "invites"("athlete_id");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("athlete_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("athlete_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("athlete_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_memberships" ADD CONSTRAINT "coach_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_memberships" ADD CONSTRAINT "coach_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("athlete_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
