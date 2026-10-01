import { useEffect, useRef, type CSSProperties } from 'react';
import type { ActionId } from '../game/actions';
import type { LogKind, Species } from '../game/types';
import { dinoSvgUrl, predatorSvgUrl } from '../ui/dinoArt';

interface DinoSceneProps {
  species: Species;
  stageIndex: number;
  health: number;
  threat: string | null;
  lastAction: ActionId | null;
  lastLogKind: LogKind | null;
  turn: number;
}

interface Effect {
  emoji: string;
  label: string;
  /** Класс-позиция эффекта на сцене. */
  place: 'left' | 'right' | 'center' | 'below';
}

/** Подбирает визуальный эффект по последнему действию и исходу. */
function effectFor(action: ActionId | null, kind: LogKind | null): Effect | null {
  if (!action) return null;
  switch (action) {
    case 'drink':
      return kind === 'good'
        ? { emoji: '💧', label: 'Лужица воды', place: 'below' }
        : { emoji: '🥵', label: 'Пересохший источник', place: 'left' };
    case 'forage':
      return kind === 'good'
        ? { emoji: '🍃', label: 'Собранная листва', place: 'left' }
        : { emoji: '☠️', label: 'Ядовитое растение', place: 'left' };
    case 'hunt':
      return kind === 'good'
        ? { emoji: '🍖', label: 'Удачная охота', place: 'right' }
        : { emoji: '🎯', label: 'Выслеживание', place: 'right' };
    case 'explore':
      return { emoji: '🧭', label: 'Исследование', place: 'right' };
    case 'sleep':
      return { emoji: '💤', label: 'Сон', place: 'center' };
    case 'rest':
      return { emoji: '🌤️', label: 'Отдых', place: 'center' };
    case 'fight':
      return { emoji: '💥', label: 'Схватка', place: 'center' };
    case 'flee':
      return { emoji: '💨', label: 'Бегство', place: 'left' };
    default:
      return null;
  }
}

/**
 * Сцена с динозавром: прямоугольная область, где модель вида и стадии стоит по центру,
 * а при угрозе разъезжается с противником по сторонам. Показывает эффект последнего
 * действия и качается при уроне — тем медленнее, чем меньше здоровья.
 */
export function DinoScene({
  species,
  stageIndex,
  health,
  threat,
  lastAction,
  lastLogKind,
  turn,
}: DinoSceneProps) {
  const prev = useRef({ turn, health });
  const changed = turn !== prev.current.turn;
  const hurt = changed && health < prev.current.health;

  useEffect(() => {
    prev.current = { turn, health };
  }, [turn, health]);

  const healthRatio = species.maxHealth > 0 ? Math.min(1, Math.max(0, health / species.maxHealth)) : 0;
  // Чем меньше здоровья, тем дольше и заметнее качание.
  const hurtDuration = 0.4 + (1 - healthRatio) * 1.6;
  const sceneStyle = {
    '--hurt-duration': `${hurtDuration}s`,
    '--hurt-amplitude': `${Math.round(4 + (1 - healthRatio) * 10)}deg`,
  } as CSSProperties;

  const dinoUrl = dinoSvgUrl(species.id, stageIndex);
  const predatorUrl = threat ? predatorSvgUrl(threat) : null;
  const effect = effectFor(lastAction, lastLogKind);

  return (
    <section
      className={`dino-scene${threat ? ' in-combat' : ''}`}
      style={sceneStyle}
      aria-label={`${species.name}, стадия ${stageIndex + 1}, здоровье ${Math.round(health)} из ${species.maxHealth}`}
    >
      <div className="scene-sky" aria-hidden />
      <div className="scene-ground" aria-hidden />

      {effect && (
        <div className={`scene-effect place-${effect.place}`} key={`effect-${turn}`} aria-hidden>
          <span className="scene-effect-emoji">{effect.emoji}</span>
          <span className="scene-effect-label">{effect.label}</span>
        </div>
      )}

      <div className={`dino-figure${threat ? ' posed' : ''}`}>
        <img
          className={`dino-img${hurt ? ' is-hurt' : ''}`}
          key={hurt ? `hurt-${turn}` : 'calm'}
          src={dinoUrl}
          alt=""
          draggable={false}
        />
      </div>

      {predatorUrl && (
        <div className="predator-figure" key={`predator-${turn}`}>
          <img src={predatorUrl} alt="" draggable={false} />
          <span className="predator-label">{threat}</span>
        </div>
      )}
    </section>
  );
}
