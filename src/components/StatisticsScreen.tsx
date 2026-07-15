import { useState } from 'react'
import type { GameStats, LifetimeStats } from '../lib/statistics'

export default function StatisticsScreen({ stats, lifetime, onClose }: { stats: GameStats; lifetime: LifetimeStats; onClose: () => void }) {
  const [allTime, setAllTime] = useState(false)
  const selected = allTime ? lifetime : stats
  const time = `${Math.floor(selected.seconds / 60)} мин ${selected.seconds % 60} сек`
  const rows: Array<[string, string | number]> = [['Время в игре', time], ['Шагов', selected.steps], ['Атак', selected.attacks], ['Щитов использовано', selected.shields], ['Поражений', selected.defeats], ['Боссов побеждено', selected.bosses], ['Предметов найдено', selected.items]]
  if (allTime) rows.unshift(['Игр начато', lifetime.games], ['Игр пройдено', lifetime.victories])
  return <div className="story-card stats-card"><span>▦</span><p className="eyebrow">ПУТЬ ГЕРОЯ</p><h2>Статистика</h2>
    <div className="stats-tabs"><button className={!allTime ? 'active' : ''} onClick={() => setAllTime(false)}>Текущая игра</button><button className={allTime ? 'active' : ''} onClick={() => setAllTime(true)}>За всё время</button></div>
    <div className="stats-list">{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><button onClick={onClose}>Назад</button></div>
}
