import { useEffect, useRef, useState } from 'react'
import { armors, shields, weapons } from '../lib/equipment'
import { bossNames } from '../lib/bosses'
import { sounds } from '../lib/sounds'
import { TOTAL_LEVELS } from '../lib/gameConfig'
import HeroModel from './HeroModel'
import EquipmentIcon from './EquipmentIcon'
import { bossDialogues } from '../lib/bossDialogues'
import { getBattleDialogue, getHeroBattleDialogue } from '../lib/battleDialogue'
import { formatControlCode, loadControlBindings } from '../lib/controlBindings'

type Props = { number: number; attackDamage: number; heroStartHp: number; heroMaxHp: number; weaponLevel: number; shieldLevel: number; armorLevel: number; skin: number; aiRemark?: string; onAction: (action: 'attack' | 'shield') => void; onHeroHealthChange: (health: number) => void; onWin: (shieldOnly: boolean) => void; onLose: () => void }
const formatNumber = (value: number) => Number(value.toFixed(1)).toLocaleString('ru-RU')

export default function BossBattle({ number, attackDamage, heroStartHp, heroMaxHp, weaponLevel, shieldLevel, armorLevel, skin, aiRemark, onAction, onHeroHealthChange, onWin, onLose }: Props) {
  const finalBoss = number === TOTAL_LEVELS
  const basicLoadout = finalBoss && weaponLevel === 0 && shieldLevel === 0 && armorLevel === 0
  const bossMax = 15 + (number - 1) * 2.45 + Math.max(0, number - 10) * .18 + (basicLoadout ? 6 : 0)
  const fullBossDamage = 6 + (number - 1) * .38 + (finalBoss ? -2.5 : 0) + (basicLoadout ? .5 : 0)
  const [bossHp, setBossHp] = useState(bossMax)
  const [heroHp, setHeroHp] = useState(Math.min(heroStartHp, heroMaxHp))
  const [message, setMessage] = useState('Босс готовится атаковать первым!')
  const [busy, setBusy] = useState(true)
  const [winning, setWinning] = useState(false)
  const [dialogueStep, setDialogueStep] = useState(0)
  const [combatStarted, setCombatStarted] = useState(false)
  const [attackAnimation, setAttackAnimation] = useState(false)
  const [bossHitAnimation, setBossHitAnimation] = useState(false)
  const [powerWarning, setPowerWarning] = useState(false)
  const [battleDialogue, setBattleDialogue] = useState('')
  const [heroBattleDialogue, setHeroBattleDialogue] = useState('')
  const [superUsed, setSuperUsed] = useState(false)
  const heroHpRef = useRef(heroHp)
  const powerAttackReady = useRef(false)
  const usedAttack = useRef(false)
  const finalStandUsed = useRef(false)
  const powerAttackChance = finalBoss ? .28 : .35
  const controlBindings = loadControlBindings()
  const ability = finalBoss ? `Королевская ярость: при ранении сильнее атакует и ослабляет щит${basicLoadout ? ' · Базовое снаряжение пробудило Стойкость Короны' : ''}` : ['Каменная кожа: снижает урон', 'Тяжёлый удар: наносит больше урона', 'Ярость: сильнее при низком HP', 'Крушитель: ослабляет щит'][(number - 1) % 4]

  useEffect(() => {
    const health = Math.min(heroStartHp, heroMaxHp)
    heroHpRef.current = health
    setHeroHp(health)
  }, [heroStartHp, heroMaxHp])

  useEffect(() => {
    if (!combatStarted) return
    const timer = window.setTimeout(() => {
      const healthAfterHit = Math.max(0, Math.min(heroStartHp, heroMaxHp) - fullBossDamage)
      powerAttackReady.current = Math.random() < powerAttackChance
      setPowerWarning(powerAttackReady.current)
      setHeroHp(healthAfterHit)
      heroHpRef.current = healthAfterHit
      onHeroHealthChange(healthAfterHit)
      setMessage(`Босс атаковал первым и нанёс ${formatNumber(fullBossDamage)} урона.${powerAttackReady.current ? ' Он готовит мощный удар — используй щит!' : ' Твой ход!'}`)
      setBattleDialogue(getBattleDialogue(number, powerAttackReady.current ? 'power' : 'opening'))
      setHeroBattleDialogue(getHeroBattleDialogue(number, 'opening'))
      if (!healthAfterHit) window.setTimeout(onLose, 650)
      else setBusy(false)
    }, 650)
    return () => window.clearTimeout(timer)
  }, [combatStarted])

  const dialogueLines = aiRemark
    ? [...bossDialogues[number - 1], { speaker: 'boss' as const, text: aiRemark }]
    : bossDialogues[number - 1]
  const currentDialogue = dialogueLines[dialogueStep]
  const continueDialogue = () => {
    sounds.menu()
    if (dialogueStep < dialogueLines.length - 1) setDialogueStep((step) => step + 1)
    else setCombatStarted(true)
  }

  useEffect(() => {
    if (combatStarted) return
    const continueWithEnter = (event: KeyboardEvent) => {
      if (event.code !== 'Enter') return
      event.preventDefault(); continueDialogue()
    }
    window.addEventListener('keydown', continueWithEnter)
    return () => window.removeEventListener('keydown', continueWithEnter)
  }, [aiRemark, combatStarted, dialogueStep])

  const turn = (action: 'attack' | 'shield' | 'super') => {
    if (busy) return
    const defending = action === 'shield'
    const superAttack = action === 'super'
    if (superAttack && (number % 10 !== 0 || superUsed)) return
    setBusy(true)
    const isPowerAttack = powerAttackReady.current
    setPowerWarning(false)
    onAction(defending ? 'shield' : 'attack')
    if (superAttack) setSuperUsed(true)
    if (defending) sounds.shield(); else {
      sounds.attack(); usedAttack.current = true
      setAttackAnimation(true); setBossHitAnimation(true)
      window.setTimeout(() => { setAttackAnimation(false); setBossHitAnimation(false) }, 800)
    }
    const weaponBonus = weaponLevel === 3 ? 2 : weaponLevel >= 1 ? .5 : 0
    const fireBonus = weaponLevel === 2 ? 1 : 0
    const skinReduction = !defending && !finalBoss && (number - 1) % 4 === 0 ? .5 : 0
    const counterDamage = shieldLevel === 3 ? 2.5 : .5 + shieldLevel * .5
    const crownResistance = basicLoadout && !defending ? .5 : 0
    const damage = defending ? counterDamage : Math.max(.5, attackDamage + weaponBonus + fireBonus - skinReduction - crownResistance + (superAttack ? 2.5 : 0))
    const nextBossHp = Math.max(0, bossHp - damage)
    setBossHp(nextBossHp)
    if (!nextBossHp) { setMessage('Победа!'); setBattleDialogue(getBattleDialogue(number, 'defeat')); setHeroBattleDialogue(getHeroBattleDialogue(number, 'defeat')); setWinning(true); sounds.victory(); window.setTimeout(() => onWin(!usedAttack.current), 1500); return }
    const isRaging = (finalBoss || (number - 1) % 4 === 2) && bossHp <= bossMax / 2
    const heavyDamage = !finalBoss && (number - 1) % 4 === 1 ? 1 : 0
    const rageDamage = fullBossDamage + (isRaging ? (finalBoss ? 3.5 : 2) : 0) + heavyDamage
    const shieldBlock = 4 + shieldLevel - (!finalBoss && (number - 1) % 4 === 3 ? 2 : 0) - (finalBoss && isRaging ? 1 : 0)
    const incomingDamage = defending ? Math.max(2, rageDamage - shieldBlock) : rageDamage * (isPowerAttack ? 3 : 1)
    const armorReduction = armorLevel === 3 ? 3 : armorLevel * 1.5
    window.setTimeout(() => {
      const currentHeroHp = heroHpRef.current
      const bossDamage = Math.max(.5, incomingDamage - armorReduction)
      const finalStand = finalBoss && !defending && !isPowerAttack && !finalStandUsed.current && nextBossHp <= damage
      const survivesPowerAttack = isPowerAttack && !defending
      const nextHeroHp = finalStand ? 2 : survivesPowerAttack ? Math.max(1, currentHeroHp - bossDamage) : Math.max(0, currentHeroHp - bossDamage)
      const dealtDamage = Math.max(0, currentHeroHp - nextHeroHp)
      if (finalStand) finalStandUsed.current = true
      sounds.hit()
      heroHpRef.current = nextHeroHp
      setHeroHp(nextHeroHp)
      onHeroHealthChange(nextHeroHp)
      powerAttackReady.current = !finalStand && Math.random() < powerAttackChance
      setPowerWarning(powerAttackReady.current)
      const warning = powerAttackReady.current ? ' Босс готовит мощный удар — используй щит!' : ''
      const result = finalStand
        ? 'Последний удар Малзара оставил тебе 2 HP. Ещё один удар решит судьбу Лабиринта!'
        : defending
        ? `Щит выдержал! Получено ${formatNumber(dealtDamage)} урона.`
        : `${superAttack ? 'Суперудар! ' : isPowerAttack ? 'Мощный удар! ' : ''}Ты атаковал на ${formatNumber(damage)}. Босс ответил на ${formatNumber(dealtDamage)}.`
      setMessage(result + warning)
      setBattleDialogue(finalStand
        ? 'Теперь решай: разобьёшь корону или позволишь ей выбрать нового хозяина?'
        : getBattleDialogue(number, powerAttackReady.current ? 'power' : nextBossHp <= bossMax / 3 ? 'wounded' : defending ? 'shield' : 'attack'))
      setHeroBattleDialogue(getHeroBattleDialogue(number, powerAttackReady.current ? 'power' : nextBossHp <= bossMax / 3 ? 'wounded' : defending ? 'shield' : 'attack'))
      if (!nextHeroHp) window.setTimeout(onLose, 650)
      else setBusy(false)
    }, 350)
  }

  useEffect(() => {
    if (!combatStarted) return
    const battleHotkeys = (event: KeyboardEvent) => {
      const bindings = loadControlBindings()
      if (event.code !== bindings.attack && event.code !== bindings.shield) return
      event.preventDefault()
      if (!busy) turn(event.code === bindings.shield ? 'shield' : 'attack')
    }
    window.addEventListener('keydown', battleHotkeys)
    return () => window.removeEventListener('keydown', battleHotkeys)
  }, [busy, combatStarted])

  if (!combatStarted) return <div className={`battle-card boss-dialogue ${finalBoss ? 'final-arena' : ''}`}>
    <div className="arena-fighters"><HeroModel skin={skin} className="battle-hero" /><div className={`boss-portrait ${finalBoss ? 'final' : ''}`}><img src={finalBoss ? '/bosses/maze-king.png' : '/bosses/stone-guardian.png'} alt={bossNames[number - 1]} /></div></div>
    <p className="eyebrow">{dialogueStep + 1} / {dialogueLines.length}</p>
    <h2>{currentDialogue.speaker === 'boss' ? bossNames[number - 1] : 'Герой'}</h2>
    <p className={`dialogue-text ${currentDialogue.speaker}`}>{currentDialogue.text}</p>
    <button onClick={continueDialogue}>{dialogueStep === dialogueLines.length - 1 ? 'Начать бой' : 'Продолжить'}</button>
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
    {battleDialogue && <blockquote className="battle-dialogue-line">{bossNames[number - 1]}: «{battleDialogue}»</blockquote>}
    {heroBattleDialogue && <blockquote className="battle-dialogue-line hero-battle-line">Герой: «{heroBattleDialogue}»</blockquote>}
    <Health label="Босс" value={bossHp} max={bossMax} danger />
    <Health label="Герой" value={heroHp} max={heroMaxHp} />
    <div className="equipment-line"><span><EquipmentIcon kind="weapon" level={weaponLevel} small />{weapons[weaponLevel].name}</span><span><EquipmentIcon kind="shield" level={shieldLevel} small />{shields[shieldLevel].name}</span><span><EquipmentIcon kind="armor" level={armorLevel} small />{armors[armorLevel].name}</span></div>
    <p className="battle-message">{message} · Твой урон: {formatNumber(attackDamage)}</p>
    {powerWarning && <div className="power-warning" role="alert">⚠ МОЩНЫЙ УДАР!<small>ИСПОЛЬЗУЙ ЩИТ</small></div>}
    <div className="battle-actions">
      <button disabled={busy} className="battle-attack" onClick={() => turn('attack')}>⚔ <span>Атаковать</span><small>{formatControlCode(controlBindings.attack)}</small></button>
      <button disabled={busy} className="secondary battle-shield" onClick={() => turn('shield')}>◈ <span>Щит</span><small>{formatControlCode(controlBindings.shield)}</small></button>
      {number % 10 === 0 && <button disabled={busy || superUsed} className="super-attack" onClick={() => turn('super')}>✦ <span>{superUsed ? 'Использовано' : 'Суперудар'}</span><small>+2,5 УРОНА</small></button>}
    </div>
  </div>
}

function Health({ label, value, max, danger = false }: { label: string; value: number; max: number; danger?: boolean }) {
  return <div className="bar"><div><span>{label}</span><strong>{formatNumber(value)} / {formatNumber(max)}</strong></div>
    <div className="bar-track"><i className={danger ? 'danger' : ''} style={{ width: `${value / max * 100}%` }} /></div></div>
}
