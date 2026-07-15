import type { Achievement } from '../lib/achievements'

export default function AchievementToast({ achievement }: { achievement: Achievement }) {
  return <div className="achievement-toast" role="status"><i>{achievement.icon}</i><span><small>ДОСТИЖЕНИЕ ОТКРЫТО</small><strong>{achievement.name}</strong></span></div>
}
