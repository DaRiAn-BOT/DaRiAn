import type { EquipmentKind } from '../lib/equipment'

type Props = { kind: EquipmentKind; level: number; small?: boolean }

export default function EquipmentIcon({ kind, level, small = false }: Props) {
  return <span className={`equipment-icon ${kind}-icon equipment-${level} ${small ? 'small' : ''}`} aria-hidden="true">
    <i /><b /><em />
  </span>
}
