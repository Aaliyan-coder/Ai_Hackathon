import { useState } from 'react';

const CREDS_KEY   = 'inbox_intel_creds_v1';   // registered account — persists across sign-outs
const SESSION_KEY = 'inbox_intel_session_v1'; // active session — cleared on sign-out

// Default user seeded so the app works immediately
const DEFAULT_USER = {
  name: 'Zeeshan',
  email: 'dev.bbtipk@gmail.com',
  password: 'inbox123',
};

const normalize = (email) => (email || '').trim().toLowerCase();

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

// Seed default credentials on first load if nothing is stored
if (!readJson(CREDS_KEY)) {
  localStorage.setItem(CREDS_KEY, JSON.stringify({
    ...DEFAULT_USER,
    email: normalize(DEFAULT_USER.email),
  }));
}

export function useAuth() {
  const [user, setUser] = useState(() => readJson(SESSION_KEY));

  function signUp({ name, email, password }) {
    try {
      const u = { name: name.trim(), email: normalize(email), password };
      localStorage.setItem(CREDS_KEY,   JSON.stringify(u));
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      setUser(u);
      return null;
    } catch {
      return 'Could not save account — please try again';
    }
  }

  function signIn({ email, password }) {
    try {
      const creds = readJson(CREDS_KEY);
      if (!creds) return 'No account found. Please sign up first.';
      if (creds.email === normalize(email) && creds.password === password) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(creds));
        setUser(creds);
        return null;
      }
      return 'Incorrect email or password';
    } catch {
      return 'Something went wrong — please try again';
    }
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY); // keeps credentials, only clears session
    setUser(null);
  }

  return { user, signUp, signIn, signOut };
}
