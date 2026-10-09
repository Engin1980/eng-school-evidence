import { todayString } from './tasks.js';

// Rozvrh studenta: schedule[den] = [subjectId, ...], den = Date#getDay() (1 = pondělí ... 5 = pátek).
export const WEEKDAYS = [
  { id: '1', label: 'Pondělí' },
  { id: '2', label: 'Úterý' },
  { id: '3', label: 'Středa' },
  { id: '4', label: 'Čtvrtek' },
  { id: '5', label: 'Pátek' },
];

// Nejbližší den po dnešku (dnešek se nepočítá), kdy má student předmět; null, pokud není v rozvrhu.
export function nextLessonDate(schedule, subjectId, now = new Date()) {
  if (!schedule || !subjectId) return null;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    if ((schedule[String(d.getDay())] || []).includes(subjectId)) return todayString(d);
  }
  return null;
}
