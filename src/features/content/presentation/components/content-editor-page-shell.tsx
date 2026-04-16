"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import type { DashboardContentArea, DashboardContentRecord } from "@/src/core/types/dashboard";
import {
  updateContentRecord,
} from "@/src/features/content/data/repositories/mock-content-repository";
import { useContentDesk } from "@/src/features/content/presentation/state/use-content-desk";
import { useProductCatalog } from "@/src/features/products/presentation/state/use-product-catalog";

type ContentEditorPageShellProps = {
  routeKey: "homepage" | "stories";
};

type ContentFormState = {
  id: string;
  title: string;
  visibility: DashboardContentRecord["visibility"];
  eyebrow: string;
  headline: string;
  body: string;
  callToActionLabel: string;
  callToActionHref: string;
  summary: string;
  linkedProductIds: string[];
  mediaUrl: string;
  mediaAlt: string;
  previewBullets: string[];
};

const routeConfig: Record<
  ContentEditorPageShellProps["routeKey"],
  {
    title: string;
    description: string;
    areas: DashboardContentArea[];
  }
> = {
  homepage: {
    title: "Homepage and featured drop editor.",
    description:
      "Shape the homepage hero and the featured-drop merchandising rail that support storefront discovery.",
    areas: ["homepage", "featured_drop"],
  },
  stories: {
    title: "Stories and navigation editor.",
    description:
      "Manage editorial story framing, lookbook support copy, and navigation promo messaging in one fixture-backed flow.",
    areas: ["stories", "navigation_promos"],
  },
};

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

