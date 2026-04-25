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

function flattenErrorDetail(detail: unknown): string | null {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => flattenErrorDetail(item))
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(" ") : null;
  }
  if (detail && typeof detail === "object") {
    const parts = Object.entries(detail as Record<string, unknown>)
      .map(([key, value]) => {
        const nested = flattenErrorDetail(value);
        return nested ? `${key}: ${nested}` : null;
      })
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(" ") : null;
  }
  return null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const authHeaders: Record<string, string> = {};
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

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
      ...(body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...authHeaders,
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
  });
  const contentType = response.headers.get("content-type") ?? "";
  const json = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const errorPayload = json?.error ?? {};
    const detailMessage = flattenErrorDetail(errorPayload.detail);
    throw new ApiError(
      response.status,
      errorPayload.code ?? `http_${response.status}`,
      detailMessage ?? errorPayload.message ?? response.statusText,
    );
  }

  if (json !== null) {
    return json as T;
  }

  return (await response.text()) as T;
}
