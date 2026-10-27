import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: number;
  readonly fields?: Record<string, string>;

  constructor(status: number, message: string, code: number, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

let unauthorizedHandler: (() => void) | null = null;

/** Registers the callback fired when the backend rejects the admin session (401). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

interface FetchOptions {
  method?: string;
  body?: unknown;
  /** Pre-encoded `Basic` token, i.e. base64("user:pass"). */
  auth?: string;
}

export interface ApiResult<T> {
  ok: boolean;
  data: T | null;
  error: ApiError | null;
}

/**
 * Talks to the OpenPlaud API through the server-side proxy so the browser
 * never sees the backend URL (no CORS) and credentials stay Basic auth.
 */
export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<ApiResult<T>> {
  const { method = 'GET', body, auth } = options;
  const headers: Record<string, string> = {};
  if (auth) headers.Authorization = `Basic ${auth}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`/api/proxy${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    return {
      ok: false,
      data: null,
      error: new ApiError(0, 'Network error — the OpenPlaud API could not be reached.', 0),
    };
  }

  const text = await res.text();
  let parsed: Partial<ApiErrorBody> | null = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as Partial<ApiErrorBody>;
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401) unauthorizedHandler?.();
    const message = parsed?.message ?? 'Something went wrong while talking to the OpenPlaud API.';
    return {
      ok: false,
      data: null,
      error: new ApiError(res.status, message, parsed?.code ?? res.status, parsed?.fields),
    };
  }

  return { ok: true, data: parsed as T, error: null };
}
