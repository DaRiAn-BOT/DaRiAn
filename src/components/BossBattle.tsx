import { useEffect, useRef, useState } from 'react'
import { armors, shields, weapons } from '../lib/equipment'
import { bossNames } from '../lib/bosses'
import { sounds } from '../lib/sounds'
import { TOTAL_LEVELS } from '../lib/gameConfig'
import HeroModel from './HeroModel'
import { bossDialogues } from '../lib/bossDialogues'

type Props = { number: number; attackDamage: number; heroMaxHp: number; weaponLevel: number; shieldLevel: number; armorLevel: number; skin: number; onAction: (action: 'attack' | 'shield') => void; onWin: (shieldOnly: boolean) => void; onLose: () => void }
const formatNumber = (value: number) => Number(value.toFixed(1)).toLocaleString('ru-RU')

export default function BossBattle({ number, attackDamage, heroMaxHp, weaponLevel, shieldLevel, armorLevel, skin, onAction, onWin, onLose }: Props) {
  const finalBoss = number === TOTAL_LEVELS
  const bossMax = 15 + (number - 1) * 2.2 + (finalBoss ? 8 : 0)
  const fullBossDamage = 6 + (number - 1) * .35 + (finalBoss ? 1 : 0)
  const [bossHp, setBossHp] = useState(bossMax)
  const [heroHp, setHeroHp] = useState(heroMaxHp)
  const [message, setMessage] = useState('Босс готовится атаковать первым!')
  const [busy, setBusy] = useState(true)
  const [winning, setWinning] = useState(false)
  const [dialogueStep, setDialogueStep] = useState(0)
  const [combatStarted, setCombatStarted] = useState(false)
  const [attackAnimation, setAttackAnimation] = useState(false)
  const [bossHitAnimation, setBossHitAnimation] = useState(false)
  const powerAttackReady = useRef(false)
  const usedAttack = useRef(false)
  const powerAttackChance = finalBoss ? .45 : .35
  const ability = finalBoss ? 'Королевская ярость: при ранении сильнее атакует и ослабляет щит' : ['Каменная кожа: снижает урон', 'Тяжёлый удар: наносит больше урона', 'Ярость: сильнее при низком HP', 'Крушитель: ослабляет щит'][(number - 1) % 4]

  useEffect(() => {
    if (!combatStarted) return
    const timer = window.setTimeout(() => {
      const healthAfterHit = Math.max(0, heroMaxHp - fullBossDamage)
      powerAttackReady.current = Math.random() < powerAttackChance
      setHeroHp(healthAfterHit)
      setMessage(`Босс атаковал первым и нанёс ${formatNumber(fullBossDamage)} урона.${powerAttackReady.current ? ' Он готовит мощный удар — используй щит!' : ' Твой ход!'}`)
      if (!healthAfterHit) window.setTimeout(onLose, 650)
      else setBusy(false)
    }, 650)
    return () => window.clearTimeout(timer)
  }, [combatStarted])

  const currentDialogue = bossDialogues[number - 1][dialogueStep]
  const continueDialogue = () => {
    sounds.menu()
    if (dialogueStep < bossDialogues[number - 1].length - 1) setDialogueStep((step) => step + 1)
    else setCombatStarted(true)
  }

  const turn = (defending: boolean) => {
    if (busy) return
    setBusy(true)
    const isPowerAttack = powerAttackReady.current
    onAction(defending ? 'shield' : 'attack')
    if (defending) sounds.shield(); else {
      sounds.attack(); usedAttack.current = true
      setAttackAnimation(true); setBossHitAnimation(true)
      window.setTimeout(() => { setAttackAnimation(false); setBossHitAnimation(false) }, 420)
    }
    const weaponBonus = weaponLevel >= 1 ? .5 : 0
    const fireBonus = weaponLevel >= 2 ? 1 : 0
    const skinReduction = !defending && !finalBoss && (number - 1) % 4 === 0 ? .5 : 0
    const damage = defending ? .5 + shieldLevel * .5 : Math.max(.5, attackDamage + weaponBonus + fireBonus - skinReduction)
    const nextBossHp = Math.max(0, bossHp - damage)
    setBossHp(nextBossHp)
    if (!nextBossHp) { setMessage('Победа!'); setWinning(true); sounds.victory(); window.setTimeout(() => onWin(!usedAttack.current), 1500); return }
    const isRaging = (finalBoss || (number - 1) % 4 === 2) && bossHp <= bossMax / 2
    const heavyDamage = !finalBoss && (number - 1) % 4 === 1 ? 1 : 0
    const rageDamage = fullBossDamage + (isRaging ? (finalBoss ? 3.5 : 2) : 0) + heavyDamage
    const shieldBlock = 4 + shieldLevel - (!finalBoss && (number - 1) % 4 === 3 ? 2 : 0) - (finalBoss && isRaging ? 1 : 0)
    const incomingDamage = defending ? Math.max(2, rageDamage - shieldBlock) : rageDamage * (isPowerAttack ? 3 : 1)
    const bossDamage = isPowerAttack && !defending
      ? heroHp
      : Math.max(.5, incomingDamage - armorLevel * 1.5)
    const nextHeroHp = Math.max(0, heroHp - bossDamage)
    window.setTimeout(() => {
      sounds.hit()
      setHeroHp(nextHeroHp)
      powerAttackReady.current = Math.random() < powerAttackChance
      const warning = powerAttackReady.current ? ' Босс готовит мощный удар — используй щит!' : ''
      const result = defending
        ? `Щит выдержал! Получено ${formatNumber(bossDamage)} урона.`
        : `${isPowerAttack ? 'Мощный удар! ' : ''}Ты атаковал на ${formatNumber(damage)}. Босс ответил на ${formatNumber(bossDamage)}.`
      setMessage(result + warning)
      if (!nextHeroHp) window.setTimeout(onLose, 650)
      else setBusy(false)
    }, 350)
  }

  useEffect(() => {
    if (!combatStarted) return
    const attackWithSpace = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      event.preventDefault()
      if (!busy) turn(false)
    }
    window.addEventListener('keydown', attackWithSpace)
    return () => window.removeEventListener('keydown', attackWithSpace)
  }, [busy, combatStarted])

  if (!combatStarted) return <div className={`battle-card boss-dialogue ${finalBoss ? 'final-arena' : ''}`}>
    <div className="arena-fighters"><HeroModel skin={skin} className="battle-hero" /><div className={`boss-portrait ${finalBoss ? 'final' : ''}`}><img src={finalBoss ? '/bosses/maze-king.png' : '/bosses/stone-guardian.png'} alt={bossNames[number - 1]} /></div></div>
    <p className="eyebrow">{dialogueStep + 1} / {bossDialogues[number - 1].length}</p>
    <h2>{currentDialogue.speaker === 'boss' ? bossNames[number - 1] : 'Герой'}</h2>
    <p className={`dialogue-text ${currentDialogue.speaker}`}>{currentDialogue.text}</p>
    <button onClick={continueDialogue}>{dialogueStep === bossDialogues[number - 1].length - 1 ? 'Начать бой' : 'Продолжить'}</button>
  </div>

  return <div className={`battle-card ${finalBoss ? 'final-arena' : ''} ${winning ? 'victory' : ''}`}>
    <div className="arena-fighters">
      <HeroModel skin={skin} className={`battle-hero ${attackAnimation ? 'attacking' : ''}`} />
      <div className={`boss-portrait ${finalBoss ? 'final' : ''} ${bossHitAnimation ? 'boss-hit' : ''}`}>
        <img src={finalBoss ? '/bosses/maze-king.png' : '/bosses/stone-guardian.png'} alt={finalBoss ? 'Король Лабиринта' : `Каменный страж ${number}`} />
      </div>
    </div>
    <p className="eyebrow">{finalBoss ? 'ФИНАЛЬНЫЙ БОСС' : `СТРАЖ ПОДСКАЗКИ ${number}`}</p>
    <h2>{bossNames[number - 1]}</h2>
    <p className="boss-ability">{ability}</p>
    <Health label="Босс" value={bossHp} max={bossMax} danger />
    <Health label="Герой" value={heroHp} max={heroMaxHp} />
    <p className="equipment-line">⚔ {weapons[weaponLevel].name} · ◆ {shields[shieldLevel].name} · ♟ {armors[armorLevel].name}</p>
    <p className="battle-message">{message} · Твой урон: {formatNumber(attackDamage)}</p>
    <div className="battle-actions">
      <button disabled={busy} onClick={() => turn(false)}>⚔ Атаковать · ПРОБЕЛ</button>
      <button disabled={busy} className="secondary" onClick={() => turn(true)}>◈ Щит</button>
    </div>
  </div>
}

function Health({ label, value, max, danger = false }: { label: string; value: number; max: number; danger?: boolean }) {
  return <div className="bar"><div><span>{label}</span><strong>{formatNumber(value)} / {formatNumber(max)}</strong></div>
    <div className="bar-track"><i className={danger ? 'danger' : ''} style={{ width: `${value / max * 100}%` }} /></div></div>
}
