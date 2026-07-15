import { useCallback, useEffect, useRef, useState } from 'react'
import { achievementList, type Achievement } from '../lib/achievements'
import type { GameStats } from '../lib/statistics'

export function useAchievements(initial: string[], stats: GameStats) {
  const [unlocked, setUnlocked] = useState(initial)
  const [notification, setNotification] = useState<Achievement | null>(null)
  const unlockedRef = useRef(new Set(initial))
  const unlock = useCallback((id: string) => {
    if (unlockedRef.current.has(id)) return
    unlockedRef.current.add(id)
    setUnlocked((current) => [...current, id])
    setNotification(achievementList.find((item) => item.id === id) ?? null)
  }, [])

  useEffect(() => {
    if (stats.bosses >= 1) unlock('first_boss')
    if (stats.bosses >= 5) unlock('seasoned')
    if (stats.steps >= 100) unlock('scout')
    if (stats.steps >= 250) unlock('traveler')
    if (stats.steps >= 1000) unlock('wanderer')
    if (stats.steps >= 2500) unlock('cartographer')
    if (stats.attacks >= 100) unlock('fighter')
    if (stats.attacks >= 250) unlock('blade_master')
    if (stats.shields >= 50) unlock('defender')
    if (stats.shields >= 150) unlock('iron_wall')
    if (stats.shields >= 300) unlock('fortress')
    if (stats.items >= 1) unlock('first_loot')
    if (stats.items >= 3) unlock('collector')
    if (stats.items >= 6) unlock('full_arsenal')
    if (stats.bosses >= 10) unlock('veteran')
    if (stats.bosses >= 15) unlock('boss_hunter')
    if (stats.defeats >= 3) unlock('persistent')
    if (stats.seconds >= 60 * 60) unlock('endurance')
  }, [stats, unlock])

  useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(() => setNotification(null), 3500)
    return () => window.clearTimeout(timer)
  }, [notification])

  return { achievements: unlocked, unlock, notification }
}
