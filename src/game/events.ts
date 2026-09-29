import type { Diet } from './types';

/** Названия существ, на которых можно наткнуться во время охоты. */
export const PREY_NAMES: Record<Diet, string[]> = {
  carnivore: ['молодого хищника', 'падальщика', 'раптора-одиночку'],
  herbivore: [
    'детёныша стегозавра',
    'молодого игуанодона',
    'маленького орнитопода',
    'раненого травоядного',
  ],
};

/** Съедобные находки травоядных. */
export interface ForageItem {
  name: string;
  nutrition: number;
  water: number;
  emoji: string;
}

export const FORAGE_ITEMS: ForageItem[] = [
  { name: 'папоротник', nutrition: 18, water: 4, emoji: '🌿' },
  { name: 'хвощ', nutrition: 14, water: 6, emoji: '🌱' },
  { name: 'цветки саговника', nutrition: 22, water: 3, emoji: '🌸' },
  { name: 'плоды гинкго', nutrition: 26, water: 8, emoji: '🫐' },
  { name: 'листву с верхних ветвей', nutrition: 30, water: 2, emoji: '🍃' },
  { name: 'семена хвойных', nutrition: 20, water: 2, emoji: '🌰' },
];

export const POISON_ITEMS: ForageItem[] = [
  { name: 'ядовитые ягоды', nutrition: 4, water: 2, emoji: '☠️' },
  { name: 'токсичный папоротник', nutrition: 2, water: 1, emoji: '☠️' },
];

/** Хищники, которые могут угрожать игроку. */
export const PREDATOR_NAMES: string[] = [
  'молодой тираннозавр',
  'стайный раптор',
  'аллозавр',
  'гигантский крокодил',
  'дромеозавр',
];

export interface ExploreOutcome {
  id: string;
  weight: number;
  text: string;
}

/** Общие события исследования. Детали эффектов — в engine.ts. */
export const EXPLORE_EVENTS: ExploreOutcome[] = [
  {
    id: 'carcass',
    weight: 14,
    text: 'Вы нашли тушу крупного животного, ещё не тронутую падальщиками.',
  },
  {
    id: 'waterhole',
    weight: 16,
    text: 'Среди скал обнаружился чистый водопой.',
  },
  {
    id: 'grove',
    weight: 14,
    text: 'Густая роща с сочной листвой и плодами.',
  },
  {
    id: 'nest',
    weight: 10,
    text: 'Уютное гнездо под скальным козырьком — отличное место для отдыха.',
  },
  {
    id: 'ambush',
    weight: 14,
    text: 'Из зарослей выходит хищник и преграждает вам путь!',
  },
  {
    id: 'danger',
    weight: 10,
    text: 'Тропа обрывается: вы оступились и поранились о камни.',
  },
  {
    id: 'nothing',
    weight: 22,
    text: 'Долгие поиски не принесли ничего, кроме усталости.',
  },
];

export const WEATHER_NAMES = ['Ясно', 'Облачно', 'Туман', 'Морось'];
