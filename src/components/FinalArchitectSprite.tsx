import './FinalArchitectSprite.css'

export type ArchitectAnimation = 'idle' | 'dash' | 'strike' | 'shield' | 'death'

type Props = { animation: ArchitectAnimation; label: string }

export default function FinalArchitectSprite({ animation, label }: Props) {
  return <span className={`architect-sprite ${animation}`} role="img" aria-label={label} />
}
