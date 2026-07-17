import { supabase } from './supabase'
import type { GameStats } from './statistics'

type EquipmentNames = { weapon: string; shield: string; armor: string }

const system = `Ты сценарист мрачной приключенческой игры «Тайны лабиринта».
Пиши по-русски, понятно для подростка, без жестоких подробностей и без Markdown.
Не упоминай ИИ, промпты, статистику или игровые механики напрямую.`

async function askNarrator(prompt: string, limit: number): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke('ai', { body: { prompt, system } })
  if (error || !data || typeof data.text !== 'string') return null
  const text = data.text.replace(/[*#_`]/g, '').replace(/\s+/g, ' ').trim()
  return text ? text.slice(0, limit) : null
}

export function createBossRemark(
  bossNumber: number,
  bossName: string,
  stats: GameStats,
  equipment: EquipmentNames,
) {
  return askNarrator(
    `Напиши одну реплику до 25 слов от босса ${bossName}, стража №${bossNumber}. ` +
      `Герой победил ${stats.bosses} боссов, проиграл ${stats.defeats} раз, применил щит ${stats.shields} раз. ` +
      `Его оружие: ${equipment.weapon}, щит: ${equipment.shield}, броня: ${equipment.armor}. ` +
      `Босс должен осмысленно заметить одну из этих особенностей и продолжить сюжет о короне Малзара.`,
    220,
  )
}

export function createPersonalEnding(stats: GameStats, equipment: EquipmentNames) {
  const minutes = Math.max(1, Math.round(stats.seconds / 60))
  return askNarrator(
    `Напиши уникальную концовку из 3 коротких предложений, максимум 75 слов. ` +
      `Герой прошёл лабиринт за ${minutes} минут, победил ${stats.bosses} боссов, проиграл ${stats.defeats} раз, ` +
      `атаковал ${stats.attacks} раз, использовал щит ${stats.shields} раз и нашёл ${stats.items} предметов. ` +
      `Финальное снаряжение: ${equipment.weapon}, ${equipment.shield}, ${equipment.armor}. ` +
      `Опиши судьбу героя, Малзара и лабиринта. Концовка должна зависеть от этих поступков.`,
    600,
  )
}
