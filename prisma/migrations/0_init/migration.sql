-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "streak" INTEGER NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "nbaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "elo" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nbaIdHash" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeaderboardEntry_weekOf_streak_idx" ON "LeaderboardEntry"("weekOf", "streak" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Player_nbaId_key" ON "Player"("nbaId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_nbaIdHash_key" ON "Player"("nbaIdHash");

