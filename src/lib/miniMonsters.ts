import type { Maze, Point } from './maze'

export type MiniMonster = Point & { id: number; hp: number; maxHp: number }
export const MINI_MONSTER_DAMAGE = 5
const steps = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }]

export function createMiniMonsters(maze: Maze, level: number): MiniMonster[] {
  const hp = 2 + (level - 1) * .5
  const cells = maze.cells.flatMap((row, y) => row.flatMap((open, x) => open && Math.hypot(x - maze.start.x, y - maze.start.y) > 5 && (x !== maze.clue.x || y !== maze.clue.y) && (x !== maze.potion.x || y !== maze.potion.y) ? [{ x, y }] : []))
  const count = 5
  return Array.from({ length: Math.min(count, cells.length) }, (_, id) => {
    const point = cells[Math.floor((id + 1) * cells.length / (count + 1))]
    return { ...point, id: level * 10 + id, hp, maxHp: hp }
  })
}

export function chasePlayer(monsters: MiniMonster[], player: Point, cells: boolean[][]) {
  const occupied = new Set(monsters.map(({ x, y }) => `${x},${y}`))
  return monsters.map((monster) => {
    occupied.delete(`${monster.x},${monster.y}`)
    const next = steps.map((step) => ({ x: monster.x + step.x, y: monster.y + step.y }))
      .filter((point) => cells[point.y]?.[point.x] && (point.x !== player.x || point.y !== player.y) && !occupied.has(`${point.x},${point.y}`))
      .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0]
    const moved = next && Math.hypot(next.x - player.x, next.y - player.y) < Math.hypot(monster.x - player.x, monster.y - player.y) ? { ...monster, ...next } : monster
    occupied.add(`${moved.x},${moved.y}`)
    return moved
  })
}
