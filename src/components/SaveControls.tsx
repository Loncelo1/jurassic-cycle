import { useRef } from 'react';
import { downloadSave, readSaveFile } from '../game/save';
import type { GameState } from '../game/types';

interface SaveControlsProps {
  mode: 'menu' | 'game';
  state?: GameState;
  onImported: (state: GameState) => void;
}

export function SaveControls({ mode, state, onImported }: SaveControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const parsed = await readSaveFile(file);
    if (parsed) {
      onImported(parsed);
    } else {
      window.alert('Не удалось прочитать файл сохранения. Проверьте, что это JSON из этой игры.');
    }
    event.target.value = '';
  }

  return (
    <>
      {mode === 'game' && state && (
        <button type="button" className="btn btn-sm" onClick={() => downloadSave(state)}>
          ⬇️ Экспорт
        </button>
      )}
      <button
        type="button"
        className={mode === 'game' ? 'btn btn-sm' : 'btn'}
        onClick={() => inputRef.current?.click()}
      >
        ⬆️ Импорт
      </button>
      <input
        ref={inputRef}
        className="file-input"
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
      />
    </>
  );
}
