import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../lib/auth.jsx';
import { useQuery, useUserNames } from '../lib/data.js';
import { formatTimestamp } from '../lib/tasks.js';

export default function Comments({ studentId, taskId }) {
  const { user } = useAuth();
  const col = collection(db, 'students', studentId, 'tasks', taskId, 'comments');
  const { docs, loading, error } = useQuery(() => query(col, orderBy('createdAt')), [studentId, taskId]);
  const userName = useUserNames();
  const [text, setText] = useState('');
  const [formError, setFormError] = useState('');

  const add = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await addDoc(col, { text: text.trim(), author: user.email, createdAt: serverTimestamp() });
      setText('');
    } catch (err) {
      setFormError('Uložení se nezdařilo: ' + (err.code || err.message));
    }
  };

  const remove = (c) => {
    if (window.confirm('Smazat komentář?')) deleteDoc(doc(col, c.id));
  };

  return (
    <div>
      <h3>Poznámky</h3>
      {loading && <p className="muted">Načítám…</p>}
      {error && <p className="error">Chyba: {error}</p>}
      {docs.map((c) => (
        <div className="comment" key={c.id}>
          <div className="muted">
            {userName(c.author)} · {formatTimestamp(c.createdAt)}{' '}
            <button type="button" className="danger" onClick={() => remove(c)}>
              Smazat
            </button>
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{c.text}</div>
        </div>
      ))}
      {!loading && docs.length === 0 && <p className="muted">Zatím bez poznámek.</p>}
      <form className="form-grid" onSubmit={add}>
        <textarea
          required
          placeholder="Napsat poznámku… (Ctrl+Enter odešle)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              e.currentTarget.form.requestSubmit();
            }
          }}
        />
        <div className="row">
          <button className="primary">Přidat poznámku</button>
          {formError && <span className="error">{formError}</span>}
        </div>
      </form>
    </div>
  );
}