const darkButtonStyle = {
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

const subtleButtonStyle = {
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

function buildFormState(entry: DashboardContentRecord): ContentFormState {
  return {
    id: entry.id,
    title: entry.title,
    visibility: entry.visibility,
    eyebrow: entry.eyebrow,
    headline: entry.headline,
    body: entry.body,
    callToActionLabel: entry.callToActionLabel,
    callToActionHref: entry.callToActionHref,
    summary: entry.summary,
    linkedProductIds: entry.linkedProductIds,
    mediaUrl: entry.mediaReferences[0]?.url ?? "",
    mediaAlt: entry.mediaReferences[0]?.alt ?? "",
    previewBullets: entry.previewBullets,
  };
}

function buildContentRecord(
  entry: DashboardContentRecord,
  formState: ContentFormState,
): DashboardContentRecord {
  return {
    ...entry,
    title: formState.title,
    visibility: formState.visibility,
    eyebrow: formState.eyebrow,
    headline: formState.headline,
    body: formState.body,
    callToActionLabel: formState.callToActionLabel,
    callToActionHref: formState.callToActionHref,
    summary: formState.summary,
    linkedProductIds: formState.linkedProductIds,
    mediaReferences: formState.mediaUrl
      ? [
          {
            id: `${entry.id}_media_primary`,
            alt: formState.mediaAlt || `${formState.title} media`,
            kind: "image",
            url: formState.mediaUrl,
          },
        ]
      : [],
    previewBullets: formState.previewBullets,
  };
}

export function ContentEditorPageShell({ routeKey }: ContentEditorPageShellProps) {
  const contentEntries = useContentDesk();
  const products = useProductCatalog();
  const config = routeConfig[routeKey];
  const editorEntries = useMemo(
    () => contentEntries.filter((entry) => config.areas.includes(entry.area)),
    [config.areas, contentEntries],
  );
  const [formStateById, setFormStateById] = useState<Record<string, ContentFormState>>(() =>
    Object.fromEntries(editorEntries.map((entry) => [entry.id, buildFormState(entry)])),
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (editorEntries.length === 0) {
    return (
      <AppStateMessage
        eyebrow="Content"
        title="This content editor has no staged records"
        description="The current fixture set does not include the content areas this route expects."
        action={<Link href="/content">Back to content hub</Link>}
      />
    );
  }

  function updateField(entryId: string, field: keyof ContentFormState, value: string | string[]) {
    setFormStateById((currentState) => ({
      ...currentState,
      [entryId]: {
        ...currentState[entryId],
        [field]: value,
      },
    }));
  }

  function setVisibility(entryId: string, visibility: DashboardContentRecord["visibility"]) {
    setFormStateById((currentState) => ({
      ...currentState,
      [entryId]: {
        ...currentState[entryId],
        visibility,
      },
    }));
  }

  function toggleLinkedProduct(entryId: string, productId: string) {
    setFormStateById((currentState) => {
      const currentProducts = currentState[entryId]?.linkedProductIds ?? [];
      const nextLinkedProducts = currentProducts.includes(productId)
        ? currentProducts.filter((id) => id !== productId)
        : [...currentProducts, productId];

      return {
        ...currentState,
        [entryId]: {
          ...currentState[entryId],
          linkedProductIds: nextLinkedProducts,
        },
      };
    });
  }

  function handleSave(nextVisibility?: DashboardContentRecord["visibility"]) {
    editorEntries.forEach((entry) => {
      const formState = formStateById[entry.id];
      const nextRecord = buildContentRecord(entry, {
        ...formState,
        visibility: nextVisibility ?? formState.visibility,
      });

      updateContentRecord(nextRecord);
    });

    setSaveMessage(
      nextVisibility === "ready"
        ? "Content entries marked ready for publish in the mocked content desk."
        : nextVisibility === "draft"
          ? "Content entries saved as draft in the mocked content desk."
          : "Content entries saved to the mocked content desk.",
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title={config.title}
        description={config.description}
        actions={
          <>
            <Link href="/content" style={lightPillStyle}>
              Back to content hub
            </Link>
          </>
        }
      />

      <div style={{ display: "grid", gap: 16 }}>
        {editorEntries.map((entry) => {
          const formState = formStateById[entry.id];

          return (
            <SectionCard
              key={entry.id}
              title={entry.title}
              description={`Area: ${entry.area.replaceAll("_", " ")}`}
            >
              <div id={entry.area.replaceAll("_", "-")} style={{ display: "grid", gap: 18 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {(["draft", "ready", "published"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setVisibility(entry.id, status)}
                      style={{
                        ...subtleButtonStyle,
                        background:
                          formState.visibility === status
                            ? "var(--color-surface-inverse)"
                            : "rgba(255, 253, 248, 0.82)",
                        color:
                          formState.visibility === status
                            ? "var(--color-text-inverse)"
                            : "var(--color-text)",
                        textTransform: "capitalize",
                      }}
                      type="button"
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 14,
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  }}
                >
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Content title</span>
                    <input
                      aria-label={`${entry.area} title`}
                      onChange={(event) => updateField(entry.id, "title", event.target.value)}
                      style={inputStyle}
                      value={formState.title}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Eyebrow</span>
                    <input
                      aria-label={`${entry.area} eyebrow`}
                      onChange={(event) => updateField(entry.id, "eyebrow", event.target.value)}
                      style={inputStyle}
                      value={formState.eyebrow}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Headline</span>
                    <input
                      aria-label={`${entry.area} headline`}
                      onChange={(event) => updateField(entry.id, "headline", event.target.value)}
                      style={inputStyle}
                      value={formState.headline}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>CTA label</span>
                    <input
                      aria-label={`${entry.area} CTA label`}
                      onChange={(event) =>
                        updateField(entry.id, "callToActionLabel", event.target.value)
                      }
                      style={inputStyle}
                      value={formState.callToActionLabel}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>CTA href</span>
                    <input
                      aria-label={`${entry.area} CTA href`}
                      onChange={(event) =>
                        updateField(entry.id, "callToActionHref", event.target.value)
                      }
                      style={inputStyle}
                      value={formState.callToActionHref}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Summary</span>
                    <input
                      aria-label={`${entry.area} summary`}
                      onChange={(event) => updateField(entry.id, "summary", event.target.value)}
                      style={inputStyle}
                      value={formState.summary}
                    />
                  </label>
                </div>

                <label style={{ display: "grid", gap: 8 }}>
                  <span>Body copy</span>
                  <textarea
                    aria-label={`${entry.area} body`}
                    onChange={(event) => updateField(entry.id, "body", event.target.value)}
                    rows={4}
                    style={textareaStyle}
                    value={formState.body}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gap: 14,
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  }}
                >
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Primary media URL</span>
                    <input
                      aria-label={`${entry.area} media URL`}
                      onChange={(event) => updateField(entry.id, "mediaUrl", event.target.value)}
                      style={inputStyle}
                      value={formState.mediaUrl}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Primary media alt</span>
                    <input
                      aria-label={`${entry.area} media alt`}
                      onChange={(event) => updateField(entry.id, "mediaAlt", event.target.value)}
                      style={inputStyle}
                      value={formState.mediaAlt}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span>Preview bullets</span>
                    <input
                      aria-label={`${entry.area} preview bullets`}
                      onChange={(event) =>
                        updateField(
                          entry.id,
                          "previewBullets",
                          event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="Hero headline, Lead CTA, Merchandising rail"
                      style={inputStyle}
                      value={formState.previewBullets.join(", ")}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <strong>Linked products</strong>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {products.map((product) => (
                      <label
                        key={`${entry.id}_${product.id}`}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "start",
                          border: "1px solid var(--color-border)",
                          borderRadius: 16,
                          padding: "12px 14px",
                          background: "rgba(255, 253, 248, 0.82)",
                        }}
                      >
                        <input
                          checked={formState.linkedProductIds.includes(product.id)}
                          onChange={() => toggleLinkedProduct(entry.id, product.id)}
                          type="checkbox"
                        />
                        <span style={{ display: "grid", gap: 4 }}>
                          <strong>{product.title}</strong>
                          <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                            {product.category} · {product.price.formatted}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <SectionCard
                  title="Preview structure"
                  description="A compact staff preview of the storefront-facing shape before the content is staged."
                >
                  <div style={{ display: "grid", gap: 12 }}>
                    <div>
                      <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Preview label</p>
                      <strong>
                        {formState.eyebrow} · {formState.visibility}
                      </strong>
                    </div>
                    <div>
                      <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Headline</p>
                      <strong>{formState.headline}</strong>
                    </div>
                    <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>{formState.body}</p>
                    <div style={{ display: "grid", gap: 8 }}>
                      {formState.previewBullets.map((bullet) => (
                        <span
                          key={`${entry.id}_${bullet}`}
                          style={{
                            border: "1px solid var(--color-border)",
                            borderRadius: 14,
                            padding: "10px 12px",
                            background: "rgba(255, 253, 248, 0.82)",
                          }}
                        >
                          {bullet}
                        </span>
                      ))}
                    </div>
                    <span style={{ color: "var(--color-text-muted)" }}>
                      Linked products: {formState.linkedProductIds.length} · CTA {formState.callToActionLabel}
                    </span>
                  </div>
                </SectionCard>
              </div>
            </SectionCard>
          );
        })}

        <SectionCard
          title="Publish control"
          description="Save the current content structure as draft, or mark it ready for publish once the copy, products, and media references look right."
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => handleSave("draft")} style={subtleButtonStyle} type="button">
              Save as draft
            </button>
            <button onClick={() => handleSave("ready")} style={darkButtonStyle} type="button">
              Mark ready for publish
            </button>
          </div>
          {saveMessage ? (
            <p style={{ marginTop: 14, color: "var(--color-success)", lineHeight: 1.5 }}>
              {saveMessage}
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

const textareaStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "var(--color-surface)",
  resize: "vertical" as const,
} as const;
