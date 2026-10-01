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

/** Восстановление здоровья за один ход отдыха. */
export const REST_HEAL_MIN = 1;
export const REST_HEAL_MAX = 2;
/** Восстановление здоровья за один ход сна. */
export const SLEEP_HEAL_MIN = 3;
export const SLEEP_HEAL_MAX = 5;

/**
 * Пища за победу в схватке: побеждённого противника можно съесть.
 * Победа «вчистую» даёт больше мяса, чем победа с тяжёлыми ранами.
 */
export const FIGHT_MEAT_MIN = 8;
export const FIGHT_MEAT_MAX = 16;
export const FIGHT_MEAT_HARD_MIN = 5;
export const FIGHT_MEAT_HARD_MAX = 10;

/** Полный прогресс одной стадии (в очках роста). */
export const GROWTH_PER_STAGE = 100;

/** Стадии взросления динозавра по порядку. */
export const STAGES: Stage[] = [
  {
    id: 'hatchling',
    name: 'Детёныш',
    emoji: '🥚',
    description: 'Совсем мал и беззащитен: растёт быстро, но любая стычка опасна.',
  },
  {
    id: 'juvenile',
    name: 'Молодой',
    emoji: '🐣',
    description: 'Уже уверенно держится на ногах и начинает пробовать охотиться.',
  },
  {
    id: 'adolescent',
    name: 'Подросток',
    emoji: '🦎',
    description: 'Сила растёт: может дать отпор хищнику и пережить засуху.',
  },
  {
    id: 'adult',
    name: 'Взрослый',
    emoji: '🦖',
    description: 'Полностью вырос и занял своё место в экосистеме — цель достигнута.',
  },
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
