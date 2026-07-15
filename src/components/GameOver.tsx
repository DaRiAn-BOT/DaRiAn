type Props = { bossNumber: number; onRetry: () => void; onExit: () => void }

export default function GameOver({ bossNumber, onRetry, onExit }: Props) {
  return <div className="story-card game-over">
    <span>♜</span><p className="eyebrow">ПОРАЖЕНИЕ</p><h2>Страж оказался сильнее</h2>
    <p>Ты вернулся на чекпоинт перед боссом {bossNumber}. Следи за предупреждением о мощном ударе.</p>
    <div className="game-over-actions"><button onClick={onRetry}>Попробовать ещё</button><button className="exit-button" onClick={onExit}>Выйти из игры</button></div>
  </div>
}
