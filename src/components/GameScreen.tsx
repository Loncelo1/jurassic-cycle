import { availableActions } from '../game/engine';
import { getSpecies } from '../game/species';
import { GROWTH_PER_STAGE, dayOf, isNight } from '../game/balance';
import { useGame } from '../state/GameContext';
import { ActionPanel } from './ActionPanel';
import { DinoAvatar } from './DinoAvatar';
import { LogPanel } from './LogPanel';
import { ResultScreen } from './ResultScreen';
import { SaveControls } from './SaveControls';
import { StageBar } from './StageBar';
import { StatsPanel } from './StatsPanel';

export function GameScreen() {
  const { game, act, startGame, newGame, importSave } = useGame();
  if (!game) return null;

  const species = getSpecies(game.speciesId);
  const actions = availableActions(game);
  const night = isNight(game.turn);
  const day = dayOf(game.turn);
  const finished = game.phase !== 'playing';

  const confirmMenu = () => {
    if (window.confirm('Вернуться в меню? Текущий прогресс будет удалён.')) newGame();
  };

  return (
    <div className="game">
      <header className="game-header">
        <div className="identity">
          <div>
            <h2>{species.name}</h2>
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              {species.diet === 'carnivore' ? '🦖 плотоядный' : '🌿 травоядный'} ·{' '}
              {species.scientificName}
            </span>
          </div>
        </div>
        <div className="game-meta">
          <span className="chip">📆 День {day}</span>
          <span className="chip">{night ? '🌙 Ночь' : '☀️ День'}</span>
          <span className="chip">🔄 Ход {game.turn}</span>
          {game.threat && <span className="chip" style={{ color: 'var(--danger)' }}>⚠️ Угроза: {game.threat}</span>}
        </div>
        <div className="row">
          <SaveControls mode="game" state={game} onImported={importSave} />
          <button type="button" className="btn btn-sm btn-ghost" onClick={confirmMenu}>
            Меню
          </button>
        </div>
      </header>

      <div className="game-layout">
        <StatsPanel game={game} />
        <div className="game-center">
          <DinoAvatar
            species={species}
            stageIndex={game.stageIndex}
            growth={game.stats.growth}
            growthMax={GROWTH_PER_STAGE}
          />
          <StageBar game={game} />
          <LogPanel entries={game.log} turn={game.turn} />
        </div>
        <ActionPanel actions={actions} disabled={finished} onAct={act} />
      </div>

      {finished && (
        <ResultScreen
          game={game}
          onRestart={() => startGame(species.id)}
          onMenu={newGame}
        />
      )}
    </div>
  );
}
