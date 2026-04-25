"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useContentDesk } from "@/src/features/content/presentation/state/use-content-desk";
import {
  subscribeToStoredOrders,
  getStoredOrdersSnapshot,
  getServerOrdersSnapshot,
} from "@/src/features/orders/data/repositories/order-repository";
import {
  subscribeToProducts,
  getProductsSnapshot,
  getServerProductsSnapshot,
} from "@/src/features/products/data/repositories/product-repository";
import {
  subscribeToStoredReturns,
  getStoredReturnsSnapshot,
  getServerReturnsSnapshot,
} from "@/src/features/returns/data/repositories/return-repository";

const LOW_STOCK_THRESHOLD = 5;

function formatNgn(amount: number): string {
  return `NGN ${Math.round(amount).toLocaleString("en-NG")}`;
}

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
  const allOrders = useSyncExternalStore(
    subscribeToStoredOrders,
    getStoredOrdersSnapshot,
    getServerOrdersSnapshot,
  );
  const allProducts = useSyncExternalStore(
    subscribeToProducts,
    getProductsSnapshot,
    getServerProductsSnapshot,
  );
  const allReturns = useSyncExternalStore(
    subscribeToStoredReturns,
    getStoredReturnsSnapshot,
    getServerReturnsSnapshot,
  );
  const allContent = useContentDesk();

  const recentOrders = useMemo(() => allOrders.slice(0, 3), [allOrders]);
  const lowStockProducts = useMemo(
    () => allProducts.filter((p) => p.inventoryQuantity <= LOW_STOCK_THRESHOLD),
    [allProducts],
  );
  const returnQueue = useMemo(
    () => allReturns.filter((r) => r.status === "new" || r.status === "in_review"),
    [allReturns],
  );

  const publishedProductCount = useMemo(
    () => allProducts.filter((p) => p.visibility === "published").length,
    [allProducts],
  );
  const ordersInMotion = useMemo(
    () => allOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length,
    [allOrders],
  );
  const totalRevenue = useMemo(
    () => allOrders.reduce((sum, o) => sum + o.total.amount, 0),
    [allOrders],
  );
  const publishedContentCount = useMemo(
    () => allContent.filter((entry) => entry.visibility === "published").length,
    [allContent],
  );
  const quickActions = useMemo(
    () => [
      {
        label: "Review returns queue",
        description:
          returnQueue.length > 0
            ? `${returnQueue.length} customer request${returnQueue.length === 1 ? "" : "s"} need attention.`
            : "No returns are pending right now, but the queue is ready for the next request.",
        href: "/returns",
      },
      {
        label: "Restock low inventory",
        description:
          lowStockProducts.length > 0
            ? `${lowStockProducts.length} SKU${lowStockProducts.length === 1 ? "" : "s"} are at or below the stock threshold.`
            : "Catalog inventory is currently above the low-stock threshold.",
        href: "/products",
      },
      {
        label: "Review live content",
        description:
          publishedContentCount > 0
            ? `${publishedContentCount} content record${publishedContentCount === 1 ? "" : "s"} are published to storefront surfaces.`
            : "No content records are published yet. Review draft and ready states in the content desk.",
        href: "/content",
      },
    ],
    [lowStockProducts.length, publishedContentCount, returnQueue.length],
  );

  const liveMetrics = [
    {
      label: "Published products",
      value: String(publishedProductCount),
      note: `${allProducts.length} total in catalog`,
      emphasis: "primary" as const,
    },
    {
      label: "Revenue staged",
      value: formatNgn(totalRevenue),
      note: `Across ${allOrders.length} order${allOrders.length === 1 ? "" : "s"}`,
      emphasis: "default" as const,
    },
    {
      label: "Low stock",
      value: `${lowStockProducts.length} SKU${lowStockProducts.length === 1 ? "" : "s"}`,
      note: `Products at ${LOW_STOCK_THRESHOLD} units or fewer`,
      emphasis: lowStockProducts.length > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Returns pending",
      value: String(returnQueue.length),
      note: "New and in-review requests",
      emphasis: returnQueue.length > 0 ? ("default" as const) : ("default" as const),
    },
  ];

  const liveModules = [
    {
      title: "Products",
      description: "Catalog control for prices, stock, variants, and visibility.",
      href: "/products",
      stat: `${publishedProductCount} published · ${allProducts.length} total`,
    },
    {
      title: "Orders",
      description: "Payment, fulfillment, and internal movement across every purchase.",
      href: "/orders",
      stat: `${ordersInMotion} order${ordersInMotion === 1 ? "" : "s"} in motion`,
    },
    {
      title: "Content",
      description: "Homepage, stories, and merchandising spotlight management.",
      href: "/content",
      stat: `${publishedContentCount} published · ${allContent.length} total`,
    },
    {
      title: "Returns",
      description: "Customer return queue, review outcomes, and operational follow-through.",
      href: "/returns",
      stat: `${returnQueue.length} awaiting review`,
    },
  ];

  const hasOverviewData =
    liveMetrics.length > 0 ||
    quickActions.length > 0 ||
    recentOrders.length > 0 ||
    lowStockProducts.length > 0 ||
    returnQueue.length > 0 ||
    liveModules.length > 0;

  if (!hasOverviewData) {
    return (
      <div>
        <PageHeader
          eyebrow="Overview"
          title="Daily control across the line."
          description="The command surface is ready, but no data has been staged yet."
        />
        <EmptyStatePanel
          eyebrow="Overview"
          title="No operational signals are live yet."
          description="Once products, orders, and returns are available, this overview will summarize the store state and route staff into the next operational action."
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
        {liveMetrics.map((metric) => {
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
              Open desk
            </Link>
          </SectionCard>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <SectionCard
          title="Recent orders"
          description="The three most recent orders from the live backend."
        >
          {recentOrders.length === 0 ? (
            <EmptyStatePanel
              eyebrow="Orders"
              title="No orders yet."
              description="Recent orders will appear here once they are created."
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
                  <div style={{ textAlign: "left" }}>
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
            description={`Products with ${LOW_STOCK_THRESHOLD} or fewer units across all variants.`}
          >
            {lowStockProducts.length === 0 ? (
              <EmptyStatePanel
                eyebrow="Inventory"
                title="No low-stock products need attention."
                description="Products hitting the low-stock threshold will appear here."
                actionHref="/products"
                actionLabel="Open products"
              />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: 18,
                      padding: "14px 16px",
                    }}
                    className="dashboard-split-row dashboard-split-row--center"
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
            description="Return requests with status New or In Review awaiting staff action."
          >
            {returnQueue.length === 0 ? (
              <EmptyStatePanel
                eyebrow="Returns"
                title="No returns are awaiting review."
                description="Return requests will appear here once customers submit them."
                actionHref="/returns"
                actionLabel="Open returns"
              />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {returnQueue.map((item) => (
                  <Link
                    key={item.id}
                    href={`/returns/${item.id}`}
                    style={{
                      display: "grid",
                      gap: 6,
                      border: "1px solid var(--color-border)",
                      borderRadius: 18,
                      padding: "14px 16px",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <strong>
                      {item.customerName} · {item.orderId}
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
                  </Link>
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
        {liveModules.map((module) => (
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
