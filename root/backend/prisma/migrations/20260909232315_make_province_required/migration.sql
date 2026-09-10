/*
  Warnings:

  - Made the column `province` on table `clubs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "clubs" ALTER COLUMN "province" SET NOT NULL;
