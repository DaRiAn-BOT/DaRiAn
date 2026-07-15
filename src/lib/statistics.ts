export type GameStats = { seconds: number; steps: number; attacks: number; shields: number; defeats: number; bosses: number; items: number }
export const emptyStats: GameStats = { seconds: 0, steps: 0, attacks: 0, shields: 0, defeats: 0, bosses: 0, items: 0 }
export type LifetimeStats = GameStats & { games: number; victories: number }
export const emptyLifetimeStats: LifetimeStats = { ...emptyStats, games: 0, victories: 0 }

const LIFETIME_KEY = 'maze-lifetime-statistics'

export function loadLifetimeStats(fallback?: GameStats): LifetimeStats {
  try {
    const saved = JSON.parse(localStorage.getItem(LIFETIME_KEY) ?? 'null') as Partial<LifetimeStats> | null
    return saved ? { ...emptyLifetimeStats, ...saved } : fallback ? { ...fallback, games: 1, victories: 0 } : emptyLifetimeStats
  } catch { return emptyLifetimeStats }
}

export function saveLifetimeStats(stats: LifetimeStats) {
  localStorage.setItem(LIFETIME_KEY, JSON.stringify(stats))
}
