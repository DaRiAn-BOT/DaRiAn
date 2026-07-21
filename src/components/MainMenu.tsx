import { useEffect, useState } from 'react'
import { TOTAL_LEVELS } from '../lib/gameConfig'
import { useLanguage } from '../lib/languageSettings'

type Props = { canContinue: boolean; accountEmail: string | null; sealShards: number; onStart: () => void; onContinue: () => void; onShop: () => void; onStats: () => void; onSound: () => void; onAchievements: () => void; onAccount: () => void }

const labels = {
  ru: { eyebrow: 'ТАЙНЫ ЛАБИРИНТА', title: 'Путь ждёт тебя', description: `Ты уснул дома, но во сне провалился в древний лабиринт. Его стражи когда-то защищали людей, пока Сбой Системы не подчинил их своей воле. Найди ${TOTAL_LEVELS} частей утраченной памяти, освободи стражей и раскрой правду о своём пробуждении.`, continue: 'Исследовать дальше', explore: 'Исследовать лабиринт', achievements: 'Достижения', stats: 'Статистика', settings: 'Настройки', account: 'Войти / регистрация', accountReady: 'Аккаунт ✓', confirm: 'Начать новое исследование?', warning: 'Текущее сохранение будет удалено. Это действие нельзя отменить.', cancel: 'Отмена', erase: 'Удалить и исследовать' },
  en: { eyebrow: 'SECRETS OF THE MAZE', title: 'The path awaits', description: `You fell asleep at home, then plunged into an ancient maze in a dream. Its guardians once protected people until the System Error enslaved them. Find ${TOTAL_LEVELS} fragments of lost memory, free the guardians and uncover the truth behind your awakening.`, continue: 'Explore further', explore: 'Explore the maze', achievements: 'Achievements', stats: 'Statistics', settings: 'Settings', account: 'Sign in / register', accountReady: 'Account ✓', confirm: 'Start a new exploration?', warning: 'Your current save will be deleted. This cannot be undone.', cancel: 'Cancel', erase: 'Delete and explore' },
  kk: { eyebrow: 'ЛАБИРИНТ ҚҰПИЯЛАРЫ', title: 'Жол сені күтеді', description: `Сен үйде ұйықтап, түсіңде ежелгі лабиринтке құладың. Оның сақшылары бұрын адамдарды қорғаған, бірақ Жүйе Ақауы оларды өзіне бағындырды. Жоғалған жадтың ${TOTAL_LEVELS} бөлігін тауып, сақшыларды босат және оянуыңның құпиясын аш.`, continue: 'Әрі қарай зерттеу', explore: 'Лабиринтті зерттеу', achievements: 'Жетістіктер', stats: 'Статистика', settings: 'Баптаулар', account: 'Кіру / тіркелу', accountReady: 'Аккаунт ✓', confirm: 'Жаңа зерттеуді бастау керек пе?', warning: 'Ағымдағы сақтау жойылады. Бұл әрекетті қайтару мүмкін емес.', cancel: 'Бас тарту', erase: 'Жою және зерттеу' },
}

export default function MainMenu({ canContinue, accountEmail, sealShards, onStart, onContinue, onShop, onStats, onSound, onAchievements, onAccount }: Props) {
  const [confirmNewGame, setConfirmNewGame] = useState(false)
  const text = labels[useLanguage()]
  const startGame = () => canContinue ? setConfirmNewGame(true) : onStart()
  useEffect(() => {
    if (!confirmNewGame) return
    const cancelWithEscape = (event: KeyboardEvent) => {
      if (event.code === 'Escape') { event.preventDefault(); setConfirmNewGame(false) }
    }
    window.addEventListener('keydown', cancelWithEscape)
    return () => window.removeEventListener('keydown', cancelWithEscape)
  }, [confirmNewGame])
  return <div className="story-card main-menu">
    <span>◇</span><p className="eyebrow">{text.eyebrow}</p><h2>{text.title}</h2><p>{text.description}</p>
    <div className="menu-currency">◈ ЭХО ЛАБИРИНТА: <strong>{sealShards}</strong></div>
    <div className="menu-actions">
      {canContinue && <button onClick={onContinue}>{text.continue}</button>}
      <button className={canContinue ? 'secondary-menu-button' : ''} onClick={startGame}>{text.explore}</button>
      <button className="secondary-menu-button" onClick={onAchievements}>{text.achievements}</button>
      <button className="secondary-menu-button shop-menu-button" onClick={onShop}>Арсенал Лабиринта</button>
      <button className="secondary-menu-button" onClick={onStats}>{text.stats}</button>
      <button className="secondary-menu-button" onClick={onSound}>{text.settings}</button>
      <button className="secondary-menu-button" onClick={onAccount}>{accountEmail ? text.accountReady : text.account}</button>
    </div>
    {confirmNewGame && <div className="confirm-overlay" role="dialog" aria-modal="true"><div className="confirm-dialog"><h3>{text.confirm}</h3><p>{text.warning}</p><div><button className="secondary-menu-button" onClick={() => setConfirmNewGame(false)}>{text.cancel}</button><button className="danger-button" onClick={onStart}>{text.erase}</button></div></div></div>}
  </div>
}
