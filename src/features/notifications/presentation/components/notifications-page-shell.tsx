"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "@/src/core/api/http-client";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useToast } from "@/src/core/ui/toast";
import type {
  DashboardNotificationLog,
  DashboardNotificationProviderStatus,
} from "@/src/core/types/dashboard";
import {
  fetchNotificationProviderStatus,
  fetchNotificationLogs,
  retryNotificationLog,
  sendNotificationProviderTest,
} from "@/src/features/notifications/data/api/notifications-api-client";

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  border: 0,
  borderRadius: "var(--radius-pill)",
  padding: "12px 18px",
  background: "var(--color-surface-inverse)",
  color: "var(--color-text-inverse)",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
} as const;

const subtleButton = {
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  padding: "12px 18px",
  background: "rgba(255,253,248,0.82)",
  color: "var(--color-text)",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
} as const;

const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "12px 16px",
  background: "var(--color-surface)",
  width: "100%",
  fontSize: 14,
} as const;

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};

const STATUS_LABELS = {
  pending: "Pending",
  sent: "Sent",
  failed: "Failed",
} as const;

const EVENT_LABELS: Record<string, string> = {
  order_placed: "Order placed",
  payment_confirmed: "Payment confirmed",
  order_fulfilled: "Order fulfilled",
  return_submitted: "Return submitted",
  return_approved: "Return approved",
  return_rejected: "Return rejected",
  staff_invited: "Staff invited",
};

