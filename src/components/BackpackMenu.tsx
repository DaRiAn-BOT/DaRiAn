import { armors, shields, weapons, type EquipmentKind, type InventoryItem } from '../lib/equipment'

type Props = {
  items: InventoryItem[]
  equipped: Record<EquipmentKind, number>
  onEquip: (item: InventoryItem) => void
  onClose: () => void
}

const catalogs = { weapon: weapons, shield: shields, armor: armors }
const icons = { weapon: '⚔', shield: '◆', armor: '♟' }

export default function BackpackMenu({ items, equipped, onEquip, onClose }: Props) {
  return <div className="backpack-card">
    <div className="backpack-title"><div><p className="eyebrow">ИНВЕНТАРЬ</p><h2>Рюкзак героя</h2></div><button onClick={onClose}>Закрыть</button></div>
    <p className="backpack-help">Выбери предмет, чтобы экипировать его. E / У — закрыть рюкзак.</p>
    <div className="item-list">
      {items.map((item) => {
        const data = catalogs[item.kind][item.level]
        const isEquipped = equipped[item.kind] === item.level
        return <button key={`${item.kind}-${item.level}`} className={isEquipped ? 'equipped' : ''} onClick={() => onEquip(item)}>
          <span>{icons[item.kind]}</span><div><strong>{data.name}</strong><small>{data.effect}</small></div><b>{isEquipped ? 'НАДЕТО' : 'НАДЕТЬ'}</b>
        </button>
      })}
    </div>
  </div>
}
