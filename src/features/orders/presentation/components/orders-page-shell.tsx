"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useOrderDesk } from "@/src/features/orders/presentation/state/use-order-desk";

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

export function OrdersPageShell() {
  const orders = useOrderDesk();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        order.orderNumber.toLowerCase().includes(normalizedQuery) ||
        order.customerName.toLowerCase().includes(normalizedQuery) ||
        order.customerEmail.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesDate = dateFilter.length === 0 || order.createdAt.startsWith(dateFilter);
      const matchesPayment = paymentFilter === "all" || order.paymentProvider === paymentFilter;

      return matchesQuery && matchesStatus && matchesDate && matchesPayment;
    });
  }, [dateFilter, orders, paymentFilter, query, statusFilter]);

  return (
    <div>
      <PageHeader
        eyebrow="Orders"
        title="Track every purchase handoff."
        description="Review order movement across payment, fulfillment, delivery, and internal staff coordination."
        actions={
          <>
            <Link href="/" style={subtleLinkStyle}>
              Return to overview
            </Link>
          </>
        }
      />

      <SectionCard
        title="Orders in motion"
        description="Search by order number or customer, filter by status or payment provider, and open an order record for fulfillment updates and internal notes."
      >
        <div
          style={{
            display: "grid",
            gap: 12,
            marginBottom: 18,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Search orders</span>
            <input
              aria-label="Search orders"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by order number, customer, or email"
              style={inputStyle}
              value={query}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Status</span>
            <select
              aria-label="Status filter"
              onChange={(event) => setStatusFilter(event.target.value)}
              style={inputStyle}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              <option value="awaiting_capture">Awaiting capture</option>
              <option value="paid">Paid</option>
              <option value="ready_to_fulfill">Ready to fulfill</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Placed on</span>
            <input
              aria-label="Placed on filter"
              onChange={(event) => setDateFilter(event.target.value)}
              style={inputStyle}
              type="date"
              value={dateFilter}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Payment</span>
            <select
              aria-label="Payment filter"
              onChange={(event) => setPaymentFilter(event.target.value)}
              style={inputStyle}
              value={paymentFilter}
            >
              <option value="all">All providers</option>
              <option value="paypal">PayPal</option>
              <option value="flutterwave">Flutterwave</option>
            </select>
          </label>
        </div>

        {orders.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Orders"
            title="No orders are moving through the desk."
            description="As new purchases come in, this queue will become the staff handoff surface."
            actionHref="/"
            actionLabel="Return to overview"
          />
        ) : filteredOrders.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Orders"
            title="No orders match the current filters."
            description="Adjust the search term or filter settings to review more of the current order desk."
            actionHref="/orders"
            actionLabel="Reset order view"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredOrders.map((order) => (
              <article
                key={order.id}
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
                    <strong style={{ fontSize: 20 }}>{order.orderNumber}</strong>
                    <span style={{ color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {order.customerName} · {order.customerEmail}
                    </span>
                  </div>
                  <span
                    style={{
                      alignSelf: "start",
                      borderRadius: "var(--radius-pill)",
                      padding: "8px 12px",
                      background:
                        order.status === "delivered"
                          ? "rgba(47, 125, 50, 0.14)"
                          : "rgba(179, 123, 31, 0.14)",
                      color:
                        order.status === "delivered"
                          ? "var(--color-success)"
                          : "var(--color-accent)",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {order.status.replaceAll("_", " ")}
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
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Placed</p>
                    <strong>{order.createdAt.slice(0, 10)}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Payment</p>
                    <strong style={{ textTransform: "capitalize" }}>{order.paymentProvider}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Total</p>
                    <strong>{order.total.formatted}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Items</p>
                    <strong>{order.lines.length} line items</strong>
                  </div>
                </div>

                <div className="dashboard-action-row">
                  <Link href={`/orders/${order.id}`} style={primaryLinkStyle}>
                    Open order
                  </Link>
                  <Link href={`/customers/${order.customerId}`} style={subtleLinkStyle}>
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
