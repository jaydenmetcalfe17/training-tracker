-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "athletes" (
    "athlete_id" SERIAL NOT NULL,
    "athlete_first_name" VARCHAR(100) NOT NULL,
    "athlete_last_name" VARCHAR(100) NOT NULL,
    "birthday" DATE,
    "gender" VARCHAR(10) NOT NULL,
    "team" VARCHAR(255),
    "age_group" VARCHAR(10),

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("athlete_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_id" SERIAL NOT NULL,
    "session_day" DATE,
    "start_time" TIME(6),
    "end_time" TIME(6),
    "location" VARCHAR(50),
    "discipline" VARCHAR(20),
    "snow_conditions" VARCHAR(50),
    "vis_conditions" VARCHAR(50),
    "terrain_type" VARCHAR(50),
    "num_freeski_runs" INTEGER,
    "num_drill_runs" INTEGER,
    "num_educational_course_runs" INTEGER,
    "num_gates_educational_course" INTEGER,
    "num_race_training_course_runs" INTEGER,
    "num_gates_race_training_course" INTEGER,
    "num_race_runs" INTEGER,
    "num_gates_race" INTEGER,
    "general_comments" VARCHAR(250),
    "created_by" INTEGER,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "attendance_id" SERIAL NOT NULL,
    "athlete_id" INTEGER,
    "session_id" INTEGER,
    "individual_comments" VARCHAR(500),

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "first_name" VARCHAR(250),
    "last_name" VARCHAR(250),
    "email" VARCHAR(100),
    "password" VARCHAR(200),
    "status" TEXT,
    "google_id" TEXT,
    "athlete_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "parents" (
    "athlete_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("athlete_id","user_id")
);

-- CreateTable
CREATE TABLE "invites" (
    "invite_id" SERIAL NOT NULL,
    "athlete_id" INTEGER,
    "token" VARCHAR(128) NOT NULL,
    "role" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "used" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("invite_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "fk_athlete" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("athlete_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

