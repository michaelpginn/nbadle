-- CreateTable
CREATE TABLE "PlayerMatchup" (
    "id" SERIAL NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "dailyGameId" INTEGER,

    CONSTRAINT "PlayerMatchup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyGame" (
    "id" SERIAL NOT NULL,
    "dayOf" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyGame_dayOf_idx" ON "DailyGame"("dayOf");

-- AddForeignKey
ALTER TABLE "PlayerMatchup" ADD CONSTRAINT "PlayerMatchup_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchup" ADD CONSTRAINT "PlayerMatchup_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchup" ADD CONSTRAINT "PlayerMatchup_dailyGameId_fkey" FOREIGN KEY ("dailyGameId") REFERENCES "DailyGame"("id") ON DELETE SET NULL ON UPDATE CASCADE;
