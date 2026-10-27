import type { ReactNode } from 'react';

export type IconName =
  | 'dashboard'
  | 'users'
  | 'chat'
  | 'plus'
  | 'trash'
  | 'close'
  | 'eye'
  | 'user-plus'
  | 'copy'
  | 'check'
  | 'warning'
  | 'info'
  | 'logout'
  | 'key'
  | 'refresh'
  | 'inbox';

const paths: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c.6-3.2 2.8-4.8 5.5-4.8s4.9 1.6 5.5 4.8" />
      <circle cx="17.2" cy="9" r="2.6" />
      <path d="M15.8 14.8c2.5.2 4.2 1.7 4.7 4.4" />
    </>
  ),
  chat: (
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-5 5v-5H6.5A2.5 2.5 0 0 1 4 15.5z" />
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9.5 7V4.5h5V7" />
      <path d="M6.5 7l.8 12.5h9.4L17.5 7" />
      <path d="M10.5 10.5v6" />
      <path d="M13.5 10.5v6" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'user-plus': (
    <>
      <circle cx="10" cy="8" r="3.2" />
      <path d="M4 19.5c.6-3.2 2.8-4.8 6-4.8 1.2 0 2.3.3 3.2.8" />
      <path d="M18.5 8.5v5" />
      <path d="M16 11h5" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  warning: (
    <>
      <path d="M12 4L2.5 20h19z" />
      <path d="M12 10.5v4" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11.5v4.5" />
      <circle cx="12" cy="8.2" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  logout: (
    <>
      <path d="M13 8.5h5.5v7H13" />
      <path d="M8 12h10.5" />
      <path d="M13 6H7A1.5 1.5 0 0 0 5.5 7.5v9A1.5 1.5 0 0 0 7 18h6" />
    </>
  ),
  key: (
    <>
      <circle cx="8.5" cy="12" r="3.5" />
      <path d="M12 12h8.5" />
      <path d="M17.5 12v3" />
      <path d="M14.5 12v2" />
    </>
  ),
  refresh: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4.5v3.5h-3.5" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 5.5h16v13H4z" />
      <path d="M4 14.5h5l1.5 3h3l1.5-3h5" />
    </>
  ),
};

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
