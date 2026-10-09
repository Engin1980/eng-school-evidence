import { useState } from 'react';
import { addDoc, arrayRemove, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase.js';
import { WEEKDAYS } from '../lib/schedule.js';
import { deleteTaskDeep } from '../lib/students.js';

export default function Subjects({ studentId, subjects }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const col = collection(db, 'students', studentId, 'subjects');

  const run = async (fn) => {
    setError('');
    try {
      await fn();
    } catch (err) {
      setError('Operace se nezdařila: ' + (err.code || err.message));
    }
  };

  const add = (e) => {
    e.preventDefault();
    run(async () => {
      await addDoc(col, { name: name.trim() });
      setName('');
    });
  };

  const rename = (s) => {
    const next = window.prompt('Nový název předmětu', s.name);
    if (next && next.trim()) run(() => updateDoc(doc(col, s.id), { name: next.trim() }));
  };

  const remove = (s) => {
    if (window.confirm(`Smazat předmět ${s.name} včetně všech jeho úkolů a komentářů?`)) {
      run(async () => {
        const tasks = await getDocs(
          query(collection(db, 'students', studentId, 'tasks'), where('subjectId', '==', s.id)),
        );
        for (const t of tasks.docs) await deleteTaskDeep(studentId, t.id);
        // Předmět zmizí i z rozvrhu studenta.
        await updateDoc(
          doc(db, 'students', studentId),
          Object.fromEntries(WEEKDAYS.map((d) => [`schedule.${d.id}`, arrayRemove(s.id)])),
        );
        await deleteDoc(doc(col, s.id));
      });
    }
  };

  return (
    <div className="card">
      <h2>Předměty</h2>
      <ul className="list">
        {subjects.map((s) => (
          <li key={s.id}>
            <span className="grow">{s.name}</span>
            <button onClick={() => rename(s)}>Přejmenovat</button>
            <button className="danger" onClick={() => remove(s)}>
              Smazat
            </button>
          </li>
        ))}
      </ul>
      {subjects.length === 0 && <p className="muted">Zatím žádné předměty. Bez předmětu nelze přidat úkol.</p>}
      <form className="row" onSubmit={add}>
        <input required placeholder="nový předmět" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="primary">Přidat předmět</button>
        {error && <span className="error">{error}</span>}
      </form>
    </div>
  );
}
