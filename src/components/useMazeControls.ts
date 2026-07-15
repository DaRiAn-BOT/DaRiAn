import { useEffect, type Dispatch, type SetStateAction } from 'react'
import type { Point } from '../lib/maze'
import { sounds } from '../lib/sounds'

type Props = {
  screen: string
  move: (dx: number, dy: number) => void
  attack: () => void
  setScreen: (screen: 'maze' | 'backpack') => void
  setCameraMode: Dispatch<SetStateAction<2 | 3>>
}

const keys: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
  ц: { x: 0, y: -1 }, ы: { x: 0, y: 1 }, ф: { x: -1, y: 0 }, в: { x: 1, y: 0 },
}

export function useMazeControls({ screen, move, attack, setScreen, setCameraMode }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || (target instanceof HTMLElement && target.isContentEditable)) return
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (event.code === 'Space' && screen === 'maze') {
        event.preventDefault(); attack(); return
      }
      if ((key === 'e' || key === 'у') && (screen === 'maze' || screen === 'backpack')) {
        event.preventDefault(); sounds.menu(); setScreen(screen === 'maze' ? 'backpack' : 'maze'); return
      }
      if (key === 'q' || key === 'й') {
        event.preventDefault(); setCameraMode((mode) => mode === 2 ? 3 : 2); return
      }
      const direction = keys[key]
      if (!direction) return
      event.preventDefault()
      move(direction.x, direction.y)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [attack, move, screen, setCameraMode, setScreen])
}
