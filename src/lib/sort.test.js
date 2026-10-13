import { describe, expect, it } from 'vitest';
import { sortByName } from './sort.js';

describe('sortByName', () => {
  it('řadí podle české abecedy', () => {
    const names = ['Dějepis', 'Chemie', 'Čeština', 'Hudební výchova', 'Anglický jazyk', 'Zeměpis', 'Český jazyk', 'Cizí jazyk'];
    expect(sortByName(names.map((name) => ({ name }))).map((s) => s.name)).toEqual([
      'Anglický jazyk',
      'Cizí jazyk',
      'Český jazyk',
      'Čeština',
      'Dějepis',
      'Hudební výchova',
      'Chemie',
      'Zeměpis',
    ]);
  });
});
