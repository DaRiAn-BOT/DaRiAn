import type { CSSProperties } from 'react'
import './AnimatedBossSprite.css'

type Animation = 'idle' | 'attack' | 'shield' | 'death'
type SpriteStyle = CSSProperties & Record<'--boss-sheet' | '--boss-row' | '--boss-steps' | '--boss-end-x', string>

type Props = { src: string; animation: Animation; label: string }

export default function AnimatedBossSprite({ src, animation, label }: Props) {
  const row = animation === 'idle' ? 0 : animation === 'attack' ? 1 : animation === 'shield' ? 2 : 3
  const frames = animation === 'idle' ? 4 : 6
  const style: SpriteStyle = {
    '--boss-sheet': `url("${src}")`,
    '--boss-row': `${-row * 32}px`,
    '--boss-steps': `${frames - 1}`,
    '--boss-end-x': `${-(frames - 1) * 32}px`,
  }
  return <span className={`animated-boss-sprite ${animation}`} style={style} role="img" aria-label={label} />
}
