import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import {
  gameReducer,
  hasStoredSave,
  initialStore,
  type GameAction,
  type GameContextValue,
  type GameStore,
} from './reducer';
import { loadFromStorage } from '../game/save';
import type { GameState } from '../game/types';

const GameStateContext = createContext<GameStore | null>(null);
const GameDispatchContext = createContext<((action: GameAction) => void) | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [store, dispatch] = useReducer(gameReducer, undefined, initialStore);
  return (
    <GameStateContext.Provider value={store}>
      <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

export function useGameStore(): GameStore {
  const store = useContext(GameStateContext);
  if (!store) throw new Error('useGameStore должен использоваться внутри GameProvider');
  return store;
}

export function useGameDispatch(): (action: GameAction) => void {
  const dispatch = useContext(GameDispatchContext);
  if (!dispatch) throw new Error('useGameDispatch должен использоваться внутри GameProvider');
  return dispatch;
}

/** Удобный хук с действиями над игрой для компонентов. */
export function useGame(): GameContextValue {
  const store = useGameStore();
  const dispatch = useGameDispatch();
  return useMemo<GameContextValue>(
    () => ({
      screen: store.screen,
      game: store.game,
      canRestore: hasStoredSave(),
      startGame: (speciesId: string) => dispatch({ type: 'START', speciesId }),
      act: (actionId) => dispatch({ type: 'ACT', actionId }),
      restoreSave: () => {
        const saved: GameState | null = loadFromStorage();
        if (saved) dispatch({ type: 'RESTORE', state: saved });
      },
      importSave: (state: GameState) => dispatch({ type: 'IMPORT', state }),
      newGame: () => dispatch({ type: 'MENU' }),
      backToMenu: () => dispatch({ type: 'MENU' }),
    }),
    [store, dispatch],
  );
}
