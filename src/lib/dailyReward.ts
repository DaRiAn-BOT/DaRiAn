const DAILY_REWARD_KEY = 'maze-daily-echo-date'

export function claimDailyEcho(): number {
  const now = new Date()
  const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  if (localStorage.getItem(DAILY_REWARD_KEY) === today) return 0
  localStorage.setItem(DAILY_REWARD_KEY, today)
  return 5
}
