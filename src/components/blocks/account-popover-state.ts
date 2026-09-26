export function dailyRewardState(days: readonly string[], now: Date) {
  const today = now.toISOString().slice(0, 10);
  const claimedToday = days.includes(today);
  const claimed = new Set(days);
  const end = Date.parse(today) - (claimedToday ? 0 : 86400000);
  let completed = 0;
  for (let index = 0; index < 7; index++) {
    if (!claimed.has(new Date(end - index * 86400000).toISOString().slice(0, 10))) break;
    completed++;
  }
  return { today, claimedToday, completed, nextClaimAt: new Date(Date.parse(today) + 86400000) };
}
