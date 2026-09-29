import { SAVE_VERSION, createGame } from './engine';
import { getSpecies } from './species';
import type { GameState } from './types';

const STORAGE_KEY = 'jurassic-cycle.save.v1';
export const SAVE_VERSION_EXPORT = SAVE_VERSION;

export interface SaveFile {
  app: 'jurassic-cycle';
  version: number;
  savedAt: string;
  state: GameState;
}

function isValidState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<GameState>;
  if (typeof state.speciesId !== 'string') return false;
  if (typeof state.turn !== 'number') return false;
  if (typeof state.rngState !== 'number') return false;
  if (typeof state.stageIndex !== 'number') return false;
  if (!state.stats || typeof state.stats.health !== 'number') return false;
  if (!Array.isArray(state.log)) return false;
  try {
    getSpecies(state.speciesId);
  } catch {
    return false;
  }
  return true;
}

export function buildSaveFile(state: GameState): SaveFile {
  return {
    app: 'jurassic-cycle',
    version: SAVE_VERSION_EXPORT,
    savedAt: new Date().toISOString(),
    state,
  };
}

/** Сохраняет игру в localStorage (автосохранение). */
export function saveToStorage(state: GameState): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(buildSaveFile(state)));
  } catch {
    // localStorage может быть недоступен (приватный режим) — молча пропускаем.
  }
}

export function loadFromStorage(): GameState | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseSave(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Разбирает и валидирует сохранение (объект SaveFile или сырое состояние). */
export function parseSave(value: unknown): GameState | null {
  if (!value || typeof value !== 'object') return null;
  const maybeFile = value as Partial<SaveFile>;
  const state = (maybeFile.state ?? value) as unknown;
  if (!isValidState(state)) return null;
  // Нормализуем недостающие поля для совместимости версий.
  const base = createGame(state.speciesId, state.rngState);
  return {
    ...base,
    ...state,
    version: SAVE_VERSION_EXPORT,
    stats: { ...base.stats, ...state.stats },
    log: state.log.slice(0, 80),
    threat: state.threat ?? null,
    deathCause: state.deathCause ?? null,
  };
}

export function parseSaveText(text: string): GameState | null {
  try {
    return parseSave(JSON.parse(text));
  } catch {
    return null;
  }
}

/** Скачивает состояние игры как .json-файл. */
export function downloadSave(state: GameState): void {
  const payload = JSON.stringify(buildSaveFile(state), null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `jurassic-cycle-save-${state.speciesId}-day${state.turn}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function readSaveFile(file: File): Promise<GameState | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(parseSaveText(String(reader.result ?? '')));
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}
