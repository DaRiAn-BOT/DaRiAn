const skinNames = ['Алый', 'Лесной', 'Ночной', 'Золотой', 'Ледяной', 'Фиолетовый', 'Песочный', 'Стальной', 'Розовый', 'Теневой']

type Props = {
  selectedSkin: number
  onSelect: (skin: number) => void
  onConfirm: () => void
}

export default function SkinSelection({ selectedSkin, onSelect, onConfirm }: Props) {
  return <div className="story-card skin-selection">
    <span>◆</span><p className="eyebrow">НАЧАЛО ПУТИ</p><h2>Выбери своего героя</h2>
    <p>Этот облик будет сопровождать тебя в лабиринте и во время сражений.</p>
    <div className="skin-grid" aria-label="Выбор героя">
      {skinNames.map((name, index) => <button key={name} className={`skin-option skin-${index} ${selectedSkin === index ? 'selected' : ''}`} onClick={() => onSelect(index)} aria-label={name} title={name}><HeroModel skin={index} className="skin-preview" /><small>{index + 1}</small></button>)}
    </div>
    <p className="selected-skin-name">Выбран: <strong>{skinNames[selectedSkin]}</strong></p>
    <button onClick={onConfirm}>Подтвердить выбор</button>
  </div>
}
import HeroModel from './HeroModel'
