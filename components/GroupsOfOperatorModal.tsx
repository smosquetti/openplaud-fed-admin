'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Group, Operator } from '@/lib/types';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

interface Props {
  operator: Operator;
}

export function GroupsOfOperatorModal({ operator }: Props) {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiFetch<Group[]>(`/operators/${operator.id}/groups`).then((res) => {
      if (!alive) return;
      if (!res.ok) {
        setError(res.error?.message ?? 'Could not load this operator\'s groups.');
        return;
      }
      setGroups(res.data ?? []);
    });
    return () => {
      alive = false;
    };
  }, [operator.id]);

  return (
    <div className="member-panel">
      {error ? (
        <div className="alert-soft">
          <Icon name="warning" size={15} />
          <span>{error}</span>
        </div>
      ) : groups === null ? (
        <Spinner label="Loading groups…" />
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="inbox" size={20} />
          </div>
          <h3>No groups yet</h3>
          <p>
            {operator.name} does not belong to any group. Add them from the <strong>Groups</strong> page.
          </p>
        </div>
      ) : (
        <div className="member-list">
          {groups.map((g) => (
            <div key={g.id} className="member-row">
              <div className="avatar avatar-sm">{g.name.charAt(0).toUpperCase()}</div>
              <div className="member-meta">
                <div className="member-name">{g.name}</div>
                <div className="member-sub">
                  <span className="badge-xmpp">{g.room}</span> on <span className="badge-xmpp">{g.service}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
