import { AuthProvider, useAuth } from './lib/auth.jsx';
import { useRoute } from './lib/route.js';
import { isConfigured } from './firebase.js';
import Login from './components/Login.jsx';
import Users from './components/Users.jsx';
import Students from './components/Students.jsx';
import Student from './components/Student.jsx';

function Shell() {
  const { status, user, logout } = useAuth();
  const route = useRoute();

  if (status === 'loading') return <p className="center">Načítám…</p>;
  if (status !== 'ready') return <Login />;

  return (
    <>
      <header className="topbar">
        <a href="#/" className="brand">
          Evidence úkolů
        </a>
        <nav>
          <a href="#/">Studenti</a>
          <a href="#/users">Uživatelé</a>
        </nav>
        <span className="spacer" />
        <span className="muted">{user.name || user.email}</span>
        <button onClick={logout}>Odhlásit</button>
      </header>
      <main>
        {route.name === 'users' && <Users />}
        {route.name === 'students' && <Students />}
        {route.name === 'student' && <Student key={route.studentId} studentId={route.studentId} />}
      </main>
    </>
  );
}

export default function App() {
  if (!isConfigured) {
    return (
      <div className="card narrow">
        <h1>Chybí konfigurace Firebase</h1>
        <p>
          Zkopírujte <code>.env.example</code> do <code>.env</code> a vyplňte hodnoty z Firebase konzole (viz README).
        </p>
      </div>
    );
  }
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
