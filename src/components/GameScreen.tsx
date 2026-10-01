import { useCallback, useEffect, useRef, useState } from 'react';
import { actionOptions } from '../game/engine';
import { getSpecies } from '../game/species';
import { dayOf, isNight } from '../game/balance';
import { useGame } from '../state/GameContext';
import type { ActionId } from '../game/actions';
import type { LogKind } from '../game/types';
import { ActionPanel } from './ActionPanel';
import { DinoScene } from './DinoScene';
import { LogPanel } from './LogPanel';
import { ResultScreen } from './ResultScreen';
import { SaveControls } from './SaveControls';
import { StageBar, StageIndicator } from './StageBar';
import { StatsPanel } from './StatsPanel';

export function GameScreen() {
  const { game, act, startGame, newGame, importSave } = useGame();
  const [lastAction, setLastAction] = useState<ActionId | null>(null);
  const [lastLogKind, setLastLogKind] = useState<LogKind | null>(null);
  const previousTurn = useRef<number | null>(null);
  const pendingAction = useRef<ActionId | null>(null);

  const handleAct = useCallback(
    (actionId: ActionId) => {
      pendingAction.current = actionId;
      act(actionId);
    },
    [act],
  );

  useEffect(() => {
    if (!game) return;
    if (previousTurn.current === null) {
      previousTurn.current = game.turn;
      return;
    }
    if (game.turn !== previousTurn.current) {
      previousTurn.current = game.turn;
      setLastAction(pendingAction.current);
      setLastLogKind(game.log[0]?.kind ?? null);
      pendingAction.current = null;
    }
  }, [game]);

  if (!game) return null;

  const species = getSpecies(game.speciesId);
  const options = actionOptions(game);
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
          {game.threat && (
            <span className="chip" style={{ color: 'var(--danger)' }}>
              ⚠️ Угроза: {game.threat}
            </span>
          )}
        </div>
        <div className="row">
          <SaveControls mode="game" state={game} onImported={importSave} />
          <button type="button" className="btn btn-sm btn-ghost" onClick={confirmMenu}>
            Меню
          </button>
        </div>
      </header>

      <div className="game-layout">
        <div className="game-side-left">
          <StatsPanel game={game} />
          <StageIndicator game={game} />
          <StageBar game={game} />
        </div>
        <DinoScene
          species={species}
          stageIndex={game.stageIndex}
          health={game.stats.health}
          threat={game.threat}
          lastAction={lastAction}
          lastLogKind={lastLogKind}
          turn={game.turn}
        />
        <div className="game-side-right">
          <ActionPanel options={options} disabled={finished} onAct={handleAct} />
          <LogPanel entries={game.log} turn={game.turn} />
        </div>
      </div>

      {finished && (
        <ResultScreen game={game} onRestart={() => startGame(species.id)} onMenu={newGame} />
      )}
    </div>
  );
}
