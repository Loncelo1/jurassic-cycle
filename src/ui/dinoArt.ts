/**
 * Карта SVG-моделей динозавров. Файлы лежат в `src/dino_svg` как
 * `<вид>_<стадия>.svg`, где стадия — baby | young | teen | adult.
 * Ассеты собираются один раз через `import.meta.glob`, чтобы URL были
 * корректны и при `base: './'` (GitHub Pages), и локально.
 */

/** Суффиксы имён файлов по индексу стадии (STAGES). */
const STAGE_SUFFIX = ['baby', 'young', 'teen', 'adult'] as const;

const modules = import.meta.glob('../dino_svg/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const BY_NAME: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() ?? '';
  BY_NAME[file.replace(/\.svg$/, '')] = url;
}

const FALLBACK = 'tyrannosaurus_baby';

/** URL SVG для вида и индекса стадии роста. */
export function dinoSvgUrl(speciesId: string, stageIndex: number): string {
  const suffix = STAGE_SUFFIX[Math.min(Math.max(stageIndex, 0), STAGE_SUFFIX.length - 1)];
  return BY_NAME[`${speciesId}_${suffix}`] ?? BY_NAME[FALLBACK] ?? '';
}

/**
 * Противники из таблицы угроз не совпадают с играбельными видами один в один,
 * поэтому каждому имени сопоставлена ближайшая модель и её стадия
 * (взрослые — крупные, молодые — помельче).
 */
const PREDATOR_ART: Record<string, { speciesId: string; stageIndex: number }> = {
  'молодой тираннозавр': { speciesId: 'tyrannosaurus', stageIndex: 1 },
  'стайный раптор': { speciesId: 'velociraptor', stageIndex: 1 },
  аллозавр: { speciesId: 'tyrannosaurus', stageIndex: 3 },
  'гигантский крокодил': { speciesId: 'spinosaurus', stageIndex: 3 },
  дромеозавр: { speciesId: 'velociraptor', stageIndex: 2 },
};

/** URL SVG для противника по имени угрозы (с запасным вариантом). */
export function predatorSvgUrl(name: string): string {
  const art = PREDATOR_ART[name];
  return art ? dinoSvgUrl(art.speciesId, art.stageIndex) : dinoSvgUrl('tyrannosaurus', 1);
}
