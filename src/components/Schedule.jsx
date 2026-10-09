import { useState } from 'react';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { WEEKDAYS } from '../lib/schedule.js';
import { createLogger } from '../lib/log.js';

const log = createLogger('schedule');

export default function Schedule({ student, subjects }) {
  const [error, setError] = useState('');

  const toggle = async (day, subjectId, on) => {
    setError('');
    try {
      await updateDoc(doc(db, 'students', student.id), {
        [`schedule.${day}`]: on ? arrayRemove(subjectId) : arrayUnion(subjectId),
      });
      log.info('Schedule changed', { studentId: student.id, day, subjectId, added: !on });
    } catch (err) {
      log.error('Schedule update failed', err.code, err.message, err);
      setError('Uložení se nezdařilo: ' + (err.code || err.message));
    }
  };

  return (
    <div className="card">
      <h2>Rozvrh</h2>
      {subjects.length === 0 ? (
        <p className="muted">Nejdříve přidejte předměty.</p>
      ) : (
        <div className="schedule">
          {WEEKDAYS.map((day) => (
            <div key={day.id} className="schedule-day">
              <h3>{day.label}</h3>
              {subjects.map((s) => {
                const on = (student.schedule?.[day.id] || []).includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    className={'subject-card' + (on ? ' selected' : '')}
                    onClick={() => toggle(day.id, s.id, on)}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
