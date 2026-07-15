import { useEffect, useState } from 'react'
import { sounds } from '../lib/sounds'

const lines = [
  'Где я?.. Куда я попал?',
  'Всё, что я помню — я лёг спать у себя дома.',
  'Во сне земля исчезла под ногами, и я провалился куда-то вниз…',
  'Я очнулся среди холодных стен. Или это был не сон?',
  'Впереди виден слабый свет. Возможно, там я найду ответы.',
]

export default function OpeningCutscene({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const next = () => {
    sounds.menu()
    if (step === lines.length - 1) onFinish()
    else setStep((current) => current + 1)
  }

  useEffect(() => {
    const continueWithEnter = (event: KeyboardEvent) => {
      if (event.code !== 'Enter') return
      event.preventDefault(); next()
    }
    window.addEventListener('keydown', continueWithEnter)
    return () => window.removeEventListener('keydown', continueWithEnter)
  }, [step])

  return <div className="opening-cutscene" onClick={next} role="dialog" aria-label="Вступление">
    <div className="cutscene-light" /><div className="cutscene-hero" aria-hidden="true">◆</div>
    <div className="cutscene-dialogue"><p className="eyebrow">ГЕРОЙ</p><p>{lines[step]}</p>
      <button onClick={(event) => { event.stopPropagation(); next() }}>{step === lines.length - 1 ? 'Войти в лабиринт' : 'Дальше'}</button>
      <small>{step + 1} / {lines.length}</small>
    </div>
  </div>
}
