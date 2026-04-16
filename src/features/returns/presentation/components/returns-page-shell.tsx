"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useReturnDesk } from "@/src/features/returns/presentation/state/use-return-desk";

const primaryLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--radius-pill)",
  padding: "14px 18px",
  background: "var(--color-surface-inverse)",
  color: "var(--color-text-inverse)",
  fontWeight: 600,
} as const;

const subtleLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--radius-pill)",
  padding: "14px 18px",
  border: "1px solid var(--color-border)",
  background: "rgba(255, 253, 248, 0.82)",
  color: "var(--color-text)",
  fontWeight: 600,
} as const;

export function ReturnsPageShell() {
  const returns = useReturnDesk();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReturns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return returns.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.id.toLowerCase().includes(normalizedQuery) ||
        item.orderId.toLowerCase().includes(normalizedQuery) ||
        item.customerName.toLowerCase().includes(normalizedQuery) ||
        item.customerEmail.toLowerCase().includes(normalizedQuery) ||
        item.reason.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, returns, statusFilter]);

  return (
    <div>
      <PageHeader
        eyebrow="Returns"
        title="Process customer requests with a clear queue."
        description="Review the queue, filter by lifecycle status, open a return record, and capture the internal decision that moves the request forward."
        actions={
          <Link href="/" style={subtleLinkStyle}>
            Return to overview
          </Link>
        }
      />

      <SectionCard
        title="Returns queue"
        description="Search by return, order, or customer and filter by lifecycle status before opening the request detail."
      >
        <div
          style={{
            display: "grid",
            gap: 12,
            marginBottom: 18,
            gridTemplateColumns: "1.4fr 0.8fr",
          }}
        >
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Search returns</span>
            <input
              aria-label="Search returns"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by return ID, order ID, customer, or reason"
              style={inputStyle}
              value={query}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Status</span>
            <select
              aria-label="Return status filter"
              onChange={(event) => setStatusFilter(event.target.value)}
              style={inputStyle}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="in_review">In review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>

        {returns.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Returns"
            title="No return requests are waiting."
            description="Once the account returns flow sends fixture requests through the dashboard, they will appear here for staff review."
            actionHref="/"
            actionLabel="Return to overview"
          />
        ) : filteredReturns.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Returns"
            title="No return requests match the current filters."
            description="Adjust the current search or lifecycle filter to review more of the queue."
            actionHref="/returns"
            actionLabel="Reset return queue"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredReturns.map((item) => (
              <article
                key={item.id}
                style={{
                  display: "grid",
                  gap: 14,
                  border: "1px solid var(--color-border)",
                  borderRadius: 20,
                  padding: "18px",
                  background: "rgba(255, 253, 248, 0.82)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "grid", gap: 6 }}>
                    <strong style={{ fontSize: 20 }}>{item.id}</strong>
                    <span style={{ color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {item.customerName} · {item.customerEmail}
                    </span>
                  </div>
                  <span
                    style={{
                      borderRadius: "var(--radius-pill)",
                      padding: "8px 12px",
                      background:
                        item.status === "approved" || item.status === "completed"
                          ? "rgba(47, 125, 50, 0.14)"
                          : item.status === "rejected"
                            ? "rgba(160, 52, 52, 0.14)"
                            : "rgba(179, 123, 31, 0.14)",
                      color:
                        item.status === "approved" || item.status === "completed"
                          ? "var(--color-success)"
                          : item.status === "rejected"
                            ? "var(--color-danger, #a03434)"
                            : "var(--color-accent)",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {item.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Order</p>
                    <strong>{item.orderId}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Requested</p>
                    <strong>{item.requestedAt.slice(0, 10)}</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Item</p>
                    <strong>{item.itemSummary}</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Reason</p>
                    <strong>{item.reason}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href={`/returns/${item.id}`} style={primaryLinkStyle}>
                    Open return
                  </Link>
                  <Link href={`/customers/${item.customerId}`} style={subtleLinkStyle}>
                    Open customer
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "var(--color-surface)",
} as const;
