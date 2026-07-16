export type Point = { x: number; y: number }
export type Loot = Point & { kind: 'weapon' | 'shield' | 'armor' }
export type Maze = { cells: boolean[][]; start: Point; clue: Point; loot?: Loot; potion: Point }

const directions = [{ x: 2, y: 0 }, { x: -2, y: 0 }, { x: 0, y: 2 }, { x: 0, y: -2 }]

const random = (seed: number) => {
  let value = seed
  return () => ((value = Math.imul(value ^ value >>> 15, 1 | value) + 0x6d2b79f5) >>> 0) / 4294967296
}

export function createMaze(level: number): Maze {
  const baseSize = 10 + Math.floor((level - 1) / 3) * 2
  const size = baseSize - (level >= 15 ? 2 : 0)
  const cells = Array.from({ length: size }, () => Array(size).fill(false))
  const rng = random(level * 7919 + 17)
  const stack: Point[] = [{ x: 1, y: 1 }]
  cells[1][1] = true

  while (stack.length) {
    const currentIndex = rng() < .55 ? Math.floor(rng() * stack.length) : stack.length - 1
    const current = stack[currentIndex]
    const choices = directions
      .map(({ x, y }) => ({ x: current.x + x, y: current.y + y }))
      .filter(({ x, y }) => x > 0 && y > 0 && x < size - 1 && y < size - 1 && !cells[y][x])
    if (!choices.length) { stack.splice(currentIndex, 1); continue }
    const next = choices[Math.floor(rng() * choices.length)]
    cells[(current.y + next.y) / 2][(current.x + next.x) / 2] = true
    cells[next.y][next.x] = true
    stack.push(next)
  }

  const clue = farthestCell(cells)
  const deadEnds = findDeadEnds(cells).filter(({ x, y }) => x !== clue.x || y !== clue.y)
  const hasArmor = level === 7 || level === 14
  const lootPoint = level % 5 === 0 || hasArmor ? deadEnds[Math.floor(rng() * deadEnds.length)] : undefined
  const kind = hasArmor ? 'armor' as const : level % 10 === 0 ? 'shield' as const : 'weapon' as const
  const loot = lootPoint ? { ...lootPoint, kind } : undefined
  const potionChoices = deadEnds.filter(({ x, y }) => !lootPoint || x !== lootPoint.x || y !== lootPoint.y)
  const potion = potionChoices[Math.floor(rng() * potionChoices.length)] ?? deadEnds[0] ?? { x: 1, y: 1 }
  return { cells, start: { x: 1, y: 1 }, clue, loot, potion }
}

function findDeadEnds(cells: boolean[][]): Point[] {
  const steps = directions.map(({ x, y }) => ({ x: x / 2, y: y / 2 }))
  return cells.flatMap((row, y) => row.flatMap((open, x) => {
    if (!open || (x === 1 && y === 1)) return []
    const exits = steps.filter((step) => cells[y + step.y]?.[x + step.x]).length
    return exits === 1 ? [{ x, y }] : []
  }))
}

function farthestCell(cells: boolean[][]): Point {
  const queue: Array<Point & { distance: number }> = [{ x: 1, y: 1, distance: 0 }]
  const visited = new Set(['1,1'])
  let farthest = queue[0]
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index]
    if (current.distance > farthest.distance) farthest = current
    directions.map(({ x, y }) => ({ x: current.x + x / 2, y: current.y + y / 2 }))
      .filter(({ x, y }) => cells[y]?.[x] && !visited.has(`${x},${y}`))
      .forEach((next) => { visited.add(`${next.x},${next.y}`); queue.push({ ...next, distance: current.distance + 1 }) })
  }
  return farthest
}
