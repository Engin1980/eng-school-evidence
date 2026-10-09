import { useEffect, useState } from 'react';

// Hash routing: #/ (studenti), #/users, #/student/<id>
export function parseHash(hash) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'users') return { name: 'users' };
  if (parts[0] === 'student' && parts[1]) return { name: 'student', studentId: parts[1] };
  return { name: 'students' };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
