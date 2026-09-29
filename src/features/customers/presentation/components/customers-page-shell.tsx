"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { CUSTOMER_PAGE_SIZE } from "@/src/features/customers/data/repositories/customer-repository";
import { useCustomerSearch } from "@/src/features/customers/presentation/state/use-customer-search";

const REGIONS = [
  { value: "", label: "All regions" },
  { value: "NG", label: "Nigeria (NG)" },
  { value: "US", label: "United States (US)" },
  { value: "GB", label: "United Kingdom (GB)" },
  { value: "EU", label: "European Union (EU)" },
];

const SEARCH_DEBOUNCE_MS = 300;

export function CustomersPageShell() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [page, setPage] = useState(1);
  const { status, customers, count, error, retry } = useCustomerSearch({ search, region, page });
  const pageCount = Math.max(1, Math.ceil(count / CUSTOMER_PAGE_SIZE));
  const hasFilters = Boolean(search.trim() || region);

  // Wait for typing to pause before asking the API, and start the new search on page 1.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <PageHeader
        eyebrow="Customers"
        title="Profile, order, and return context in one place."
        description="Search by name, email, or customer ID, then open a customer record with linked order and return context."
        actions={
          <Link href="/" style={subtleLinkStyle}>
            Return to overview
          </Link>
        }
      />
      <SectionCard
        title="Customer list"
        description="Look up a customer by name, email, or customer ID before opening the full record."
      >
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            marginBottom: 18,
          }}
        >
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Search customers</span>
            <input
              aria-label="Search customers"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or customer ID"
              style={inputStyle}
              value={query}
            />
          </label>
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Region</span>
            <select
              aria-label="Filter by region"
              onChange={(event) => {
                setRegion(event.target.value);
                setPage(1);
              }}
              style={inputStyle}
              value={region}
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>
        </div>

        {status === "error" ? (
          <div style={{ display: "grid", gap: 12 }}>
            <EmptyStatePanel
              eyebrow="Customers"
              title="Customer records could not be loaded."
              description={`The dashboard could not reach customer data: ${error}`}
              actionLabel="Reset customer list"
              actionHref="/customers"
            />
            <div>
              <button type="button" onClick={retry} style={retryButtonStyle}>
                Retry now
              </button>
            </div>
          </div>
        ) : status === "loading" ? (
          <p style={{ color: "var(--color-text-muted)" }}>Loading customer records...</p>
        ) : customers.length === 0 && !hasFilters ? (
          <EmptyStatePanel
            eyebrow="Customers"
            title="No customer records yet."
            description="Customer records are created when a customer account is registered, signs in, or saves an address."
            actionHref="/"
            actionLabel="Return to overview"
          />
        ) : customers.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Customers"
            title="No customer records match the current search."
            description="Adjust the search or region to find the customer you are looking for."
            actionHref="/customers"
            actionLabel="Reset customer search"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {customers.map((customer) => (
              <article
                key={customer.id}
                style={{
                  display: "grid",
                  gap: 14,
                  border: "1px solid var(--color-border)",
                  borderRadius: 20,
                  padding: "18px",
                  background: "rgba(255, 253, 248, 0.82)",
                }}
              >
                <div className="dashboard-split-row dashboard-split-row--center">
                  <div style={{ display: "grid", gap: 6 }}>
                    <strong style={{ fontSize: 20 }}>
                      {customer.firstName} {customer.lastName}
                    </strong>
                    <span style={{ color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {customer.email} · {customer.id}
                    </span>
                  </div>
                  <span
                    style={{
                      borderRadius: "var(--radius-pill)",
                      padding: "8px 12px",
                      background: "rgba(179, 123, 31, 0.14)",
                      color: "var(--color-accent)",
                      fontWeight: 600,
                    }}
                  >
                    {customer.defaultRegion}
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
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Addresses</p>
                    <strong>{customer.addressCount}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Orders</p>
                    <strong>{customer.orderCount}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Returns</p>
                    <strong>{customer.returnCount}</strong>
                  </div>
                </div>

                <div className="dashboard-action-row">
                  <Link href={`/customers/${customer.id}`} style={primaryLinkStyle}>
                    Open customer
                  </Link>
                </div>
              </article>
            ))}
            <nav
              aria-label="Customer pages"
              className="dashboard-split-row dashboard-split-row--center"
              style={{ marginTop: 6 }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>
                Page {page} of {pageCount} · {count} customer{count === 1 ? "" : "s"}
              </span>
              <div className="dashboard-action-row">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  style={retryButtonStyle}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  disabled={page >= pageCount}
                  style={retryButtonStyle}
                >
                  Next
                </button>
              </div>
            </nav>
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

const retryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  padding: "12px 16px",
  background: "rgba(255, 253, 248, 0.82)",
  color: "var(--color-text)",
  fontWeight: 600,
  cursor: "pointer",
} as const;
