import type { Armor, Shield, Weapon } from '../types/items'

export const weaponsRegistry: Record<number, Weapon> = {
  1: { id: 'rusty_sword', type: 'weapon', name: 'Ржавый меч стражника', rarity: 'Common', value: 5, lore: 'Старый клинок, найденный у входа в лабиринт.' },
  2: { id: 'shaman_wooden_staff', type: 'weapon', name: 'Посох увядающих лютиков', rarity: 'Common', value: 8, lore: 'Живое дерево всё ещё помнит голос Забытого Леса.' },
  3: { id: 'starlight_dagger', type: 'weapon', name: 'Кинжал звёздного света', rarity: 'Rare', value: 13, lore: 'Его лезвие мерцает даже в самой глубокой тьме.' },
  4: { id: 'heavy_plasma_cutter', type: 'weapon', name: 'Тяжёлый плазменный резак', rarity: 'Epic', value: 20, lore: 'Инструмент лаборатории, ставший оружием против её создателей.' },
  5: { id: 'vampiric_scythe', type: 'weapon', name: 'Коса пожирателя душ', rarity: 'Epic', value: 28, lore: 'Тёмная сталь хранит отголоски каждого поверженного врага.' },
  6: { id: 'abyss_greatsword', type: 'weapon', name: 'Двуручник Первозданной Бездны', rarity: 'Legendary', value: 37, lore: 'Клинок поглощает свет и оставляет за собой холод пустоты.' },
  7: { id: 'arch_chronos_blade', type: 'weapon', name: 'Меч искривления времени', rarity: 'Legendary', value: 48, lore: 'Один взмах способен нарушить ход времени в лабиринте.' },
}

export const armorsRegistry: Record<number, Armor> = {
  1: { id: 'novice_leather_armor', type: 'armor', name: 'Кожаная куртка бродяги', rarity: 'Common', value: 2, lore: 'Лёгкая одежда для первых коридоров.' },
  2: { id: 'steel_guardian_plates', type: 'armor', name: 'Стальной доспех Стража', rarity: 'Rare', value: 5, lore: 'Пластины сняты с древнего механического защитника.' },
  3: { id: 'frozen_yeti_hide', type: 'armor', name: 'Шкура ледяного йети', rarity: 'Epic', value: 9, lore: 'Мех сохраняет тепло даже на Ледяных Пиках.' },
  4: { id: 'cyber_matrix_suit', type: 'armor', name: 'Нанокостюм Кибер-Матрицы', rarity: 'Epic', value: 13, lore: 'Нити костюма перестраиваются перед ударом.' },
  5: { id: 'architect_plate_resonance', type: 'armor', name: 'Доспех Истинного Резонанса', rarity: 'Legendary', value: 20, lore: 'Доспех меняется вместе с законами текущего мира.' },
}

export const shieldsRegistry: Record<number, Shield> = {
  1: { id: 'wooden_buckler', type: 'shield', name: 'Треснувший деревянный баклер', rarity: 'Common', value: 3, lore: 'Простой щит, переживший больше владельцев, чем ударов босса.' },
  2: { id: 'hexagonal_matrix_shield', type: 'shield', name: 'Голографический барьер', rarity: 'Rare', value: 7, lore: 'Силовое поле собирается из светящихся граней.' },
  3: { id: 'obsidian_bulwark', type: 'shield', name: 'Обсидиановый оплот вулкана', rarity: 'Epic', value: 11, lore: 'Застывшая лава всё ещё отдаёт внутренним жаром.' },
  4: { id: 'mirror_frost_aegis', type: 'shield', name: 'Зеркальная эгида Ледяной Девы', rarity: 'Epic', value: 16, lore: 'Ледяное зеркало помнит отражения древних заклинаний.' },
  5: { id: 'void_singularity_gate', type: 'shield', name: 'Врата Сингулярности Пустоты', rarity: 'Legendary', value: 22, lore: 'Миниатюрная чёрная дыра поглощает направленные в неё атаки.' },
}

export const GAME_ITEMS_REGISTRY = {
  weapons: weaponsRegistry,
  armors: armorsRegistry,
  shields: shieldsRegistry,
} as const

export const itemsRegistry = GAME_ITEMS_REGISTRY
