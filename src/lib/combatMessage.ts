type CombatMessageInput = {
  playerDamage: number
  bossDamage: number
  isPowerAttack: boolean
  isPlayerBlocking: boolean
  isSpamming: boolean
  isBossStunnedCurrentTurn: boolean
  isBossStunnedNextTurn: boolean
  specialAttack: 'beam' | 'smash' | 'projectile' | null
}

const formatDamage = (value: number) =>
  Number(value.toFixed(1)).toLocaleString('ru-RU')

export function generateCombatMessage(input: CombatMessageInput) {
  const playerDamage = formatDamage(input.playerDamage)
  const bossDamage = formatDamage(input.bossDamage)

  if (input.isBossStunnedCurrentTurn) {
    return `Босс оглушён и пропускает ответный удар! Вы нанесли ${playerDamage} урона.`
  }
  if (input.isBossStunnedNextTurn) {
    return `Идеальный блок! Вы получили ${bossDamage} урона и оглушили босса на следующий ход.`
  }
  if (input.isSpamming) {
    return `Босс прочитал серию! Ваш удар снижен до ${playerDamage}, а усиленная контратака нанесла ${bossDamage} урона. Используйте щит.`
  }
  if (input.isPlayerBlocking) {
    return `Щит поглотил часть атаки! Вы получили ${bossDamage} урона и нанесли контрударом ${playerDamage}.`
  }

  const attackName = input.specialAttack === 'beam'
    ? 'Заряженный луч'
    : input.specialAttack === 'smash'
      ? 'Удар по земле'
      : input.specialAttack === 'projectile'
        ? 'Энергетический снаряд'
        : input.isPowerAttack
      ? 'Мощный ответ босса'
      : 'Атака'
  return `${attackName}! Вы нанесли ${playerDamage} урона. Босс ответил на ${bossDamage}.`
}
