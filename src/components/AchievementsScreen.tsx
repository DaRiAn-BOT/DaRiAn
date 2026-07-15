import { achievementList } from '../lib/achievements'

export default function AchievementsScreen({ unlocked, onClose }: { unlocked: string[]; onClose: () => void }) {
  return <div className="story-card achievements-screen"><span>★</span><p className="eyebrow">ИСПЫТАНИЯ</p><h2>Достижения</h2>
    <p className="achievement-progress">Открыто {unlocked.length} из {achievementList.length}</p>
    <div className="achievement-list">{achievementList.map((item) => <div key={item.id} className={unlocked.includes(item.id) ? 'unlocked' : ''}>
      <i>{unlocked.includes(item.id) ? item.icon : '?'}</i><span><strong>{item.name}</strong><small>{item.description}</small></span><b>{unlocked.includes(item.id) ? 'Открыто' : 'Закрыто'}</b>
    </div>)}</div><button onClick={onClose}>Назад</button>
  </div>
}
