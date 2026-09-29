/**
 * Детерминированный генератор случайных чисел.
 * Состояние хранится в GameState (rngState), поэтому любой ход
 * воспроизводим из сохранения — это важно для тестов и загрузок.
 */
export class Rng {
  state: number;

  constructor(state: number) {
    this.state = (state >>> 0) || 1;
  }

  /** Возвращает число в диапазоне [0, 1). */
  next(): number {
    const t = (this.state + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    const value = ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    this.state = t;
    return value;
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /** Целое число в диапазоне [min, max] включительно. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  pick<T>(items: T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  weighted<T>(items: { value: T; weight: number }[]): T {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = this.next() * total;
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item.value;
    }
    return items[items.length - 1].value;
  }
}

export function randomSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) ^ Date.now()) >>> 0;
}
