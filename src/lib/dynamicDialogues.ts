import type { GameBoss } from '../types/bosses'

export function getDynamicDialogue(boss: GameBoss, weaponId: string) {
  if (boss.world === 'forest' && weaponId === 'shaman_wooden_staff') {
    return `«Посох лютиков узнал ${boss.locationContext}. Корни шепчут, что ты можешь разорвать власть Короны без огня.»`
  }
  if (boss.world === 'forest' && weaponId === 'abyss_greatsword') {
    return `«Двуручник Бездны отравляет ${boss.locationContext}. Корона велит мне остановить тебя, пока тьма не достигла корней.»`
  }
  return `«Корона связала мою волю с этим местом — ${boss.locationContext}. Победи меня, и одна из её цепей падёт.»`
}
