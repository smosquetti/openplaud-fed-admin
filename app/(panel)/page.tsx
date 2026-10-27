'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import type { Group, Operator } from '@/lib/types';
import { Icon } from '@/components/Icon';
import { Spinner } from '@/components/Spinner';
import { useToasts } from '@/components/Toaster';

function StatCard({ icon, label, value, hint }: { icon: 'users' | 'chat'; label: string; value: string | number; hint: string }) {
  return (
    <div className="op-card stat-card">
      <div className="stat-icon" aria-hidden="true">
        <Icon name={icon} size={22} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">
          {label} · {hint}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const toasts = useToasts();
  const [operators, setOperators] = useState<Operator[] | null>(null);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [o, g] = await Promise.all([apiFetch<Operator[]>('/operators'), apiFetch<Group[]>('/groups')]);
    if (o.ok) setOperators(o.data ?? []);
    if (g.ok) setGroups(g.data ?? []);
    if (!o.ok) {
      toasts('error', 'Could not load dashboard', o.error?.message);
    }
    setLoading(false);
  }, [toasts]);

  useEffect(() => {
    let alive = true;
    Promise.all([apiFetch<Operator[]>('/operators'), apiFetch<Group[]>('/groups')]).then(([o, g]) => {
      if (!alive) return;
      if (o.ok) setOperators(o.data ?? []);
      if (g.ok) setGroups(g.data ?? []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">An overview of the OpenPlaud chat environment.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => { setLoading(true); void load(); }}>
          <Icon name="refresh" size={15} />
          <span>Refresh</span>
        </button>
      </header>

      <div className="stat-grid">
        <StatCard icon="users" label="Operators" value={operators === null ? '—' : operators.length} hint="registered XMPP users" />
        <StatCard icon="chat" label="Groups" value={groups === null ? '—' : groups.length} hint="persistent MUC rooms" />
      </div>

      {loading ? (
        <Spinner label="Loading…" />
      ) : (
        <div className="dash-grid">
          <section className="op-card">
            <div className="card-head">
              <h2>Recent operators</h2>
              <Link className="link" href="/operators">
                View all
              </Link>
            </div>
            {(operators ?? []).length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Icon name="users" size={20} />
                </div>
                <h3>No operators yet</h3>
                <p>Register the first operator to start building the chat environment.</p>
                <Link className="link" href="/operators">
                  Go to Operators
                </Link>
              </div>
            ) : (
              <>
                {(operators ?? []).slice(0, 5).map((op) => (
                  <div key={op.id} className="list-row">
                    <div className="avatar avatar-sm">{op.name.charAt(0).toUpperCase()}</div>
                    <div className="list-main">
                      <div className="list-name">{op.name}</div>
                      <div className="list-sub">{op.email}</div>
                    </div>
                    <span className="badge-xmpp">@{op.xmppUser}</span>
                  </div>
                ))}
              </>
            )}
          </section>
          <section className="op-card">
            <div className="card-head">
              <h2>Groups</h2>
              <Link className="link" href="/groups">
                View all
              </Link>
            </div>
            {(groups ?? []).length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Icon name="chat" size={20} />
                </div>
                <h3>No groups yet</h3>
                <p>Create the first MUC room to organize operators.</p>
                <Link className="link" href="/groups">
                  Go to Groups
                </Link>
              </div>
            ) : (
              <>
                {(groups ?? []).slice(0, 5).map((g) => (
                  <div key={g.id} className="list-row">
                    <div className="avatar avatar-sm">{g.name.charAt(0).toUpperCase()}</div>
                    <div className="list-main">
                      <div className="list-name">{g.name}</div>
                      <div className="list-sub">
                        {g.room} on {g.service}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
