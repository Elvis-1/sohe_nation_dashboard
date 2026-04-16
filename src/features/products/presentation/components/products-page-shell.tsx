import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { ModuleStatePanel } from "@/src/core/ui/module-state-panel";
import { SectionCard } from "@/src/core/ui/section-card";
import { listProducts } from "@/src/features/products/data/repositories/mock-product-repository";

export function ProductsPageShell() {
  const products = listProducts();

  return (
    <div>
      <PageHeader
        eyebrow="Products"
        title="Catalog control for discovery and PDP."
        description="This module will own the fixture-backed product list, editor, status control, and merchandising fields that power the storefront catalog and detail pages."
      />
      <SectionCard
        title="Product list"
        description="First-pass scaffold for search, filtering, creation, and editing."
      >
        {products.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Products"
            title="The catalog desk is empty right now."
            description="Once fixture or live product records exist, they will appear here for merchandising and operational review."
            actionHref="/"
            actionLabel="Return to overview"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.8fr 0.7fr 0.7fr",
                  gap: 12,
                  border: "1px solid var(--color-border)",
                  borderRadius: 18,
                  padding: "16px",
                }}
              >
                <strong>{product.title}</strong>
                <span style={{ textTransform: "capitalize" }}>{product.audience}</span>
                <span>{product.price.formatted}</span>
                <span style={{ color: "var(--color-accent)", textTransform: "capitalize" }}>
                  {product.visibility}
                </span>
                <span style={{ color: "var(--color-text-muted)" }}>
                  {product.inventoryQuantity} units
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <div style={{ marginTop: 16 }}>
        <ModuleStatePanel
          eyebrow="Module state"
          title="Editor flow is the next product milestone."
          description="This shared state panel marks the next product-specific step: turning the list scaffold into a full product editor with draft, publish, and variant handling."
          nextLabel="Return to overview"
          nextHref="/"
        />
      </div>
    </div>
  );
}
