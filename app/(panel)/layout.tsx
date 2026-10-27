'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { Spinner } from '@/components/Spinner';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/operators', label: 'Operators', icon: 'users' },
  { href: '/groups', label: 'Groups', icon: 'chat' },
] as const;

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { status, username, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'anon') router.replace('/login');
  }, [status, router]);

  if (status !== 'authed') {
    return (
      <div className="page-center">
        <Spinner
          label={status === 'checking' ? 'Connecting to the OpenPlaud API…' : 'Please wait…'}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Logo size={36} />
          <div className="brand-text">
            <div className="brand-name">OpenPlaud</div>
            <div className="brand-sub">Admin console</div>
          </div>
        </div>
        <nav className="side-nav" aria-label="Main">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-item${pathname === item.href ? ' active' : ''}`}
            >
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="admin-chip">
            <div className="avatar">{(username ?? 'A').replace('@localhost', '').charAt(0).toUpperCase() || 'A'}</div>
            <div className="admin-meta">
              <div className="admin-name">{username}</div>
              <div className="admin-sub">ejabberd admin</div>
            </div>
          </div>
          <button className="signout-btn" onClick={logout}>
            <Icon name="logout" size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
