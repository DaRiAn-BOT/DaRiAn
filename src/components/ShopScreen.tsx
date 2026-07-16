import { armors, shields, weapons, type EquipmentKind, type InventoryItem } from '../lib/equipment'
import EquipmentIcon from './EquipmentIcon'

const offers: Array<{ kind: EquipmentKind; level: number; price: number }> = [
  { kind: 'armor', level: 3, price: 100 },
  { kind: 'weapon', level: 3, price: 110 },
  { kind: 'shield', level: 3, price: 130 },
]
const catalogs = { weapon: weapons, shield: shields, armor: armors }

type Props = { level: number; shards: number; inventory: InventoryItem[]; onBuy: (offer: InventoryItem & { price: number }) => void; onClose: () => void }

export default function ShopScreen({ level, shards, inventory, onBuy, onClose }: Props) {
  const location = level < 10 ? 'ancient' : level < 20 ? 'magic' : 'guardian'
  return <div className={`shop-card shop-${location}`}>
    <div className="shop-header"><div><p className="eyebrow">ЛАВКА МЕЖДУ СТЕН</p><h2>Торговец Печати</h2></div><strong>◈ {shards} Эха</strong></div>
    <p>Эхо Лабиринта остаётся после освобождённых стражей. Обменяй его на снаряжение, способное выдержать глубины.</p>
    <div className="shop-items">{offers.map((offer) => {
      const item = catalogs[offer.kind][offer.level]
      const owned = inventory.some((saved) => saved.kind === offer.kind && saved.level === offer.level)
      return <article key={offer.kind}><EquipmentIcon kind={offer.kind} level={offer.level} /><div><h3>{item.name}</h3><p>{item.effect}</p></div><button disabled={owned || shards < offer.price} onClick={() => onBuy(offer)}>{owned ? 'КУПЛЕНО' : `◈ ${offer.price}`}</button></article>
    })}</div>
    <button className="shop-back" onClick={onClose}>Вернуться в меню</button>
  </div>
}
