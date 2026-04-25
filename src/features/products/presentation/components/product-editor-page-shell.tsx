"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useToast } from "@/src/core/ui/toast";
import type { DashboardProductRecord, ProductRegion } from "@/src/core/types/dashboard";
import {
  createProductRecord,
  archiveProductRecord,
  updateProductRecord,
} from "@/src/features/products/data/repositories/product-repository";
import { uploadDashboardCatalogMedia } from "@/src/features/products/data/api/product-api-client";
import { useProductCatalog } from "@/src/features/products/presentation/state/use-product-catalog";

type ProductEditorPageShellProps = {
  productId?: string;
};

type VariantFormItem = {
  localId: string;       // stable React key (always present)
  apiId?: string;        // real UUID from API — present on persisted variants
  sku: string;
  size: string;
  color: string;
  inventoryQuantity: string;
  priceAmount: string;
  compareAtPriceAmount: string;
};

type ProductFormState = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  category: DashboardProductRecord["category"];
  audience: DashboardProductRecord["audience"];
  defaultRegion: ProductRegion;
  regionAvailability: ProductRegion[];
  shippingAmount: string;
  shippingCurrency: "NGN" | "USD" | "GBP" | "EUR";
  visibility: DashboardProductRecord["visibility"];
  primaryMediaUrl: string;
  primaryMediaAlt: string;
  campaignNote: string;
  fitGuidance: string;
  materialStory: string;
  sustainabilityNote: string;
  deliveryNote: string;
  variants: VariantFormItem[];
};

const REGION_OPTIONS: ProductRegion[] = ["NG", "US", "GB", "EU"];

