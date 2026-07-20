import { useEffect, useState } from 'react'
import { controlLabels, formatControlCode, loadControlBindings, saveControlBinding, type ControlAction } from '../lib/controlBindings'

export default function ControlsScreen({ onClose }: { onClose: () => void }) {
  const [bindings, setBindings] = useState(loadControlBindings)
  const [editing, setEditing] = useState<ControlAction | null>(null)
  useEffect(() => {
    if (!editing) return
    const capture = (event: KeyboardEvent) => {
      event.preventDefault(); event.stopImmediatePropagation()
      if (event.code === 'Escape') { setEditing(null); return }
      setBindings(saveControlBinding(editing, event.code)); setEditing(null)
    }
    window.addEventListener('keydown', capture, true)
    return () => window.removeEventListener('keydown', capture, true)
  }, [editing])
  const actions = Object.keys(controlLabels) as ControlAction[]
  return <div className="story-card controls-card"><span>⌨</span><p className="eyebrow">КАК ИГРАТЬ</p><h2>Управление</h2>
    <p>Нажми на клавишу действия, затем выбери новую кнопку.</p>
    <div className="controls-list">{actions.map((action) => <div key={action}><button className={editing === action ? 'binding-active' : ''} onClick={() => setEditing(action)}>{editing === action ? 'НАЖМИ КЛАВИШУ…' : formatControlCode(bindings[action])}</button><span>{controlLabels[action]}</span></div>)}</div>
    <small>Стрелки и ESC работают всегда.</small>
    <button onClick={onClose}>Назад</button>
  </div>
}
