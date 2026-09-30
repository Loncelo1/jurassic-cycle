import type { GameState, Stats } from '../game/types';
import { GROWTH_PER_STAGE, MAX_STAT, STAGES } from '../game/balance';
import { getSpecies } from '../game/species';

interface StatRow {
  key: keyof Stats;
  label: string;
  emoji: string;
  value: number;
  max: number;
  cls: string;
  unit?: string;
}

export function StatsPanel({ game }: { game: GameState }) {
  const species = getSpecies(game.speciesId);
  const stage = STAGES[game.stageIndex];

  const rows: StatRow[] = [
    {
      key: 'health',
      label: 'Здоровье',
      emoji: '❤️',
      value: game.stats.health,
      max: species.maxHealth,
      cls: 'bar-health',
    },
    {
      key: 'food',
      label: 'Пища в желудке',
      emoji: '🍖',
      value: game.stats.food,
      max: MAX_STAT,
      cls: 'bar-food',
    },
    {
      key: 'water',
      label: 'Вода',
      emoji: '💧',
      value: game.stats.water,
      max: MAX_STAT,
      cls: 'bar-water',
    },
    {
      key: 'energy',
      label: 'Энергия',
      emoji: '⚡',
      value: game.stats.energy,
      max: MAX_STAT,
      cls: 'bar-energy',
    },
    {
      key: 'growth',
      label: `Рост (${stage.name})`,
      emoji: stage.emoji,
      value: game.stats.growth,
      max: GROWTH_PER_STAGE,
      cls: 'bar-growth',
    },
  ];

  return (
    <section className="stats-panel panel" aria-label="Состояние динозавра">
      {rows.map((row) => {
        const percentage = Math.round((row.value / row.max) * 100);
        return (
          <div className="stat" key={row.key}>
            <div className="stat-head">
              <span className="label">
                <span aria-hidden>{row.emoji}</span> {row.label}
              </span>
              <span className="value">
                {Math.round(row.value)}
                <span className="muted">/{row.max}</span>
              </span>
            </div>
            <div
              className={`bar ${row.cls}`}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={row.label}
            >
              <span style={{ width: `${percentage}%` }} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
