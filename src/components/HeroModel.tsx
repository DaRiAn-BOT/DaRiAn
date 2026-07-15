type Props = { skin: number; className?: string }

export default function HeroModel({ skin, className = '' }: Props) {
  return <span className={`hero simple-hero skin-${skin} ${className}`} aria-label="Герой лабиринта">
    <i className="neck" /><i className="head" /><i className="body" />
    <i className="arm arm-left"><b className="hand" /></i>
    <i className="arm arm-right"><b className="hand" /><em className="weapon" aria-hidden="true" /></i>
    <i className="legs" /><i className="boot boot-left" /><i className="boot boot-right" />
  </span>
}
