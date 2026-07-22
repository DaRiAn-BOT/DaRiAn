import type { PlayerEquipment } from '../types/items'

type CombatTickInput = {
  equipment: PlayerEquipment
  currentBossHp: number
  bossMaxHp: number
  baseBossDamage: number
  playerAttackModifier: number
  bossBonusDamage: number
  shieldPenalty: number
  isPlayerBlocking: boolean
  isSpamming: boolean
  isPowerAttack: boolean
  isEnragedByAbility: boolean
}

export type CombatTickResult = {
  playerDamage: number
  bossDamage: number
  nextBossHp: number
  isEnraged: boolean
  isBossStunnedNextTurn: boolean
}

export function calculateCombatTick(input: CombatTickInput): CombatTickResult {
  const weaponDamage = Math.max(1, input.equipment.weapon.value + input.playerAttackModifier)
  const playerDamage = input.isPlayerBlocking
    ? Math.max(1, input.equipment.shield.value * .1)
    : input.isSpamming
      ? Math.max(1, weaponDamage * .4)
      : weaponDamage
  const nextBossHp = Math.max(0, input.currentBossHp - playerDamage)
  const isEnraged = nextBossHp < input.bossMaxHp / 2 || input.isEnragedByAbility
  const enragedDamage = input.baseBossDamage * (isEnraged ? 1.25 : 1)
  const powerMultiplier = input.isPowerAttack && !input.isPlayerBlocking ? 3 : 1
  const shieldAbsorption = input.isPlayerBlocking
    ? Math.max(0, input.equipment.shield.value - input.shieldPenalty)
    : 0
  const bossDamage = Math.max(
    1,
    (enragedDamage + input.bossBonusDamage) * powerMultiplier
      - input.equipment.armor.value
      - shieldAbsorption,
  )

  return {
    playerDamage,
    bossDamage,
    nextBossHp,
    isEnraged,
    isBossStunnedNextTurn: input.isPlayerBlocking && input.isPowerAttack,
  }
}
