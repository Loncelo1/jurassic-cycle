import { describe, expect, it } from 'vitest';
import { buildSaveFile, parseSave, parseSaveText } from './save';
import { createGame } from './engine';

describe('сохранения', () => {
  it('сериализует и восстанавливает состояние без потерь', () => {
    const state = createGame('tyrannosaurus', 555);
    const text = JSON.stringify(buildSaveFile(state));
    const restored = parseSaveText(text);
    expect(restored).not.toBeNull();
    expect(restored?.speciesId).toBe('tyrannosaurus');
    expect(restored?.stats).toEqual(state.stats);
    expect(restored?.rngState).toBe(state.rngState);
  });

  it('принимает как файл сохранения, так и сырое состояние', () => {
    const state = createGame('triceratops', 9);
    expect(parseSave(state)?.speciesId).toBe('triceratops');
    expect(parseSave({ app: 'jurassic-cycle', version: 1, savedAt: 'x', state })?.speciesId).toBe(
      'triceratops',
    );
  });

  it('отклоняет повреждённые данные', () => {
    expect(parseSave(null)).toBeNull();
    expect(parseSave({})).toBeNull();
    expect(parseSave({ speciesId: 'супер-динозавр', turn: 1, rngState: 1, stats: {} })).toBeNull();
    expect(parseSaveText('{ не json')).toBeNull();
  });
});
