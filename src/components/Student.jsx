import { useState } from 'react';
import { arrayUnion, collection, doc, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useDocument, useQuery } from '../lib/data.js';
import { deleteStudentDeep } from '../lib/students.js';
import Subjects from './Subjects.jsx';
import Board from './Board.jsx';

function Members({ student }) {
  const { docs: users } = useQuery(() => query(collection(db, 'allowedUsers'), orderBy('email')), []);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');

  const candidates = users.filter((u) => !student.memberEmails.includes(u.id));
  const label = (email) => {
    const u = users.find((x) => x.id === email);
    return u && u.name ? `${u.name} (${email})` : email;
  };

  const add = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    try {
      await updateDoc(doc(db, 'students', student.id), { memberEmails: arrayUnion(selected) });
      setSelected('');
    } catch (err) {
      setError('Uložení se nezdařilo: ' + (err.code || err.message));
    }
  };

  return (
    <div className="card">
      <h2>Uživatelé studenta</h2>
      <ul className="list">
        {student.memberEmails.map((email) => (
          <li key={email}>{label(email)}</li>
        ))}
      </ul>
      <form className="row" onSubmit={add}>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">— vyberte uživatele —</option>
          {candidates.map((u) => (
            <option key={u.id} value={u.id}>
              {label(u.id)}
            </option>
          ))}
        </select>
        <button className="primary" disabled={!selected}>
          Připojit ke studentovi
        </button>
        {error && <span className="error">{error}</span>}
      </form>
    </div>
  );
}

export default function Student({ studentId }) {
  const { data: student, error } = useDocument(() => doc(db, 'students', studentId), [studentId]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const { docs: subjects } = useQuery(
    () => query(collection(db, 'students', studentId, 'subjects'), orderBy('name')),
    [studentId],
  );

  if (error) return <p className="error">Student nelze načíst: {error}</p>;
  if (student === undefined) return <p>Načítám…</p>;
  if (student === null) return <p>Student neexistuje nebo k němu nemáte přístup. <a href="#/">Zpět</a></p>;

  const rename = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, 'students', studentId), { name: name.trim() });
    setEditing(false);
  };

  const remove = async () => {
    if (window.confirm(`Smazat studenta ${student.name} včetně všech předmětů, úkolů a komentářů?`)) {
      await deleteStudentDeep(studentId);
      window.location.hash = '#/';
    }
  };

  return (
    <>
      <p>
        <a href="#/">← Studenti</a>
      </p>
      <div className="row">
        {editing ? (
          <form className="row" onSubmit={rename}>
            <input required value={name} onChange={(e) => setName(e.target.value)} />
            <button className="primary">Uložit</button>
            <button type="button" onClick={() => setEditing(false)}>
              Zrušit
            </button>
          </form>
        ) : (
          <>
            <h1>{student.name}</h1>
            <button
              onClick={() => {
                setName(student.name);
                setEditing(true);
              }}
            >
              Přejmenovat
            </button>
            <button className="danger" onClick={remove}>
              Smazat studenta
            </button>
          </>
        )}
      </div>
      <Board studentId={studentId} subjects={subjects} />
      <Members student={student} />
      <Subjects studentId={studentId} subjects={subjects} />
    </>
  );
}
