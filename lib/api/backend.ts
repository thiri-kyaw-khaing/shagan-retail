// Low-level fetch to the shagan_pos backend. No cookie access here, so
// proxy.ts can use it too; server components/functions use ./server.ts.
import type { ApiErrorBody } from "@/lib/api/types";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: ApiErrorBody["errors"] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// The backend serializes bcrypt hashes on User (`credential_hash`) and Staff
// (`pin_hash`) responses. Drop them before anything can reach the browser.
const SECRET_KEYS = new Set(["credential_hash", "pin_hash"]);

function stripSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSecrets);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !SECRET_KEYS.has(key))
        .map(([key, v]) => [key, stripSecrets(v)]),
    );
  }
  return value;
}

function baseUrl() {
  const url = process.env.BACKEND_API_URL;
  if (!url) throw new Error("BACKEND_API_URL is not set (see .env.example)");
  return url;
}

/**
 * Calls `${BACKEND_API_URL}/api/v1${path}`. JSON bodies are passed as plain
 * objects via `json`; a 204 resolves to undefined. Non-2xx throws ApiError
 * carrying the backend's `message`.
 */
export async function callBackend<T>(
  path: string,
  { json, accessToken, headers, ...init }: RequestInit & { json?: unknown; accessToken?: string } = {},
): Promise<T> {
  const res = await fetch(`${baseUrl()}/api/v1${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(json !== undefined && { "Content-Type": "application/json" }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body as ApiErrorBody | null;
    throw new ApiError(res.status, err?.message ?? res.statusText, err?.errors);
  }
  return stripSecrets(body) as T;
}
