import type { ActionDef } from '../game/actions';

interface ActionPanelProps {
  actions: ActionDef[];
  disabled: boolean;
  onAct: (actionId: ActionDef['id']) => void;
}

export function ActionPanel({ actions, disabled, onAct }: ActionPanelProps) {
  return (
    <section className="panel side" aria-label="Действия">
      <h3 className="panel-title">Действия</h3>
      <div className="action-list">
        {actions.map((action) => (
          <button
            type="button"
            key={action.id}
            className="action-btn"
            disabled={disabled}
            onClick={() => onAct(action.id)}
            title={action.description}
          >
            <span className="action-emoji" aria-hidden>
              {action.emoji}
            </span>
            <span className="action-body">
              <span className="action-label">{action.label}</span>
              <span className="action-hint">{action.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
