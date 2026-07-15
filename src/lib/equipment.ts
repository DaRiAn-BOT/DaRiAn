export const weapons = [
  { name: 'Железный меч героя', effect: 'Обычная надёжная атака.' },
  { name: 'Теневой клинок', effect: '+0,5 к каждому удару.' },
  { name: 'Огненный меч дракона', effect: '+1 огненного урона.' },
]

export const shields = [
  { name: 'Щит рыцаря', effect: 'Блокирует 4 урона, контрудар 0,5.' },
  { name: 'Шипастый щит стража', effect: 'Блокирует 5 урона, контрудар 1.' },
  { name: 'Драконий щит', effect: 'Блокирует 6 урона, контрудар 1,5.' },
]

export const armors = [
  { name: 'Походная куртка', effect: 'Не уменьшает урон.' },
  { name: 'Стальная броня', effect: 'Уменьшает любой урон на 1,5.' },
  { name: 'Доспех дракона', effect: 'Уменьшает любой урон на 3.' },
]

export type EquipmentKind = 'weapon' | 'shield' | 'armor'
export type InventoryItem = { kind: EquipmentKind; level: number }
