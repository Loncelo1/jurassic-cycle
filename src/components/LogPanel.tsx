import type { LogEntry } from '../game/types';

export function LogPanel({ entries, turn }: { entries: LogEntry[]; turn: number }) {
  return (
    <section className="panel side" aria-label="Журнал событий">
      <h3 className="panel-title">Журнал</h3>
      {entries.length === 0 ? (
        <p className="hint-block">
          Пока пусто. Начните действовать — здесь появятся события хода за ходом.
        </p>
      ) : (
        <div className="log-list">
          {entries.map((entry) => (
            <div className={`log-entry ${entry.kind}`} key={entry.id}>
              <span className="log-turn">Ход {entry.turn + 1}</span>
              {entry.text}
            </div>
          ))}
        </div>
      )}
      <p className="hint-block muted">Всего ходов: {turn}</p>
    </section>
  );
}
