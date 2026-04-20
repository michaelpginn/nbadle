-- AlterTable
ALTER TABLE "DailyGame" ADD COLUMN     "correctPerTurn" INTEGER[],
ADD COLUMN     "numUsersPerScore" INTEGER[],
ADD COLUMN     "totalPlays" INTEGER NOT NULL DEFAULT 0;
