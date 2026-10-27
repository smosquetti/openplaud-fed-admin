'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toBasicToken, useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { Icon } from '@/components/Icon';

export default function LoginPage() {
  const { status, login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authed') router.replace('/');
  }, [status, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both the username and the password.');
      return;
    }
    setBusy(true);
    setError(null);
    let res: Response;
    try {
      res = await fetch('/api/proxy/admin/login', {
        method: 'GET',
        headers: { Authorization: `Basic ${toBasicToken(username.trim(), password)}` },
        cache: 'no-store',
      });
    } catch {
      setBusy(false);
      setError('Could not reach the OpenPlaud API. Make sure the backend is running, then try again.');
      return;
    }
    setBusy(false);
    if (res.ok) {
      login(username.trim(), password);
      router.replace('/');
      return;
    }
    if (res.status === 401) {
      setError('Login failed — the admin account or password was rejected by ejabberd.');
    } else if (res.status >= 500) {
      setError('Could not reach the OpenPlaud API. Make sure the backend is running, then try again.');
    } else {
      setError('Login failed — unexpected response from the OpenPlaud API.');
    }
  }

  return (
    <div className="login-wrap">
      <form onSubmit={onSubmit} className="login-card" noValidate>
        <div className="login-head">
          <Logo size={52} />
          <h1 className="login-title">OpenPlaud Admin</h1>
          <p className="login-sub">Sign in with the ejabberd admin account to manage the chat environment.</p>
        </div>
        <label className="field">
          <span className="field-label">Username</span>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin@localhost"
            autoComplete="username"
            autoFocus
          />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>
        {error ? (
          <div className="login-error">
            <Icon name="warning" size={15} />
            <span>{error}</span>
          </div>
        ) : null}
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? <span className="spinner-inline" aria-hidden="true" /> : null}
          <span>{busy ? 'Signing in…' : 'Sign in'}</span>
        </button>
        <p className="login-hint">
          The account must match <code>ejabberd.username</code> on the backend (default: <code>admin@localhost</code>
          ).
        </p>
      </form>
    </div>
  );
}
