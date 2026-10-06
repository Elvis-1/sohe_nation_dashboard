"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useToast } from "@/src/core/ui/toast";
import type { DashboardOrderRecord } from "@/src/core/types/dashboard";
import { ApiError } from "@/src/core/api/http-client";
import {
  archiveOrderRecord,
  loadOrderIntoDesk,
  retryOrdersLoad,
  updateOrderRecord,
} from "@/src/features/orders/data/repositories/order-repository";
import {
  useOrderDesk,
  useOrderDeskError,
  useOrderDeskStatus,
} from "@/src/features/orders/presentation/state/use-order-desk";

type OrderDetailPageShellProps = {
  orderId: string;
};


/** Courier-ready address lines; falls back to the text snapshot for older orders. */
function formatShippingLines(order: DashboardOrderRecord): string[] {
  const details = order.shippingDetails;
  if (!details) return [order.shippingAddress];
  return [
    details.phone ? `${details.recipientName} · ${details.phone}` : details.recipientName,
    details.line1,
    details.line2,
    [details.city, details.state, details.postalCode].filter(Boolean).join(", "),
    details.countryCode,
  ].filter(Boolean);
}
export function OrderDetailPageShell({ orderId }: OrderDetailPageShellProps) {
  const orders = useOrderDesk();
  const ordersError = useOrderDeskError();
  const deskStatus = useOrderDeskStatus();
  const order = useMemo(
    () => orders.find((item) => item.id === orderId) ?? null,
    [orderId, orders],
  );
  // Orders missing from the loaded desk are looked up directly before showing "missing".
  const [lookedUpOrderId, setLookedUpOrderId] = useState<string | null>(null);
  const needsLookup = deskStatus === "ready" && !order && lookedUpOrderId !== orderId;

  useEffect(() => {
    if (!needsLookup) return;
    let isActive = true;
    void loadOrderIntoDesk(orderId).then(() => {
      if (isActive) setLookedUpOrderId(orderId);
    });
    return () => {
      isActive = false;
    };
  }, [needsLookup, orderId]);

  if (ordersError) {
    return (
      <AppStateMessage
        eyebrow="Orders"
        title="The order desk could not load."
        description={`The dashboard could not read orders from the API. ${ordersError.message}`}
        actionLabel="Retry"
        onAction={retryOrdersLoad}
      />
    );
  }

  if (!order && (deskStatus === "loading" || needsLookup)) {
    return (
      <AppStateMessage
        eyebrow="Orders"
        title="Loading order"
        description="Reading this order from the API."
      />
    );
  }

  if (!order) {
    return (
      <AppStateMessage
        eyebrow="Orders"
        title="This order record is missing"
        description="The order you tried to open does not exist or has been archived."
        action={<Link href="/orders">Back to orders</Link>}
      />
    );
  }

  return <OrderDetailEditor key={order.id} order={order} />;
}

