import { collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';

async function deleteAll(colRef) {
  const snap = await getDocs(colRef);
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

// Firestore nemaže podkolekce automaticky, proto je mažeme ručně.
export async function deleteTaskDeep(studentId, taskId) {
  await deleteAll(collection(db, 'students', studentId, 'tasks', taskId, 'comments'));
  await deleteDoc(doc(db, 'students', studentId, 'tasks', taskId));
}

export async function deleteStudentDeep(studentId) {
  const tasks = await getDocs(collection(db, 'students', studentId, 'tasks'));
  for (const t of tasks.docs) await deleteTaskDeep(studentId, t.id);
  await deleteAll(collection(db, 'students', studentId, 'subjects'));
  await deleteDoc(doc(db, 'students', studentId));
}
