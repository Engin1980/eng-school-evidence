import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';

// Živý odběr kolekce/dotazu. `makeQuery` vrací Firestore query (nebo null, pokud ještě nelze číst).
// `deps` určuje, kdy se odběr znovu založí.
export function useQuery(makeQuery, deps) {
  const [state, setState] = useState({ docs: [], loading: true, error: '' });
  useEffect(() => {
    const q = makeQuery();
    if (!q) return undefined;
    setState((s) => ({ ...s, loading: true }));
    return onSnapshot(
      q,
      (snap) => setState({ docs: snap.docs.map((d) => ({ id: d.id, ...d.data() })), loading: false, error: '' }),
      (err) => setState({ docs: [], loading: false, error: err.code || err.message }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

// Dokument -> prostý objekt, null pokud neexistuje.
export function useDocument(makeRef, deps) {
  const [state, setState] = useState({ data: undefined, error: '' });
  useEffect(() => {
    setState({ data: undefined, error: '' });
    return onSnapshot(
      makeRef(),
      (snap) => setState({ data: snap.exists() ? { id: snap.id, ...snap.data() } : null, error: '' }),
      (err) => setState({ data: null, error: err.code || err.message }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
