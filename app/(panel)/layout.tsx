'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/operators', label: 'Operators', icon: 'users' },
  { href: '/groups', label: 'Groups', icon: 'chat' },
] as const;

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { status, username, logout } = useAuth();
  const pathname = usePathname();

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
        {status === 'authed' ? (
          <div className="sidebar-foot">
            <div className="admin-chip">
              <div className="avatar">
                {(username ?? 'A').replace('@localhost', '').charAt(0).toUpperCase() || 'A'}
              </div>
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
        ) : null}
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
