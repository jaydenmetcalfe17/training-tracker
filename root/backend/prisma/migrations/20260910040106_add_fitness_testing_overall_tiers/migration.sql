-- CreateTable
CREATE TABLE "fitness_overall_tier_rules" (
    "overall_tier_rule_id" SERIAL NOT NULL,
    "tier_category_id" INTEGER NOT NULL,
    "tier_id" INTEGER NOT NULL,
    "threshold" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "fitness_overall_tier_rules_pkey" PRIMARY KEY ("overall_tier_rule_id")
);

-- CreateIndex
CREATE INDEX "fitness_overall_tier_rules_tier_category_id_idx" ON "fitness_overall_tier_rules"("tier_category_id");

-- CreateIndex
CREATE INDEX "fitness_overall_tier_rules_tier_id_idx" ON "fitness_overall_tier_rules"("tier_id");

-- CreateIndex
CREATE UNIQUE INDEX "fitness_overall_tier_rules_tier_category_id_tier_id_key" ON "fitness_overall_tier_rules"("tier_category_id", "tier_id");

-- AddForeignKey
ALTER TABLE "fitness_overall_tier_rules" ADD CONSTRAINT "fitness_overall_tier_rules_tier_category_id_fkey" FOREIGN KEY ("tier_category_id") REFERENCES "fitness_tier_categories"("tier_category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fitness_overall_tier_rules" ADD CONSTRAINT "fitness_overall_tier_rules_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "fitness_tiers"("tier_id") ON DELETE CASCADE ON UPDATE CASCADE;
