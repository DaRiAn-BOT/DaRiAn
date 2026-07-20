export type ControlAction = 'up' | 'down' | 'left' | 'right' | 'attack' | 'super' | 'shield' | 'backpack' | 'camera'
export type ControlBindings = Record<ControlAction, string>

export const controlLabels: Record<ControlAction, string> = {
  up: 'Идти вперёд', down: 'Идти назад', left: 'Идти влево', right: 'Идти вправо',
  attack: 'Атаковать', super: 'Использовать суперудар', shield: 'Использовать щит', backpack: 'Открыть рюкзак', camera: 'Переключить камеру',
}

export const defaultBindings: ControlBindings = {
  up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD',
  attack: 'Space', super: 'KeyZ', shield: 'KeyR', backpack: 'KeyE', camera: 'KeyQ',
}

const STORAGE_KEY = 'maze-control-bindings'

export function loadControlBindings(): ControlBindings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<ControlBindings>
    return { ...defaultBindings, ...saved }
  } catch { return defaultBindings }
}

export function saveControlBinding(action: ControlAction, code: string) {
  const bindings = loadControlBindings()
  const duplicate = (Object.keys(bindings) as ControlAction[]).find((key) => key !== action && bindings[key] === code)
  if (duplicate) bindings[duplicate] = bindings[action]
  bindings[action] = code
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings))
  window.dispatchEvent(new Event('maze-controls-changed'))
  return bindings
}

export function formatControlCode(code: string) {
  if (code === 'Space') return 'ПРОБЕЛ'
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  return code.replace('Arrow', 'СТРЕЛКА ').toUpperCase()
}
