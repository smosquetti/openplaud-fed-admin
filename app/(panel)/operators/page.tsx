'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { CreatedOperator, Operator } from '@/lib/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { GroupsOfOperatorModal } from '@/components/GroupsOfOperatorModal';
import { Icon } from '@/components/Icon';
import { InitialPasswordBanner } from '@/components/InitialPasswordBanner';
import { Modal } from '@/components/Modal';
import { Spinner } from '@/components/Spinner';
import { useToasts } from '@/components/Toaster';

interface FormState {
  name: string;
  email: string;
  password: string;
}

const emptyForm: FormState = { name: '', email: '', password: '' };

export default function OperatorsPage() {
  const toasts = useToasts();
  const { status } = useAuth();
  const router = useRouter();
  const [operators, setOperators] = useState<Operator[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const [created, setCreated] = useState<{ name: string; password: string } | null>(null);
  const [createdUser, setCreatedUser] = useState<Operator | null>(null);

  const [viewing, setViewing] = useState<Operator | null>(null);
  const [deleting, setDeleting] = useState<Operator | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch<Operator[]>('/operators');
    if (res.ok) setOperators(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'anon') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authed') return;
    let alive = true;
    apiFetch<Operator[]>('/operators').then((res) => {
      if (!alive) return;
      if (res.ok) setOperators(res.data ?? []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [status]);

  if (status !== 'authed') {
    return (
      <div className="page-center">
        <Spinner label={status === 'checking' ? 'Connecting to the OpenPlaud API…' : 'Please wait…'} />
      </div>
    );
  }

  function setField(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setFormErrors({ _form: 'Name and email are required.' });
      return;
    }
    setBusy(true);
    setFormErrors({});
    const body: Record<string, string> = {
      name: form.name.trim(),
      email: form.email.trim(),
    };
    if (form.password) body.password = form.password;

    const res = await apiFetch<CreatedOperator>('/operators', { method: 'POST', body });
    setBusy(false);

    if (!res.ok) {
      const fields = res.error?.fields ?? {};
      if (res.error?.status === 400 && Object.keys(fields).length > 0) {
        setFormErrors(fields);
      } else {
        toasts('error', 'Could not create operator', res.error?.message);
      }
      return;
    }

    const data = res.data ?? ({} as CreatedOperator);
    if (data.initialPassword) {
      setCreated({ name: data.name, password: data.initialPassword });
    } else {
      setCreated(null);
    }
    setCreatedUser(data);
    setForm(emptyForm);
    toasts('success', 'Operator created', `${data.name} (@${data.xmppUser}) is registered on the XMPP server.`);
    await load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    const res = await apiFetch(`/operators/${deleting.id}`, { method: 'DELETE' });
    setDeleteBusy(false);
    if (res.ok) {
      toasts('success', 'Operator removed', `${deleting.name} has been removed, including the XMPP user.`);
      setDeleting(null);
      await load();
    } else {
      toasts('error', 'Could not remove operator', res.error?.message);
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Operators</h1>
          <p className="page-sub">Register XMPP operators and manage their group memberships.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <Icon name="plus" size={15} />
          <span>New operator</span>
        </button>
      </header>

      {created ? (
        <InitialPasswordBanner
          operatorName={created.name}
          password={created.password}
          onDismiss={() => setCreated(null)}
        />
      ) : createdUser ? (
        <div className="pw-banner">
          <div className="pw-icon" aria-hidden="true">
            <Icon name="key" size={18} />
          </div>
          <div className="pw-text">
            <div>
              <strong>{createdUser.name}</strong> was registered with the password you set. Share it with the operator.
            </div>
          </div>
          <button className="icon-btn" onClick={() => setCreatedUser(null)} aria-label="Dismiss">
            <Icon name="close" size={14} />
          </button>
        </div>
      ) : null}

      {showForm ? (
        <div className="op-card form-card">
          <div className="form-head">
            <h2>Register operator</h2>
            <button className="icon-btn" onClick={() => setShowForm(false)} aria-label="Close form">
              <Icon name="close" size={16} />
            </button>
          </div>
          <form onSubmit={create} noValidate>
            <div className="form-grid">
              <div className="field">
                <span className="field-label">Full name</span>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="John Doe"
                  autoFocus
                />
                {formErrors.name ? <div className="field-error">{formErrors.name}</div> : null}
              </div>
              <div className="field">
                <span className="field-label">Email</span>
                <input
                  className="form-control"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="john@example.com"
                />
                {formErrors.email ? <div className="field-error">{formErrors.email}</div> : null}
              </div>
              <div className="field full">
                <span className="field-label">Initial password (optional)</span>
                <input
                  className="form-control"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder="Leave empty to let the server generate one"
                />
                <p className="form-note">
                  The XMPP username is derived automatically from the name (lowercased, alphanumeric only, 2–30
                  characters).
                </p>
                {formErrors.password ? <div className="field-error">{formErrors.password}</div> : null}
                {formErrors._form ? <div className="field-error">{formErrors._form}</div> : null}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? <span className="spinner-inline" aria-hidden="true" /> : <Icon name="user-plus" size={15} />}
                <span>{busy ? 'Creating…' : 'Create operator'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="table-card">
        {loading ? (
          <div style={{ padding: 40 }} className="page-center">
            <Spinner label="Loading operators…" />
          </div>
        ) : (operators ?? []).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="users" size={20} />
            </div>
            <h3>No operators yet</h3>
            <p>Use the form above to register the first operator on the XMPP server.</p>
          </div>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{ width: '42%' }}>Operator</th>
                <th style={{ width: '20%' }}>XMPP user</th>
                <th style={{ width: '14%' }}>Email</th>
                <th style={{ width: '24%' }} />
              </tr>
            </thead>
            <tbody>
              {(operators ?? []).map((op) => (
                <tr key={op.id}>
                  <td>
                    <div className="cell-main">
                      <div className="avatar avatar-sm">{op.name.charAt(0).toUpperCase()}</div>
                      <span>{op.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-xmpp">@{op.xmppUser}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13.5, color: 'var(--op-muted)' }}>{op.email}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewing(op)}>
                        <Icon name="eye" size={13} />
                        <span>Groups</span>
                      </button>
                      <button className="btn btn-ghost btn-sm btn-danger-ghost" onClick={() => setDeleting(op)}>
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

      <Modal open={viewing !== null} title={viewing ? `Groups — ${viewing.name}` : ''} onClose={() => setViewing(null)}>
        {viewing ? <GroupsOfOperatorModal operator={viewing} /> : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Remove operator"
        message={
          deleting
            ? `This permanently removes ${deleting.name} (@${deleting.xmppUser}) from the XMPP server and deletes all of their group memberships. This action cannot be undone.`
            : ''
        }
        confirmLabel="Remove operator"
        busy={deleteBusy}
        danger
        onConfirm={() => void confirmDelete()}
        onCancel={() => (deleteBusy ? undefined : setDeleting(null))}
      />
    </>
  );
}
