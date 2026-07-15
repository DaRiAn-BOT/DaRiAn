import type { InventoryItem } from './equipment'
import type { Point } from './maze'
import type { GameStats } from './statistics'
import type { MiniMonster } from './miniMonsters'

export type SavedProgress = {
  active: boolean; clues: number; attackDamage: number; cameraMode: 1 | 2 | 3
  cameraAngle: number; weaponLevel: number; shieldLevel: number; armorLevel: number
  lootFound: boolean; selectedSkin: number; facing: 'up' | 'down' | 'left' | 'right'
  inventory: InventoryItem[]; player: Point; checkpoint: Point
  achievements: string[]; hasLost: boolean
  stats: GameStats
  monsters?: MiniMonster[]
  mazeHp?: number
}

const SAVE_KEY = 'maze-adventure-progress'

export function loadProgress(): SavedProgress | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null')
    if (!value || typeof value !== 'object' || !('clues' in value)) return null
    return value as SavedProgress
  } catch { return null }
}

export function saveProgress(progress: SavedProgress) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress))
}
