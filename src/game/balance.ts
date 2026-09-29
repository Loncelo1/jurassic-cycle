import type { Stage } from './types';

export const MAX_STAT = 100;

/** Сколько ходов длится одна игровая «сутка». */
export const TURNS_PER_DAY = 8;

/** Базовый расход пищи за ход (до множителей вида и действия). */
export const FOOD_DECAY = 5;
/** Базовый расход воды за ход. */
export const WATER_DECAY = 6;
/** Базовый расход энергии за ход. */
export const ENERGY_DECAY = 2;

/** Потеря здоровья за ход при обнулении пищи. */
export const STARVE_HEALTH = 6;
/** Потеря здоровья за ход при обнулении воды. */
export const DEHYDRATE_HEALTH = 9;

/** Полный прогресс одной стадии (в очках роста). */
export const GROWTH_PER_STAGE = 100;

/** Стадии взросления динозавра по порядку. */
export const STAGES: Stage[] = [
  { id: 'hatchling', name: 'Детёныш', emoji: '🥚' },
  { id: 'juvenile', name: 'Молодой', emoji: '🐣' },
  { id: 'adolescent', name: 'Подросток', emoji: '🦎' },
  { id: 'adult', name: 'Взрослый', emoji: '🦖' },
];

export function clamp(value: number, min = 0, max = MAX_STAT): number {
  return Math.min(max, Math.max(min, value));
}

export function isNight(turn: number): boolean {
  return turn % TURNS_PER_DAY < 3;
}

export function dayOf(turn: number): number {
  return Math.floor(turn / TURNS_PER_DAY) + 1;
}
