import type { Diet } from './types';

export type ActionId =
  | 'rest'
  | 'sleep'
  | 'hunt'
  | 'forage'
  | 'drink'
  | 'explore'
  | 'fight'
  | 'flee';

export interface ActionDef {
  id: ActionId;
  label: string;
  emoji: string;
  description: string;
  /** Подсказка об эффекте для интерфейса. */
  hint: string;
  /** Требуемая минимальная стадия (индекс в STAGES). */
  minStage: number;
  /** Применимо к рациону; пусто — доступно всем. */
  diets?: Diet[];
  /** Показывать только при активной угрозе. */
  requiresThreat?: boolean;
}

/**
 * Каталог действий. Сама механика — в engine.ts,
 * здесь только метаданные для интерфейса и фильтрации.
 */
export const ACTIONS: ActionDef[] = [
  {
    id: 'rest',
    label: 'Отдохнуть',
    emoji: '🌤️',
    description: 'Передохнуть в укрытии, восстановить силы и немного подрасти.',
    hint: '+энергия, +рост, −пища, −вода',
    minStage: 0,
  },
  {
    id: 'sleep',
    label: 'Спать',
    emoji: '🌙',
    description: 'Глубокий сон. Много энергии, замедленный расход пищи, идёт время.',
    hint: '++энергия, +рост, −пища (медленно)',
    minStage: 0,
  },
  {
    id: 'hunt',
    label: 'Охотиться',
    emoji: '🎯',
    description:
      'Выследить добычу и попытаться её поймать. Детёнышу достаётся лишь мелкая добыча.',
    hint: '±пища, −энергия, риск раны',
    minStage: 0,
    diets: ['carnivore'],
  },
  {
    id: 'forage',
    label: 'Искать пищу',
    emoji: '🌿',
    description: 'Собрать цветки, плоды и папоротники. Иногда попадается ядовитое.',
    hint: '+пища, +немного воды, риск отравления',
    minStage: 0,
    diets: ['herbivore'],
  },
  {
    id: 'drink',
    label: 'Пить',
    emoji: '💧',
    description: 'Найти воду и утолить жажду. У воды легче, в засуху — сложнее.',
    hint: '++вода, −энергия, −немного времени',
    minStage: 0,
  },
  {
    id: 'explore',
    label: 'Исследовать',
    emoji: '🧭',
    description: 'Отправиться в неизвестную зону в поисках выгоды или опасности.',
    hint: 'случайное событие',
    minStage: 0,
  },
  {
    id: 'fight',
    label: 'Сражаться',
    emoji: '⚔️',
    description: 'Ответить на угрозу и прогнать хищника. Достаётся и вам.',
    hint: '−здоровье, +прогон угрозы',
    minStage: 0,
    requiresThreat: true,
  },
  {
    id: 'flee',
    label: 'Убегать',
    emoji: '💨',
    description: 'Попытаться скрыться от хищника. Успех зависит от стадии.',
    hint: '−энергия, шанс уйти от угрозы',
    minStage: 0,
    requiresThreat: true,
  },
];

/** Может ли действие быть выполнено при данных условиях. */
export function canAct(
  action: ActionDef,
  diet: Diet,
  stageIndex: number,
  hasThreat: boolean,
): boolean {
  if (action.requiresThreat) return hasThreat;
  if (hasThreat) return false;
  if (action.minStage > stageIndex) return false;
  if (action.diets && !action.diets.includes(diet)) return false;
  return true;
}
