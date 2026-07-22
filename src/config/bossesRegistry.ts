import type { BossWorld, GameBoss } from '../types/bosses'

const worlds: Record<BossWorld, Pick<GameBoss, 'locationContext' | 'palette'>> = {
  forest: { locationContext: 'древние корни Забытого Леса и ядовитые болота', palette: { primary: '#315c3a', secondary: '#80633a', glow: '#9ee86f' } },
  hell: { locationContext: 'раскалённые темницы Адской Цитадели', palette: { primary: '#641f18', secondary: '#30120f', glow: '#ff7b32' } },
  ice: { locationContext: 'вечная метель Ледяных Пиков', palette: { primary: '#5c8fac', secondary: '#d7edf4', glow: '#8eeeff' } },
  laboratory: { locationContext: 'забытые камеры Лаборатории алхимиков', palette: { primary: '#42595a', secondary: '#263335', glow: '#72d9a5' } },
  abyss: { locationContext: 'беззвёздные глубины Космической Бездны', palette: { primary: '#38245d', secondary: '#11101d', glow: '#b47cff' } },
}

const makeBoss = (id: string, name: string, world: BossWorld, sprite: string, level: number): GameBoss => ({
  id, name, world, sprite, ...worlds[world],
  stats: {
    maxHealth: Math.round((15 + (level - 1) * 2.45 + Math.max(0, level - 10) * .18) * 10) / 10,
    damage: Math.round((6 + (level - 1) * .38) * 10) / 10,
    powerAttackChance: level === 30 ? .28 : .35,
  },
})

export const BOSSES_IN_ORDER: GameBoss[] = [
  makeBoss('ancient_treant', 'Спиритический Древесный Огр', 'forest', 'treant-boss', 1),
  makeBoss('swamp_witch', 'Болотная Ведьма', 'forest', 'swamp-hag', 2),
  makeBoss('plague_wasp_queen', 'Чумная Осиная Королева', 'forest', 'plague-wasp-queen', 3),
  makeBoss('moss_crystal_golem', 'Мшистый Кристальный Голем', 'forest', 'crystal-golem', 4),
  makeBoss('shadow_werewolf', 'Теневой Оборотень', 'forest', 'shadow-werewolf', 5),
  makeBoss('mushroom_lord', 'Грибной Повелитель', 'forest', 'mushroom-king', 6),
  makeBoss('infernal_archdemon', 'Архидемон Цитадели', 'hell', 'arch-demon', 7),
  makeBoss('fire_elemental', 'Сердце Живого Пламени', 'hell', 'fire-elemental', 8),
  makeBoss('underworld_drill_worm', 'Стальной Червь Подземелий', 'hell', 'drill-worm', 9),
  makeBoss('three_headed_cerberus', 'Трёхглавый Цербер', 'hell', 'cerberus', 10),
  makeBoss('lich_king', 'Король-Лич Пепельного Трона', 'hell', 'lich-king', 11),
  makeBoss('obsidian_scorpion', 'Обсидиановый Скорпион', 'hell', 'obsidian-scorpion', 12),
  makeBoss('frost_archmage', 'Архимаг Вечного Инея', 'ice', 'frost-archmage', 13),
  makeBoss('frost_yeti', 'Йети Ледяных Круч', 'ice', 'frost-yeti', 14),
  makeBoss('frost_siren', 'Зеркальная Сирена', 'ice', 'frost-siren', 15),
  makeBoss('armored_polar_bear', 'Бронированный Полярный Зверь', 'ice', 'polar-bear-cyborg', 16),
  makeBoss('glacier_golem', 'Голем Ледника', 'ice', 'crystal-golem', 17),
  makeBoss('frost_wyvern', 'Инейный Дракон', 'ice', 'frost-wyvern', 18),
  makeBoss('watcher_eye', 'Око Забытой Лаборатории', 'laboratory', 'ai-overseer-eye', 19),
  makeBoss('mercury_swarm', 'Рой Живого Металла', 'laboratory', 'nanite-swarm', 20),
  makeBoss('alchemical_mutant', 'Алхимический Мутант', 'laboratory', 'cyber-meat-mutant', 21),
  makeBoss('blade_experiment', 'Багровый Эксперимент', 'laboratory', 'neon-cyber-ninja', 22),
  makeBoss('storm_generator', 'Грозовой Генератор', 'laboratory', 'defense-mainframe', 23),
  makeBoss('toxic_disposer', 'Токсичный Слизень-Утилизатор', 'laboratory', 'toxic-slime-waste', 24),
  makeBoss('void_avatar', 'Аватар Пустоты', 'abyss', 'void-avatar-god', 25),
  makeBoss('eldritch_oracle', 'Всевидящий Оракул', 'abyss', 'eldritch-eye-oracle', 26),
  makeBoss('star_wanderer', 'Рыцарь Звёздных Странствий', 'abyss', 'star-wanderer-knight', 27),
  makeBoss('cosmic_jellyfish_queen', 'Королева Космических Медуз', 'abyss', 'cosmic-jellyfish-queen', 28),
  makeBoss('rift_leviathan', 'Левиафан Разлома', 'abyss', 'cosmic-leviathan-rift-worm', 29),
  makeBoss('dark_crown_heart', 'Сердце Тёмной Короны', 'abyss', 'void-avatar-god', 30),
]

export const GAME_BOSSES_REGISTRY: Record<string, GameBoss> = Object.fromEntries(
  BOSSES_IN_ORDER.map((boss) => [boss.id, boss]),
)

export const getBossByLevel = (level: number) => BOSSES_IN_ORDER[Math.max(0, Math.min(BOSSES_IN_ORDER.length - 1, level - 1))]
