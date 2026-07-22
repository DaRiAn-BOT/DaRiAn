import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { sounds } from '../lib/sounds'
import { TOTAL_LEVELS } from '../lib/gameConfig'
import HeroModel from './HeroModel'
import EquipmentIcon from './EquipmentIcon'
import { bossDialogues } from '../lib/bossDialogues'
import { getBattleDialogue, getHeroBattleDialogue } from '../lib/battleDialogue'
import { formatControlCode, loadControlBindings } from '../lib/controlBindings'
import { getBossImage } from '../lib/bossVisuals'
import AnimatedBossSprite from './AnimatedBossSprite'
import type { PlayerEquipment } from '../types/items'
import { calculateCombatTick } from '../lib/combatTick'
import { generateCombatMessage } from '../lib/combatMessage'
import type { GameBoss } from '../types/bosses'

type Props = { number: number; boss: GameBoss; heroStartHp: number; heroMaxHp: number; weaponLevel: number; shieldLevel: number; armorLevel: number; equipment: PlayerEquipment; skin: number; aiRemark?: string; equipmentDialogue?: string | null; onAction: (action: 'attack' | 'shield') => void; onHeroHealthChange: (health: number) => void; onWin: (shieldOnly: boolean) => void; onLose: () => void }
const formatNumber = (value: number) => Number(value.toFixed(1)).toLocaleString('ru-RU')