function createFormState(product?: DashboardProductRecord): ProductFormState {
  if (product) {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      subtitle: product.subtitle,
      category: product.category,
      audience: product.audience,
      defaultRegion: product.defaultRegion,
      regionAvailability: product.regionAvailability,
      shippingAmount: String(product.shipping?.amount ?? 0),
      shippingCurrency: product.shipping?.currency ?? "NGN",
      visibility: product.visibility,
      primaryMediaUrl: product.primaryMedia.url,
      primaryMediaAlt: product.primaryMedia.alt,
      campaignNote: product.narrative?.campaignNote ?? "",
      fitGuidance: product.narrative?.fitGuidance ?? "",
      materialStory: product.narrative?.materialStory ?? "",
      sustainabilityNote: product.narrative?.sustainabilityNote ?? "",
      deliveryNote: product.narrative?.deliveryNote ?? "",
      variants: product.variants.map((variant) => ({
        localId: variant.id,
        apiId: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        inventoryQuantity: String(variant.inventoryQuantity),
        priceAmount: String(variant.price.amount),
        compareAtPriceAmount: variant.compareAtPrice ? String(variant.compareAtPrice.amount) : "",
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
    defaultRegion: "NG",
    regionAvailability: ["NG"],
    shippingAmount: "0",
    shippingCurrency: "NGN",
    visibility: "published",
    primaryMediaUrl: "",
    primaryMediaAlt: "",
    campaignNote: "",
    fitGuidance: "",
    materialStory: "",
    sustainabilityNote: "",
    deliveryNote: "",
    variants: [
      {
        localId: `${draftId}_v1`,
        sku: "",
        size: "",
        color: "",
        inventoryQuantity: "0",
        priceAmount: "0",
        compareAtPriceAmount: "",
      },
    ],
  };
}

export function ProductEditorPageShell({ productId }: ProductEditorPageShellProps) {
  const router = useRouter();
  const toast = useToast();
  const products = useProductCatalog();
  const product = useMemo(
    () => (productId ? products.find((item) => item.id === productId) ?? null : null),
    [productId, products],
  );
  const [formState, setFormState] = useState<ProductFormState>(() => createFormState(product ?? undefined));
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

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

  function updateVariantField(localId: string, field: keyof VariantFormItem, value: string) {
    setFormState((currentState) => ({
      ...currentState,
      variants: currentState.variants.map((variant) =>
        variant.localId === localId ? { ...variant, [field]: value } : variant,
      ),
    }));
  }

  function toggleRegionAvailability(region: ProductRegion, isChecked: boolean) {
    setFormState((currentState) => {
      const nextRegions = isChecked
        ? [...new Set([...currentState.regionAvailability, region])]
        : currentState.regionAvailability.filter((currentRegion) => currentRegion !== region);

      return {
        ...currentState,
        regionAvailability: nextRegions,
      };
    });
  }

  function addVariant() {
    setFormState((currentState) => ({
      ...currentState,
      variants: [
        ...currentState.variants,
        {
          localId: `${currentState.id}_v${currentState.variants.length + 1}_${Date.now()}`,
          sku: "",
          size: "",
          color: "",
          inventoryQuantity: "0",
          priceAmount: "0",
          compareAtPriceAmount: "",
        },
      ],
    }));
  }

  function removeVariant(localId: string) {
    setFormState((currentState) => ({
      ...currentState,
      variants:
        currentState.variants.length === 1
          ? currentState.variants
          : currentState.variants.filter((variant) => variant.localId !== localId),
    }));
  }

  async function handleSave(nextVisibility?: DashboardProductRecord["visibility"]) {
    const resolvedVisibility = nextVisibility ?? formState.visibility;

    const validVariants = formState.variants.filter(
      (v) => v.sku && v.size && v.color && Number(v.priceAmount) > 0,
    );

    try {
      if (product) {
        await updateProductRecord(product.id, {
          slug: formState.slug,
          title: formState.title,
          subtitle: formState.subtitle,
          gender: formState.audience,
          category: formState.category,
          default_region: formState.defaultRegion,
          region_availability: formState.regionAvailability,
          shipping_amount: Number(formState.shippingAmount) || 0,
          shipping_currency: formState.shippingCurrency,
          visibility: resolvedVisibility,
          narrative: {
            campaign_note: formState.campaignNote,
            fit_guidance: formState.fitGuidance,
            material_story: formState.materialStory,
            sustainability_note: formState.sustainabilityNote,
            delivery_note: formState.deliveryNote,
          },
          variants: validVariants.map((v) => {
            const compareAt = Number(v.compareAtPriceAmount);
            if (v.apiId) {
              return {
                id: v.apiId,
                size: v.size,
                color: v.color,
                inventory_quantity: Number(v.inventoryQuantity) || 0,
                price_amount: Number(v.priceAmount),
                price_currency: "NGN",
                ...(compareAt > 0
                  ? { compare_at_price_amount: compareAt, compare_at_price_currency: "NGN" }
                  : { compare_at_price_amount: null }),
              };
            }
            return {
              sku: v.sku,
              size: v.size,
              color: v.color,
              inventory_quantity: Number(v.inventoryQuantity) || 0,
              price_amount: Number(v.priceAmount),
              price_currency: "NGN",
              ...(compareAt > 0
                ? { compare_at_price_amount: compareAt, compare_at_price_currency: "NGN" }
                : {}),
            };
          }),
        });
        toast.success("Product changes saved.");
      } else {
        await createProductRecord({
          slug: formState.slug,
          title: formState.title,
          subtitle: formState.subtitle,
          gender: formState.audience,
          category: formState.category,
          default_region: formState.defaultRegion,
          region_availability: formState.regionAvailability,
          shipping_amount: Number(formState.shippingAmount) || 0,
          shipping_currency: formState.shippingCurrency,
          visibility: resolvedVisibility,
          media: formState.primaryMediaUrl
            ? [
                {
                  alt: formState.primaryMediaAlt || `${formState.title} image`,
                  kind: "image",
                  url: formState.primaryMediaUrl,
                  is_primary: true,
                },
              ]
            : undefined,
          narrative: {
            campaign_note: formState.campaignNote,
            fit_guidance: formState.fitGuidance,
            material_story: formState.materialStory,
            sustainability_note: formState.sustainabilityNote,
            delivery_note: formState.deliveryNote,
          },
          variants: validVariants.map((v) => {
            const compareAt = Number(v.compareAtPriceAmount);
            return {
              sku: v.sku,
              size: v.size,
              color: v.color,
              inventory_quantity: Number(v.inventoryQuantity) || 0,
              price_amount: Number(v.priceAmount),
              price_currency: "NGN",
              ...(compareAt > 0
                ? { compare_at_price_amount: compareAt, compare_at_price_currency: "NGN" }
                : {}),
            };
          }),
        });
        toast.success("New product created.");
      }
      router.push("/products");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed. Please try again.";
      toast.error(message);
    }
  }

  async function handleArchiveProduct() {
    if (!product) return;
    try {
      await archiveProductRecord(product.id);
      toast.success("Product archived and removed from active catalog.");
      router.push("/products");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Archive failed.";
      toast.error(message);
    }
  }

  async function handlePrimaryMediaUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      const uploaded = await uploadDashboardCatalogMedia(file);
      updateField("primaryMediaUrl", uploaded.url);
      if (!formState.primaryMediaAlt.trim()) {
        updateField("primaryMediaAlt", formState.title ? `${formState.title} image` : uploaded.original_filename);
      }
      toast.success("Media uploaded and linked.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Media upload failed.";
      toast.error(message);
    } finally {
      setIsUploadingMedia(false);
      event.target.value = "";
    }
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
          <div className="dashboard-action-row">
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
              <span>Default region</span>
              <select
                aria-label="Product default region"
                onChange={(event) =>
                  updateField("defaultRegion", event.target.value as ProductRegion)
                }
                style={inputStyle}
                value={formState.defaultRegion}
              >
                {REGION_OPTIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Shipping amount</span>
              <input
                aria-label="Product shipping amount"
                inputMode="decimal"
                onChange={(event) => updateField("shippingAmount", event.target.value)}
                style={inputStyle}
                value={formState.shippingAmount}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Shipping currency</span>
              <select
                aria-label="Product shipping currency"
                onChange={(event) =>
                  updateField("shippingCurrency", event.target.value as ProductFormState["shippingCurrency"])
                }
                style={inputStyle}
                value={formState.shippingCurrency}
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
            <fieldset
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: "12px 14px",
                display: "grid",
                gap: 8,
              }}
            >
              <legend style={{ padding: "0 6px" }}>Region availability</legend>
              <div className="dashboard-chip-row">
                {REGION_OPTIONS.map((region) => (
                  <label key={region} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <input
                      aria-label={`Region ${region}`}
                      checked={formState.regionAvailability.includes(region)}
                      onChange={(event) => toggleRegionAvailability(region, event.target.checked)}
                      type="checkbox"
                    />
                    <span>{region}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div
              style={{
                display: "grid",
                gap: 14,
                gridColumn: "1 / -1",
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: "12px 14px",
                background: "rgba(255, 253, 248, 0.52)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: 14,
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  alignItems: "start",
                }}
              >
                <label style={{ display: "grid", gap: 8 }}>
                  <span>Upload primary media</span>
                  <input
                    aria-label="Upload product media"
                    accept="image/*,video/*"
                    disabled={isUploadingMedia}
                    onChange={handlePrimaryMediaUpload}
                    style={fileInputStyle}
                    type="file"
                  />
                  <small style={{ opacity: 0.7 }}>
                    {isUploadingMedia ? "Uploading to cloud storage..." : "Upload file and we auto-fill the URL."}
                  </small>
                </label>
                <label style={{ display: "grid", gap: 8 }}>
                  <span>Primary media URL (auto-generated)</span>
                  <input
                    aria-label="Primary media URL"
                    disabled
                    readOnly
                    style={{
                      ...inputStyle,
                      opacity: 1,
                      background: "rgba(238, 235, 228, 0.65)",
                      color: "rgba(36, 31, 22, 0.82)",
                      cursor: "not-allowed",
                    }}
                    value={formState.primaryMediaUrl}
                  />
                </label>
              </div>
              <label style={{ display: "grid", gap: 8, gridColumn: "1 / -1" }}>
                <span>Primary media alt</span>
                <input
                  aria-label="Primary media alt"
                  onChange={(event) => updateField("primaryMediaAlt", event.target.value)}
                  style={inputStyle}
                  value={formState.primaryMediaAlt}
                />
              </label>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="PDP narrative"
          description="These narrative fields render in storefront product story blocks."
        >
          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            <label style={{ display: "grid", gap: 8, gridColumn: "1 / -1" }}>
              <span>Campaign note</span>
              <textarea
                aria-label="Product campaign note"
                onChange={(event) => updateField("campaignNote", event.target.value)}
                rows={3}
                style={textareaStyle}
                value={formState.campaignNote}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Fit guidance</span>
              <textarea
                aria-label="Product fit guidance"
                onChange={(event) => updateField("fitGuidance", event.target.value)}
                rows={3}
                style={textareaStyle}
                value={formState.fitGuidance}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Material story</span>
              <textarea
                aria-label="Product material story"
                onChange={(event) => updateField("materialStory", event.target.value)}
                rows={3}
                style={textareaStyle}
                value={formState.materialStory}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Sustainability note</span>
              <textarea
                aria-label="Product sustainability note"
                onChange={(event) => updateField("sustainabilityNote", event.target.value)}
                rows={3}
                style={textareaStyle}
                value={formState.sustainabilityNote}
              />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Delivery note</span>
              <textarea
                aria-label="Product delivery note"
                onChange={(event) => updateField("deliveryNote", event.target.value)}
                rows={3}
                style={textareaStyle}
                value={formState.deliveryNote}
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
                key={variant.localId}
                style={{
                  display: "grid",
                  gap: 12,
                  border: "1px solid var(--color-border)",
                  borderRadius: 18,
                  padding: "16px",
                  background: "rgba(255, 253, 248, 0.7)",
                }}
              >
                <div className="dashboard-split-row dashboard-split-row--center">
                  <strong>
                    Variant {index + 1}
                    {variant.apiId ? null : (
                      <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.55 }}>new</span>
                    )}
                  </strong>
                  <button
                    disabled={formState.variants.length === 1}
                    onClick={() => removeVariant(variant.localId)}
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
                      disabled={!!variant.apiId}
                      onChange={(event) => updateVariantField(variant.localId, "sku", event.target.value)}
                      style={{ ...inputStyle, ...(variant.apiId ? { opacity: 0.55 } : {}) }}
                      title={variant.apiId ? "SKU cannot be changed after creation" : undefined}
                      value={variant.sku}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Size</span>
                    <input
                      aria-label={`Variant ${index + 1} size`}
                      onChange={(event) => updateVariantField(variant.localId, "size", event.target.value)}
                      style={inputStyle}
                      value={variant.size}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Color</span>
                    <input
                      aria-label={`Variant ${index + 1} color`}
                      onChange={(event) => updateVariantField(variant.localId, "color", event.target.value)}
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
                        updateVariantField(variant.localId, "inventoryQuantity", event.target.value)
                      }
                      style={inputStyle}
                      value={variant.inventoryQuantity}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Price (NGN)</span>
                    <input
                      aria-label={`Variant ${index + 1} price`}
                      inputMode="numeric"
                      onChange={(event) =>
                        updateVariantField(variant.localId, "priceAmount", event.target.value)
                      }
                      style={inputStyle}
                      value={variant.priceAmount}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Compare at (NGN)</span>
                    <input
                      aria-label={`Variant ${index + 1} compare at price`}
                      inputMode="numeric"
                      onChange={(event) =>
                        updateVariantField(variant.localId, "compareAtPriceAmount", event.target.value)
                      }
                      placeholder="Leave blank if no sale"
                      style={inputStyle}
                      value={variant.compareAtPriceAmount}
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
          <div className="dashboard-action-row">
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
            {product ? (
              <button
                onClick={handleArchiveProduct}
                style={dangerButtonStyle}
                type="button"
              >
                Archive product
              </button>
            ) : null}
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

const fileInputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "10px 12px",
  background: "var(--color-surface)",
  minHeight: 52,
} as const;

const textareaStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "var(--color-surface)",
  resize: "vertical" as const,
  fontFamily: "inherit",
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
