const DEFAULT_BASE_URL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://backend:40001")
    : "/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export interface ApiOptions {
  baseUrl?: string;
  token?: string;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
}

async function handle<T>(
  res: Response,
  fallbackErrMessage: string,
): Promise<T> {
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const msg =
      (body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : null) ?? fallbackErrMessage;
    throw new ApiError(res.status, msg, body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiGet<T>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const url = `${opts.baseUrl ?? DEFAULT_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: opts.cache,
    next: opts.next,
  });
  return handle<T>(res, `GET ${path} failed`);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  opts: ApiOptions = {},
): Promise<T> {
  const url = `${opts.baseUrl ?? DEFAULT_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: opts.cache,
    next: opts.next,
  });
  return handle<T>(res, `POST ${path} failed`);
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  opts: ApiOptions = {},
): Promise<T> {
  const url = `${opts.baseUrl ?? DEFAULT_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: opts.cache,
    next: opts.next,
  });
  return handle<T>(res, `PUT ${path} failed`);
}

export async function apiDelete<T>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const url = `${opts.baseUrl ?? DEFAULT_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    cache: opts.cache,
    next: opts.next,
  });
  return handle<T>(res, `DELETE ${path} failed`);
}
