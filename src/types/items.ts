export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export interface BaseItem {
  id: string
  name: string
  rarity: Rarity
  lore: string
}

export interface Weapon extends BaseItem {
  type: 'weapon'
  value: number
}

export interface Armor extends BaseItem {
  type: 'armor'
  value: number
}

export interface Shield extends BaseItem {
  type: 'shield'
  value: number
}

export interface PlayerEquipment {
  weapon: Weapon
  armor: Armor
  shield: Shield
}
