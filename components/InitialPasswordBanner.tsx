'use client';

import { useState } from 'react';
import { Icon } from './Icon';

interface Props {
  operatorName: string;
  password: string;
  onDismiss: () => void;
}

export function InitialPasswordBanner({ operatorName, password, onDismiss }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the password stays visible in the banner
    }
  }

  return (
    <div className="pw-banner">
      <div className="pw-icon" aria-hidden="true">
        <Icon name="key" size={18} />
      </div>
      <div className="pw-text">
        <div>
          <strong>Initial password for {operatorName}:</strong>{' '}
          <code className="pw-value">{password}</code>
        </div>
        <div className="pw-hint">This password is shown only once — share it with the operator before closing this page.</div>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={copy}>
        <Icon name={copied ? 'check' : 'copy'} size={13} />
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <button className="icon-btn" onClick={onDismiss} aria-label="Dismiss password banner">
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
