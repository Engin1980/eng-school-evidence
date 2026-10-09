import { useState } from 'react';
import { addDoc, collection, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../lib/auth.jsx';
import { useQuery } from '../lib/data.js';

export default function Students() {
  const { user } = useAuth();
  const { docs, loading, error } = useQuery(
    () => query(collection(db, 'students'), where('memberEmails', 'array-contains', user.email)),
    [user.email],
  );
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  const add = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const ref = await addDoc(collection(db, 'students'), {
        name: name.trim(),
        memberEmails: [user.email],
        createdBy: user.email,
        createdAt: serverTimestamp(),
      });
      setName('');
      window.location.hash = `#/student/${ref.id}`;
    } catch (err) {
      setFormError('Uložení se nezdařilo: ' + (err.code || err.message));
    }
  };

  const sorted = [...docs].sort((a, b) => a.name.localeCompare(b.name, 'cs'));

  return (
    <>
      <h1>Studenti</h1>
      <form className="card row" onSubmit={add}>
        <input required placeholder="jméno nového studenta" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="primary">Vytvořit studenta</button>
        {formError && <span className="error">{formError}</span>}
      </form>
      <div className="card">
        {loading && <p>Načítám…</p>}
        {error && <p className="error">Chyba: {error}</p>}
        {!loading && !error && sorted.length === 0 && <p className="muted">Zatím nemáte žádného studenta.</p>}
        <ul className="list">
          {sorted.map((s) => (
            <li key={s.id}>
              <a className="grow" href={`#/student/${s.id}`}>
                {s.name}
              </a>
              <span className="muted">{s.memberEmails.length} uživatel(é)</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
