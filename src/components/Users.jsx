import { useState } from 'react';
import { collection, doc, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth, normalizeEmail } from '../lib/auth.jsx';
import { useQuery } from '../lib/data.js';

export default function Users() {
  const { user } = useAuth();
  const { docs, loading, error } = useQuery(() => query(collection(db, 'allowedUsers'), orderBy('email')), []);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  const add = async (e) => {
    e.preventDefault();
    setFormError('');
    const key = normalizeEmail(email);
    if (docs.some((u) => u.id === key)) {
      setFormError('Tento uživatel už existuje.');
      return;
    }
    try {
      await setDoc(doc(db, 'allowedUsers', key), {
        email: key,
        name: name.trim(),
        createdBy: user.email,
        createdAt: serverTimestamp(),
      });
      setEmail('');
      setName('');
    } catch (err) {
      setFormError('Uložení se nezdařilo: ' + (err.code || err.message));
    }
  };

  return (
    <>
      <h1>Uživatelé</h1>
      <form className="card row" onSubmit={add}>
        <input type="email" required placeholder="e-mail nového uživatele" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="jméno (volitelné)" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="primary">Přidat uživatele</button>
        {formError && <span className="error">{formError}</span>}
      </form>
      <div className="card">
        {loading && <p>Načítám…</p>}
        {error && <p className="error">Chyba: {error}</p>}
        <ul className="list">
          {docs.map((u) => (
            <li key={u.id}>
              <span className="grow">
                {u.name ? <b>{u.name} </b> : null}
                <span className="muted">{u.email}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="muted">Nový uživatel se přihlásí zadáním svého e-mailu na přihlašovací stránce.</p>
      </div>
    </>
  );
}
