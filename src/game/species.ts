import type { Species } from './types';

/**
 * Игровые виды. Баланс подобран так, чтобы дожить до стадии
 * «Взрослый» было реально, но требовало внимательного расхода ресурсов.
 */
export const SPECIES: Species[] = [
  {
    id: 'tyrannosaurus',
    name: 'Тираннозавр',
    scientificName: 'Tyrannosaurus rex',
    diet: 'carnivore',
    emoji: '🦖',
    description:
      'Верховный хищник. Огромная сила, но и огромный аппетит: пропускать охоту нельзя.',
    maxHealth: 120,
    growthRate: 1,
    huntSkill: 0.25,
    forageSkill: 0,
    appetite: 1.3,
    thirst: 1.1,
  },
  {
    id: 'velociraptor',
    name: 'Велоцираптор',
    scientificName: 'Velociraptor',
    diet: 'carnivore',
    emoji: '🦕',
    description:
      'Быстрый и хитрый охотник. Легко добывает добычу и быстро растёт, но не терпит голода.',
    maxHealth: 90,
    growthRate: 1.2,
    huntSkill: 0.35,
    forageSkill: 0,
    appetite: 1.1,
    thirst: 1.2,
  },
  {
    id: 'spinosaurus',
    name: 'Спинозавр',
    scientificName: 'Spinosaurus',
    diet: 'carnivore',
    emoji: '🐊',
    description:
      'Полуводный гигант. Любит рыбалку у воды, поэтому реже страдает от жажды.',
    maxHealth: 110,
    growthRate: 0.95,
    huntSkill: 0.26,
    forageSkill: 0,
    appetite: 1.25,
    thirst: 0.85,
  },
  {
    id: 'triceratops',
    name: 'Трицератопс',
    scientificName: 'Triceratops',
    diet: 'herbivore',
    emoji: '🦏',
    description:
      'Бронированный травоядный. Много здоровья и спокойный нрав, но растёт неспешно.',
    maxHealth: 130,
    growthRate: 0.9,
    huntSkill: 0,
    forageSkill: 0.2,
    appetite: 1.2,
    thirst: 1,
  },
  {
    id: 'brachiosaurus',
    name: 'Брахиозавр',
    scientificName: 'Brachiosaurus',
    diet: 'herbivore',
    emoji: '🦒',
    description:
      'Огромный длинношеий вегетарианец. Достаёт листву с верхушек и медленно наедается.',
    maxHealth: 150,
    growthRate: 0.85,
    huntSkill: 0,
    forageSkill: 0.2,
    appetite: 1.35,
    thirst: 1.15,
  },
  {
    id: 'parasaurolophus',
    name: 'Паразауролоф',
    scientificName: 'Parasaurolophus',
    diet: 'herbivore',
    emoji: '🦆',
    description:
      'Стадный травоядный с гребнем-трубой. Быстро находит пищу и предупреждает об опасности.',
    maxHealth: 100,
    growthRate: 1.05,
    huntSkill: 0,
    forageSkill: 0.25,
    appetite: 1.15,
    thirst: 1.1,
  },
];

export function getSpecies(id: string): Species {
  const species = SPECIES.find((item) => item.id === id);
  if (!species) {
    throw new Error(`Неизвестный вид: ${id}`);
  }
  return species;
}

export const CARNIVORES = SPECIES.filter((s) => s.diet === 'carnivore');
export const HERBIVORES = SPECIES.filter((s) => s.diet === 'herbivore');
