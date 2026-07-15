import { useState } from 'react'
import { loadAudioSettings, saveAudioSettings, type AudioSettings } from '../lib/audioSettings'
import { loadLanguage, saveLanguage, type GameLanguage } from '../lib/languageSettings'
import { sounds } from '../lib/sounds'

export default function SoundSettings({ onClose, onControls }: { onClose: () => void; onControls: () => void }) {
  const [audio, setAudio] = useState(loadAudioSettings)
  const [language, setLanguage] = useState(loadLanguage)
  const text = language === 'ru'
    ? { eyebrow: 'НАСТРОЙКИ', title: 'Игра', music: 'Музыка', effects: 'Звуковые эффекты', language: 'Язык', controls: 'Управление', ru: 'Русский', en: 'English', kk: 'Қазақша', back: 'Назад' }
    : language === 'kk'
      ? { eyebrow: 'БАПТАУЛАР', title: 'Ойын', music: 'Музыка', effects: 'Дыбыс әсерлері', language: 'Тіл', controls: 'Басқару', ru: 'Русский', en: 'English', kk: 'Қазақша', back: 'Артқа' }
      : { eyebrow: 'SETTINGS', title: 'Game', music: 'Music', effects: 'Sound effects', language: 'Language', controls: 'Controls', ru: 'Русский', en: 'English', kk: 'Қазақша', back: 'Back' }

  const changeAudio = (kind: keyof AudioSettings, value: number) => {
    const next = { ...audio, [kind]: value }
    setAudio(next)
    saveAudioSettings(next)
    if (kind === 'effects') sounds.menu()
  }
  const changeLanguage = (next: GameLanguage) => {
    setLanguage(next)
    saveLanguage(next)
    sounds.menu()
  }

  return <div className="story-card sound-settings">
    <span>⚙</span><p className="eyebrow">{text.eyebrow}</p><h2>{text.title}</h2>
    <VolumeSlider label={text.music} value={audio.music} onChange={(value) => changeAudio('music', value)} />
    <VolumeSlider label={text.effects} value={audio.effects} onChange={(value) => changeAudio('effects', value)} />
    <fieldset className="language-picker"><legend>{text.language}</legend>
      <button className={language === 'ru' ? 'selected' : ''} onClick={() => changeLanguage('ru')}>{text.ru}</button>
      <button className={language === 'en' ? 'selected' : ''} onClick={() => changeLanguage('en')}>{text.en}</button>
      <button className={language === 'kk' ? 'selected' : ''} onClick={() => changeLanguage('kk')}>{text.kk}</button>
    </fieldset>
    <button className="secondary-menu-button settings-controls" onClick={onControls}>{text.controls}</button>
    <button onClick={onClose}>{text.back}</button>
  </div>
}

function VolumeSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="volume-slider"><span><b>{label}</b><strong>{Math.round(value * 100)}%</strong></span>
    <input type="range" min="0" max="1" step="0.05" value={value} onChange={(event) => onChange(Number(event.target.value))} />
  </label>
}
