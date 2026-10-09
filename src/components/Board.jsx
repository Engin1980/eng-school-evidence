import { useState } from 'react';
import { collection, doc, limit, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useQuery, useUserNames } from '../lib/data.js';
import { STATUSES, formatDate, formatTimestamp, groupByStatus, isDueTomorrow, isDueOrOverdue } from '../lib/tasks.js';
import TaskModal from './TaskModal.jsx';

// Karta úkolu: klik kamkoliv otevře detail; zobrazuje poslední poznámku (živý odběr jedné poznámky).
function TaskCard({ studentId, task, subjectName, userName, onOpen }) {
  const { docs } = useQuery(
    () =>
      query(
        collection(db, 'students', studentId, 'tasks', task.id, 'comments'),
        orderBy('createdAt', 'desc'),
        limit(1),
      ),
    [studentId, task.id],
  );
  const last = docs[0];
  const urgency = isDueOrOverdue(task) ? ' urgent' : isDueTomorrow(task) ? ' tomorrow' : '';

  return (
    <div
      className={'task' + urgency}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
      onClick={onOpen}
    >
      <div className="title">{task.description}</div>
      <div>
        <span className="tag">{subjectName}</span>
        <span className="due">do {formatDate(task.dueDate)}</span>
      </div>
      {last && (
        <div className="last-comment">
          <div className="muted">
            {userName(last.author)} · {formatTimestamp(last.createdAt)}
          </div>
          {last.text}
        </div>
      )}
    </div>
  );
}

export default function Board({ studentId, subjects, schedule }) {
  const { docs: tasks, loading, error } = useQuery(
    () => query(collection(db, 'students', studentId, 'tasks'), orderBy('createdAt', 'desc')),
    [studentId],
  );
  const userName = useUserNames();
  const [modal, setModal] = useState(null); // { task } | null
  const [filter, setFilter] = useState([]); // vybrané předměty; prázdné = vše
  const [overColumn, setOverColumn] = useState('');
  const [moveError, setMoveError] = useState('');

  // Smazané předměty ve filtru se ignorují; zbyde-li prázdný výběr, zobrazí se vše.
  const activeFilter = filter.filter((id) => subjects.some((s) => s.id === id));
  const visible = activeFilter.length ? tasks.filter((t) => activeFilter.includes(t.subjectId)) : tasks;
  const groups = groupByStatus(visible);
  const toggleFilter = (id) => setFilter((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const subjectName = (id) => subjects.find((s) => s.id === id)?.name ?? '(smazaný předmět)';

  const move = async (taskId, status) => {
    setMoveError('');
    try {
      await updateDoc(doc(db, 'students', studentId, 'tasks', taskId), { status });
    } catch (err) {
      setMoveError('Změna stavu se nezdařila: ' + (err.code || err.message));
    }
  };

  const onDrop = (e, status) => {
    e.preventDefault();
    setOverColumn('');
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== status) move(taskId, status);
  };

  return (
    <div className="card">
      <div className="row">
        <h2>Úkoly</h2>
        <span className="spacer" />
        <button
          className="primary"
          disabled={subjects.length === 0}
          title={subjects.length === 0 ? 'Nejdřív přidejte předmět' : ''}
          onClick={() => setModal({ task: null })}
        >
          Nový úkol
        </button>
      </div>
      {subjects.length > 0 && (
        <div className="subject-cards filter" role="group" aria-label="Filtr předmětů">
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={activeFilter.includes(s.id)}
              className={'subject-card' + (activeFilter.includes(s.id) ? ' selected' : '')}
              onClick={() => toggleFilter(s.id)}
            >
              {s.name}
            </button>
          ))}
          {activeFilter.length > 0 && (
            <button type="button" onClick={() => setFilter([])}>
              Zrušit filtr
            </button>
          )}
        </div>
      )}
      {loading && <p>Načítám…</p>}
      {error && <p className="error">Chyba: {error}</p>}
      {moveError && <p className="error">{moveError}</p>}
      <div className="board">
        {STATUSES.map((col) => (
          <div
            key={col.id}
            className={'column' + (overColumn === col.id ? ' over' : '')}
            onDragOver={(e) => {
              e.preventDefault();
              setOverColumn(col.id);
            }}
            onDragLeave={() => setOverColumn((c) => (c === col.id ? '' : c))}
            onDrop={(e) => onDrop(e, col.id)}
          >
            <h3>
              {col.label} ({groups[col.id].length})
            </h3>
            {groups[col.id].map((t) => (
              <TaskCard
                key={t.id}
                studentId={studentId}
                task={t}
                subjectName={subjectName(t.subjectId)}
                userName={userName}
                onOpen={() => setModal({ task: t })}
              />
            ))}
          </div>
        ))}
      </div>
      {modal && <TaskModal studentId={studentId} task={modal.task} subjects={subjects} schedule={schedule} onClose={() => setModal(null)} />}
    </div>
  );
}