function formatDate(value?: string | null) {
  if (!value) return "Not yet sent";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusPill(status: DashboardNotificationLog["status"]) {
  const color =
    status === "sent"
      ? "rgba(50,180,100,0.14)"
      : status === "failed"
        ? "rgba(200,80,80,0.12)"
        : "rgba(179,123,31,0.12)";
  const text =
    status === "sent"
      ? "#1e7a44"
      : status === "failed"
        ? "#b04040"
        : "var(--color-accent)";

  return {
    display: "inline-block",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: color,
    color: text,
    border: `1px solid ${text === "var(--color-accent)" ? "rgba(179,123,31,0.18)" : color}`,
  } as const;
}

export function NotificationsPageShell() {
  const toast = useToast();
  const [logs, setLogs] = useState<DashboardNotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<DashboardNotificationProviderStatus | null>(
    null,
  );
  const [providerError, setProviderError] = useState<string | null>(null);
  const [testRecipient, setTestRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [filters, setFilters] = useState({
    eventType: "",
    status: "",
    recipient: "",
  });

  async function loadProviderStatus() {
    setProviderError(null);
    try {
      const next = await fetchNotificationProviderStatus();
      setProviderStatus(next);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "The dashboard could not read notification provider status.";
      setProviderError(message);
    }
  }

  async function load(currentFilters = filters) {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchNotificationLogs(currentFilters);
      setLogs(next);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "The dashboard could not read notification logs from the API.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    void loadProviderStatus();
  }, []);

  async function handleApplyFilters() {
    await load(filters);
  }

  async function handleRetry(log: DashboardNotificationLog) {
    setRetryingId(log.id);
    try {
      const retried = await retryNotificationLog(log.id);
      toast.success(`Retry queued as attempt ${retried.attemptNumber}.`);
      await load(filters);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Retry failed.");
    } finally {
      setRetryingId(null);
    }
  }

  async function handleSendTest() {
    if (!testRecipient) {
      toast.error("Enter a recipient email first.");
      return;
    }

    setSendingTest(true);
    try {
      const result = await sendNotificationProviderTest(testRecipient);
      toast.success(`Test email sent to ${result.recipientEmail}.`);
      setFilters((current) => ({ ...current, recipient: result.recipientEmail }));
      await load({
        ...filters,
        recipient: result.recipientEmail,
      });
      await loadProviderStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Test email failed.");
    } finally {
      setSendingTest(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Notifications"
        title="Delivery log and retry control."
        description="Inspect order, return, and staff invite email attempts. Failed deliveries can be retried without leaving the dashboard."
        actions={
          <Link href="/" style={subtleButton}>
            Return to overview
          </Link>
        }
      />

      <SectionCard
        title="Provider status"
        description="Live delivery uses environment-backed SMTP credentials. Use this card to confirm configuration and send a test email."
      >
        {providerError ? (
          <div
            style={{
              borderRadius: 16,
              padding: "14px 16px",
              background: "rgba(200,80,80,0.08)",
              color: "#b04040",
              marginBottom: 14,
            }}
          >
            {providerError}
          </div>
        ) : null}

        {providerStatus ? (
          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <div>
                <strong style={{ display: "block", marginBottom: 4 }}>Delivery mode</strong>
                <span style={statusPill(providerStatus.deliveryMode === "live" ? "sent" : "pending")}>
                  {providerStatus.deliveryMode === "live" ? "Live SMTP" : "Local backend"}
                </span>
              </div>
              <div>
                <strong style={{ display: "block", marginBottom: 4 }}>Backend</strong>
                <span style={{ color: "var(--color-text-muted)" }}>{providerStatus.backendName}</span>
              </div>
              <div>
                <strong style={{ display: "block", marginBottom: 4 }}>Host</strong>
                <span style={{ color: "var(--color-text-muted)" }}>
                  {providerStatus.host || "Not set"}:{providerStatus.port}
                </span>
              </div>
              <div>
                <strong style={{ display: "block", marginBottom: 4 }}>Auth user</strong>
                <span style={{ color: "var(--color-text-muted)" }}>
                  {providerStatus.hostUserMasked || "Not set"}
                </span>
              </div>
              <div>
                <strong style={{ display: "block", marginBottom: 4 }}>From</strong>
                <span style={{ color: "var(--color-text-muted)" }}>
                  {providerStatus.defaultFromEmail}
                </span>
              </div>
              <div>
                <strong style={{ display: "block", marginBottom: 4 }}>TLS</strong>
                <span style={{ color: "var(--color-text-muted)" }}>
                  {providerStatus.useTls ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div
              style={{
                borderRadius: 16,
                background: "rgba(245,239,226,0.75)",
                padding: "12px 14px",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}
            >
              {providerStatus.notes}
            </div>
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 10, marginTop: 16, maxWidth: 420 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
            Send test email to
            <input
              style={inputStyle}
              value={testRecipient}
              placeholder="owner@sohesnation.com"
              onChange={(event) => setTestRecipient(event.target.value)}
            />
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={primaryButton} type="button" onClick={() => void handleSendTest()} disabled={sendingTest}>
              {sendingTest ? "Sending..." : "Send test email"}
            </button>
            <button style={subtleButton} type="button" onClick={() => void loadProviderStatus()}>
              Refresh provider status
            </button>
          </div>
        </div>
      </SectionCard>

      <div style={{ height: 18 }} />

      <SectionCard
        title="Filter delivery attempts"
        description="Narrow the log by event, outcome, or recipient before investigating failures."
      >
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
            Event type
            <select
              style={selectStyle}
              value={filters.eventType}
              onChange={(event) =>
                setFilters((current) => ({ ...current, eventType: event.target.value }))
              }
            >
              <option value="">All events</option>
              {Object.entries(EVENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
            Delivery state
            <select
              style={selectStyle}
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({ ...current, status: event.target.value }))
              }
            >
              <option value="">All states</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
            Recipient search
            <input
              style={inputStyle}
              value={filters.recipient}
              placeholder="customer@example.com"
              onChange={(event) =>
                setFilters((current) => ({ ...current, recipient: event.target.value }))
              }
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button style={primaryButton} type="button" onClick={() => void handleApplyFilters()}>
            Apply filters
          </button>
          <button
            style={subtleButton}
            type="button"
            onClick={() => {
              const cleared = { eventType: "", status: "", recipient: "" };
              setFilters(cleared);
              void load(cleared);
            }}
          >
            Clear filters
          </button>
        </div>
      </SectionCard>

      <div style={{ height: 18 }} />

      {error ? (
        <SectionCard title="The notifications desk could not load." description={error}>
          <button style={primaryButton} type="button" onClick={() => void load()}>
            Retry loading
          </button>
        </SectionCard>
      ) : null}

      {!error && !loading && logs.length === 0 ? (
        <EmptyStatePanel
          eyebrow="Notifications"
          title="No delivery attempts match the current filters."
          description="Once order, return, or staff invite emails run through the API, their delivery attempts will appear here."
          actionHref="/"
          actionLabel="Return to overview"
        />
      ) : null}

      {!error && logs.length > 0 ? (
        <SectionCard
          title="Recent delivery attempts"
          description="Every row is a backend delivery attempt, including retries."
        >
          <div style={{ display: "grid", gap: 12 }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "grid",
                  gap: 12,
                  border: "1px solid var(--color-border)",
                  borderRadius: 20,
                  padding: "16px 18px",
                  background: "rgba(255,253,248,0.78)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", marginBottom: 4 }}>
                      {EVENT_LABELS[log.eventType] ?? log.eventType}
                    </strong>
                    <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                      {log.recipientEmail}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={statusPill(log.status)}>{STATUS_LABELS[log.status]}</span>
                    <span
                      style={{
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        background: "rgba(179,123,31,0.08)",
                        color: "var(--color-accent)",
                        border: "1px solid rgba(179,123,31,0.14)",
                      }}
                    >
                      Attempt {log.attemptNumber}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    color: "var(--color-text-muted)",
                    fontSize: 13,
                  }}
                >
                  <div>
                    <strong style={{ display: "block", color: "var(--color-text)", marginBottom: 4 }}>
                      Subject
                    </strong>
                    {log.subject}
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "var(--color-text)", marginBottom: 4 }}>
                      Backend
                    </strong>
                    {log.backendName}
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "var(--color-text)", marginBottom: 4 }}>
                      Last attempt
                    </strong>
                    {formatDate(log.lastAttemptedAt ?? log.createdAt)}
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "var(--color-text)", marginBottom: 4 }}>
                      Retry lineage
                    </strong>
                    {log.retryOfId ? `Retry of ${log.retryOfId}` : "Original attempt"}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 16,
                    background: "rgba(245,239,226,0.75)",
                    padding: "12px 14px",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ display: "block", marginBottom: 6 }}>Provider response</strong>
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {log.providerResponse || "No provider response recorded."}
                  </span>
                  {log.errorMessage ? (
                    <>
                      <strong style={{ display: "block", marginTop: 10, marginBottom: 6 }}>
                        Failure detail
                      </strong>
                      <span style={{ color: "#b04040" }}>{log.errorMessage}</span>
                    </>
                  ) : null}
                </div>

                {log.canRetry ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      style={primaryButton}
                      type="button"
                      disabled={retryingId === log.id}
                      onClick={() => void handleRetry(log)}
                    >
                      {retryingId === log.id ? "Retrying..." : "Retry delivery"}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
