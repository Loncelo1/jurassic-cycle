import { STAGES } from '../game/balance';
import type { GameState } from '../game/types';

export function StageBar({ game }: { game: GameState }) {
  return (
    <section className="panel side" aria-label="Стадии взросления">
      <h3 className="panel-title">Стадии взросления</h3>
      <div className="stage-track">
        {STAGES.map((stage, index) => {
          const cls =
            index < game.stageIndex ? 'done' : index === game.stageIndex ? 'current' : '';
          return (
            <div className={`stage-node ${cls}`} key={stage.id}>
              <span className="stage-emoji" aria-hidden>
                {stage.emoji}
              </span>
              {stage.name}
            </div>
          );
        })}
      </div>
      <p className="hint-block">
        Достигните стадии «Взрослый», чтобы выиграть. Рост даёт отдых, сон и успешные
        взаимодействия. Смерть — при нуле здоровья, пищи или воды.
      </p>
    </section>
  );
}
