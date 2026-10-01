import { useState } from 'react';
import { CARNIVORES, HERBIVORES } from '../game/species';
import { STAGES } from '../game/balance';
import type { Diet, Species } from '../game/types';
import { useGame } from '../state/GameContext';
import { dinoSvgUrl } from '../ui/dinoArt';
import { SaveControls } from './SaveControls';

interface DietSectionProps {
  title: string;
  emoji: string;
  species: Species[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ADULT_STAGE = STAGES.length - 1;

function DietSection({ title, emoji, species, selectedId, onSelect }: DietSectionProps) {
  return (
    <section className="diet-section">
      <h2 className="diet-heading">
        <span aria-hidden>{emoji}</span> {title}
      </h2>
      <div className="species-grid">
        {species.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`species-card panel${selectedId === item.id ? ' selected' : ''}`}
            onClick={() => onSelect(item.id)}
            aria-pressed={selectedId === item.id}
          >
            <img
              className="species-art"
              src={dinoSvgUrl(item.id, ADULT_STAGE)}
              alt={`${item.name}, взрослая особь`}
              loading="lazy"
              draggable={false}
            />
            <span className="species-name">{item.name}</span>
            <span className="species-latin">{item.scientificName}</span>
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              {item.description}
            </span>
            <span className="species-traits">
              <span className="chip">❤️ {item.maxHealth}</span>
              <span className="chip">🌱 рост ×{item.growthRate.toFixed(2)}</span>
              <span className="chip">🍖 аппетит ×{item.appetite.toFixed(2)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function StartScreen() {
  const { startGame, canRestore, restoreSave, importSave } = useGame();
  const [selected, setSelected] = useState<string | null>(null);

  const dietLabel: Record<Diet, string> = {
    carnivore: 'плотоядный',
    herbivore: 'травоядный',
  };
  const selectedSpecies =
    CARNIVORES.concat(HERBIVORES).find((s) => s.id === selected) ?? null;

  return (
    <div className="menu">
      <header className="hero">
        <h1>Jurassic Cycle</h1>
        <p className="subtitle">
          Пошаговая RPG о выживании и взрослении динозавра. Выбирайте действия с умом: каждый
          ход расходует пищу и воду, а ошибки могут стоить жизни.
        </p>
      </header>

      <DietSection
        title="Плотоядные"
        emoji="🦖"
        species={CARNIVORES}
        selectedId={selected}
        onSelect={setSelected}
      />
      <DietSection
        title="Травоядные"
        emoji="🌿"
        species={HERBIVORES}
        selectedId={selected}
        onSelect={setSelected}
      />

      <div className="menu-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selected}
          onClick={() => selected && startGame(selected)}
        >
          {selectedSpecies
            ? `Начать за «${selectedSpecies.name}» (${dietLabel[selectedSpecies.diet]})`
            : 'Выберите динозавра'}
        </button>
        {canRestore && (
          <button type="button" className="btn" onClick={restoreSave}>
            Продолжить сохранение
          </button>
        )}
        <SaveControls mode="menu" onImported={importSave} />
      </div>

      <p className="hint-block" style={{ textAlign: 'center' }}>
        Игра работает локально в браузере: прогресс сохраняется автоматически в localStorage,
        а кнопками ниже его можно выгрузить в файл или загрузить обратно.
      </p>
    </div>
  );
}
