import { createGame, step } from '../game/engine';
import { clearStorage, loadFromStorage, saveToStorage } from '../game/save';
import { randomSeed } from '../game/rng';
import type { GameState } from '../game/types';
import type { ActionId } from '../game/actions';

export type Screen = 'menu' | 'game';

export interface GameContextValue {
  screen: Screen;
  game: GameState | null;
  canRestore: boolean;
  startGame: (speciesId: string) => void;
  act: (actionId: ActionId) => void;
  restoreSave: () => void;
  importSave: (state: GameState) => void;
  newGame: () => void;
  backToMenu: () => void;
}

export type GameAction =
  | { type: 'START'; speciesId: string }
  | { type: 'ACT'; actionId: ActionId }
  | { type: 'RESTORE'; state: GameState }
  | { type: 'IMPORT'; state: GameState }
  | { type: 'MENU' };

export interface GameStore {
  screen: Screen;
  game: GameState | null;
}

export function initialStore(): GameStore {
  return { screen: 'menu', game: null };
}

/** Есть ли сохранение в localStorage (для кнопки «Продолжить»). */
export function hasStoredSave(): boolean {
  return loadFromStorage() !== null;
}

export function gameReducer(store: GameStore, action: GameAction): GameStore {
  switch (action.type) {
    case 'START': {
      const game = createGame(action.speciesId, randomSeed());
      saveToStorage(game);
      return { screen: 'game', game };
    }
    case 'ACT': {
      if (!store.game) return store;
      const game = step(store.game, action.actionId);
      if (game === store.game) return store;
      saveToStorage(game);
      return { ...store, game };
    }
    case 'RESTORE':
    case 'IMPORT': {
      saveToStorage(action.state);
      return { screen: 'game', game: action.state };
    }
    case 'MENU': {
      clearStorage();
      return { screen: 'menu', game: null };
    }
    default:
      return store;
  }
}

export function loadInitialStore(): GameStore {
  return initialStore();
}
