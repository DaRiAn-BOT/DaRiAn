export type BossWorld = 'forest' | 'hell' | 'ice' | 'laboratory' | 'abyss'

export interface GameBoss {
  id: string
  name: string
  world: BossWorld
  locationContext: string
  sprite: string
  palette: { primary: string; secondary: string; glow: string }
  stats: { maxHealth: number; damage: number; powerAttackChance: number }
}
