"use client";

import type { DashboardSeoOverrides } from "@/src/core/types/dashboard";
import { SectionCard } from "@/src/core/ui/section-card";

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "https://sohenation.com";
const BRAND_SUFFIX = " | Sohe Nation";

// The storefront appends the brand, so the title guide leaves room for it.
const TITLE_GUIDE = 60 - BRAND_SUFFIX.length;
const TITLE_MAX = 70;
const DESCRIPTION_GUIDE = 160;
const DESCRIPTION_MAX = 200;

type Props = {
  value: DashboardSeoOverrides;
  onChange: (next: DashboardSeoOverrides) => void;
  /** What the storefront uses when a field is left blank. */
  defaults: { title: string; description: string; imageUrl: string };
  /** Storefront path of the page, e.g. `/products/lunar-utility-jacket`. */
  path: string;
  idPrefix: string;
};

function counter(length: number, guide: number) {
  return length > guide ? `${length}/${guide} — search results will cut this off` : `${length}/${guide}`;
}

/**
 * Optional search-result and link-preview overrides. Blank fields fall back to the page's
 * own title, description, and main image, so most items need nothing here.
 */
export function SeoFieldsSection({ value, onChange, defaults, path, idPrefix }: Props) {
  const title = value.seoTitle.trim() || defaults.title;
  const description = value.seoDescription.trim() || defaults.description;
  const image = value.shareImageUrl.trim() || defaults.imageUrl;
  const imageInvalid = Boolean(value.shareImageUrl.trim()) && !value.shareImageUrl.trim().startsWith("https://");

  return (
    <SectionCard
      title="Search and sharing"
      description="Optional. Leave blank to use the page's own title, description, and main image. The store name is added to the title automatically."
    >
      <div style={{ display: "grid", gap: 14 }}>
        <label style={labelStyle}>
          <span>
            Search title <span style={hintStyle}>{counter(value.seoTitle.length, TITLE_GUIDE)}</span>
          </span>
          <input
            aria-label={`${idPrefix} search title`}
            maxLength={TITLE_MAX}
            onChange={(event) => onChange({ ...value, seoTitle: event.target.value })}
            placeholder={defaults.title}
            style={inputStyle}
            value={value.seoTitle}
          />
        </label>
        <label style={labelStyle}>
          <span>
            Search description{" "}
            <span style={hintStyle}>{counter(value.seoDescription.length, DESCRIPTION_GUIDE)}</span>
          </span>
          <textarea
            aria-label={`${idPrefix} search description`}
            maxLength={DESCRIPTION_MAX}
            onChange={(event) => onChange({ ...value, seoDescription: event.target.value })}
            placeholder={defaults.description}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            value={value.seoDescription}
          />
        </label>
        <label style={labelStyle}>
          <span>
            Share image URL{" "}
            <span style={hintStyle}>
              Shown when the link is shared. 1200×630 works best. Must start with https://
            </span>
          </span>
          <input
            aria-invalid={imageInvalid}
            aria-label={`${idPrefix} share image URL`}
            onChange={(event) => onChange({ ...value, shareImageUrl: event.target.value })}
            placeholder={defaults.imageUrl || "https://..."}
            style={inputStyle}
            value={value.shareImageUrl}
          />
          {imageInvalid ? (
            <span role="alert" style={{ color: "var(--color-danger, #b3261e)", fontSize: 13 }}>
              The image link must start with https://
            </span>
          ) : null}
        </label>

        <div aria-label="Search result preview" style={previewStyle}>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {STOREFRONT_URL.replace(/^https?:\/\//, "")}
            {path}
          </span>
          <strong style={{ color: "#1a0dab", fontSize: 18, fontWeight: 500 }}>
            {title}
            {BRAND_SUFFIX}
          </strong>
          <span style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
            {description.length > DESCRIPTION_GUIDE ? `${description.slice(0, DESCRIPTION_GUIDE - 1)}…` : description}
          </span>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote preview of a staff-entered URL
            <img alt="Share image preview" src={image} style={{ marginTop: 8, maxWidth: 240, borderRadius: 12 }} />
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

const labelStyle = { display: "grid", gap: 8 } as const;
const hintStyle = { fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)" } as const;
const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "var(--color-surface)",
} as const;
const previewStyle = {
  display: "grid",
  gap: 4,
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "#fff",
} as const;
