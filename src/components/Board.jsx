import { useState } from 'react';
import { collection, doc, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useQuery } from '../lib/data.js';
import { STATUSES, formatDate, groupByStatus, isDueTomorrow, isDueOrOverdue } from '../lib/tasks.js';
import TaskModal from './TaskModal.jsx';

export default function Board({ studentId, subjects }) {
  const { docs: tasks, loading, error } = useQuery(
    () => query(collection(db, 'students', studentId, 'tasks'), orderBy('createdAt', 'desc')),
    [studentId],
  );
  const [modal, setModal] = useState(null); // { task } | null
  const [overColumn, setOverColumn] = useState('');
  const [moveError, setMoveError] = useState('');

  const groups = groupByStatus(tasks);
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

  const shift = (task, delta) => {
    const i = STATUSES.findIndex((s) => s.id === task.status);
    const next = STATUSES[i + delta];
    if (next) move(task.id, next.id);
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
              <div
                key={t.id}
                className={'task' + (isDueOrOverdue(t) ? ' urgent' : isDueTomorrow(t) ? ' tomorrow' : '')}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)}
              >
                <div className="title" onClick={() => setModal({ task: t })}>
                  {t.description}
                </div>
                <div>
                  <span className="tag">{subjectName(t.subjectId)}</span>
                  <span className="due">do {formatDate(t.dueDate)}</span>
                </div>
                <div className="row">
                  <button disabled={t.status === STATUSES[0].id} onClick={() => shift(t, -1)} aria-label="Posunout zpět">
                    ◀
                  </button>
                  <button
                    disabled={t.status === STATUSES[STATUSES.length - 1].id}
                    onClick={() => shift(t, 1)}
                    aria-label="Posunout dál"
                  >
                    ▶
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {modal && <TaskModal studentId={studentId} task={modal.task} subjects={subjects} onClose={() => setModal(null)} />}
    </div>
  );
}
