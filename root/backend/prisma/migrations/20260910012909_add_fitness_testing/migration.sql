-- CreateTable
CREATE TABLE "fitness_testing_results" (
    "fitness_testing_result_id" SERIAL NOT NULL,
    "athlete_id" INTEGER NOT NULL,
    "test_date" DATE NOT NULL,
    "age_category" VARCHAR(20) NOT NULL,
    "return_to_sport" BOOLEAN NOT NULL DEFAULT false,
    "height" DECIMAL(5,2),
    "weight" DECIMAL(5,2),
    "ais_beep_level" DECIMAL(65,30),
    "beep_max_hr" INTEGER,
    "hex_cw_t1" DECIMAL(65,30),
    "hex_cw_t2" DECIMAL(65,30),
    "hex_cw_t3" DECIMAL(65,30),
    "hex_ccw_t1" DECIMAL(65,30),
    "hex_ccw_t2" DECIMAL(65,30),
    "hex_ccw_t3" DECIMAL(65,30),
    "slj_t1" DECIMAL(65,30),
    "slj_t2" DECIMAL(65,30),
    "slj_t3" DECIMAL(65,30),
    "dlpj_t1" DECIMAL(65,30),
    "dlpj_t2" DECIMAL(65,30),
    "dlpj_t3" DECIMAL(65,30),
    "slpj_left_t1" DECIMAL(65,30),
    "slpj_left_t2" DECIMAL(65,30),
    "slpj_left_t3" DECIMAL(65,30),
    "slpj_right_t1" DECIMAL(65,30),
    "slpj_right_t2" DECIMAL(65,30),
    "slpj_right_t3" DECIMAL(65,30),
    "pushups" INTEGER,
    "pullups" INTEGER,
    "situps" INTEGER,
    "bar_hang" DECIMAL(65,30),
    "box_jumps_30s" INTEGER,
    "box_jumps_60s" INTEGER,
    "box_jumps_total" INTEGER,

    CONSTRAINT "fitness_testing_results_pkey" PRIMARY KEY ("fitness_testing_result_id")
);

-- CreateTable
CREATE TABLE "fitness_tests" (
    "test_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "unit" VARCHAR(30),
    "comparison_direction" VARCHAR(10) NOT NULL,

    CONSTRAINT "fitness_tests_pkey" PRIMARY KEY ("test_id")
);

-- CreateTable
CREATE TABLE "fitness_test_categories" (
    "cat_id" SERIAL NOT NULL,
    "test_id" INTEGER NOT NULL,
    "age_category" VARCHAR(20),
    "gender" VARCHAR(10),
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "fitness_test_categories_pkey" PRIMARY KEY ("cat_id")
);

-- CreateTable
CREATE TABLE "fitness_scoring_rules" (
    "rule_id" SERIAL NOT NULL,
    "cat_id" INTEGER NOT NULL,
    "threshold" DECIMAL(10,3) NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "fitness_scoring_rules_pkey" PRIMARY KEY ("rule_id")
);

-- CreateTable
CREATE TABLE "fitness_tiers" (
    "tier_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "fitness_tiers_pkey" PRIMARY KEY ("tier_id")
);

-- CreateTable
CREATE TABLE "fitness_tier_categories" (
    "tier_category_id" SERIAL NOT NULL,
    "age_category" VARCHAR(20) NOT NULL,
    "gender" VARCHAR(10),

    CONSTRAINT "fitness_tier_categories_pkey" PRIMARY KEY ("tier_category_id")
);

-- CreateTable
CREATE TABLE "fitness_tier_rules" (
    "tier_rule_id" SERIAL NOT NULL,
    "tier_category_id" INTEGER NOT NULL,
    "tier_id" INTEGER NOT NULL,
    "test_id" INTEGER NOT NULL,
    "threshold" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "fitness_tier_rules_pkey" PRIMARY KEY ("tier_rule_id")
);

-- CreateIndex
CREATE INDEX "fitness_testing_results_athlete_id_idx" ON "fitness_testing_results"("athlete_id");

-- CreateIndex
CREATE INDEX "fitness_testing_results_test_date_idx" ON "fitness_testing_results"("test_date");

-- CreateIndex
CREATE UNIQUE INDEX "fitness_tests_name_key" ON "fitness_tests"("name");

-- CreateIndex
CREATE INDEX "fitness_test_categories_test_id_idx" ON "fitness_test_categories"("test_id");

-- CreateIndex
CREATE INDEX "fitness_test_categories_age_category_gender_idx" ON "fitness_test_categories"("age_category", "gender");

-- CreateIndex
CREATE INDEX "fitness_scoring_rules_cat_id_idx" ON "fitness_scoring_rules"("cat_id");

-- CreateIndex
CREATE UNIQUE INDEX "fitness_scoring_rules_cat_id_threshold_key" ON "fitness_scoring_rules"("cat_id", "threshold");

-- CreateIndex
CREATE UNIQUE INDEX "fitness_tiers_name_key" ON "fitness_tiers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fitness_tier_categories_age_category_gender_key" ON "fitness_tier_categories"("age_category", "gender");

-- CreateIndex
CREATE INDEX "fitness_tier_rules_tier_category_id_idx" ON "fitness_tier_rules"("tier_category_id");

-- CreateIndex
CREATE INDEX "fitness_tier_rules_tier_id_idx" ON "fitness_tier_rules"("tier_id");

-- CreateIndex
CREATE INDEX "fitness_tier_rules_test_id_idx" ON "fitness_tier_rules"("test_id");

-- CreateIndex
CREATE UNIQUE INDEX "fitness_tier_rules_tier_category_id_tier_id_test_id_key" ON "fitness_tier_rules"("tier_category_id", "tier_id", "test_id");

-- AddForeignKey
ALTER TABLE "fitness_testing_results" ADD CONSTRAINT "fitness_testing_results_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("athlete_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fitness_test_categories" ADD CONSTRAINT "fitness_test_categories_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "fitness_tests"("test_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fitness_scoring_rules" ADD CONSTRAINT "fitness_scoring_rules_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "fitness_test_categories"("cat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fitness_tier_rules" ADD CONSTRAINT "fitness_tier_rules_tier_category_id_fkey" FOREIGN KEY ("tier_category_id") REFERENCES "fitness_tier_categories"("tier_category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fitness_tier_rules" ADD CONSTRAINT "fitness_tier_rules_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "fitness_tiers"("tier_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fitness_tier_rules" ADD CONSTRAINT "fitness_tier_rules_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "fitness_tests"("test_id") ON DELETE CASCADE ON UPDATE CASCADE;
