import { STAGES } from '../game/balance';
import { getSpecies } from '../game/species';
import type { GameState } from '../game/types';

interface ResultScreenProps {
  game: GameState;
  onRestart: () => void;
  onMenu: () => void;
}

export function ResultScreen({ game, onRestart, onMenu }: ResultScreenProps) {
  const species = getSpecies(game.speciesId);
  const won = game.phase === 'won';
  const stage = STAGES[game.stageIndex];

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="panel result-card">
        <div className="result-emoji" aria-hidden>
          {won ? '🏆' : '💀'}
        </div>
        <h2>{won ? 'Взрослый динозавр!' : 'Динозавр погиб'}</h2>
        <p className="muted">{won ? 'Вы прошли путь от детёныша до взрослой особи.' : game.deathCause}</p>

        <div className="result-summary">
          <div className="cell">
            <span className="k">Вид</span>
            {species.emoji} {species.name}
          </div>
          <div className="cell">
            <span className="k">Достигнутая стадия</span>
            {stage.emoji} {stage.name}
          </div>
          <div className="cell">
            <span className="k">Прожито ходов</span>
            {game.turn}
          </div>
          <div className="cell">
            <span className="k">Дней в мире</span>
            {Math.floor(game.turn / 8) + 1}
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            Начать заново
          </button>
          <button type="button" className="btn btn-ghost" onClick={onMenu}>
            В главное меню
          </button>
        </div>
      </div>
    </div>
  );
}
