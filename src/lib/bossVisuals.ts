import { TOTAL_LEVELS } from './gameConfig'

const bossDesigns = [
  '/bosses/stone-guardian.png',
  '/bosses/abyss-knight.png',
  '/bosses/arcane-guardian.png',
  '/bosses/ember-guardian.png',
]

const animatedBossSheets = [
  'treant-boss', 'swamp-hag', 'plague-wasp-queen', 'crystal-golem', 'shadow-werewolf', 'mushroom-king',
  'arch-demon', 'fire-elemental', 'drill-worm', 'cerberus', 'lich-king', 'obsidian-scorpion',
  'frost-archmage', 'frost-yeti', 'frost-siren', 'polar-bear-cyborg', 'crystal-golem', 'frost-wyvern',
  'ai-overseer-eye', 'nanite-swarm', 'cyber-meat-mutant', 'neon-cyber-ninja', 'defense-mainframe', 'toxic-slime-waste',
  'void-avatar-god', 'eldritch-eye-oracle', 'star-wanderer-knight', 'cosmic-jellyfish-queen', 'cosmic-leviathan-rift-worm',
]

export function getAnimatedBossSheet(level: number) {
  const fileName = animatedBossSheets[level - 1]
  return fileName ? `/sprites/${fileName}-sprite-sheet-96.png` : null
}

export function getBossImage(level: number) {
  if (level === TOTAL_LEVELS) return '/bosses/maze-king.png'

  const location = Math.floor((level - 1) / 10)
  const variation = (level - 1) % 3
  return bossDesigns[(location + variation) % bossDesigns.length]
}
