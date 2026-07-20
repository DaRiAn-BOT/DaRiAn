import { useEffect, useState } from 'react'
import HeroModel from './HeroModel'
import { sounds } from '../lib/sounds'

type Props = { skin: number; playerName: string; onFinish: () => void }

export default function BedroomEnding({ skin, playerName, onFinish }: Props) {
  const [step, setStep] = useState(0)
  const scene = [
    { speaker: 'Рассвет', text: `Тьма расступается. ${playerName} чувствует под собой знакомую кровать.` },
    { speaker: playerName, text: 'Я дома… Значит, это всё-таки был сон?' },
    { speaker: 'Голос из-за двери', text: `${playerName}, просыпайся!` },
    { speaker: 'Мама', text: `${playerName}, пойдём завтракать.` },
    { speaker: playerName, text: 'Сейчас, мам! Но почему у меня в руке осталась золотая пыль?' },
  ]
  const next = () => {
    sounds.menu()
    if (step === scene.length - 1) onFinish()
    else setStep((value) => value + 1)
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Enter' && event.code !== 'Space') return
      event.preventDefault(); next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])
  return <div className={`bedroom-ending ${step > 0 ? 'hero-awake' : ''}`}>
    <div className="bedroom-window"><i /></div><div className="bedroom-bed"><i /></div>
    <HeroModel skin={skin} className="bedroom-hero" />
    <div className="bedroom-dialogue"><small>{scene[step].speaker}</small><p>{scene[step].text}</p><button onClick={next}>{step === scene.length - 1 ? 'Завершить историю' : 'Продолжить'}</button></div>
  </div>
}
