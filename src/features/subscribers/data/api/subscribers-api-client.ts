import { apiRequest } from "@/src/core/api/http-client";

const BASE = "/dashboard/marketing/subscribers";

export const SUBSCRIBER_PAGE_SIZE = 25;

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";
export type SubscriberSource = "footer" | "registration" | "checkout";
export type BrevoSyncStatus = "not_required" | "pending" | "synced" | "failed";

export type DashboardSubscriber = {
  id: string;
  email: string;
  status: SubscriberStatus;
  source: SubscriberSource;
  consentedAt: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  brevoSyncStatus: BrevoSyncStatus;
  brevoLastError: string;
  createdAt: string;
};

export type SubscriberFilters = {
  status: string;
  source: string;
  search: string;
  page: number;
};

export type SubscriberSummary = {
  total: number;
  pending: number;
  confirmed: number;
  unsubscribed: number;
  brevoFailed: number;
};

type ApiSubscriber = {
  id: string;
  email: string;
  status: SubscriberStatus;
  source: SubscriberSource;
  consented_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  brevo_sync_status: BrevoSyncStatus;
  brevo_last_error: string;
  created_at: string;
};

function query(filters: Partial<SubscriberFilters>, extra: Record<string, string> = {}) {
  const params = new URLSearchParams(extra);
  if (filters.status) params.set("status", filters.status);
  if (filters.source) params.set("source", filters.source);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function fetchSubscriberPage(filters: SubscriberFilters) {
  const data = await apiRequest<{ count: number; results: ApiSubscriber[] }>(
    `${BASE}/${query(filters, { page: String(filters.page), page_size: String(SUBSCRIBER_PAGE_SIZE) })}`,
  );
  return {
    count: data.count,
    results: data.results.map(
      (api): DashboardSubscriber => ({
        id: api.id,
        email: api.email,
        status: api.status,
        source: api.source,
        consentedAt: api.consented_at,
        confirmedAt: api.confirmed_at,
        unsubscribedAt: api.unsubscribed_at,
        brevoSyncStatus: api.brevo_sync_status,
        brevoLastError: api.brevo_last_error,
        createdAt: api.created_at,
      }),
    ),
  };
}

export async function fetchSubscriberSummary(): Promise<SubscriberSummary> {
  const data = await apiRequest<{
    total: number;
    pending: number;
    confirmed: number;
    unsubscribed: number;
    brevo_failed: number;
  }>(`${BASE}/summary/`);
  return {
    total: data.total,
    pending: data.pending,
    confirmed: data.confirmed,
    unsubscribed: data.unsubscribed,
    brevoFailed: data.brevo_failed,
  };
}

/** CSV of every subscriber matching the filters (owner/admin only; the API audits it). */
export async function downloadSubscribersCsv(filters: Partial<SubscriberFilters>) {
  const csv = await apiRequest<string>(`${BASE}/export/${query(filters)}`);
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `sohe-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Erasure request: removes the contact from Brevo and deletes the record (owner/admin only). */
export async function removeSubscriber(id: string) {
  await apiRequest<string>(`${BASE}/${id}/`, { method: "DELETE" });
}
