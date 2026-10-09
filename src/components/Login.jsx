import { useState } from 'react';
import { sendLink, signInWithGoogle, useAuth } from '../lib/auth.jsx';

export default function Login() {
  const { status, error, confirmEmail, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  if (status === 'denied') {
    return (
      <div className="card narrow">
        <h1>Přístup odepřen</h1>
        <p>Tento e-mail není na seznamu povolených uživatelů. Požádejte existujícího uživatele, aby vás přidal.</p>
        <button onClick={logout}>Odhlásit</button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setLocalError('');
    try {
      if (status === 'needsEmail') await confirmEmail(email.trim().toLowerCase());
      else {
        await sendLink(email);
        setSent(true);
      }
    } catch (err) {
      setLocalError('Odeslání se nezdařilo: ' + (err.code || err.message));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setLocalError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      // Closing the popup is not an error worth showing.
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setLocalError('Přihlášení přes Google se nezdařilo: ' + (err.code || err.message));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card narrow">
      <h1>Evidence úkolů</h1>
      {sent ? (
        <p>
          Odkaz pro přihlášení byl odeslán na <b>{email}</b>. Otevřete ho ve stejném prohlížeči (zkontrolujte i spam).
        </p>
      ) : (
        <form onSubmit={submit}>
          <p>
            {status === 'needsEmail'
              ? 'Pro dokončení přihlášení potvrďte svůj e-mail.'
              : 'Zadejte e-mail, pošleme vám přihlašovací odkaz.'}
          </p>
          <input type="email" required placeholder="e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="primary" disabled={busy}>
            {status === 'needsEmail' ? 'Dokončit přihlášení' : 'Poslat odkaz'}
          </button>
        </form>
      )}
      {status !== 'needsEmail' && !sent && (
        <>
          <p className="muted">nebo</p>
          <button onClick={google} disabled={busy}>
            Přihlásit se přes Google
          </button>
        </>
      )}
      {(error || localError) && <p className="error">{error || localError}</p>}
    </div>
  );
}
