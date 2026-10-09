import { describe, expect, it } from 'vitest';
import { nextLessonDate } from './schedule.js';

const schedule = { 1: ['mat'], 3: ['mat', 'cj'], 5: ['cj'] };

describe('nextLessonDate', () => {
  it('najde nejbližší další den s předmětem', () => {
    // 2026-10-07 je středa
    expect(nextLessonDate(schedule, 'cj', new Date(2026, 9, 6))).toBe('2026-10-07');
  });
  it('dnešek se nepočítá, hledá se příští výskyt', () => {
    expect(nextLessonDate(schedule, 'mat', new Date(2026, 9, 7))).toBe('2026-10-12');
  });
  it('přeskočí víkend a přejde přes konec měsíce', () => {
    // 2026-10-30 je pátek, další pondělí je 2. 11.
    expect(nextLessonDate(schedule, 'mat', new Date(2026, 9, 30))).toBe('2026-11-02');
  });
  it('vrátí null, když předmět není v rozvrhu', () => {
    expect(nextLessonDate(schedule, 'fyz', new Date(2026, 9, 7))).toBeNull();
    expect(nextLessonDate(undefined, 'mat')).toBeNull();
  });
});
