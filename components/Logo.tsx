export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="openplaud-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#openplaud-logo-grad)" />
      <g transform="translate(8.2, 8.2) scale(0.983)">
        <path
          d="M20 2H4c-1.1 0-1.989.9-1.989 2L2 22l5-5h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
          fill="#ffffff"
        />
      </g>
    </svg>
  );
}
