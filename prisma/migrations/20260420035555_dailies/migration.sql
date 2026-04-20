/*
  Warnings:

  - You are about to drop the column `dayOf` on the `DailyGame` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameDate]` on the table `DailyGame` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameDate` to the `DailyGame` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DailyGame_dayOf_idx";

-- AlterTable
ALTER TABLE "DailyGame" DROP COLUMN "dayOf",
ADD COLUMN     "gameDate" DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DailyGame_gameDate_key" ON "DailyGame"("gameDate");

-- CreateIndex
CREATE INDEX "DailyGame_gameDate_idx" ON "DailyGame"("gameDate");
