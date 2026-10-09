import { createContext, useContext, useEffect, useState } from 'react';
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

const EMAIL_KEY = 'emailForSignIn';
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export const normalizeEmail = (email) => (email || '').trim().toLowerCase();

export async function sendLink(email) {
  await sendSignInLinkToEmail(auth, normalizeEmail(email), {
    url: window.location.origin + window.location.pathname,
    handleCodeInApp: true,
  });
  localStorage.setItem(EMAIL_KEY, normalizeEmail(email));
}

// status: loading | signedOut | needsEmail | denied | ready
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null); // { email, name }
  const [error, setError] = useState('');

  const finishLink = async (email) => {
    setError('');
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem(EMAIL_KEY);
    } catch {
      setError('Odkaz je neplatný nebo vypršel. Požádejte o nový.');
      setStatus('signedOut');
    } finally {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const stored = localStorage.getItem(EMAIL_KEY);
      if (stored) finishLink(stored);
      else setStatus('needsEmail');
    }
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setStatus((s) => (s === 'needsEmail' ? s : 'signedOut'));
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'allowedUsers', normalizeEmail(fbUser.email)));
        if (snap.exists()) {
          setUser({ email: normalizeEmail(fbUser.email), name: snap.data().name || '' });
          setStatus('ready');
        } else {
          setStatus('denied');
        }
      } catch {
        setStatus('denied');
      }
    });
  }, []);

  const value = {
    status,
    user,
    error,
    confirmEmail: finishLink,
    logout: () => signOut(auth),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
