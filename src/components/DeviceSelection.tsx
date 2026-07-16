type Props = { onComputer: () => void; onPhone: () => void }

export default function DeviceSelection({ onComputer, onPhone }: Props) {
  return <div className="device-select-overlay" role="dialog" aria-modal="true" aria-labelledby="device-title">
    <div className="story-card device-select-card">
      <span>▣</span><p className="eyebrow">ВЫБОР УСТРОЙСТВА</p><h2 id="device-title">На чём ты играешь?</h2>
      <p>Мы расположим управление так, чтобы играть было удобно.</p>
      <div className="device-options">
        <button onClick={onComputer}><b>▰</b><strong>Игра на компьютере</strong><small>Клавиатура и обычный экран</small></button>
        <button onClick={onPhone}><b>▯</b><strong>Игра на телефоне</strong><small>Горизонтальный экран и сенсорные кнопки</small></button>
      </div>
      <p className="ios-fullscreen-tip">На iPhone: нажми «Поделиться» → «На экран Домой», затем запускай игру через её значок — она откроется без панели браузера.</p>
    </div>
  </div>
}
