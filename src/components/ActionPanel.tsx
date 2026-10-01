import type { ActionOption } from '../game/engine';
import type { ActionId } from '../game/actions';

interface ActionPanelProps {
  options: ActionOption[];
  disabled: boolean;
  onAct: (actionId: ActionId) => void;
}

/**
 * Панель действий. Показывает все доступные по правилам игры кнопки, но кнопки,
 * которые сейчас выполнить нельзя (например, при нуле энергии), только становятся
 * неактивными — их состав не меняется, поэтому интерфейс не «скачет».
 */
export function ActionPanel({ options, disabled, onAct }: ActionPanelProps) {
  return (
    <section className="panel side" aria-label="Действия">
      <h3 className="panel-title">Действия</h3>
      <div className="action-list">
        {options.map(({ action, enabled }) => (
          <button
            type="button"
            key={action.id}
            className="action-btn"
            disabled={disabled || !enabled}
            onClick={() => onAct(action.id)}
            title={enabled ? action.description : 'Не хватает энергии — нужен отдых или сон'}
          >
            <span className="action-emoji" aria-hidden>
              {action.emoji}
            </span>
            <span className="action-body">
              <span className="action-label">{action.label}</span>
              <span className="action-hint">
                {enabled ? action.hint : '⛔ нет энергии — отдохните или поспите'}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
