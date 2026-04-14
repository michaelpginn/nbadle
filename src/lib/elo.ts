/**
 * Returns the K-factor for a player based on their vote count.
 * Higher K = more aggressive rating changes for new players.
 */
export function getK(voteCount: number): number {
  if (voteCount < 10) return 64;
  if (voteCount < 30) return 48;
  if (voteCount < 100) return 32;
  return 16;
}

/**
 * Expected score for player A given both ELO ratings.
 * Returns a value between 0 and 1.
 */
export function expectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

/**
 * Calculates new ELO scores after a match.
 * @param winnerElo  - ELO of the winner before the match
 * @param loserElo   - ELO of the loser before the match
 * @param winnerVotes - Vote count of the winner (used for K)
 * @param loserVotes  - Vote count of the loser (used for K)
 */
export function calculateNewElos(
  winnerElo: number,
  loserElo: number,
  winnerVotes: number,
  loserVotes: number
): { newWinnerElo: number; newLoserElo: number } {
  const kWinner = getK(winnerVotes);
  const kLoser = getK(loserVotes);
  const k = (kWinner + kLoser) / 2;

  const expectedWinner = expectedScore(winnerElo, loserElo);
  const expectedLoser = 1 - expectedWinner;

  return {
    newWinnerElo: winnerElo + k * (1 - expectedWinner),
    newLoserElo: loserElo + k * (0 - expectedLoser),
  };
}
