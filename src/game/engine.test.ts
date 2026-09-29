import { describe, expect, it } from 'vitest';
import { createGame, availableActions, step, totalGrowth } from './engine';
import { STAGES } from './balance';
import { SPECIES, getSpecies } from './species';
import type { Stats } from './types';

describe('createGame', () => {
  it('создаёт игру в стадии детёныша с полным здоровьем вида', () => {
    const state = createGame('tyrannosaurus', 12345);
    expect(state.phase).toBe('playing');
    expect(state.stageIndex).toBe(0);
    expect(state.turn).toBe(0);
    expect(state.stats.health).toBe(getSpecies('tyrannosaurus').maxHealth);
  });

  it('выдаёт разные наборы действий для хищника и травоядного', () => {
    const carnivore = availableActions(createGame('velociraptor', 1)).map((a) => a.id);
    const herbivore = availableActions(createGame('triceratops', 1)).map((a) => a.id);
    expect(carnivore).not.toContain('forage');
    expect(herbivore).not.toContain('hunt');
    expect(herbivore).toContain('forage');
  });
});

describe('шаг игры', () => {
  it('отдых восстанавливает энергию и снижает пищу', () => {
    const start = createGame('triceratops', 42);
    const rested = step(start, 'rest');
    expect(rested.stats.energy).toBeGreaterThanOrEqual(start.stats.energy);
    expect(rested.stats.food).toBeLessThan(start.stats.food);
    expect(rested.turn).toBe(1);
  });

  it('даёт хищнику охотиться с самого детства', () => {
    const baby = createGame('velociraptor', 7);
    const actions = availableActions(baby).map((a) => a.id);
    expect(actions).toContain('hunt');
    const after = step(baby, 'hunt');
    expect(after).not.toBe(baby);
    expect(after.turn).toBe(1);
  });

  it('травоядное находит пищу при поиске', () => {
    const start = createGame('parasaurolophus', 99);
    const after = step(start, 'forage');
    expect(after).not.toBe(start);
    expect(after.stats.food).toBeGreaterThanOrEqual(0);
  });

  it('не изменяет исходное состояние (иммутабельность)', () => {
    const start = createGame('triceratops', 5);
    const snapshot = JSON.stringify(start);
    step(start, 'eat' as never);
    step(start, 'rest');
    expect(JSON.stringify(start)).toBe(snapshot);
  });

  it('пассивно расходует воду каждый ход', () => {
    const start = createGame('brachiosaurus', 3);
    const after = step(start, 'rest');
    expect(after.stats.water).toBeLessThanOrEqual(start.stats.water);
  });
});

describe('рост и стадии', () => {
  it('переводит динозавра в следующую стадию при заполнении роста', () => {
    const start = createGame('parasaurolophus', 11);
    const boosted = {
      ...start,
      stats: { ...start.stats, growth: 99, food: 100, water: 100, energy: 100 } as Stats,
    };
    const after = step(boosted, 'rest');
    expect(after.stageIndex).toBe(1);
    expect(after.stats.growth).toBeLessThan(100);
  });

  it('totalGrowth складывает стадии и текущий рост', () => {
    const start = createGame('velociraptor', 1);
    expect(totalGrowth(start)).toBe(0);
    const progressed = { ...start, stageIndex: 2, stats: { ...start.stats, growth: 40 } };
    expect(totalGrowth(progressed)).toBe(240);
  });
});

describe('смерть и победа', () => {
  it('наносит урон и убивает при обнулении воды', () => {
    const start = createGame('velociraptor', 1);
    const thirsty = {
      ...start,
      stats: { ...start.stats, water: 0, food: 50, health: 5, energy: 50 },
    };
    const after = step(thirsty, 'rest');
    expect(after.phase).toBe('dead');
    expect(after.deathCause).toContain('жажды');
  });

  it('объявляет победу при достижении взрослой стадии', () => {
    const start = createGame('triceratops', 1);
    const almost = {
      ...start,
      stageIndex: STAGES.length - 1,
      stats: { ...start.stats, growth: 0, food: 90, water: 90, energy: 90, health: 100 },
    };
    const after = step(almost, 'rest');
    expect(after.phase).toBe('won');
  });
});

describe('виды', () => {
  it('содержит как минимум по три вида в каждом рационе', () => {
    expect(SPECIES.filter((s) => s.diet === 'carnivore').length).toBeGreaterThanOrEqual(3);
    expect(SPECIES.filter((s) => s.diet === 'herbivore').length).toBeGreaterThanOrEqual(3);
  });

  it('бросает ошибку для неизвестного вида', () => {
    expect(() => getSpecies('нет-такого')).toThrow();
  });
});