function OrderDetailEditor({ order }: { order: DashboardOrderRecord }) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState<DashboardOrderRecord["status"]>(order.status);
  const [fulfillmentNote, setFulfillmentNote] = useState(order.fulfillmentNote);
  const [internalNote, setInternalNote] = useState(order.internalNote);
  const canArchive = order.status === "cancelled" || order.status === "delivered";

  async function handleSave() {
    try {
      await updateOrderRecord({
        ...order,
        status,
        fulfillmentNote,
        internalNote,
      });

      toast.success("Order updates saved.");
    } catch (error) {
      if (error instanceof ApiError && error.code === "invalid_order_transition") {
        toast.error(`Can't move to "${status}" from "${order.status}". Check the allowed order status flow.`);
        return;
      }
      toast.error(error instanceof ApiError ? error.message : "Unable to save order updates right now.");
    }
  }

  async function handleArchive() {
    try {
      await archiveOrderRecord(order.id);
      toast.success("Order archived.");
      router.push("/orders");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to archive order.");
      return;
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Orders"
        title={`Order ${order.orderNumber}`}
        description="Review fulfillment state, payment method, customer details, shipping details, and internal staff notes in one place."
        actions={
          <>
            <Link
              href="/orders"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-pill)",
                padding: "14px 18px",
                border: "1px solid var(--color-border)",
                background: "rgba(255, 253, 248, 0.82)",
                color: "var(--color-text)",
                fontWeight: 600,
              }}
            >
              Back to orders
            </Link>
          </>
        }
      />

      <div style={{ display: "grid", gap: 16 }}>
        <SectionCard
          title="Order summary"
          description="The core order context already implied by checkout and account history."
        >
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Customer</p>
              <strong>{order.customerName}</strong>
              <p style={{ marginTop: 4, color: "var(--color-text-muted)" }}>{order.customerEmail}</p>
            </div>
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
            <div style={{ gridColumn: "1 / -1" }}>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Shipping address</p>
              <strong style={{ whiteSpace: "pre-line" }}>{formatShippingLines(order).join("\n")}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Line items"
          description="Items staged inside the order for fulfillment review."
        >
          <div style={{ display: "grid", gap: 12 }}>
            {order.lines.map((line) => (
              <div
                key={line.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                  border: "1px solid var(--color-border)",
                  borderRadius: 18,
                  padding: "16px",
                }}
              >
                <div>
                  <strong>{line.title}</strong>
                  <p style={{ marginTop: 6, color: "var(--color-text-muted)" }}>{line.variantLabel}</p>
                </div>
                <span>{line.unitPrice.formatted}</span>
                <span>{line.quantity} qty</span>
                <span>{line.variantId}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Fulfillment control"
          description="Update the order lifecycle state and capture the next staff handoff note."
        >
          <div style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Fulfillment status</span>
              <select
                aria-label="Fulfillment status"
                onChange={(event) => setStatus(event.target.value as DashboardOrderRecord["status"])}
                style={inputStyle}
                value={status}
              >
                <option value="awaiting_capture">Awaiting capture</option>
                <option value="paid">Paid</option>
                <option value="ready_to_fulfill">Ready to fulfill</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Fulfillment note</span>
              <textarea
                aria-label="Fulfillment note"
                onChange={(event) => setFulfillmentNote(event.target.value)}
                rows={4}
                style={textareaStyle}
                value={fulfillmentNote}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard
          title="Internal notes"
          description="Capture the staff-only context that should stay attached to this order record."
        >
          <label style={{ display: "grid", gap: 8 }}>
            <span>Internal note</span>
            <textarea
              aria-label="Internal note"
              onChange={(event) => setInternalNote(event.target.value)}
              rows={5}
              style={textareaStyle}
              value={internalNote}
            />
          </label>

          <div className="dashboard-action-row" style={{ marginTop: 16 }}>
            <button onClick={handleSave} style={primaryButtonStyle} type="button">
              Save order updates
            </button>
            <button
              onClick={handleArchive}
              style={dangerButtonStyle}
              type="button"
              disabled={!canArchive}
              title={!canArchive ? "Only delivered or cancelled orders can be archived." : undefined}
            >
              Archive order
            </button>
            <Link href={`/customers/${order.customerId}`} style={secondaryLinkStyle}>
              Open customer
            </Link>
          </div>

        </SectionCard>
      </div>
    </div>
  );
}

const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "var(--color-surface)",
} as const;

const textareaStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "var(--color-surface)",
  resize: "vertical" as const,
} as const;

const primaryButtonStyle = {
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

const secondaryLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  padding: "14px 18px",
  background: "rgba(255, 253, 248, 0.82)",
  color: "var(--color-text)",
  fontWeight: 600,
} as const;

const dangerButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #a64f43",
  borderRadius: "var(--radius-pill)",
  padding: "14px 18px",
  background: "rgba(110, 58, 50, 0.16)",
  color: "#8f2f24",
  fontWeight: 600,
  cursor: "pointer",
} as const;
