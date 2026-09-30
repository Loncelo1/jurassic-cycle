import { STAGES } from '../game/balance';
import type { CSSProperties } from 'react';
import type { Species } from '../game/types';

interface DinoAvatarProps {
  species: Species;
  stageIndex: number;
  growth: number;
  growthMax: number;
}

/**
 * Центральный визуал динозавра: эмодзи стадии, масштаб по возрасту и кольцо роста.
 * Вся графика изолирована здесь — замена эмодзи на SVG не затронет остальной интерфейс.
 */
export function DinoAvatar({ species, stageIndex, growth, growthMax }: DinoAvatarProps) {
  const stage = STAGES[stageIndex];
  const progress = growthMax > 0 ? Math.min(1, Math.max(0, growth / growthMax)) : 0;
  const scale = 0.9 + stageIndex * 0.16 + progress * 0.12;

  const style = {
    '--dino-scale': String(scale),
    '--dino-progress': `${Math.round(progress * 100)}%`,
  } as CSSProperties;

  return (
    <div
      className="dino-avatar"
      style={style}
      role="img"
      aria-label={`${species.name}, стадия ${stage.name}, рост ${Math.round(growth)} из ${growthMax}`}
    >
      <div className="dino-avatar-ring" aria-hidden>
        <div className="dino-avatar-core">
          <span className="dino-avatar-emoji">{stage.emoji}</span>
          <span className="dino-avatar-stage">{stage.name}</span>
        </div>
      </div>
      <span className="dino-avatar-growth" aria-hidden>
        Рост {Math.round(growth)}/{growthMax}
      </span>
    </div>
  );
}
