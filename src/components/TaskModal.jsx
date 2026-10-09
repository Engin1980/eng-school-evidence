import { useEffect, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../lib/auth.jsx';
import { STATUSES, formatTimestamp, todayString } from '../lib/tasks.js';
import { deleteTaskDeep } from '../lib/students.js';
import Comments from './Comments.jsx';

// task === null -> nový úkol
export default function TaskModal({ studentId, task, subjects, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    description: task?.description ?? '',
    subjectId: task?.subjectId ?? subjects[0]?.id ?? '',
    dueDate: task?.dueDate ?? todayString(),
    status: task?.status ?? 'created',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = { ...form, description: form.description.trim() };
    try {
      if (task) await updateDoc(doc(db, 'students', studentId, 'tasks', task.id), data);
      else {
        await addDoc(collection(db, 'students', studentId, 'tasks'), {
          ...data,
          createdBy: user.email,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (err) {
      setError('Uložení se nezdařilo: ' + (err.code || err.message));
      setBusy(false);
    }
  };

  const remove = async () => {
    if (window.confirm('Smazat úkol včetně komentářů?')) {
      await deleteTaskDeep(studentId, task.id);
      onClose();
    }
  };

  const subjectMissing = task && task.subjectId && !subjects.some((s) => s.id === task.subjectId);

  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{task ? 'Úkol' : 'Nový úkol'}</h2>
        <form className="form-grid" onSubmit={submit}>
          <div>
            Předmět
            <div className="subject-cards" role="radiogroup" aria-label="Předmět">
              {subjectMissing && (
                <button type="button" role="radio" aria-checked className="subject-card selected">
                  (smazaný předmět)
                </button>
              )}
              {subjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={form.subjectId === s.id}
                  className={'subject-card' + (form.subjectId === s.id ? ' selected' : '')}
                  onClick={() => setForm((f) => ({ ...f, subjectId: s.id }))}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {subjects.length === 0 && <span className="muted">Nejdříve přidejte předmět.</span>}
          </div>
          <label>
            Termín splnění
            <input type="date" required value={form.dueDate} onChange={set('dueDate')} />
          </label>
          <label>
            Stav
            <select value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Popis
            <textarea required value={form.description} onChange={set('description')} />
          </label>
          {task && (
            <span className="muted">
              Vložil {task.createdBy} {formatTimestamp(task.createdAt)}
            </span>
          )}
          {error && <span className="error">{error}</span>}
          <div className="row">
            <button className="primary" disabled={busy || !form.subjectId}>
              Uložit
            </button>
            <button type="button" onClick={onClose}>
              Zavřít
            </button>
            <span className="spacer" />
            {task && (
              <button type="button" className="danger" onClick={remove}>
                Smazat úkol
              </button>
            )}
          </div>
        </form>
        {task && <Comments studentId={studentId} taskId={task.id} />}
      </div>
    </div>
  );
}
