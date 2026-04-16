import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { ModuleStatePanel } from "@/src/core/ui/module-state-panel";
import { SectionCard } from "@/src/core/ui/section-card";
import { listOrders } from "@/src/features/orders/data/repositories/mock-order-repository";

export function OrdersPageShell() {
  const orders = listOrders();

  return (
    <div>
      <PageHeader
        eyebrow="Orders"
        title="Track every purchase handoff."
        description="The orders module will manage fixture-mode order review, fulfillment updates, payment visibility, and internal notes before API wiring begins."
      />
      <SectionCard
        title="Orders in motion"
        description="Scaffolded list view for status filtering and drill-down into order detail."
      >
        {orders.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Orders"
            title="No orders are moving through the desk."
            description="As checkout and account fixtures create order history, this queue will become the staff handoff surface."
            actionHref="/"
            actionLabel="Return to overview"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.8fr 1fr 0.9fr 0.8fr 0.8fr",
                  gap: 12,
                  border: "1px solid var(--color-border)",
                  borderRadius: 18,
                  padding: "16px",
                }}
              >
                <strong>{order.orderNumber}</strong>
                <span>{order.customerName}</span>
                <span style={{ color: "var(--color-accent)", textTransform: "capitalize" }}>
                  {order.status.replaceAll("_", " ")}
                </span>
                <span style={{ textTransform: "capitalize" }}>{order.paymentProvider}</span>
                <span>{order.total.formatted}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <div style={{ marginTop: 16 }}>
        <ModuleStatePanel
          eyebrow="Module state"
          title="Order detail and internal notes are still to come."
          description="The shared admin state pattern is now in place while the deeper order desk flow is still pending its dedicated phase."
          nextLabel="Back to overview"
          nextHref="/"
        />
      </div>
    </div>
  );
}
