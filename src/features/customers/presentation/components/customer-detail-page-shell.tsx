"use client";

import Link from "next/link";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { getCustomerById } from "@/src/features/customers/data/repositories/mock-customer-repository";

type CustomerDetailPageShellProps = {
  customerId: string;
};

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

export function CustomerDetailPageShell({ customerId }: CustomerDetailPageShellProps) {
  const customer = getCustomerById(customerId);

  if (!customer) {
    return (
      <AppStateMessage
        eyebrow="Customers"
        title="This customer record is missing"
        description="The customer you tried to open is not available in the current fixture directory."
        action={<Link href="/customers">Back to customers</Link>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Customers"
        title={`${customer.firstName} ${customer.lastName}`}
        description="This lightweight customer record exists so orders can hand staff into the right profile context before the full customers phase lands."
        actions={
          <Link href="/customers" style={subtleLinkStyle}>
            Back to customers
          </Link>
        }
      />

      <div style={{ display: "grid", gap: 16 }}>
        <SectionCard
          title="Profile context"
          description="Core customer information already implied by checkout, order history, and returns."
        >
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Email</p>
              <strong>{customer.email}</strong>
            </div>
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Default region</p>
              <strong>{customer.defaultRegion}</strong>
            </div>
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Saved addresses</p>
              <strong>{customer.addressCount}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Related activity"
          description="This keeps the order handoff meaningful without pulling the full customer workflow into Phase 4."
        >
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 8 }}>
                Order history
              </p>
              <div style={{ display: "grid", gap: 8 }}>
                {customer.orderIds.map((orderId) => (
                  <span
                    key={orderId}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: 16,
                      padding: "12px 14px",
                      background: "rgba(255, 253, 248, 0.82)",
                    }}
                  >
                    {orderId}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 8 }}>
                Return history
              </p>
              <div style={{ display: "grid", gap: 8 }}>
                {customer.returnIds.length > 0 ? (
                  customer.returnIds.map((returnId) => (
                    <span
                      key={returnId}
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: 16,
                        padding: "12px 14px",
                        background: "rgba(255, 253, 248, 0.82)",
                      }}
                    >
                      {returnId}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "var(--color-text-muted)" }}>No returns linked yet.</span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