export default function BossBattle({ number, boss, heroStartHp, heroMaxHp, weaponLevel, shieldLevel, armorLevel, equipment, skin, aiRemark, equipmentDialogue, onAction, onHeroHealthChange, onWin, onLose }: Props) {
  const finalBoss = number === TOTAL_LEVELS
  const bossImage = getBossImage(number)
  const animatedBossSheet = `/sprites/${boss.sprite}-sprite-sheet-96.png`
  const basicLoadout = finalBoss && weaponLevel === 0 && shieldLevel === 0 && armorLevel === 0
  const bossMax = boss.stats.maxHealth + (basicLoadout ? 6 : 0)
  const fullBossDamage = boss.stats.damage + (basicLoadout ? .5 : 0)
  const [bossHp, setBossHp] = useState(bossMax)
  const [heroHp, setHeroHp] = useState(Math.min(heroStartHp, heroMaxHp))
  const [message, setMessage] = useState('Босс готовится атаковать первым!')
  const [busy, setBusy] = useState(true)
  const [winning, setWinning] = useState(false)
  const [dialogueStep, setDialogueStep] = useState(0)
  const [combatStarted, setCombatStarted] = useState(false)
  const [heroMove, setHeroMove] = useState<'idle' | 'slash' | 'beam' | 'smash' | 'projectile'>('idle')
  const [bossHitAnimation, setBossHitAnimation] = useState(false)
  const [bossAttackAnimation, setBossAttackAnimation] = useState(false)
  const [powerWarning, setPowerWarning] = useState(false)
  const [battleDialogue, setBattleDialogue] = useState('')
  const [heroBattleDialogue, setHeroBattleDialogue] = useState('')
  const [attackCombo, setAttackCombo] = useState(0)
  const [bossStunned, setBossStunned] = useState(false)
  const [superUsed, setSuperUsed] = useState(false)
  const [smashUsed, setSmashUsed] = useState(false)
  const [projectileCharges, setProjectileCharges] = useState(3)
  const heroHpRef = useRef(heroHp)
  const powerAttackReady = useRef(false)
  const usedAttack = useRef(false)
  const finalStandUsed = useRef(false)
  const powerAttackChance = boss.stats.powerAttackChance
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
      setBossAttackAnimation(true)
      window.setTimeout(() => setBossAttackAnimation(false), 680)
      const firstHitDamage = Math.max(1, fullBossDamage - equipment.armor.value)
      const healthAfterHit = Math.max(0, Math.min(heroStartHp, heroMaxHp) - firstHitDamage)
      powerAttackReady.current = Math.random() < powerAttackChance
      setPowerWarning(powerAttackReady.current)
      setHeroHp(healthAfterHit)
      heroHpRef.current = healthAfterHit
      onHeroHealthChange(healthAfterHit)
      setMessage(`Босс атаковал первым и нанёс ${formatNumber(firstHitDamage)} урона.${powerAttackReady.current ? ' Он готовит мощный удар — используй щит!' : ' Твой ход!'}`)
      setBattleDialogue(getBattleDialogue(number, powerAttackReady.current ? 'power' : 'opening'))
      setHeroBattleDialogue(getHeroBattleDialogue(number, 'opening'))
      if (!healthAfterHit) window.setTimeout(onLose, 650)
      else setBusy(false)
    }, 650)
    return () => window.clearTimeout(timer)
  }, [combatStarted])

  const dialogueLines = [
    ...bossDialogues[number - 1],
    ...(equipmentDialogue ? [{ speaker: 'boss' as const, text: equipmentDialogue }] : []),
    ...(aiRemark ? [{ speaker: 'boss' as const, text: aiRemark }] : []),
  ]
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

  const turn = (action: 'attack' | 'shield' | 'super' | 'smash' | 'projectile') => {
    if (busy) return
    const defending = action === 'shield'
    const superAttack = action === 'super'
    const groundSmash = action === 'smash'
    const projectileAttack = action === 'projectile'
    if (superAttack && superUsed) return
    if (groundSmash && smashUsed) return
    if (projectileAttack && projectileCharges < 1) return
    setBusy(true)
    const isPowerAttack = powerAttackReady.current
    setPowerWarning(false)
    onAction(defending ? 'shield' : 'attack')
    if (superAttack) setSuperUsed(true)
    if (groundSmash) setSmashUsed(true)
    if (projectileAttack) setProjectileCharges((charges) => charges - 1)
    const nextCombo = defending ? 0 : Math.min(3, attackCombo + 1)
    const comboBonus = nextCombo === 2 ? .3 : 0
    const isSpamming = !defending && nextCombo >= 2
    setAttackCombo(defending ? 0 : nextCombo)
    if (defending) sounds.shield(); else {
      sounds.attack(); usedAttack.current = true
      setHeroMove(superAttack ? 'beam' : groundSmash ? 'smash' : projectileAttack ? 'projectile' : 'slash')
      setBossHitAnimation(true)
      window.setTimeout(() => { setHeroMove('idle'); setBossHitAnimation(false) }, superAttack ? 1100 : 800)
    }
    const skinReduction = !defending && !finalBoss && (number - 1) % 4 === 0 ? .5 : 0
    const crownResistance = basicLoadout && !defending ? .5 : 0
    const heavyAttackTriggered = !finalBoss && (number - 1) % 4 === 1 && isPowerAttack
    const shieldWeakeningTriggered = !finalBoss && (number - 1) % 4 === 3 && defending
    const shieldPenalty = (shieldWeakeningTriggered ? 2 : 0) + (finalBoss && bossHp < bossMax / 2 ? 1 : 0)
    const tick = calculateCombatTick({
      equipment,
      currentBossHp: bossHp,
      bossMaxHp: bossMax,
      baseBossDamage: fullBossDamage,
      playerAttackModifier: -skinReduction - crownResistance + comboBonus
        + (superAttack ? equipment.weapon.value * .5 : groundSmash ? equipment.weapon.value * .35 : projectileAttack ? -equipment.weapon.value * .25 : 0),
      bossBonusDamage: isSpamming ? 4 : 0,
      shieldPenalty,
      isPlayerBlocking: defending,
      isSpamming,
      isPowerAttack,
      isEnragedByAbility: heavyAttackTriggered || shieldWeakeningTriggered,
    })
    const damage = tick.playerDamage
    const nextBossHp = tick.nextBossHp
    setBossHp(nextBossHp)
    if (!nextBossHp) { setMessage('Победа!'); setBattleDialogue(getBattleDialogue(number, 'defeat')); setHeroBattleDialogue(getHeroBattleDialogue(number, 'defeat')); setWinning(true); sounds.victory(); window.setTimeout(() => onWin(!usedAttack.current), 1500); return }
    if (bossStunned) {
      setBossStunned(false)
      window.setTimeout(() => {
        powerAttackReady.current = Math.random() < powerAttackChance
        setPowerWarning(powerAttackReady.current)
        setMessage(generateCombatMessage({
          playerDamage: damage,
          bossDamage: 0,
          isPowerAttack,
          isPlayerBlocking: defending,
          isSpamming,
          isBossStunnedCurrentTurn: true,
          isBossStunnedNextTurn: false,
          specialAttack: superAttack ? 'beam' : groundSmash ? 'smash' : projectileAttack ? 'projectile' : null,
        }))
        setBattleDialogue('Печать сковала моё тело… Я не могу ответить!')
        setBusy(false)
      }, 350)
      return
    }
    window.setTimeout(() => {
      setBossAttackAnimation(true)
      window.setTimeout(() => setBossAttackAnimation(false), 680)
      const currentHeroHp = heroHpRef.current
      const bossDamage = tick.bossDamage
      const finalStand = finalBoss && !defending && !isPowerAttack && !finalStandUsed.current && nextBossHp <= damage
      const survivesPowerAttack = isPowerAttack && !defending
      const nextHeroHp = finalStand ? 2 : survivesPowerAttack ? Math.max(1, currentHeroHp - bossDamage) : Math.max(0, currentHeroHp - bossDamage)
      if (finalStand) finalStandUsed.current = true
      sounds.hit()
      heroHpRef.current = nextHeroHp
      setHeroHp(nextHeroHp)
      onHeroHealthChange(nextHeroHp)
      powerAttackReady.current = !finalStand && Math.random() < powerAttackChance
      if (tick.isBossStunnedNextTurn) {
        setBossStunned(true)
        powerAttackReady.current = false
      }
      setPowerWarning(powerAttackReady.current)
      const warning = powerAttackReady.current ? ' Босс готовит мощный удар — используй щит!' : ''
      const result = finalStand
        ? 'Сердце Короны оставило тебе 2 HP. Ещё один удар решит судьбу Лабиринта!'
        : generateCombatMessage({
          playerDamage: tick.playerDamage,
          bossDamage: tick.bossDamage,
          isPowerAttack,
          isPlayerBlocking: defending,
          isSpamming,
          isBossStunnedCurrentTurn: false,
          isBossStunnedNextTurn: tick.isBossStunnedNextTurn,
          specialAttack: superAttack ? 'beam' : groundSmash ? 'smash' : projectileAttack ? 'projectile' : null,
        })
      setMessage(result + warning)
      setBattleDialogue(finalStand
        ? 'Теперь решай: разобьёшь корону или позволишь ей выбрать нового хозяина?'
        : getBattleDialogue(number, powerAttackReady.current ? 'power' : nextBossHp <= bossMax / 3 ? 'wounded' : defending ? 'shield' : 'attack'))
      setHeroBattleDialogue(getHeroBattleDialogue(number, powerAttackReady.current ? 'power' : nextBossHp <= bossMax / 3 ? 'wounded' : defending ? 'shield' : 'attack'))
      if (!nextHeroHp) window.setTimeout(onLose, 650)
      else setBusy(false)
    }, 350)
  }

  const handlePlayerBlockAction = () => {
    setAttackCombo(0)
    turn('shield')
  }

  useEffect(() => {
    if (!combatStarted) return
    const battleHotkeys = (event: KeyboardEvent) => {
      const bindings = loadControlBindings()
      if (event.code !== bindings.attack && event.code !== bindings.shield && event.code !== bindings.super && event.code !== 'KeyB' && event.code !== 'KeyA') return
      event.preventDefault()
      if (!busy) {
        if (event.code === bindings.shield) handlePlayerBlockAction()
        else turn(event.code === bindings.super ? 'super' : event.code === 'KeyB' ? 'smash' : event.code === 'KeyA' ? 'projectile' : 'attack')
      }
    }
    window.addEventListener('keydown', battleHotkeys)
    return () => window.removeEventListener('keydown', battleHotkeys)
  }, [busy, combatStarted])

  const regularBossAnimation: 'idle' | 'attack' | 'shield' | 'death' = winning ? 'death' : bossAttackAnimation || bossHitAnimation ? 'attack' : attackCombo > 2 ? 'shield' : 'idle'
  const renderBoss = (animation = regularBossAnimation) => animatedBossSheet
    ? <AnimatedBossSprite src={animatedBossSheet} animation={animation} label={boss.name} />
    : <img src={bossImage} alt={boss.name} />
  const bossPalette = { '--boss-primary': boss.palette.primary, '--boss-secondary': boss.palette.secondary, '--boss-glow': boss.palette.glow } as CSSProperties

  if (!combatStarted) return <div className={`battle-card boss-dialogue ${finalBoss ? 'final-arena' : ''}`} style={bossPalette}>
    <div className="arena-fighters"><HeroModel skin={skin} className="battle-hero" /><div className={`boss-portrait ${finalBoss ? 'final architect-portrait' : animatedBossSheet ? 'animated-portrait' : ''}`}>{renderBoss('idle')}</div></div>
    <p className="eyebrow">{dialogueStep + 1} / {dialogueLines.length}</p>
    <h2>{currentDialogue.speaker === 'boss' ? boss.name : 'Герой'}</h2>
    <p className={`dialogue-text ${currentDialogue.speaker}`}>{currentDialogue.text}</p>
    <button onClick={continueDialogue}>{dialogueStep === dialogueLines.length - 1 ? 'Начать бой' : 'Продолжить'}</button>
  </div>

  return <div className={`battle-card ${finalBoss ? 'final-arena' : ''} ${winning ? 'victory' : ''}`} style={bossPalette}>
    <div className="arena-fighters">
      <HeroModel skin={skin} className={`battle-hero move-${heroMove} ${heroMove === 'slash' ? 'attacking' : ''}`} />
      <div className={`boss-portrait ${finalBoss ? 'final architect-portrait' : animatedBossSheet ? 'animated-portrait' : ''} ${!animatedBossSheet && bossHitAnimation ? 'boss-hit' : ''} ${!animatedBossSheet && bossAttackAnimation ? 'boss-attacking' : ''}`}>
        {renderBoss()}
      </div>
    </div>
    <p className="eyebrow">{finalBoss ? 'ФИНАЛЬНЫЙ БОСС' : `СТРАЖ ПОДСКАЗКИ ${number}`}</p>
    <h2>{boss.name}</h2>
    <p className="boss-ability">{ability}</p>
    <div className="battle-mechanics"><span>{bossHp <= bossMax / 2 ? '⚠ ФАЗА II · ЯРОСТЬ' : 'ФАЗА I · ИСПЫТАНИЕ'}</span>{attackCombo === 2 && <span>⚠ БОСС ЧИТАЕТ СЕРИЮ · ИСПОЛЬЗУЙ ЩИТ</span>}{attackCombo > 2 && <span>ЗАЩИТА БОССА АКТИВНА</span>}{bossStunned && <span>✦ БОСС ОГЛУШЁН</span>}</div>
    {battleDialogue && <blockquote className="battle-dialogue-line">{boss.name}: «{battleDialogue}»</blockquote>}
    {heroBattleDialogue && <blockquote className="battle-dialogue-line hero-battle-line">Герой: «{heroBattleDialogue}»</blockquote>}
    <Health label="Босс" value={bossHp} max={bossMax} danger />
    <Health label="Герой" value={heroHp} max={heroMaxHp} />
    <div className="equipment-line"><span><EquipmentIcon kind="weapon" level={weaponLevel} small />{equipment.weapon.name}</span><span><EquipmentIcon kind="shield" level={shieldLevel} small />{equipment.shield.name}</span><span><EquipmentIcon kind="armor" level={armorLevel} small />{equipment.armor.name}</span></div>
    <p className="battle-message">{message} · Твой урон: {formatNumber(equipment.weapon.value)}</p>
    {powerWarning && <div className="power-warning" role="alert">⚠ МОЩНЫЙ УДАР!<small>ИСПОЛЬЗУЙ ЩИТ</small></div>}
    <div className="battle-actions">
      <button disabled={busy} className="battle-attack" onClick={() => turn('attack')}>⚔ <span>Атаковать</span><small>{formatControlCode(controlBindings.attack)}</small></button>
      <button disabled={busy} className="secondary battle-shield" onClick={handlePlayerBlockAction}>◈ <span>Щит</span><small>{formatControlCode(controlBindings.shield)}</small></button>
      <button disabled={busy || superUsed} className="super-attack" onClick={() => turn('super')}>✦ <span>{superUsed ? 'Использовано' : 'Заряженный луч'}</span><small>{formatControlCode(controlBindings.super)} · 150%</small></button>
      <button disabled={busy || smashUsed} className="super-attack ground-smash-button" onClick={() => turn('smash')}>◆ <span>{smashUsed ? 'Использовано' : 'Удар по земле'}</span><small>B/И · 135%</small></button>
      <button disabled={busy || projectileCharges < 1} className="secondary projectile-button" onClick={() => turn('projectile')}>● <span>Снаряд</span><small>A/Ф · {projectileCharges}/3</small></button>
    </div>
  </div>
}

function Health({ label, value, max, danger = false }: { label: string; value: number; max: number; danger?: boolean }) {
  return <div className="bar"><div><span>{label}</span><strong>{formatNumber(value)} / {formatNumber(max)}</strong></div>
    <div className="bar-track"><i className={danger ? 'danger' : ''} style={{ width: `${value / max * 100}%` }} /></div></div>
}
