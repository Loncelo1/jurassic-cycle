import { describe, expect, it } from 'vitest';
import { buildSaveFile, parseSave, parseSaveText } from './save';
import { createGame } from './engine';
import { STAGES } from './balance';
import { getSpecies } from './species';

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

  it('нормализует idx стадии вне диапазона и не роняет игру', () => {
    const raw = { ...createGame('velociraptor', 3), stageIndex: 99 };
    const restored = parseSave(raw);
    expect(restored).not.toBeNull();
    const index = restored!.stageIndex;
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(STAGES.length);
    expect(STAGES[index]).toBeDefined();
  });

  it('нормализует статы и неизвестную фазу к валидным значениям', () => {
    const raw = {
      ...createGame('triceratops', 4),
      phase: 'unknown' as never,
      stats: { health: 999, food: -5, water: 300, energy: -1, growth: 250 },
    };
    const restored = parseSave(raw);
    expect(restored).not.toBeNull();
    const species = getSpecies('triceratops');
    expect(restored!.phase).toBe('playing');
    expect(restored!.stats.health).toBeLessThanOrEqual(999);
    expect(restored!.stats.food).toBeGreaterThanOrEqual(0);
    expect(restored!.stats.water).toBeLessThanOrEqual(100);
    expect(restored!.stats.energy).toBeGreaterThanOrEqual(0);
    expect(restored!.stats.growth).toBeLessThanOrEqual(100);
    expect(species.maxHealth).toBeGreaterThan(0);
  });
});
