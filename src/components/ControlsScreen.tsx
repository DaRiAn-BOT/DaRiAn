const controls = [
  ['WASD / ЦФЫВ / стрелки', 'Движение по лабиринту'],
  ['Q / Й', 'Переключить камеру'],
  ['E / У', 'Открыть или закрыть рюкзак'],
  ['Атаковать', 'Обычный удар во время боя'],
  ['Щит', 'Защита от мощного удара'],
  ['× слева сверху', 'Выйти в главное меню с сохранением'],
]

export default function ControlsScreen({ onClose }: { onClose: () => void }) {
  return <div className="story-card controls-card"><span>⌨</span><p className="eyebrow">КАК ИГРАТЬ</p><h2>Управление</h2>
    <div className="controls-list">{controls.map(([key, action]) => <div key={key}><kbd>{key}</kbd><span>{action}</span></div>)}</div>
    <button onClick={onClose}>Назад</button>
  </div>
}
