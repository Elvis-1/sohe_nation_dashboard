"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { listCustomers } from "@/src/features/customers/data/repositories/mock-customer-repository";

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

export function CustomersPageShell() {
  const customers = listCustomers();
  const [query, setQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return customers.filter((customer) => {
      if (normalizedQuery.length === 0) {
        return true;
      }

      return (
        customer.id.toLowerCase().includes(normalizedQuery) ||
        customer.email.toLowerCase().includes(normalizedQuery) ||
        customer.firstName.toLowerCase().includes(normalizedQuery) ||
        customer.lastName.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [customers, query]);

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
        <label style={{ display: "grid", gap: 8, marginBottom: 18 }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Search customers</span>
          <input
            aria-label="Search customers"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or customer ID"
            style={inputStyle}
            value={query}
          />
        </label>

        {customers.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Customers"
            title="No customer records are linked yet."
            description="Account fixtures will populate this surface once customer, order, and return relationships are staged."
            actionHref="/"
            actionLabel="Return to overview"
          />
        ) : filteredCustomers.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Customers"
            title="No customer records match the current search."
            description="Adjust the current customer lookup to review more of the fixture directory."
            actionHref="/customers"
            actionLabel="Reset customer search"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredCustomers.map((customer) => (
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
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
                    <strong>{customer.orderIds.length}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Returns</p>
                    <strong>{customer.returnIds.length}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href={`/customers/${customer.id}`} style={primaryLinkStyle}>
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
