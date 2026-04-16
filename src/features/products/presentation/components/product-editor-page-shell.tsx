"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import type { DashboardProductRecord } from "@/src/core/types/dashboard";
import {
  createProductRecord,
  updateProductRecord,
} from "@/src/features/products/data/repositories/mock-product-repository";
import { useProductCatalog } from "@/src/features/products/presentation/state/use-product-catalog";

type ProductEditorPageShellProps = {
  productId?: string;
};

type ProductFormState = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  category: DashboardProductRecord["category"];
  audience: DashboardProductRecord["audience"];
  visibility: DashboardProductRecord["visibility"];
  priceAmount: string;
  compareAtPriceAmount: string;
  inventoryQuantity: string;
  primaryMediaUrl: string;
  primaryMediaAlt: string;
  variants: Array<{
    id: string;
    sku: string;
    size: string;
    color: string;
    inventoryQuantity: string;
    isAvailable: boolean;
  }>;
};

function createFormState(product?: DashboardProductRecord): ProductFormState {
  if (product) {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      subtitle: product.subtitle,
      category: product.category,
      audience: product.audience,
      visibility: product.visibility,
      priceAmount: String(product.price.amount),
      compareAtPriceAmount: product.compareAtPrice ? String(product.compareAtPrice.amount) : "",
      inventoryQuantity: String(product.inventoryQuantity),
      primaryMediaUrl: product.primaryMedia.url,
      primaryMediaAlt: product.primaryMedia.alt,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        inventoryQuantity: String(variant.inventoryQuantity),
        isAvailable: variant.isAvailable,
      })),
    };
  }

  const draftId = `prod_${Date.now()}`;

  return {
    id: draftId,
    title: "",
    slug: "",
    subtitle: "",
    category: "tops",
    audience: "unisex",
    visibility: "draft",
    priceAmount: "0",
    compareAtPriceAmount: "",
    inventoryQuantity: "0",
    primaryMediaUrl: "",
    primaryMediaAlt: "",
    variants: [
      {
        id: `${draftId}_variant_1`,
        sku: "",
        size: "",
        color: "",
        inventoryQuantity: "0",
        isAvailable: true,
      },
    ],
  };
}

function formatCurrency(amount: number) {
  return `NGN ${amount.toLocaleString("en-NG")}`;
}

function buildProductRecord(formState: ProductFormState): DashboardProductRecord {
  const priceAmount = Number(formState.priceAmount) || 0;
  const compareAtPriceAmount = Number(formState.compareAtPriceAmount) || 0;
  const inventoryQuantity = Number(formState.inventoryQuantity) || 0;

  return {
    id: formState.id,
    slug: formState.slug,
    title: formState.title,
    subtitle: formState.subtitle,
    category: formState.category,
    audience: formState.audience,
    visibility: formState.visibility,
    price: {
      amount: priceAmount,
      currency: "NGN",
      formatted: formatCurrency(priceAmount),
    },
    compareAtPrice:
      compareAtPriceAmount > 0
        ? {
            amount: compareAtPriceAmount,
            currency: "NGN",
            formatted: formatCurrency(compareAtPriceAmount),
          }
        : undefined,
    inventoryQuantity,
    primaryMedia: {
      id: `${formState.id}_primary_media`,
      alt: formState.primaryMediaAlt || `${formState.title} primary image`,
      kind: "image",
      url: formState.primaryMediaUrl || "/fixtures/products/placeholder.jpg",
    },
    variants: formState.variants.map((variant, index) => ({
      id: variant.id || `${formState.id}_variant_${index + 1}`,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      inventoryQuantity: Number(variant.inventoryQuantity) || 0,
      isAvailable: variant.isAvailable,
    })),
  };
}

