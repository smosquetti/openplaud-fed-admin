'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Group, Operator } from '@/lib/types';
import { useToasts } from './Toaster';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

interface Props {
  group: Group;
}

export function MembersModal({ group }: Props) {
  const toasts = useToasts();
  const [members, setMembers] = useState<Operator[] | null>(null);
  const [all, setAll] = useState<Operator[]>([]);
  const [selected, setSelected] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addBusy, setAddBusy] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [m, a] = await Promise.all([
      apiFetch<Operator[]>(`/groups/${group.id}/operators`),
      apiFetch<Operator[]>('/operators'),
    ]);
    if (!m.ok || !a.ok) {
      setLoadError((m.ok ? a.error?.message : m.error?.message) ?? 'Could not load group data.');
      return;
    }
    setMembers(m.data ?? []);
    setAll(a.data ?? []);
  }, [group.id]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      apiFetch<Operator[]>(`/groups/${group.id}/operators`),
      apiFetch<Operator[]>('/operators'),
    ]).then(([m, a]) => {
      if (!alive) return;
      if (!m.ok || !a.ok) {
        setLoadError((m.ok ? a.error?.message : m.error?.message) ?? 'Could not load group data.');
        return;
      }
      setMembers(m.data ?? []);
      setAll(a.data ?? []);
    });
    return () => {
      alive = false;
    };
  }, [group.id]);

  const candidates = (all ?? []).filter((o) => !(members ?? []).some((m) => m.id === o.id));

  async function add() {
    if (!selected) return;
    setAddBusy(true);
    const res = await apiFetch(`/groups/${group.id}/operators/${selected}`, { method: 'POST' });
    setAddBusy(false);
    if (res.ok) {
      const name = all.find((o) => o.id === selected)?.name ?? 'Operator';
      toasts('success', 'Added to group', `${name} is now a member of ${group.name}.`);
      setSelected('');
      await load();
    } else {
      toasts('error', 'Could not add operator', res.error?.message);
    }
  }

  async function remove(op: Operator) {
    setRemovingId(op.id);
    const res = await apiFetch(`/groups/${group.id}/operators/${op.id}`, { method: 'DELETE' });
    setRemovingId(null);
    if (res.ok) {
      toasts('success', 'Removed from group', `${op.name} is no longer a member of ${group.name}.`);
      await load();
    } else {
      toasts('error', 'Could not remove operator', res.error?.message);
    }
  }

  return (
    <div className="member-panel">
      <div className="member-add">
        <select
          className="form-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={addBusy}
          aria-label="Select operator to add"
        >
          <option value="">Select an operator…</option>
          {candidates.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} — {o.xmppUser}
            </option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => void add()} disabled={!selected || addBusy}>
          {addBusy ? <span className="spinner-inline" aria-hidden="true" /> : <Icon name="user-plus" size={14} />}
          <span>Add</span>
        </button>
      </div>

      {candidates.length === 0 && all.length > 0 ? (
        <p className="member-note">All operators are already members of this group.</p>
      ) : null}

      {loadError ? (
        <div className="alert-soft">
          <Icon name="warning" size={15} />
          <span>{loadError}</span>
        </div>
      ) : members === null ? (
        <Spinner label="Loading members…" />
      ) : members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="users" size={20} />
          </div>
          <h3>No members yet</h3>
          <p>Use the dropdown above to add the first operator to {group.name}.</p>
        </div>
      ) : (
        <div className="member-list">
          {members.map((op) => (
            <div key={op.id} className="member-row">
              <div className="avatar avatar-sm">{op.name.charAt(0).toUpperCase()}</div>
              <div className="member-meta">
                <div className="member-name">{op.name}</div>
                <div className="member-sub">
                  {op.email} · <span className="badge-xmpp">@{op.xmppUser}</span>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm btn-danger-ghost"
                onClick={() => void remove(op)}
                disabled={removingId !== null}
              >
                {removingId === op.id ? (
                  <span className="spinner-inline" aria-hidden="true" />
                ) : (
                  <Icon name="trash" size={13} />
                )}
                <span>Remove</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
