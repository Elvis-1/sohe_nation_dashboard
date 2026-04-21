"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import type { DashboardCustomerRecord } from "@/src/core/types/dashboard";
import { fetchCustomerById } from "@/src/features/customers/data/repositories/customer-repository";
import { useOrderDesk } from "@/src/features/orders/presentation/state/use-order-desk";
import { useReturnDesk } from "@/src/features/returns/presentation/state/use-return-desk";

type Props = {
  customerId: string;
};

export function CustomerDetailPageShell({ customerId }: Props) {
  const [customer, setCustomer] = useState<DashboardCustomerRecord | null | "loading">("loading");

  useEffect(() => {
    fetchCustomerById(customerId).then(setCustomer);
  }, [customerId]);
  const orders = useOrderDesk();
  const returns = useReturnDesk();

  const resolvedCustomer = customer === "loading" ? null : customer;

  const linkedOrders = useMemo(
    () =>
      resolvedCustomer
        ? resolvedCustomer.orderIds.map((orderId) => ({
            orderId,
            record: orders.find((order) => order.id === orderId) ?? null,
          }))
        : [],
    [resolvedCustomer, orders],
  );

  const linkedReturns = useMemo(
    () =>
      resolvedCustomer
        ? resolvedCustomer.returnIds.map((returnId) => ({
            returnId,
            record: returns.find((item) => item.id === returnId) ?? null,
          }))
        : [],
    [resolvedCustomer, returns],
  );

  if (customer === "loading") return null;

  if (!resolvedCustomer) {
    return (
      <AppStateMessage
        eyebrow="Customers"
        title="This customer record is missing"
        description="The customer record could not be found. It may not exist or the ID may be incorrect."
        action={<Link href="/customers">Back to customers</Link>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Customers"
        title={`${resolvedCustomer.firstName} ${resolvedCustomer.lastName}`}
        description="Review profile context, order history, and return history, then jump into linked records that need action."
        actions={
          <Link href="/customers" style={subtleLinkStyle}>
            Back to customers
          </Link>
        }
      />

      <div style={{ display: "grid", gap: 16 }}>
        <SectionCard
          title="Profile context"
          description="Core customer information linked by email across orders and returns."
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
              <strong>{resolvedCustomer.email}</strong>
            </div>
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Default region</p>
              <strong>{resolvedCustomer.defaultRegion}</strong>
            </div>
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Saved addresses</p>
              <strong>{resolvedCustomer.addressCount}</strong>
            </div>
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Customer ID</p>
              <strong style={{ fontSize: 13, wordBreak: "break-all" }}>{resolvedCustomer.id}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Related activity"
          description="Linked order and return records that give staff the full customer context."
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
                Order history ({linkedOrders.length})
              </p>
              {linkedOrders.length === 0 ? (
                <span style={{ color: "var(--color-text-muted)" }}>No orders linked yet.</span>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {linkedOrders.map(({ orderId, record }) => (
                    <div
                      key={orderId}
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
                        <strong>{record?.orderNumber ?? orderId}</strong>
                        <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                          {record ? record.status.replaceAll("_", " ") : "Order not yet loaded"}
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
              )}
            </div>

            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 8 }}>
                Return history ({linkedReturns.length})
              </p>
              {linkedReturns.length === 0 ? (
                <span style={{ color: "var(--color-text-muted)" }}>No returns linked yet.</span>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {linkedReturns.map(({ returnId, record }) => (
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
                        <strong>{record?.id ?? returnId}</strong>
                        <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                          {record ? record.status.replaceAll("_", " ") : "Return not yet loaded"}
                        </span>
                      </span>
                      {record ? (
                        <Link href={`/returns/${record.id}`} style={linkChipStyle}>
                          Open return
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

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
