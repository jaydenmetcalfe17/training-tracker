-- CreateTable
CREATE TABLE "sessions_teams" (
    "session_team_id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,

    CONSTRAINT "sessions_teams_pkey" PRIMARY KEY ("session_team_id")
);

-- CreateIndex
CREATE INDEX "sessions_teams_session_id_idx" ON "sessions_teams"("session_id");

-- CreateIndex
CREATE INDEX "sessions_teams_team_id_idx" ON "sessions_teams"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_teams_session_id_team_id_key" ON "sessions_teams"("session_id", "team_id");

-- AddForeignKey
ALTER TABLE "sessions_teams" ADD CONSTRAINT "sessions_teams_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_teams" ADD CONSTRAINT "sessions_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;
