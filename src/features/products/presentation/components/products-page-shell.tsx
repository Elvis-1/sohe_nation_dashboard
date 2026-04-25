"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useProductCatalog } from "@/src/features/products/presentation/state/use-product-catalog";

const pillLinkStyle = {
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

export function ProductsPageShell() {
  const products = useProductCatalog();
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.title.toLowerCase().includes(normalizedQuery) ||
        product.slug.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery);

      const matchesVisibility =
        visibilityFilter === "all" || product.visibility === visibilityFilter;

      const matchesAudience = audienceFilter === "all" || product.audience === audienceFilter;

      return matchesQuery && matchesVisibility && matchesAudience;
    });
  }, [audienceFilter, products, query, visibilityFilter]);

  return (
    <div>
      <PageHeader
        eyebrow="Products"
        title="Catalog control for discovery and PDP."
        description="Search, review, create, and edit product records that power the storefront catalog and product detail pages."
        actions={
          <>
            <Link href="/products/new" style={pillLinkStyle}>
              Create product
            </Link>
            <Link href="/" style={subtleLinkStyle}>
              Return to overview
            </Link>
          </>
        }
      />

      <SectionCard
        title="Catalog desk"
        description="Filter the current fixture-backed catalog, then open a product record to edit title, price, stock, variants, and publish state."
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
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Search catalog</span>
            <input
              aria-label="Search catalog"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, slug, or category"
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: "14px 16px",
                background: "var(--color-surface)",
              }}
              value={query}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Visibility</span>
            <select
              aria-label="Visibility filter"
              onChange={(event) => setVisibilityFilter(event.target.value)}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: "14px 16px",
                background: "var(--color-surface)",
              }}
              value={visibilityFilter}
            >
              <option value="all">All visibility</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Audience</span>
            <select
              aria-label="Audience filter"
              onChange={(event) => setAudienceFilter(event.target.value)}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: "14px 16px",
                background: "var(--color-surface)",
              }}
              value={audienceFilter}
            >
              <option value="all">All audiences</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
            </select>
          </label>
        </div>

        {products.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Products"
            title="The catalog desk is empty right now."
            description="Create the first fixture-backed product record to start merchandising and PDP management."
            actionHref="/products/new"
            actionLabel="Create product"
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Products"
            title="No product records match the current filters."
            description="Adjust the search term or filters to review more of the catalog."
            actionHref="/products"
            actionLabel="Reset catalog view"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredProducts.map((product) => (
              <article
                key={product.id}
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
                    <strong style={{ fontSize: 20 }}>{product.title}</strong>
                    <span style={{ color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {product.subtitle}
                    </span>
                  </div>
                  <span
                    style={{
                      alignSelf: "start",
                      borderRadius: "var(--radius-pill)",
                      padding: "8px 12px",
                      background:
                        product.visibility === "published"
                          ? "rgba(47, 125, 50, 0.14)"
                          : "rgba(179, 123, 31, 0.14)",
                      color:
                        product.visibility === "published"
                          ? "var(--color-success)"
                          : "var(--color-accent)",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {product.visibility}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Slug</p>
                    <strong>{product.slug}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Category</p>
                    <strong style={{ textTransform: "capitalize" }}>{product.category}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Audience</p>
                    <strong style={{ textTransform: "capitalize" }}>{product.audience}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Price</p>
                    <strong>{product.price.formatted}</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Stock</p>
                    <strong>{product.inventoryQuantity} units</strong>
                  </div>
                  <div>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Variants</p>
                    <strong>{product.variants.length} options</strong>
                  </div>
                </div>

                <div className="dashboard-action-row">
                  <Link href={`/products/${product.id}`} style={pillLinkStyle}>
                    Edit product
                  </Link>
                  <Link href={`/products/${product.id}`} style={subtleLinkStyle}>
                    Review status
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
