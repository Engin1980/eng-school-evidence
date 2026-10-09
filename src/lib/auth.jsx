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
import { createLogger, maskLink } from './log.js';

const log = createLogger('auth');

const EMAIL_KEY = 'emailForSignIn';
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export const normalizeEmail = (email) => (email || '').trim().toLowerCase();

export async function sendLink(email) {
  const target = normalizeEmail(email);
  const url = window.location.origin + window.location.pathname;
  log.info('Sending sign-in link', { email: target, continueUrl: url, authDomain: auth.app.options.authDomain });
  try {
    await sendSignInLinkToEmail(auth, target, { url, handleCodeInApp: true });
  } catch (err) {
    log.error('sendSignInLinkToEmail failed', err.code, err.message, err);
    throw err;
  }
  localStorage.setItem(EMAIL_KEY, target);
  log.info('Firebase accepted the request; the email should be on its way (check spam). Email stored for completing sign-in.');
}

// status: loading | signedOut | needsEmail | denied | ready
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null); // { email, name }
  const [error, setError] = useState('');

  const finishLink = async (email) => {
    setError('');
    log.info('Completing sign-in with email link', { email, link: maskLink(window.location.href) });
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem(EMAIL_KEY);
      log.info('signInWithEmailLink succeeded');
    } catch (err) {
      log.error('signInWithEmailLink failed', err.code, err.message, err);
      setError('Odkaz je neplatný nebo vypršel. Požádejte o nový.');
      setStatus('signedOut');
    } finally {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    const isLink = isSignInWithEmailLink(auth, window.location.href);
    log.debug('Auth init', { isEmailLink: isLink, url: maskLink(window.location.href) });
    if (isLink) {
      const stored = localStorage.getItem(EMAIL_KEY);
      log.info('Opened via sign-in link', { storedEmail: stored });
      if (stored) finishLink(stored);
      else setStatus('needsEmail');
    }
    return onAuthStateChanged(auth, async (fbUser) => {
      log.info('onAuthStateChanged', fbUser ? { email: fbUser.email, uid: fbUser.uid } : 'signed out');
      if (!fbUser) {
        setUser(null);
        setStatus((s) => (s === 'needsEmail' ? s : 'signedOut'));
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'allowedUsers', normalizeEmail(fbUser.email)));
        if (snap.exists()) {
          log.info('Allow-list check passed', normalizeEmail(fbUser.email));
          setUser({ email: normalizeEmail(fbUser.email), name: snap.data().name || '' });
          setStatus('ready');
        } else {
          log.warn('Not on allow-list: allowedUsers/' + normalizeEmail(fbUser.email) + ' does not exist');
          setStatus('denied');
        }
      } catch (err) {
        log.error('Allow-list lookup failed (rules?)', err.code, err.message, err);
        setStatus('denied');
      }
    });
  }, []);

  const value = {
    status,
    user,
    error,
    confirmEmail: finishLink,
    logout: () => {
      log.info('Signing out');
      return signOut(auth);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
