export type Diet = 'carnivore' | 'herbivore';

export type StageId = 'hatchling' | 'juvenile' | 'adolescent' | 'adult';

export interface Stage {
  id: StageId;
  name: string;
  emoji: string;
}

export interface Species {
  id: string;
  name: string;
  scientificName: string;
  diet: Diet;
  emoji: string;
  description: string;
  /** Максимальное здоровье вида (здоровье измеряется в его пределах). */
  maxHealth: number;
  /** Множитель прироста взросления. */
  growthRate: number;
  /** Бонус к шансу успешной охоты (только хищники). */
  huntSkill: number;
  /** Бонус к шансу найти пищу (только травоядные). */
  forageSkill: number;
  /** Множитель расхода пищи. */
  appetite: number;
  /** Множитель расхода воды. */
  thirst: number;
}

export interface Stats {
  health: number;
  food: number;
  water: number;
  energy: number;
  /** Прогресс взросления внутри текущей стадии, 0–100. */
  growth: number;
}

export type LogKind = 'info' | 'good' | 'bad' | 'neutral';

export interface LogEntry {
  id: number;
  turn: number;
  text: string;
  kind: LogKind;
}

export type GamePhase = 'playing' | 'won' | 'dead';

export interface GameState {
  version: number;
  speciesId: string;
  rngState: number;
  phase: GamePhase;
  deathCause: string | null;
  stats: Stats;
  /** Индекс текущей стадии в STAGES. */
  stageIndex: number;
  turn: number;
  /** Имя активной угрозы (хищника) или null. */
  threat: string | null;
  log: LogEntry[];
  nextLogId: number;
}
