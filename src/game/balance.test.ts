import { describe, expect, it } from 'vitest';
import { availableActions, createGame, step } from './engine';
import { getSpecies, SPECIES } from './species';
import type { ActionId } from './actions';
import type { GameState } from './types';

/**
 * Простой «автопилот»: разумно расходует ресурсы и растит динозавра.
 * Служит проверкой того, что баланс проходим, а не демонстрацией сильного ИИ.
 */
function autopilot(state: GameState): ActionId {
  const { stats, stageIndex } = state;
  if (state.threat) return stageIndex >= 2 ? 'fight' : 'flee';
  if (stats.water < 25) return 'drink';
  const species = getSpecies(state.speciesId);
  const hungry = stats.food < 30;
  if (hungry) {
    if (species.diet === 'carnivore') return 'hunt';
    return 'forage';
  }
  if (stats.energy < 25) return 'sleep';
  if (stats.energy < 45) return 'rest';
  return 'sleep';
}

function simulate(speciesId: string, seed: number, maxTurns = 1000): GameState {
  let state = createGame(speciesId, seed);
  for (let i = 0; i < maxTurns && state.phase === 'playing'; i += 1) {
    const actions = availableActions(state).map((a) => a.id);
    let action = autopilot(state);
    if (!actions.includes(action)) {
      action = actions.includes('rest') ? 'rest' : actions[0];
    }
    state = step(state, action);
  }
  return state;
}

/** Доля побед наивного автопилота на серии партий (детерминированно по seed). */
function winRate(speciesId: string, games: number): number {
  let wins = 0;
  for (let seed = 1; seed <= games; seed += 1) {
    if (simulate(speciesId, seed).phase === 'won') wins += 1;
  }
  return wins / games;
}

const GAMES_PER_SPECIES = 200;

describe('баланс', () => {
  for (const species of SPECIES) {
    it(`«${species.name}» может дожить до взрослой стадии`, () => {
      let wins = 0;
      for (let seed = 1; seed <= 20; seed += 1) {
        const result = simulate(species.id, seed);
        if (result.phase === 'won') wins += 1;
      }
      expect(wins).toBeGreaterThan(0);
    });
  }

  it('стратегия завершает партию за разумное число ходов', () => {
    const result = simulate('parasaurolophus', 3);
    expect(result.phase).toBe('won');
    expect(result.turn).toBeLessThan(600);
  });

  for (const species of SPECIES.filter((s) => s.diet === 'herbivore')) {
    it(`«${species.name}» выигрывает в целевом диапазоне 85–95%`, () => {
      const rate = winRate(species.id, GAMES_PER_SPECIES);
      expect(rate, `фактический винрейт ${(rate * 100).toFixed(1)}%`).toBeGreaterThanOrEqual(0.85);
      expect(rate, `фактический винрейт ${(rate * 100).toFixed(1)}%`).toBeLessThanOrEqual(0.95);
    });
  }

  for (const species of SPECIES.filter((s) => s.diet === 'carnivore')) {
    it(`«${species.name}» выигрывает в целевом диапазоне 45–65%`, () => {
      const rate = winRate(species.id, GAMES_PER_SPECIES);
      expect(rate, `фактический винрейт ${(rate * 100).toFixed(1)}%`).toBeGreaterThanOrEqual(0.45);
      expect(rate, `фактический винрейт ${(rate * 100).toFixed(1)}%`).toBeLessThanOrEqual(0.65);
    });
  }
});
