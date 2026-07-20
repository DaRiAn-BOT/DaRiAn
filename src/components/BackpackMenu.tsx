import { useEffect, useMemo, useState } from 'react'
import { armors, shields, weapons, type EquipmentKind, type InventoryItem } from '../lib/equipment'
import EquipmentIcon from './EquipmentIcon'
import { formatControlCode, loadControlBindings } from '../lib/controlBindings'

type Props = { items: InventoryItem[]; potions: number; health: number; maxHealth: number; equipped: Record<EquipmentKind, number>; onEquip: (item: InventoryItem) => void; onUsePotion: () => void; onClose: () => void }
type Choice = { type: 'potion' } | { type: 'equipment'; item: InventoryItem }
const catalogs = { weapon: weapons, shield: shields, armor: armors }

export default function BackpackMenu({ items, potions, health, maxHealth, equipped, onEquip, onUsePotion, onClose }: Props) {
  const backpackKey = formatControlCode(loadControlBindings().backpack)
  const choices = useMemo<Choice[]>(() => [...(potions > 0 ? [{ type: 'potion' as const }] : []), ...items.map((item) => ({ type: 'equipment' as const, item }))], [items, potions])
  const [selected, setSelected] = useState(0)
  const activate = (choice = choices[selected]) => {
    if (!choice) return
    if (choice.type === 'potion') onUsePotion()
    else onEquip(choice.item)
  }

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (/^[1-9]$/.test(event.key)) { const index = Number(event.key) - 1; if (choices[index]) { event.preventDefault(); setSelected(index) } }
      if (event.code === 'Enter') { event.preventDefault(); activate() }
    }
    window.addEventListener('keydown', keyboard)
    return () => window.removeEventListener('keydown', keyboard)
  }, [choices, selected])

  let index = 0
  return <div className="backpack-card">
    <div className="backpack-title"><div><p className="eyebrow">ИНВЕНТАРЬ</p><h2>Рюкзак героя</h2></div><button onClick={onClose}>Закрыть</button></div>
    <p className="backpack-help">ЦИФРА — выбрать предмет · ENTER — экипировать или использовать · {backpackKey} — закрыть.</p>
    <div className="item-list">
      {potions > 0 && (() => { const number = ++index; return <button className={`potion-item ${selected === number - 1 ? 'keyboard-selected' : ''}`} disabled={health >= maxHealth} onClick={() => { setSelected(number - 1); onUsePotion() }}><kbd>{number}</kbd><span className="health-potion backpack-potion"><i /></span><div><strong>Зелье исцеления ×{potions}</strong><small>Восстанавливает 50 HP.</small></div><b>{health >= maxHealth ? 'HP ПОЛНОЕ' : 'ИСПОЛЬЗОВАТЬ'}</b></button> })()}
      {items.map((item) => { const number = ++index; const data = catalogs[item.kind][item.level]; const isEquipped = equipped[item.kind] === item.level; return <button key={`${item.kind}-${item.level}`} className={`${isEquipped ? 'equipped' : ''} ${selected === number - 1 ? 'keyboard-selected' : ''}`} onClick={() => { setSelected(number - 1); onEquip(item) }}><kbd>{number}</kbd><EquipmentIcon kind={item.kind} level={item.level} /><div><strong>{data.name}</strong><small>{data.effect}</small></div><b>{isEquipped ? 'НАДЕТО' : 'НАДЕТЬ'}</b></button> })}
    </div>
  </div>
}
