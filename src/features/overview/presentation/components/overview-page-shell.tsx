import Link from "next/link";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { getOverviewSnapshot } from "@/src/features/overview/data/repositories/mock-overview-repository";

const darkPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--radius-pill)",
  padding: "14px 18px",
  background: "var(--color-surface-inverse)",
  color: "var(--color-text-inverse)",
  fontWeight: 600,
} as const;

const lightPillStyle = {
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

export function OverviewPageShell() {
  const {
    lowStockProducts,
    overviewMetrics,
    overviewModules,
    quickActions,
    recentOrders,
    returnQueue,
  } = getOverviewSnapshot();

  const hasOverviewData =
    overviewMetrics.length > 0 ||
    quickActions.length > 0 ||
    recentOrders.length > 0 ||
    lowStockProducts.length > 0 ||
    returnQueue.length > 0 ||
    overviewModules.length > 0;

  if (!hasOverviewData) {
    return (
      <div>
        <PageHeader
          eyebrow="Overview"
          title="Daily control across the line."
          description="The command surface is ready, but no fixture data has been staged yet."
        />
        <EmptyStatePanel
          eyebrow="Overview"
          title="No operational signals are live yet."
          description="Once products, orders, returns, and content fixtures are available, this overview will summarize the store state and route staff into the next operational action."
          actionHref="/products"
          actionLabel="Open products"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Daily operations at a glance."
        description="A quick snapshot of orders, revenue, low stock, and returns awaiting review, with direct paths into the modules staff need next."
        actions={
          <>
            <Link href="/orders" style={darkPillStyle}>
              Review orders
            </Link>
            <Link href="/products" style={lightPillStyle}>
              Review stock
            </Link>
          </>
        }
      />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {overviewMetrics.map((metric) => {
          const background =
            metric.emphasis === "primary"
              ? "rgba(179, 123, 31, 0.12)"
              : metric.emphasis === "warning"
                ? "rgba(201, 122, 20, 0.12)"
                : "var(--color-surface)";

          const borderColor =
            metric.emphasis === "primary"
              ? "var(--color-border-strong)"
              : metric.emphasis === "warning"
                ? "rgba(201, 122, 20, 0.4)"
                : "var(--color-border)";

          return (
            <section
              key={metric.label}
              style={{
                border: `1px solid ${borderColor}`,
                borderRadius: 24,
                padding: 22,
                background,
              }}
            >
              <p
                style={{
                  marginBottom: 10,
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                {metric.label}
              </p>
              <strong style={{ display: "block", fontSize: 30 }}>{metric.value}</strong>
              <p style={{ marginTop: 8, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                {metric.note}
              </p>
            </section>
          );
        })}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {quickActions.map((action) => (
          <SectionCard key={action.label} title={action.label} description={action.description}>
            <Link href={action.href} style={lightPillStyle}>
              Open module
            </Link>
          </SectionCard>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 16,
        }}
      >
        <SectionCard
          title="Recent orders"
          description="The latest movement coming from the fixture-mode checkout and account history flow."
        >
          {recentOrders.length === 0 ? (
            <EmptyStatePanel
              eyebrow="Orders"
              title="No recent orders are staged."
              description="Recent purchases will appear here once order fixtures are available."
              actionHref="/orders"
              actionLabel="Open orders"
            />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    padding: "16px",
                    borderRadius: 18,
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <p style={{ marginTop: 6, color: "var(--color-text-muted)" }}>
                      {order.customerName} · {order.paymentProvider}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong>{order.total.formatted}</strong>
                    <p
                      style={{
                        marginTop: 6,
                        color: "var(--color-accent)",
                        textTransform: "capitalize",
                      }}
                    >
                      {order.status.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div style={{ display: "grid", gap: 16 }}>
          <SectionCard
            title="Low stock watch"
            description="The next product records most likely to need a stock update or merchandising change."
          >
            {lowStockProducts.length === 0 ? (
              <EmptyStatePanel
                eyebrow="Inventory"
                title="No low-stock products need attention."
                description="This panel will call out inventory pressure once product fixtures hit the low-stock threshold."
                actionHref="/products"
                actionLabel="Open products"
              />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      border: "1px solid var(--color-border)",
                      borderRadius: 18,
                      padding: "14px 16px",
                    }}
                  >
                    <div>
                      <strong>{product.title}</strong>
                      <p style={{ marginTop: 6, color: "var(--color-text-muted)" }}>
                        {product.audience}
                      </p>
                    </div>
                    <span style={{ color: "var(--color-warning)", fontWeight: 600 }}>
                      {product.inventoryQuantity} units left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Returns pending"
            description="A compact queue view so staff can see what needs review before opening the returns desk."
          >
            {returnQueue.length === 0 ? (
              <EmptyStatePanel
                eyebrow="Returns"
                title="No returns are awaiting review."
                description="Return requests will appear here once customers submit them through the account flow."
                actionHref="/returns"
                actionLabel="Open returns"
              />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {returnQueue.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "grid",
                      gap: 6,
                      border: "1px solid var(--color-border)",
                      borderRadius: 18,
                      padding: "14px 16px",
                    }}
                  >
                    <strong>
                      {item.id} · {item.customerName}
                    </strong>
                    <span
                      style={{
                        color: "var(--color-accent)",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {item.status.replaceAll("_", " ")}
                    </span>
                    <p style={{ color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {overviewModules.map((module) => (
          <SectionCard key={module.title} title={module.title} description={module.description}>
            <p
              style={{
                marginBottom: 16,
                color: "var(--color-accent)",
                fontWeight: 600,
              }}
            >
              {module.stat}
            </p>
            <Link href={module.href} style={lightPillStyle}>
              Open {module.title.toLowerCase()}
            </Link>
          </SectionCard>
        ))}
      </section>
    </div>
  );
}
