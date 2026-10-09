import { useState } from 'react';
import { arrayUnion, collection, doc, getDoc, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { normalizeEmail } from '../lib/auth.jsx';
import { useDocument, useQuery } from '../lib/data.js';
import { createLogger } from '../lib/log.js';
import { deleteStudentDeep } from '../lib/students.js';
import Subjects from './Subjects.jsx';
import Board from './Board.jsx';

const log = createLogger('student');

function Members({ student }) {
  const { docs: users } = useQuery(() => query(collection(db, 'allowedUsers'), orderBy('email')), []);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const label = (memberEmail) => {
    const u = users.find((x) => x.id === memberEmail);
    return u && u.name ? `${u.name} (${memberEmail})` : memberEmail;
  };

  const add = async (e) => {
    e.preventDefault();
    const target = normalizeEmail(email);
    if (!target) return;
    setError('');
    if (student.memberEmails.includes(target)) {
      setError('Tento uživatel už je ke studentovi připojen.');
      return;
    }
    setBusy(true);
    try {
      const snap = await getDoc(doc(db, 'allowedUsers', target));
      if (!snap.exists()) {
        log.warn('Add member: no such allowed user', target);
        setError('Uživatel s tímto e-mailem neexistuje. Nejdříve ho přidejte na stránce Uživatelé.');
        return;
      }
      await updateDoc(doc(db, 'students', student.id), { memberEmails: arrayUnion(target) });
      log.info('Member added to student', { studentId: student.id, email: target });
      setEmail('');
    } catch (err) {
      log.error('Add member failed', err.code, err.message, err);
      setError('Uložení se nezdařilo: ' + (err.code || err.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h2>Uživatelé studenta</h2>
      <ul className="list">
        {student.memberEmails.map((memberEmail) => (
          <li key={memberEmail}>{label(memberEmail)}</li>
        ))}
      </ul>
      <form className="row" onSubmit={add}>
        <input
          type="email"
          required
          placeholder="e-mail uživatele"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="primary" disabled={busy}>
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
