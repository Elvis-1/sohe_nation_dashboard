const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/backend";
const DASHBOARD_SESSION_STORAGE_KEY = "sohe-dashboard-session";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const authHeaders: Record<string, string> = {};

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(DASHBOARD_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { token?: string };
        if (parsed.token) {
          authHeaders.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch {
      // Ignore malformed stored auth and proceed without a token header.
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorPayload = json?.error ?? {};
    throw new ApiError(
      response.status,
      errorPayload.code ?? `http_${response.status}`,
      errorPayload.message ?? response.statusText,
    );
  }

  return json as T;
}
