/*
  Warnings:

  - Added the required column `category` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('ADVENTURE', 'CULTURE', 'FOOD', 'RELAXATION', 'NIGHTLIFE', 'SHOPPING', 'NATURE', 'OTHER');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "category" "ActivityCategory" NOT NULL;