export function ProductEditorPageShell({ productId }: ProductEditorPageShellProps) {
  const router = useRouter();
  const products = useProductCatalog();
  const product = useMemo(
    () => (productId ? products.find((item) => item.id === productId) ?? null : null),
    [productId, products],
  );
  const [formState, setFormState] = useState<ProductFormState>(() => createFormState(product ?? undefined));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (productId && !product) {
    return (
      <AppStateMessage
        eyebrow="Products"
        title="This product record is missing"
        description="The product you tried to open is not available in the current fixture catalog."
        action={<Link href="/products">Back to products</Link>}
      />
    );
  }

  function updateField<Key extends keyof ProductFormState>(field: Key, value: ProductFormState[Key]) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  }

  function updateVariantField(
    variantId: string,
    field: keyof ProductFormState["variants"][number],
    value: string | boolean,
  ) {
    setFormState((currentState) => ({
      ...currentState,
      variants: currentState.variants.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant,
      ),
    }));
  }

  function addVariant() {
    setFormState((currentState) => ({
      ...currentState,
      variants: [
        ...currentState.variants,
        {
          id: `${currentState.id}_variant_${currentState.variants.length + 1}`,
          sku: "",
          size: "",
          color: "",
          inventoryQuantity: "0",
          isAvailable: true,
        },
      ],
    }));
  }

  function removeVariant(variantId: string) {
    setFormState((currentState) => ({
      ...currentState,
      variants:
        currentState.variants.length === 1
          ? currentState.variants
          : currentState.variants.filter((variant) => variant.id !== variantId),
    }));
  }

  function handleSave(nextVisibility?: DashboardProductRecord["visibility"]) {
    const nextFormState = {
      ...formState,
      visibility: nextVisibility ?? formState.visibility,
    };

    const nextProduct = buildProductRecord(nextFormState);

    if (product) {
      updateProductRecord(nextProduct);
      setStatusMessage("Product changes saved to the mocked catalog.");
    } else {
      createProductRecord(nextProduct);
      setStatusMessage("New product created in the mocked catalog.");
    }

    router.push("/products");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Products"
        title={product ? "Edit product record." : "Create a draft product."}
        description="Manage the product fields the storefront relies on: title, slug, category, audience, price, stock, variants, visibility, and media."
        actions={
          <>
            <Link
              href="/products"
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
              Back to products
            </Link>
          </>
        }
      />

      <div style={{ display: "grid", gap: 16 }}>
        <SectionCard
          title="Status control"
          description="Keep a product in draft while shaping it, or publish it once the storefront-facing fields are ready."
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(["draft", "published", "scheduled"] as const).map((status) => (
              <button
                key={status}
                onClick={() => updateField("visibility", status)}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-pill)",
                  padding: "12px 16px",
                  background:
                    formState.visibility === status
                      ? "var(--color-surface-inverse)"
                      : "rgba(255, 253, 248, 0.82)",
                  color:
                    formState.visibility === status
                      ? "var(--color-text-inverse)"
                      : "var(--color-text)",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
                type="button"
              >
                {status}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Product fields"
          description="These fields cover the key storefront merchandising and PDP assumptions already in fixture mode."
        >
          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <label style={{ display: "grid", gap: 8 }}>
              <span>Title</span>
              <input
                aria-label="Product title"
                onChange={(event) => updateField("title", event.target.value)}
                style={inputStyle}
                value={formState.title}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Slug</span>
              <input
                aria-label="Product slug"
                onChange={(event) => updateField("slug", event.target.value)}
                style={inputStyle}
                value={formState.slug}
              />
            </label>
            <label style={{ display: "grid", gap: 8, gridColumn: "1 / -1" }}>
              <span>Subtitle</span>
              <input
                aria-label="Product subtitle"
                onChange={(event) => updateField("subtitle", event.target.value)}
                style={inputStyle}
                value={formState.subtitle}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Category</span>
              <select
                aria-label="Product category"
                onChange={(event) =>
                  updateField("category", event.target.value as DashboardProductRecord["category"])
                }
                style={inputStyle}
                value={formState.category}
              >
                <option value="tracksuit">Tracksuit</option>
                <option value="outerwear">Outerwear</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="headwear">Headwear</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Audience</span>
              <select
                aria-label="Product audience"
                onChange={(event) =>
                  updateField("audience", event.target.value as DashboardProductRecord["audience"])
                }
                style={inputStyle}
                value={formState.audience}
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="unisex">Unisex</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Price (NGN)</span>
              <input
                aria-label="Product price"
                inputMode="numeric"
                onChange={(event) => updateField("priceAmount", event.target.value)}
                style={inputStyle}
                value={formState.priceAmount}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Compare at price (NGN)</span>
              <input
                aria-label="Compare at price"
                inputMode="numeric"
                onChange={(event) => updateField("compareAtPriceAmount", event.target.value)}
                style={inputStyle}
                value={formState.compareAtPriceAmount}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Stock</span>
              <input
                aria-label="Product stock"
                inputMode="numeric"
                onChange={(event) => updateField("inventoryQuantity", event.target.value)}
                style={inputStyle}
                value={formState.inventoryQuantity}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Primary media URL</span>
              <input
                aria-label="Primary media URL"
                onChange={(event) => updateField("primaryMediaUrl", event.target.value)}
                style={inputStyle}
                value={formState.primaryMediaUrl}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Primary media alt</span>
              <input
                aria-label="Primary media alt"
                onChange={(event) => updateField("primaryMediaAlt", event.target.value)}
                style={inputStyle}
                value={formState.primaryMediaAlt}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard
          title="Variants"
          description="Capture the size, color, SKU, and stock options the storefront needs for selection and availability."
        >
          <div style={{ display: "grid", gap: 12 }}>
            {formState.variants.map((variant, index) => (
              <div
                key={variant.id}
                style={{
                  display: "grid",
                  gap: 12,
                  border: "1px solid var(--color-border)",
                  borderRadius: 18,
                  padding: "16px",
                  background: "rgba(255, 253, 248, 0.7)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>Variant {index + 1}</strong>
                  <button
                    disabled={formState.variants.length === 1}
                    onClick={() => removeVariant(variant.id)}
                    style={secondaryButtonStyle}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  }}
                >
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>SKU</span>
                    <input
                      aria-label={`Variant ${index + 1} SKU`}
                      onChange={(event) => updateVariantField(variant.id, "sku", event.target.value)}
                      style={inputStyle}
                      value={variant.sku}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Size</span>
                    <input
                      aria-label={`Variant ${index + 1} size`}
                      onChange={(event) => updateVariantField(variant.id, "size", event.target.value)}
                      style={inputStyle}
                      value={variant.size}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Color</span>
                    <input
                      aria-label={`Variant ${index + 1} color`}
                      onChange={(event) => updateVariantField(variant.id, "color", event.target.value)}
                      style={inputStyle}
                      value={variant.color}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Stock</span>
                    <input
                      aria-label={`Variant ${index + 1} stock`}
                      inputMode="numeric"
                      onChange={(event) =>
                        updateVariantField(variant.id, "inventoryQuantity", event.target.value)
                      }
                      style={inputStyle}
                      value={variant.inventoryQuantity}
                    />
                  </label>
                </div>
              </div>
            ))}
            <button onClick={addVariant} style={secondaryButtonStyle} type="button">
              Add variant
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Save actions"
          description="Save the record as a draft, publish it to the mocked catalog, or return to the product desk."
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => handleSave("draft")}
              style={secondaryButtonStyle}
              type="button"
            >
              Save as draft
            </button>
            <button
              onClick={() => handleSave("published")}
              style={primaryButtonStyle}
              type="button"
            >
              Save and publish
            </button>
            <Link href="/products" style={secondaryLinkStyle}>
              Cancel
            </Link>
          </div>
          {statusMessage ? (
            <p style={{ marginTop: 14, color: "var(--color-success)", lineHeight: 1.5 }}>
              {statusMessage}
            </p>
          ) : null}
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

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  padding: "14px 18px",
  background: "rgba(255, 253, 248, 0.82)",
  color: "var(--color-text)",
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
