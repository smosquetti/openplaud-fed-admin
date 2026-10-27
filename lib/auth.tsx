'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from './api';

export function toBasicToken(user: string, pass: string): string {
  const bytes = new TextEncoder().encode(`${user}:${pass}`);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

type Status = 'checking' | 'authed' | 'anon';

interface AuthContextValue {
  status: Status;
  username: string | null;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'openplaud.admin.session';

interface StoredCreds {
  username: string;
  password: string;
}

function readStored(): StoredCreds | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredCreds) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>(() =>
    typeof window === 'undefined' ? 'checking' : readStored() ? 'checking' : 'anon',
  );
  const [username, setUsername] = useState<string | null>(() => {
    const stored = readStored();
    return stored ? stored.username : null;
  });

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setStatus('anon');
    setUsername(null);
  }, []);

  const login = useCallback((user: string, pass: string) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ username: user, password: pass }));
    setUsername(user);
    setStatus('authed');
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      sessionStorage.removeItem(STORAGE_KEY);
      setStatus('anon');
      setUsername(null);
    };
    setUnauthorizedHandler(onUnauthorized);

    const stored = readStored();
    if (!stored) {
      return () => setUnauthorizedHandler(null);
    }

    let cancelled = false;
    fetch('/api/proxy/admin/login', {
      method: 'GET',
      headers: { Authorization: `Basic ${toBasicToken(stored.username, stored.password)}` },
      cache: 'no-store',
    })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setStatus('authed');
          return;
        }
        if (res.status === 401) {
          sessionStorage.removeItem(STORAGE_KEY);
          setUsername(null);
          setStatus('anon');
          return;
        }
        // Backend unreachable (proxy returns 5xx): keep the session and retry
        // on the next navigation — show the "connecting" screen meanwhile.
        setStatus('checking');
      })
      .catch(() => {
        if (!cancelled) setStatus('checking');
      });

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, []);

  const value = useMemo(
    () => ({ status, username, login, logout }),
    [status, username, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
