export const STATUSES = [
  { id: 'created', label: 'Vytvořené' },
  { id: 'active', label: 'Aktivní' },
  { id: 'done', label: 'Dokončené' },
];

export const isStatus = (value) => STATUSES.some((s) => s.id === value);

// Seskupí úkoly do sloupců; neznámý stav padá do prvního sloupce. Řadí podle termínu (bez termínu na konec).
export function groupByStatus(tasks) {
  const groups = Object.fromEntries(STATUSES.map((s) => [s.id, []]));
  for (const t of tasks) groups[isStatus(t.status) ? t.status : STATUSES[0].id].push(t);
  for (const list of Object.values(groups)) {
    list.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  }
  return groups;
}

export const todayString = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

export const tomorrowString = (now = new Date()) => {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  return todayString(d);
};

// Termín je zítra a úkol není dokončený.
export const isDueTomorrow = (task, tomorrow = tomorrowString()) =>
  task.status !== 'done' && Boolean(task.dueDate) && task.dueDate === tomorrow;

// Po termínu nebo dnes = není dokončený a termín je dnes nebo dříve.
export const isDueOrOverdue = (task, today = todayString()) =>
  task.status !== 'done' && Boolean(task.dueDate) && task.dueDate <= today;

export function formatDate(dueDate) {
  if (!dueDate) return '';
  const [y, m, d] = dueDate.split('-');
  return `${Number(d)}. ${Number(m)}. ${y}`;
}

// Firestore Timestamp -> text; null před dokončením zápisu serverem.
export function formatTimestamp(ts) {
  if (!ts || typeof ts.toDate !== 'function') return '';
  return ts.toDate().toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });
}
