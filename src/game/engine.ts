import { Rng } from './rng';
import { getSpecies } from './species';
import {
  ACTIONS,
  canAct,
  type ActionDef,
  type ActionId,
} from './actions';
import {
  DEHYDRATE_HEALTH,
  ENERGY_DECAY,
  FOOD_DECAY,
  GROWTH_PER_STAGE,
  MAX_STAT,
  STAGES,
  STARVE_HEALTH,
  WATER_DECAY,
  clamp,
  dayOf,
  isNight,
} from './balance';
import {
  EXPLORE_EVENTS,
  FORAGE_ITEMS,
  POISON_ITEMS,
  PREDATOR_NAMES,
  PREY_NAMES,
  type ForageItem,
} from './events';
import type { GameState, LogKind, Stats } from './types';

export const SAVE_VERSION = 1;
const MAX_LOG = 80;

export function createGame(speciesId: string, seed: number): GameState {
  const species = getSpecies(speciesId);
  return {
    version: SAVE_VERSION,
    speciesId,
    rngState: seed >>> 0 || 1,
    phase: 'playing',
    deathCause: null,
    stats: {
      health: species.maxHealth,
      food: 70,
      water: 70,
      energy: 85,
      growth: 0,
    },
    stageIndex: 0,
    turn: 0,
    threat: null,
    log: [],
    nextLogId: 1,
  };
}

/** Общий прогресс взросления в очках (стадия × 100 + текущий рост). */
export function totalGrowth(state: GameState): number {
  return state.stageIndex * GROWTH_PER_STAGE + state.stats.growth;
}

function pushLog(state: GameState, text: string, kind: LogKind = 'info'): void {
  state.log = [{ id: state.nextLogId, turn: state.turn, text, kind }, ...state.log].slice(
    0,
    MAX_LOG,
  );
  state.nextLogId += 1;
}

export function availableActions(state: GameState): ActionDef[] {
  const species = getSpecies(state.speciesId);
  return ACTIONS.filter((action) =>
    canAct(action, species.diet, state.stageIndex, state.threat !== null),
  );
}

/** Применяет эффект действия к статам (частичные значения). */
function applyEffects(state: GameState, effects: Partial<Stats>): void {
  const species = getSpecies(state.speciesId);
  const maxHealth = species.maxHealth;
  const s = state.stats;
  if (effects.health) s.health = clamp(s.health + effects.health, 0, maxHealth);
  if (effects.food) s.food = clamp(s.food + effects.food);
  if (effects.water) s.water = clamp(s.water + effects.water);
  if (effects.energy) s.energy = clamp(s.energy + effects.energy);
  if (effects.growth) s.growth = clamp(s.growth + effects.growth);
}

/** Ночью активные действия стоят дороже, покой — продуктивнее. */
function nightModifier(action: ActionId, turn: number): number {
  if (!isNight(turn)) return 1;
  if (action === 'hunt' || action === 'explore' || action === 'forage') return 0.85;
  if (action === 'sleep') return 1.2;
  return 1;
}

function performForage(state: GameState, rng: Rng): { text: string; kind: LogKind } {
  const species = getSpecies(state.speciesId);
  const skill = species.forageSkill * nightModifier('forage', state.turn);
  if (rng.chance(0.18)) {
    const poison = rng.pick(POISON_ITEMS);
    applyEffects(state, { food: poison.nutrition / 2, energy: -4, health: -8 });
    return {
      text: `Вы съели ${poison.name} ${poison.emoji} — живот свело, самочувствие ухудшилось.`,
      kind: 'bad',
    };
  }
  const item: ForageItem = rng.pick(FORAGE_ITEMS);
  const luck = 0.6 + skill;
  const nutrition = Math.round(item.nutrition * luck);
  const water = Math.round(item.water * luck);
  applyEffects(state, { food: nutrition, water, energy: -20, growth: 2 });
  return {
    text: `Собрано: ${item.name} ${item.emoji} (+${nutrition} пищи, +${water} воды).`,
    kind: 'good',
  };
}

