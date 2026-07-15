import { useState } from 'react'
import { TOTAL_LEVELS } from '../lib/gameConfig'
import { useLanguage } from '../lib/languageSettings'

type Props = { canContinue: boolean; accountEmail: string | null; onStart: () => void; onContinue: () => void; onStats: () => void; onSound: () => void; onAchievements: () => void; onAccount: () => void }

const labels = {
  ru: { eyebrow: 'ТАЙНЫ ЛАБИРИНТА', title: 'Путь ждёт тебя', description: `Найди ${TOTAL_LEVELS} подсказок, собери снаряжение и победи Короля Лабиринта.`, continue: 'Исследовать дальше', explore: 'Исследовать лабиринт', achievements: 'Достижения', stats: 'Статистика', settings: 'Настройки', account: 'Войти / регистрация', accountReady: 'Аккаунт ✓', confirm: 'Начать новое исследование?', warning: 'Текущее сохранение будет удалено. Это действие нельзя отменить.', cancel: 'Отмена', erase: 'Удалить и исследовать' },
  en: { eyebrow: 'SECRETS OF THE MAZE', title: 'The path awaits', description: `Find ${TOTAL_LEVELS} clues, collect equipment and defeat the Maze King.`, continue: 'Explore further', explore: 'Explore the maze', achievements: 'Achievements', stats: 'Statistics', settings: 'Settings', account: 'Sign in / register', accountReady: 'Account ✓', confirm: 'Start a new exploration?', warning: 'Your current save will be deleted. This cannot be undone.', cancel: 'Cancel', erase: 'Delete and explore' },
  kk: { eyebrow: 'ЛАБИРИНТ ҚҰПИЯЛАРЫ', title: 'Жол сені күтеді', description: `${TOTAL_LEVELS} кеңес тауып, жабдық жинап, Лабиринт Патшасын жең.`, continue: 'Әрі қарай зерттеу', explore: 'Лабиринтті зерттеу', achievements: 'Жетістіктер', stats: 'Статистика', settings: 'Баптаулар', account: 'Кіру / тіркелу', accountReady: 'Аккаунт ✓', confirm: 'Жаңа зерттеуді бастау керек пе?', warning: 'Ағымдағы сақтау жойылады. Бұл әрекетті қайтару мүмкін емес.', cancel: 'Бас тарту', erase: 'Жою және зерттеу' },
}

export default function MainMenu({ canContinue, accountEmail, onStart, onContinue, onStats, onSound, onAchievements, onAccount }: Props) {
  const [confirmNewGame, setConfirmNewGame] = useState(false)
  const text = labels[useLanguage()]
  const startGame = () => canContinue ? setConfirmNewGame(true) : onStart()
  return <div className="story-card main-menu">
    <span>◇</span><p className="eyebrow">{text.eyebrow}</p><h2>{text.title}</h2><p>{text.description}</p>
    <div className="menu-actions">
      {canContinue && <button onClick={onContinue}>{text.continue}</button>}
      <button className={canContinue ? 'secondary-menu-button' : ''} onClick={startGame}>{text.explore}</button>
      <button className="secondary-menu-button" onClick={onAchievements}>{text.achievements}</button>
      <button className="secondary-menu-button" onClick={onStats}>{text.stats}</button>
      <button className="secondary-menu-button" onClick={onSound}>{text.settings}</button>
      <button className="secondary-menu-button" onClick={onAccount}>{accountEmail ? text.accountReady : text.account}</button>
    </div>
    {confirmNewGame && <div className="confirm-overlay" role="dialog" aria-modal="true"><div className="confirm-dialog"><h3>{text.confirm}</h3><p>{text.warning}</p><div><button className="secondary-menu-button" onClick={() => setConfirmNewGame(false)}>{text.cancel}</button><button className="danger-button" onClick={onStart}>{text.erase}</button></div></div></div>}
  </div>
}
