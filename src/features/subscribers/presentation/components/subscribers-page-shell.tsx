"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useToast } from "@/src/core/ui/toast";
import {
  downloadSubscribersCsv,
  removeSubscriber,
  SUBSCRIBER_PAGE_SIZE,
  type DashboardSubscriber,
} from "@/src/features/subscribers/data/api/subscribers-api-client";
import { useSubscribers } from "@/src/features/subscribers/presentation/state/use-subscribers";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Waiting for confirmation" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

const SOURCE_OPTIONS = [
  { value: "", label: "All sources" },
  { value: "footer", label: "Footer form" },
  { value: "registration", label: "Account registration" },
  { value: "checkout", label: "Checkout" },
];

const STATUS_LABELS: Record<DashboardSubscriber["status"], string> = {
  confirmed: "Confirmed",
  pending: "Waiting for confirmation",
  unsubscribed: "Unsubscribed",
};

const SOURCE_LABELS: Record<DashboardSubscriber["source"], string> = {
  footer: "Footer form",
  registration: "Registration",
  checkout: "Checkout",
};

const BREVO_LABELS: Record<DashboardSubscriber["brevoSyncStatus"], string> = {
  not_required: "—",
  pending: "Syncing",
  synced: "In Brevo list",
  failed: "Sync failed",
};

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
}

export function SubscribersPageShell() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const list = useSubscribers({ status, source, search, page });
  const pageCount = Math.max(1, Math.ceil(list.count / SUBSCRIBER_PAGE_SIZE));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  async function handleExport() {
    setBusy("export");
    try {
      await downloadSubscribersCsv({ status, source, search });
      toast.success("Subscriber list downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The export failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRemove(subscriber: DashboardSubscriber) {
    const confirmed = window.confirm(
      `Remove ${subscriber.email} completely?\n\nUse this for a data-deletion request. The address is deleted here and from the Brevo list, and cannot be restored.`,
    );
    if (!confirmed) return;
    setBusy(subscriber.id);
    try {
      await removeSubscriber(subscriber.id);
      toast.success(`${subscriber.email} was removed.`);
      list.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The subscriber could not be removed.");
    } finally {
      setBusy(null);
    }
  }

  const summary = list.summary;

  return (
    <div>
      <PageHeader
        eyebrow="Drop List"
        title="Newsletter subscribers."
        description="Everyone who joined the drop list. Only confirmed subscribers are added to the Brevo list that campaigns are sent from."
        actions={
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={busy === "export"}
            style={{ ...darkButtonStyle, opacity: busy === "export" ? 0.6 : 1 }}
          >
            {busy === "export" ? "Preparing..." : "Export CSV"}
          </button>
        }
      />

      <div
        aria-label="Subscriber summary"
        style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", marginBottom: 18 }}
      >
        {[
          { label: "Confirmed", value: summary?.confirmed },
          { label: "Waiting for confirmation", value: summary?.pending },
          { label: "Unsubscribed", value: summary?.unsubscribed },
          { label: "Brevo sync failed", value: summary?.brevoFailed, warn: Boolean(summary?.brevoFailed) },
        ].map((tile) => (
          <div key={tile.label} style={{ ...tileStyle, ...(tile.warn ? warnTileStyle : {}) }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{tile.label}</span>
            <strong style={{ fontSize: 28 }}>{tile.value ?? "—"}</strong>
          </div>
        ))}
      </div>

      <SectionCard
        title="Subscriber list"
        description="Export and remove are for the owner and admins. Removing a subscriber is for data-deletion requests; to stop emails, the subscriber can unsubscribe from any campaign email."
      >
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 18 }}>
          <label style={labelStyle}>
            <span>Search</span>
            <input
              aria-label="Search subscribers"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Email address"
              style={inputStyle}
              value={query}
            />
          </label>
          <label style={labelStyle}>
            <span>Status</span>
            <select
              aria-label="Subscriber status"
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              style={inputStyle}
              value={status}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            <span>Source</span>
            <select
              aria-label="Subscriber source"
              onChange={(event) => {
                setSource(event.target.value);
                setPage(1);
              }}
              style={inputStyle}
              value={source}
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {list.status === "error" ? (
          <div role="alert" style={{ display: "grid", gap: 10 }}>
            <p style={{ margin: 0 }}>{list.error}</p>
            <button type="button" onClick={list.reload} style={subtleButtonStyle}>
              Retry
            </button>
          </div>
        ) : list.status === "loading" ? (
          <p style={{ color: "var(--color-text-muted)" }}>Loading subscribers...</p>
        ) : list.rows.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>
            {search || status || source ? "No subscribers match these filters." : "Nobody has joined the drop list yet."}
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--color-text-muted)", fontSize: 13 }}>
                  <th style={cellStyle}>Email</th>
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Source</th>
                  <th style={cellStyle}>Signed up</th>
                  <th style={cellStyle}>Confirmed</th>
                  <th style={cellStyle}>Brevo</th>
                  <th style={cellStyle} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {list.rows.map((subscriber) => (
                  <tr key={subscriber.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                    <td style={cellStyle}>{subscriber.email}</td>
                    <td style={cellStyle}>{STATUS_LABELS[subscriber.status]}</td>
                    <td style={cellStyle}>{SOURCE_LABELS[subscriber.source]}</td>
                    <td style={cellStyle}>{formatDate(subscriber.consentedAt)}</td>
                    <td style={cellStyle}>{formatDate(subscriber.confirmedAt)}</td>
                    <td style={cellStyle} title={subscriber.brevoLastError || undefined}>
                      {BREVO_LABELS[subscriber.brevoSyncStatus]}
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>
                      <button
                        type="button"
                        aria-label={`Remove ${subscriber.email}`}
                        onClick={() => void handleRemove(subscriber)}
                        disabled={busy === subscriber.id}
                        style={subtleButtonStyle}
                      >
                        {busy === subscriber.id ? "Removing..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {list.count > SUBSCRIBER_PAGE_SIZE ? (
          <div className="dashboard-action-row" style={{ marginTop: 16, alignItems: "center" }}>
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} style={subtleButtonStyle}>
              Previous
            </button>
            <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
              Page {page} of {pageCount} · {list.count} subscribers
            </span>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((value) => value + 1)}
              style={subtleButtonStyle}
            >
              Next
            </button>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}

const labelStyle = { display: "grid", gap: 8 } as const;
const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "12px 14px",
  background: "var(--color-surface)",
} as const;
const cellStyle = { padding: "12px 10px", verticalAlign: "top" as const } as const;
const tileStyle = {
  display: "grid",
  gap: 6,
  border: "1px solid var(--color-border)",
  borderRadius: 18,
  padding: "14px 16px",
  background: "rgba(255, 253, 248, 0.82)",
} as const;
const warnTileStyle = { borderColor: "rgba(179, 123, 31, 0.5)", background: "rgba(179, 123, 31, 0.1)" } as const;
const darkButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  borderRadius: "var(--radius-pill)",
  padding: "14px 18px",
  background: "var(--color-surface-inverse)",
  color: "var(--color-text-inverse)",
  fontWeight: 600,
  cursor: "pointer",
} as const;
const subtleButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  padding: "10px 14px",
  background: "rgba(255, 253, 248, 0.82)",
  color: "var(--color-text)",
  fontWeight: 600,
  cursor: "pointer",
} as const;