function performHunt(state: GameState, rng: Rng): { text: string; kind: LogKind } {
  const species = getSpecies(state.speciesId);
  applyEffects(state, { energy: -25 });
  if (rng.chance(0.12)) {
    state.threat = rng.pick(PREDATOR_NAMES);
    return {
      text: `Пока вы выслеживали добычу, из зарослей выходит ${state.threat}. Придётся защищаться!`,
      kind: 'bad',
    };
  }
  const stageBonus = state.stageIndex * 0.12;
  const energyBonus = (state.stats.energy / MAX_STAT) * 0.1;
  const success = 0.4 + species.huntSkill + stageBonus + energyBonus;
  const roll = rng.next();
  if (roll < success) {
    const prey = rng.pick(PREY_NAMES.carnivore);
    const nutrition = Math.round(26 + state.stageIndex * 10 + rng.int(0, 8));
    applyEffects(state, { food: nutrition, growth: 4 });
    return { text: `Успешная охота на ${prey}! +${nutrition} пищи.`, kind: 'good' };
  }
  if (roll < success + 0.25) {
    applyEffects(state, { health: -10 });
    return { text: 'Добыча вырвалась, а вы получили рану (−10 здоровья).', kind: 'bad' };
  }
  return { text: 'Охота не удалась: след потерян, силы потрачены впустую.', kind: 'neutral' };
}

function performExplore(state: GameState, rng: Rng): { text: string; kind: LogKind } {
  const species = getSpecies(state.speciesId);
  const event = rng.weighted(EXPLORE_EVENTS.map((e) => ({ value: e, weight: e.weight })));
  applyEffects(state, { energy: -15 });
  switch (event.id) {
    case 'carcass': {
      const gain = species.diet === 'carnivore' ? 36 : 22;
      applyEffects(state, { food: gain });
      return { text: `${event.text} (+${gain} пищи.)`, kind: 'good' };
    }
    case 'waterhole':
      applyEffects(state, { water: 28 });
      return { text: `${event.text} (+28 воды.)`, kind: 'good' };
    case 'grove': {
      const gain = species.diet === 'herbivore' ? 26 : 14;
      applyEffects(state, { food: gain });
      return { text: `${event.text} (+${gain} пищи.)`, kind: 'good' };
    }
    case 'nest':
      applyEffects(state, { energy: 25, growth: 3 });
      return { text: `${event.text} (+25 энергии.)`, kind: 'good' };
    case 'ambush':
      state.threat = rng.pick(PREDATOR_NAMES);
      return { text: event.text, kind: 'bad' };
    case 'danger':
      applyEffects(state, { health: -9 });
      return { text: `${event.text} (−9 здоровья.)`, kind: 'bad' };
    default:
      return { text: event.text, kind: 'neutral' };
  }
}

function performDrink(state: GameState, rng: Rng): { text: string; kind: LogKind } {
  applyEffects(state, { energy: -12 });
  if (rng.chance(0.2)) {
    applyEffects(state, { energy: -8, health: -5 });
    return {
      text: 'Поиски воды затянулись, источник пересох. Вы вернулись измученным и обезвоженным.',
      kind: 'bad',
    };
  }
  const gain = 32 + rng.int(0, 12);
  applyEffects(state, { water: gain });
  return { text: `Вы нашли ручей и напились (+${gain} воды).`, kind: 'good' };
}

function performRest(state: GameState, rng: Rng): { text: string; kind: LogKind } {
  const species = getSpecies(state.speciesId);
  const rest = rng.int(14, 20);
  applyEffects(state, { energy: rest, growth: 3 * species.growthRate, food: -3, water: -3 });
  return { text: `Вы передохнули в тени (+${rest} энергии).`, kind: 'neutral' };
}

function performSleep(state: GameState, rng: Rng): { text: string; kind: LogKind } {
  const species = getSpecies(state.speciesId);
  const energy = Math.round(rng.int(28, 38) * nightModifier('sleep', state.turn));
  applyEffects(state, {
    energy,
    growth: 5 * species.growthRate,
    food: -4,
    water: -2,
  });
  return { text: `Крепкий сон пошёл на пользу (+${energy} энергии).`, kind: 'good' };
}

function performFight(state: GameState, rng: Rng): { text: string; kind: LogKind } {
  const species = getSpecies(state.speciesId);
  const predator = state.threat ?? 'хищник';
  applyEffects(state, { energy: -18 });
  const power = 0.3 + state.stageIndex * 0.16 + species.huntSkill * 0.5;
  if (rng.chance(power)) {
    applyEffects(state, { health: -14, growth: 3 });
    state.threat = null;
    return { text: `Вы отогнали ${predator}, но получили ранения (−14 здоровья).`, kind: 'good' };
  }
  applyEffects(state, { health: -28, food: -5 });
  return { text: `${predator} оказался сильнее — вы едва вырвались (−28 здоровья).`, kind: 'bad' };
}

