import type { Maze, Point } from '../lib/maze'
import HeroModel from './HeroModel'
import type { MiniMonster } from '../lib/miniMonsters'

type Facing = 'up' | 'down' | 'left' | 'right'
type Props = { level: number; maze: Maze; player: Point; playerName: string; playerHp: number; playerMaxHp: number; checkpoint: Point; monsters: MiniMonster[]; cameraMode: 2 | 3; lootFound: boolean; potionFound: boolean; skin: number; facing: Facing; walkStep: boolean; attackAnimation: boolean; hitMonsterId: number | null; portalMode?: boolean; onMove: (dx: number, dy: number) => void }
const controls = [
  { label: '↑', dx: 0, dy: -1, className: 'up' }, { label: '←', dx: -1, dy: 0, className: 'left' },
  { label: '↓', dx: 0, dy: 1, className: 'down' }, { label: '→', dx: 1, dy: 0, className: 'right' },
]
const CELL_SIZE = 36

export default function MazeBoard({ level, maze, player, playerName, playerHp, playerMaxHp, checkpoint, monsters, cameraMode, lootFound, potionFound, skin, facing, walkStep, attackAnimation, hitMonsterId, portalMode = false, onMove }: Props) {
  const worldNumber = Math.min(5, Math.ceil(level / 6))
  const location = portalMode ? 'portal' : worldNumber === 1 ? 'ancient' : worldNumber === 3 ? 'magic' : worldNumber === 4 ? 'laboratory' : worldNumber === 5 ? 'cosmic' : 'guardian'
  const cameraScale = cameraMode === 2 ? 2.15 : 1.15
  const playerOffset = `translate(-${(player.x + .5) * CELL_SIZE}px, -${(player.y + .5) * CELL_SIZE}px)`
  const cameraTransform = cameraMode === 2
    ? `rotateX(57deg) scale(${cameraScale}) ${playerOffset}`
    : `rotateX(32deg) scale(${cameraScale}) ${playerOffset}`
  const locationName = location === 'portal'
    ? 'ДОРОГА ДОМОЙ'
    : location === 'ancient'
    ? 'МИР 1: ЗАБЫТЫЙ ЛЕС И БОЛОТА'
    : worldNumber === 2
    ? 'МИР 2: АДСКАЯ ЦИТАДЕЛЬ И ПОДЗЕМЕЛЬЯ'
    : worldNumber === 3
    ? 'МИР 3: ЛЕДЯНЫЕ ПИКИ И ТУНДРА'
    : worldNumber === 4
    ? 'МИР 4: ЗАБРОШЕННАЯ ЛАБОРАТОРИЯ'
    : worldNumber === 5
    ? 'МИР 5: КОСМИЧЕСКАЯ БЕЗДНА'
    : 'КРЕПОСТЬ СТРАЖЕЙ'
  return <>
    <div className={`maze-camera camera-${cameraMode} location-${location}`}>
      <div className="location-name">{locationName}</div>
      <div className="maze-health"><span>HP</span><b>{Math.ceil(playerHp)} / {Math.ceil(playerMaxHp)}</b><i><em style={{ width: `${playerHp / playerMaxHp * 100}%` }} /></i></div>
      <div className="maze-world" style={{
        gridTemplateColumns: `repeat(${maze.cells.length}, ${CELL_SIZE}px)`,
        width: maze.cells.length * CELL_SIZE,
        transformOrigin: '0 0',
        transform: cameraTransform,
      }}>
        {maze.cells.flatMap((row, y) => row.map((open, x) => {
          const isPlayer = player.x === x && player.y === y
          const isClue = maze.clue.x === x && maze.clue.y === y
          const isCheckpoint = checkpoint.x === x && checkpoint.y === y
          const monster = monsters.find((enemy) => enemy.x === x && enemy.y === y)
          const isLoot = !lootFound && maze.loot?.x === x && maze.loot.y === y
          const isPotion = !potionFound && maze.potion.x === x && maze.potion.y === y
          const distance = Math.hypot(player.x - x, player.y - y)
          const lightRadius = 2
          const darkness = distance <= lightRadius ? 0 : 1
          return <div key={`${x}-${y}`} className={`${open ? 'cell path' : 'cell wall'} ${isPlayer ? 'player-cell' : ''}`}>
            {isClue && (portalMode ? <span className="home-portal" title="Портал домой"><i /></span> : <span className="clue">?</span>)}
            {isCheckpoint && <span className="checkpoint-marker" title="Чекпоинт">◆</span>}
            {monster && <span className={`mini-monster ${hitMonsterId === monster.id ? 'monster-hit' : ''}`} title={`Мини-монстр: ${monster.hp} HP`}><i /><b>{monster.hp.toFixed(1).replace('.0', '')}</b></span>}
            {!portalMode && isLoot && <span className="loot">{maze.loot?.kind === 'weapon' ? '⚔' : maze.loot?.kind === 'armor' ? '♟' : '◆'}</span>}
            {!portalMode && isPotion && <span className="health-potion" title="Зелье исцеления: +50 HP"><i /></span>}
            <span className="fog" style={{ opacity: darkness }} />
          </div>
        }))}
      </div>
      <span className="maze-hero-overlay"><b className="hero-nameplate">{playerName}</b><HeroModel skin={skin} className={`facing-${facing} ${walkStep ? 'walk-a' : 'walk-b'} ${attackAnimation ? 'maze-attacking' : ''}`} /></span>
    </div>
    <p className="camera-label">Камера: {cameraMode === 2 ? 'от второго лица' : 'от третьего лица'}</p>
    <div className="controls" aria-label="Управление">
      {controls.map((button) => <button key={button.label} className={button.className}
        onClick={() => onMove(button.dx, button.dy)} aria-label={`Идти ${button.label}`}>{button.label}</button>)}
    </div>
  </>
}
