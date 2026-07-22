type Props = { skin: number; className?: string }

export default function HeroModel({ skin, className = '' }: Props) {
  return <span className={`sprite-hero-shell skin-${skin} ${className}`} aria-label="Герой лабиринта">
    <i className="hero-sprite-sheet" aria-hidden="true" />
  </span>
}
