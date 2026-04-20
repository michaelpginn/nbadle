export function getDayOf(date: Date): Date {
  /**
   * Turn any day into an EST midnight date
   */
  const estOffsetMs = 5 * 60 * 60 * 1000;
  date = new Date(date.getTime() - estOffsetMs);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function getDayOfToday() {
  return getDayOf(new Date()).toISOString();
}

export function getWeekOf(): Date {
  // Treat week boundaries as midnight Monday EST (UTC-5 = 05:00 UTC)
  const now = new Date();
  const estOffsetMs = 5 * 60 * 60 * 1000;
  const estNow = new Date(now.getTime() - estOffsetMs);
  const day = estNow.getUTCDay(); // 0 = Sunday in EST
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(estNow);
  monday.setUTCDate(estNow.getUTCDate() - daysToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}
