import { describe, expect, it } from 'vitest';
import { formatDate, groupByStatus, isOverdue, todayString } from './tasks.js';

describe('groupByStatus', () => {
  it('rozdělí úkoly do sloupců a seřadí podle termínu', () => {
    const g = groupByStatus([
      { id: 1, status: 'active', dueDate: '2026-10-12' },
      { id: 2, status: 'active', dueDate: '2026-10-10' },
      { id: 3, status: 'done', dueDate: '' },
      { id: 4, status: 'created' },
    ]);
    expect(g.active.map((t) => t.id)).toEqual([2, 1]);
    expect(g.done.map((t) => t.id)).toEqual([3]);
    expect(g.created.map((t) => t.id)).toEqual([4]);
  });

  it('neznámý stav dá do prvního sloupce', () => {
    expect(groupByStatus([{ id: 1, status: 'x' }]).created).toHaveLength(1);
  });
});

describe('isOverdue', () => {
  it('po termínu jen u nedokončených', () => {
    expect(isOverdue({ status: 'active', dueDate: '2026-10-01' }, '2026-10-09')).toBe(true);
    expect(isOverdue({ status: 'done', dueDate: '2026-10-01' }, '2026-10-09')).toBe(false);
    expect(isOverdue({ status: 'active', dueDate: '2026-10-09' }, '2026-10-09')).toBe(false);
    expect(isOverdue({ status: 'active', dueDate: '' }, '2026-10-09')).toBe(false);
  });
});

describe('dates', () => {
  it('formátuje datum', () => {
    expect(formatDate('2026-10-09')).toBe('9. 10. 2026');
    expect(formatDate('')).toBe('');
  });
  it('todayString', () => {
    expect(todayString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
