import { useEffect, type Dispatch, type SetStateAction } from 'react'
import type { Point } from '../lib/maze'
import { sounds } from '../lib/sounds'
import { loadControlBindings } from '../lib/controlBindings'

type Props = {
  screen: string
  move: (dx: number, dy: number) => void
  attack: () => void
  setScreen: (screen: 'maze' | 'backpack') => void
  setCameraMode: Dispatch<SetStateAction<2 | 3>>
}

export function useMazeControls({ screen, move, attack, setScreen, setCameraMode }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || (target instanceof HTMLElement && target.isContentEditable)) return
      const bindings = loadControlBindings()
      if (event.code === bindings.attack && screen === 'maze') {
        event.preventDefault(); attack(); return
      }
      if (event.code === bindings.backpack && (screen === 'maze' || screen === 'backpack')) {
        event.preventDefault(); sounds.menu(); setScreen(screen === 'maze' ? 'backpack' : 'maze'); return
      }
      if (event.code === bindings.camera) {
        event.preventDefault(); setCameraMode((mode) => mode === 2 ? 3 : 2); return
      }
      const direction: Point | undefined = event.code === bindings.up ? { x: 0, y: -1 }
        : event.code === bindings.down ? { x: 0, y: 1 }
        : event.code === bindings.left ? { x: -1, y: 0 }
        : event.code === bindings.right ? { x: 1, y: 0 }
        : ({ ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } } as Record<string, Point>)[event.code]
      if (!direction) return
      event.preventDefault()
      move(direction.x, direction.y)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [attack, move, screen, setCameraMode, setScreen])
}
