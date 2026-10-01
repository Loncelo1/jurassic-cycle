import { GROWTH_PER_STAGE, STAGES } from '../game/balance';
import type { GameState } from '../game/types';

/** Компактный индикатор текущей стадии с прогрессом роста. */
export function StageIndicator({ game }: { game: GameState }) {
  const stage = STAGES[game.stageIndex];
  const progress = Math.round((game.stats.growth / GROWTH_PER_STAGE) * 100);

  return (
    <div className="stage-indicator panel" aria-label={`Текущая стадия: ${stage.name}`}>
      <span className="stage-indicator-emoji" aria-hidden>
        {stage.emoji}
      </span>
      <div className="stage-indicator-body">
        <span className="stage-indicator-label">Текущая стадия</span>
        <strong className="stage-indicator-name">{stage.name}</strong>
        <div
          className="bar bar-growth"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Прогресс роста"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="muted stage-indicator-growth">
          Рост {Math.round(game.stats.growth)}/{GROWTH_PER_STAGE}
        </span>
      </div>
    </div>
  );
}

/** Трек стадий взросления с описанием каждой ступени. */
export function StageBar({ game }: { game: GameState }) {
  return (
    <section className="panel side stage-bar" aria-label="Стадии взросления">
      <h3 className="panel-title">Стадии взросления</h3>
      <div className="stage-track">
        {STAGES.map((stage, index) => {
          const cls =
            index < game.stageIndex ? 'done' : index === game.stageIndex ? 'current' : '';
          return (
            <div className={`stage-node ${cls}`} key={stage.id}>
              <span className="stage-emoji" aria-hidden>
                {stage.emoji}
              </span>
              <span className="stage-name">{stage.name}</span>
              <span className="stage-desc">{stage.description}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
