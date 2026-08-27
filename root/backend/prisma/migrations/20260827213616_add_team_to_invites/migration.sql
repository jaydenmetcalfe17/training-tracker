-- AlterTable
ALTER TABLE "invites" ADD COLUMN     "team_id" INTEGER;

-- CreateIndex
CREATE INDEX "invites_team_id_idx" ON "invites"("team_id");

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("athlete_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;