function performFlee(state: GameState, rng: Rng): { text: string; kind: LogKind } {
  applyEffects(state, { energy: -16 });
  if (rng.chance(0.35 + state.stageIndex * 0.12)) {
    state.threat = null;
    return { text: 'Вам удалось скрыться в густых зарослях.', kind: 'good' };
  }
  applyEffects(state, { health: -15 });
  return { text: 'Хищник догнал вас, но вы всё же вырвались (−15 здоровья).', kind: 'bad' };
}

const HANDLERS: Record<ActionId, (state: GameState, rng: Rng) => { text: string; kind: LogKind }> =
  {
    rest: performRest,
    sleep: performSleep,
    hunt: performHunt,
    forage: performForage,
    drink: performDrink,
    explore: performExplore,
    fight: performFight,
    flee: performFlee,
  };

/** Пассивный расход ресурсов и последствия истощения за один ход. */
function passiveTurn(state: GameState, actionId: ActionId): void {
  const species = getSpecies(state.speciesId);
  const s = state.stats;
  const sleeping = actionId === 'sleep';
  s.food = clamp(s.food - FOOD_DECAY * species.appetite * (sleeping ? 0.5 : 1));
  s.water = clamp(s.water - WATER_DECAY * species.thirst * (sleeping ? 0.6 : 1));
  s.energy = clamp(s.energy - ENERGY_DECAY);
  if (s.food <= 0) s.health = clamp(s.health - STARVE_HEALTH, 0, species.maxHealth);
  if (s.water <= 0) s.health = clamp(s.health - DEHYDRATE_HEALTH, 0, species.maxHealth);
}

/** Проверяет переход на следующую стадию роста. Возвращает текст события. */
function checkGrowth(state: GameState): { text: string; kind: LogKind } | null {
  if (state.stats.growth < GROWTH_PER_STAGE) return null;
  if (state.stageIndex >= STAGES.length - 1) return null;
  state.stats.growth = 0;
  state.stageIndex += 1;
  const stage = STAGES[state.stageIndex];
  applyEffects(state, { health: 20 });
  return {
    text: `Вы доросли до стадии «${stage.name}» ${stage.emoji}! Здоровье восстановлено.`,
    kind: 'good',
  };
}

/**
 * Выполняет ход: действие, пассивный распад, проверку роста и смерти.
 * Возвращает новое состояние (иммутабельно).
 */
export function step(prev: GameState, actionId: ActionId): GameState {
  if (prev.phase !== 'playing') return prev;
  const species = getSpecies(prev.speciesId);
  const state: GameState = {
    ...prev,
    stats: { ...prev.stats },
    log: [...prev.log],
  };
  const rng = new Rng(state.rngState);

  const def = ACTIONS.find((a) => a.id === actionId);
  if (!def || !canAct(def, species.diet, prev.stageIndex, prev.threat !== null)) {
    return prev;
  }

  const handler = HANDLERS[actionId];
  const result = handler(state, rng);
  pushLog(state, result.text, result.kind);

  passiveTurn(state, actionId);

  const growth = checkGrowth(state);
  if (growth) pushLog(state, growth.text, growth.kind);

  state.turn += 1;
  state.rngState = rng.state;

  const s = state.stats;
  if (s.health <= 0) {
    state.phase = 'dead';
    state.deathCause =
      s.food <= 0
        ? 'Истощение: динозавр погиб от голода.'
        : s.water <= 0
          ? 'Обезвоживание: динозавр погиб от жажды.'
          : 'Смертельные ранения: динозавр не выжил после схватки.';
    pushLog(state, state.deathCause, 'bad');
  } else if (state.stageIndex >= STAGES.length - 1) {
    state.phase = 'won';
    pushLog(state, 'Ваш динозавр достиг взрослой стадии и занял своё место в экосистеме!', 'good');
  }

  return state;
}

/** Текстовое состояние текущего времени суток и дня для интерфейса. */
export function describeTurn(state: GameState): { night: boolean; day: number } {
  return { night: isNight(state.turn), day: dayOf(state.turn) };
}
