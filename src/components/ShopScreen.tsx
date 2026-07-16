import { armors, shields, weapons, type EquipmentKind, type InventoryItem } from '../lib/equipment'
import EquipmentIcon from './EquipmentIcon'

const offers: Array<{ kind: EquipmentKind; level: number; price: number }> = [
  { kind: 'armor', level: 3, price: 100 },
  { kind: 'weapon', level: 3, price: 110 },
  { kind: 'shield', level: 3, price: 130 },
]
const catalogs = { weapon: weapons, shield: shields, armor: armors }

type Props = { level: number; shards: number; inventory: InventoryItem[]; onBuy: (offer: InventoryItem & { price: number }) => void; onClose: () => void }
type ShopProps = Props & { potions: number; onBuyPotion: () => void }

export default function ShopScreen({ level, shards, inventory, potions, onBuy, onBuyPotion, onClose }: ShopProps) {
  const location = level < 10 ? 'ancient' : level < 20 ? 'magic' : 'guardian'
  return <div className={`shop-card shop-${location}`}>
    <div className="shop-header"><div><p className="eyebrow">МАГАЗИН СНАРЯЖЕНИЯ</p><h2>Арсенал Лабиринта</h2></div><strong>◈ {shards} Эха</strong></div>
    <p>Эхо Лабиринта остаётся после освобождённых стражей. Обменяй его на снаряжение, способное выдержать глубины.</p>
    <div className="shop-items">{offers.map((offer) => {
      const item = catalogs[offer.kind][offer.level]
      const owned = inventory.some((saved) => saved.kind === offer.kind && saved.level === offer.level)
      return <article key={offer.kind}><EquipmentIcon kind={offer.kind} level={offer.level} /><div><h3>{item.name}</h3><p>{item.effect}</p></div><button disabled={owned || shards < offer.price} onClick={() => onBuy(offer)}>{owned ? 'КУПЛЕНО' : `◈ ${offer.price}`}</button></article>
    })}<article className="shop-potion"><span className="health-potion shop-potion-icon"><i /></span><div><h3>Зелье исцеления</h3><p>Добавляет в рюкзак одно зелье. Восстанавливает 50 HP.</p></div><button disabled={shards < 215} onClick={onBuyPotion}>◈ 215<small>В рюкзаке: {potions}</small></button></article></div>
    <button className="shop-back" onClick={onClose}>Вернуться в меню</button>
  </div>
}
