"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { getCustomerById } from "@/src/features/customers/data/repositories/mock-customer-repository";
import { getOrderByOrderNumber } from "@/src/features/orders/data/repositories/order-repository";
import { useOrderDesk } from "@/src/features/orders/presentation/state/use-order-desk";
import { useReturnDesk } from "@/src/features/returns/presentation/state/use-return-desk";

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
  const orders = useOrderDesk();
  const returns = useReturnDesk();

  const linkedOrders = useMemo(
    () =>
      customer
        ? customer.orderIds.map((orderNumber) => ({
            orderNumber,
            record:
              orders.find((order) => order.orderNumber === orderNumber) ??
              getOrderByOrderNumber(orderNumber),
          }))
        : [],
    [customer, orders],
  );
  const linkedReturns = useMemo(
    () =>
      customer
        ? customer.returnIds.map((returnId) => ({
            returnId,
            record: returns.find((item) => item.id === returnId) ?? null,
          }))
        : [],
    [customer, returns],
  );

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
        description="Review profile context, saved addresses, order history, and return history, then jump into the linked records that need action."
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
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Customer ID</p>
              <strong>{customer.id}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Related activity"
          description="Linked order and return records that give staff the full customer context inside the dashboard."
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
                {linkedOrders.map(({ orderNumber, record }) => (
                  <div
                    key={orderNumber}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      border: "1px solid var(--color-border)",
                      borderRadius: 16,
                      padding: "12px 14px",
                      background: "rgba(255, 253, 248, 0.82)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ display: "grid", gap: 4 }}>
                      <strong>{orderNumber}</strong>
                      <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                        {record ? record.status.replaceAll("_", " ") : "Archive-linked order"}
                      </span>
                    </span>
                    {record ? (
                      <Link href={`/orders/${record.id}`} style={linkChipStyle}>
                        Open order
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 8 }}>
                Return history
              </p>
              <div style={{ display: "grid", gap: 8 }}>
                {linkedReturns.length > 0 ? (
                  linkedReturns.map(({ returnId, record }) => (
                    <div
                      key={returnId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        border: "1px solid var(--color-border)",
                        borderRadius: 16,
                        padding: "12px 14px",
                        background: "rgba(255, 253, 248, 0.82)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ display: "grid", gap: 4 }}>
                        <strong>{returnId}</strong>
                        <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                          {record ? record.status.replaceAll("_", " ") : "Archive-linked return"}
                        </span>
                      </span>
                      {record ? (
                        <Link href={`/returns/${record.id}`} style={linkChipStyle}>
                          Open return
                        </Link>
                      ) : null}
                    </div>
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

const linkChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--radius-pill)",
  padding: "10px 14px",
  border: "1px solid var(--color-border)",
  background: "rgba(255, 253, 248, 0.82)",
  color: "var(--color-text)",
  fontWeight: 600,
} as const;
