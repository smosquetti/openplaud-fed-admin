'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Group } from '@/lib/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Icon } from '@/components/Icon';
import { MembersModal } from '@/components/MembersModal';
import { Modal } from '@/components/Modal';
import { Spinner } from '@/components/Spinner';
import { useToasts } from '@/components/Toaster';

interface FormState {
  name: string;
  service: string;
}

const emptyForm: FormState = { name: '', service: 'conference' };

export default function GroupsPage() {
  const toasts = useToasts();
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const [managing, setManaging] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState<Group | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch<Group[]>('/groups');
    if (res.ok) setGroups(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    apiFetch<Group[]>('/groups').then((res) => {
      if (!alive) return;
      if (res.ok) setGroups(res.data ?? []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  function setField(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormErrors({ name: 'Group name is required.' });
      return;
    }
    setBusy(true);
    setFormErrors({});
    const res = await apiFetch<Group>('/groups', {
      method: 'POST',
      body: { name: form.name.trim(), service: form.service.trim() || 'conference' },
    });
    setBusy(false);

    if (!res.ok) {
      const fields = res.error?.fields ?? {};
      if (res.error?.status === 400 && Object.keys(fields).length > 0) setFormErrors(fields);
      toasts('error', 'Could not create group', res.error?.message);
      return;
    }

    setForm(emptyForm);
    setShowForm(false);
    toasts('success', 'Group created', `The ${res.data?.name ?? 'group'} MUC room is ready.`);
    await load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    const res = await apiFetch(`/groups/${deleting.id}`, { method: 'DELETE' });
    setDeleteBusy(false);
    if (res.ok) {
      toasts('success', 'Group removed', `${deleting.name} and its MUC room have been destroyed.`);
      setDeleting(null);
      await load();
    } else {
      toasts('error', 'Could not remove group', res.error?.message);
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-sub">Persistent MUC rooms that organize operators into teams.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <Icon name="plus" size={15} />
          <span>New group</span>
        </button>
      </header>

      {showForm ? (
        <div className="op-card form-card">
          <div className="form-head">
            <h2>Create group</h2>
            <button className="icon-btn" onClick={() => setShowForm(false)} aria-label="Close form">
              <Icon name="close" size={16} />
            </button>
          </div>
          <form onSubmit={create} noValidate>
            <div className="form-grid">
              <div className="field">
                <span className="field-label">Group name</span>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Support Team"
                  autoFocus
                />
                {formErrors.name ? <div className="field-error">{formErrors.name}</div> : null}
              </div>
              <div className="field">
                <span className="field-label">MUC service</span>
                <input
                  className="form-control"
                  value={form.service}
                  onChange={(e) => setField('service', e.target.value)}
                  placeholder="conference"
                />
                {formErrors.service ? <div className="field-error">{formErrors.service}</div> : null}
              </div>
              <div className="field full">
                <p className="form-note">
                  The room name is derived automatically from the group name (lowercased, alphanumeric only).
                </p>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? <span className="spinner-inline" aria-hidden="true" /> : <Icon name="chat" size={15} />}
                <span>{busy ? 'Creating…' : 'Create group'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="table-card">
        {loading ? (
          <div style={{ padding: 40 }} className="page-center">
            <Spinner label="Loading groups…" />
          </div>
        ) : (groups ?? []).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="chat" size={20} />
            </div>
            <h3>No groups yet</h3>
            <p>Create the first persistent MUC room to organize operators into teams.</p>
          </div>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Group</th>
                <th style={{ width: '22%' }}>Room</th>
                <th style={{ width: '18%' }}>Service</th>
                <th style={{ width: '22%' }} />
              </tr>
            </thead>
            <tbody>
              {(groups ?? []).map((g) => (
                <tr key={g.id}>
                  <td>
                    <div className="cell-main">
                      <div className="avatar avatar-sm">{g.name.charAt(0).toUpperCase()}</div>
                      <span>{g.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-xmpp">{g.room}</span>
                  </td>
                  <td>
                    <span className="badge-xmpp">{g.service}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setManaging(g)}>
                        <Icon name="users" size={13} />
                        <span>Members</span>
                      </button>
                      <button className="btn btn-ghost btn-sm btn-danger-ghost" onClick={() => setDeleting(g)}>
                        <Icon name="trash" size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={managing !== null}
        title={managing ? `Members — ${managing.name}` : ''}
        onClose={() => setManaging(null)}
        wide
      >
        {managing ? <MembersModal key={managing.id} group={managing} /> : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Remove group"
        message={
          deleting
            ? `This destroys the ${deleting.name} MUC room on the XMPP server and deletes all of its memberships. This action cannot be undone.`
            : ''
        }
        confirmLabel="Remove group"
        busy={deleteBusy}
        danger
        onConfirm={() => void confirmDelete()}
        onCancel={() => (deleteBusy ? undefined : setDeleting(null))}
      />
    </>
  );
}
