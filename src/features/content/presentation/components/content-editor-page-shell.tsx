"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useToast } from "@/src/core/ui/toast";
import type { DashboardContentArea, DashboardContentRecord } from "@/src/core/types/dashboard";
import {
  updateContentRecord,
} from "@/src/features/content/data/repositories/content-repository";
import {
  useContentDesk,
  useContentDeskError,
} from "@/src/features/content/presentation/state/use-content-desk";
import { useProductCatalog } from "@/src/features/products/presentation/state/use-product-catalog";

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "https://sohenation.com";

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
  slug: string;
  secondaryCallToActionLabel: string;
  secondaryCallToActionHref: string;
  chapterLabel: string;
  campaignStatement: string;
  linkedProductIds: string[];
  mediaKind: "image" | "video";
  mediaUrl: string;
  mediaPosterUrl: string;
  mediaAlt: string;
  previewBullets: string[];
  campaignStatsText: string;
  modulesText: string;
  hotspotsText: string;
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
      "Manage editorial story framing, lookbook support copy, and navigation promo messaging in one API-backed flow.",
    areas: ["stories", "navigation_promos"],
  },
};

const areaSurfaceMap: Record<
  DashboardContentArea,
  {
    storefrontSurface: string;
    storefrontRoute: string;
    publishingOutcome: string;
  }
> = {
  homepage: {
    storefrontSurface: "Marketing homepage hero",
    storefrontRoute: "/",
    publishingOutcome: "Publishing this record makes the storefront homepage hero live.",
  },
  featured_drop: {
    storefrontSurface: "Homepage featured product rail",
    storefrontRoute: "/#featured-drop",
    publishingOutcome: "Publishing this record updates the featured drop rail directly under the homepage hero.",
  },
  stories: {
    storefrontSurface: "Stories index and story detail page",
    storefrontRoute: "/stories and /stories/[slug]",
    publishingOutcome: "Publishing this record exposes the story in the listing and enables its detail route.",
  },
  navigation_promos: {
    storefrontSurface: "Homepage story band promo",
    storefrontRoute: "/#story-band",
    publishingOutcome: "Publishing this record powers the story band CTA and promo modules on the homepage.",
  },
};

const areaEditNotes: Record<DashboardContentArea, string> = {
  homepage:
    "Hero copy is fixed in the storefront for now. This panel only manages the hero media asset and publish state.",
  featured_drop:
    "This panel only manages the featured product lineup and publish state for the homepage rail.",
  stories:
    "Story content is fully editable here, including copy, media, linked products, and narrative structure.",
  navigation_promos:
    "Navigation promos remain locked in this slice. You can review the record and change publish state, but not edit the content fields here.",
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
    slug: entry.slug ?? "",
    secondaryCallToActionLabel: entry.secondaryCallToActionLabel ?? "",
    secondaryCallToActionHref: entry.secondaryCallToActionHref ?? "",
    chapterLabel: entry.chapterLabel ?? "",
    campaignStatement: entry.campaignStatement ?? "",
    linkedProductIds: entry.linkedProductIds,
    mediaKind: entry.mediaReferences[0]?.kind ?? "image",
    mediaUrl: entry.mediaReferences[0]?.url ?? "",
    mediaPosterUrl: entry.mediaReferences[0]?.posterUrl ?? "",
    mediaAlt: entry.mediaReferences[0]?.alt ?? "",
    previewBullets: entry.previewBullets,
    campaignStatsText: (entry.campaignStats ?? [])
      .map((item) => `${item.label}|${item.value}`)
      .join("\n"),
    modulesText: (entry.modules ?? [])
      .map((module) => `${module.title}|${module.body}`)
      .join("\n"),
    hotspotsText: (entry.hotspots ?? [])
      .map(
        (hotspot) =>
          `${hotspot.id}|${hotspot.label}|${hotspot.productSlug}|${hotspot.top}|${hotspot.left}|${hotspot.note}`,
      )
      .join("\n"),
  };
}

function parseDelimitedLines(value: string, expectedParts: number) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length >= expectedParts);
}

function buildContentRecord(
  entry: DashboardContentRecord,
  formState: ContentFormState,
): DashboardContentRecord {
  const campaignStats = parseDelimitedLines(formState.campaignStatsText, 2).map(
    ([label, value]) => ({ label, value }),
  );
  const modules = parseDelimitedLines(formState.modulesText, 2).map(([title, body]) => ({
    title,
    body,
  }));
  const hotspots = parseDelimitedLines(formState.hotspotsText, 6).map(
    ([id, label, productSlug, top, left, note]) => ({
      id,
      label,
      productSlug,
      top,
      left,
      note,
    }),
  );

  return {
    ...entry,
    slug: formState.slug || undefined,
    title: formState.title,
    visibility: formState.visibility,
    eyebrow: formState.eyebrow,
    headline: formState.headline,
    body: formState.body,
    callToActionLabel: formState.callToActionLabel,
    callToActionHref: formState.callToActionHref,
    secondaryCallToActionLabel: formState.secondaryCallToActionLabel,
    secondaryCallToActionHref: formState.secondaryCallToActionHref,
    chapterLabel: formState.chapterLabel,
    campaignStatement: formState.campaignStatement,
    summary: formState.summary,
    linkedProductIds: formState.linkedProductIds,
    mediaReferences: formState.mediaUrl
      ? [
          {
            id: `${entry.id}_media_primary`,
            alt: formState.mediaAlt || `${formState.title} media`,
            kind: formState.mediaKind,
            url: formState.mediaUrl,
            ...(formState.mediaKind === "video" && formState.mediaPosterUrl
              ? { posterUrl: formState.mediaPosterUrl }
              : {}),
          },
        ]
      : [],
    previewBullets: formState.previewBullets,
    campaignStats,
    modules,
    hotspots,
  };
}

export function ContentEditorPageShell({ routeKey }: ContentEditorPageShellProps) {
  const toast = useToast();
  const contentEntries = useContentDesk();
  const contentError = useContentDeskError();
  const products = useProductCatalog();
  const config = routeConfig[routeKey];
  const editorEntries = useMemo(
    () => contentEntries.filter((entry) => config.areas.includes(entry.area)),
    [config.areas, contentEntries],
  );
  const [draftFormStateById, setFormStateById] = useState<Record<string, ContentFormState>>(() =>
    Object.fromEntries(editorEntries.map((entry) => [entry.id, buildFormState(entry)])),
  );
  const formStateById = useMemo(() => {
    const nextState = { ...draftFormStateById };
    for (const entry of editorEntries) {
      if (!nextState[entry.id]) {
        nextState[entry.id] = buildFormState(entry);
      }
    }
    return nextState;
  }, [draftFormStateById, editorEntries]);

  if (contentError) {
    return (
      <AppStateMessage
        eyebrow="Content"
        title="This content editor could not load."
        description={`The dashboard could not load content records from the API for this editor. ${contentError.message}`}
        action={<Link href="/content">Back to content hub</Link>}
      />
    );
  }

  if (editorEntries.length === 0) {
    return (
      <AppStateMessage
        eyebrow="Content"
        title="This content editor has no staged records"
        description="The API is not currently returning the content areas this route expects."
        action={<Link href="/content">Back to content hub</Link>}
      />
    );
  }

  function updateField(entryId: string, field: keyof ContentFormState, value: string | string[]) {
    setFormStateById((currentState) => ({
      ...currentState,
      [entryId]: {
        ...(currentState[entryId] ?? formStateById[entryId]),
        [field]: value,
      },
    }));
  }

  function setVisibility(entryId: string, visibility: DashboardContentRecord["visibility"]) {
    setFormStateById((currentState) => ({
      ...currentState,
      [entryId]: {
        ...(currentState[entryId] ?? formStateById[entryId]),
        visibility,
      },
    }));
  }

  function toggleLinkedProduct(entryId: string, productId: string) {
    setFormStateById((currentState) => {
      const entryState = currentState[entryId] ?? formStateById[entryId];
      const currentProducts = entryState?.linkedProductIds ?? [];
      const nextLinkedProducts = currentProducts.includes(productId)
        ? currentProducts.filter((id) => id !== productId)
        : [...currentProducts, productId];

      return {
        ...currentState,
        [entryId]: {
          ...entryState,
          linkedProductIds: nextLinkedProducts,
        },
      };
    });
  }

  async function handleSave(nextVisibility?: DashboardContentRecord["visibility"]) {
    await Promise.all(
      editorEntries.map((entry) => {
        const formState = formStateById[entry.id] ?? buildFormState(entry);
        const nextRecord = buildContentRecord(entry, {
          ...formState,
          visibility: nextVisibility ?? formState.visibility,
        });

        return updateContentRecord(nextRecord);
      }),
    );

    toast.success(
      nextVisibility === "ready"
        ? "Content entries marked ready for publish."
        : nextVisibility === "published"
          ? "Content entries published live to the storefront."
        : nextVisibility === "draft"
          ? "Content entries saved as draft."
          : "Content entries saved.",
    );
  }

  async function handleSaveEntry(
    entry: DashboardContentRecord,
    nextVisibility?: DashboardContentRecord["visibility"],
  ) {
    const formState = formStateById[entry.id] ?? buildFormState(entry);
    const nextRecord = buildContentRecord(entry, {
      ...formState,
      visibility: nextVisibility ?? formState.visibility,
    });

    await updateContentRecord(nextRecord);

    toast.success(
      nextVisibility === "ready"
        ? `${areaSurfaceMap[entry.area].storefrontSurface} marked ready for publish.`
        : nextVisibility === "published"
          ? `${areaSurfaceMap[entry.area].storefrontSurface} published live to the storefront.`
          : nextVisibility === "draft"
            ? `${areaSurfaceMap[entry.area].storefrontSurface} saved as draft.`
            : `${areaSurfaceMap[entry.area].storefrontSurface} saved.`,
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
          const formState = formStateById[entry.id] ?? buildFormState(entry);
          const surface = areaSurfaceMap[entry.area];
          const isHomepageHeroEntry = entry.area === "homepage";
          const isFeaturedDropEntry = entry.area === "featured_drop";
          const isStoryEntry = entry.area === "stories";
          const isNavigationPromoEntry = entry.area === "navigation_promos";

          return (
            <SectionCard
              key={entry.id}
              title={surface.storefrontSurface}
              description={`Route ${surface.storefrontRoute} · record title "${entry.title}"`}
            >
              <div id={entry.area.replaceAll("_", "-")} style={{ display: "grid", gap: 18 }}>
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    border: "1px solid var(--color-border)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    background: "rgba(255, 253, 248, 0.82)",
                  }}
                >
                  <strong>{surface.storefrontSurface}</strong>
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Storefront route:{" "}
                    <a
                      href={`${STOREFRONT_URL}${surface.storefrontRoute}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--color-text)", textDecoration: "underline" }}
                    >
                      {surface.storefrontRoute} ↗
                    </a>
                  </span>
                  <p style={{ color: "var(--color-text-muted)", lineHeight: 1.5, margin: 0 }}>
                    {surface.publishingOutcome}
                  </p>
                  <p style={{ color: "var(--color-text-muted)", lineHeight: 1.5, margin: 0 }}>
                    {areaEditNotes[entry.area]}
                  </p>
                </div>

                <div className="dashboard-action-row">
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

                {/* Text fields — stories editor only. Homepage text is hardcoded in the storefront. */}
                {isStoryEntry && (
                  <>
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
                        <span>Slug <span style={hintStyle}>URL path — e.g. built-like-an-army becomes /stories/built-like-an-army</span></span>
                        <input
                          aria-label={`${entry.area} slug`}
                          onChange={(event) => updateField(entry.id, "slug", event.target.value)}
                          placeholder={entry.area === "stories" ? "built-like-an-army" : ""}
                          style={inputStyle}
                          value={formState.slug}
                        />
                      </label>
                      <label style={{ display: "grid", gap: 8 }}>
                        <span>Eyebrow <span style={hintStyle}>Small label shown above the headline</span></span>
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
                        <span>Button label <span style={hintStyle}>Text shown on the primary call-to-action button</span></span>
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
                        <span>Button link <span style={hintStyle}>URL the primary button points to</span></span>
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
                        <span>Secondary button label <span style={hintStyle}>Optional</span></span>
                        <input
                          aria-label={`${entry.area} secondary CTA label`}
                          onChange={(event) =>
                            updateField(entry.id, "secondaryCallToActionLabel", event.target.value)
                          }
                          style={inputStyle}
                          value={formState.secondaryCallToActionLabel}
                        />
                      </label>
                      <label style={{ display: "grid", gap: 8 }}>
                        <span>Secondary button link</span>
                        <input
                          aria-label={`${entry.area} secondary CTA href`}
                          onChange={(event) =>
                            updateField(entry.id, "secondaryCallToActionHref", event.target.value)
                          }
                          style={inputStyle}
                          value={formState.secondaryCallToActionHref}
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
                      <label style={{ display: "grid", gap: 8 }}>
                        <span>Chapter label <span style={hintStyle}>Section marker in story detail, e.g. Chapter 01</span></span>
                        <input
                          aria-label={`${entry.area} chapter label`}
                          onChange={(event) => updateField(entry.id, "chapterLabel", event.target.value)}
                          style={inputStyle}
                          value={formState.chapterLabel}
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

                    <label style={{ display: "grid", gap: 8 }}>
                      <span>Campaign statement</span>
                      <textarea
                        aria-label={`${entry.area} campaign statement`}
                        onChange={(event) => updateField(entry.id, "campaignStatement", event.target.value)}
                        rows={3}
                        style={textareaStyle}
                        value={formState.campaignStatement}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <span>Campaign stats <span style={hintStyle}>One per line — format: Label|Value (e.g. Looks|03)</span></span>
                      <textarea
                        aria-label={`${entry.area} campaign stats`}
                        onChange={(event) => updateField(entry.id, "campaignStatsText", event.target.value)}
                        placeholder={"Looks|03\nFrames|09"}
                        rows={3}
                        style={textareaStyle}
                        value={formState.campaignStatsText}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <span>Content modules <span style={hintStyle}>One per line — format: Title|Body copy</span></span>
                      <textarea
                        aria-label={`${entry.area} modules`}
                        onChange={(event) => updateField(entry.id, "modulesText", event.target.value)}
                        placeholder={"Frame One|Story body copy\nLayer Order|Supporting body copy"}
                        rows={4}
                        style={textareaStyle}
                        value={formState.modulesText}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <span>Product hotspots <span style={hintStyle}>One per line — format: id|label|product-slug|top%|left%|note</span></span>
                      <textarea
                        aria-label={`${entry.area} hotspots`}
                        onChange={(event) => updateField(entry.id, "hotspotsText", event.target.value)}
                        placeholder={"hotspot-1|Lead Look|lunar-utility-jacket|58%|44%|Lead look note"}
                        rows={4}
                        style={textareaStyle}
                        value={formState.hotspotsText}
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
                  </>
                )}

                {/* Hero video — homepage area only */}
                {isHomepageHeroEntry && (
                  <div
                    style={{
                      display: "grid",
                      gap: 14,
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    }}
                  >
                    <label style={{ display: "grid", gap: 8 }}>
                      <span>Media type <span style={hintStyle}>Choose Video for the looping hero clip</span></span>
                      <select
                        aria-label={`${entry.area} media kind`}
                        onChange={(event) =>
                          updateField(entry.id, "mediaKind", event.target.value as "image" | "video")
                        }
                        style={inputStyle}
                        value={formState.mediaKind}
                      >
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                      </select>
                    </label>
                    <label style={{ display: "grid", gap: 8 }}>
                      <span>Media URL <span style={hintStyle}>Full URL to the video or image file</span></span>
                      <input
                        aria-label={`${entry.area} media URL`}
                        onChange={(event) => updateField(entry.id, "mediaUrl", event.target.value)}
                        style={inputStyle}
                        value={formState.mediaUrl}
                      />
                    </label>
                    <label style={{ display: "grid", gap: 8 }}>
                      <span>Poster image URL <span style={hintStyle}>Still frame shown before the video plays</span></span>
                      <input
                        aria-label={`${entry.area} media poster URL`}
                        onChange={(event) =>
                          updateField(entry.id, "mediaPosterUrl", event.target.value)
                        }
                        placeholder="https://..."
                        style={inputStyle}
                        value={formState.mediaPosterUrl}
                      />
                    </label>
                    <label style={{ display: "grid", gap: 8 }}>
                      <span>Alt text <span style={hintStyle}>Accessibility description of the video</span></span>
                      <input
                        aria-label={`${entry.area} media alt`}
                        onChange={(event) => updateField(entry.id, "mediaAlt", event.target.value)}
                        style={inputStyle}
                        value={formState.mediaAlt}
                      />
                    </label>
                  </div>
                )}

                {/* Linked products — shown for all areas in stories editor, and for featured_drop in homepage editor */}
                {(isFeaturedDropEntry || isStoryEntry) && (
                <div style={{ display: "grid", gap: 10 }}>
                  <strong>{isFeaturedDropEntry ? "Featured products" : "Linked products"}</strong>
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
                          gap: 10,
                          alignItems: "start",
                          border: "1px solid var(--color-border)",
                          borderRadius: 16,
                          padding: "12px 14px",
                          background: "rgba(255, 253, 248, 0.82)",
                        }}
                        className="dashboard-full-width"
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
                )}

                {isNavigationPromoEntry && (
                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      border: "1px dashed var(--color-border)",
                      borderRadius: 16,
                      padding: "16px 18px",
                      background: "rgba(255, 253, 248, 0.6)",
                    }}
                  >
                    <strong>Read-only in Slice 4</strong>
                    <p style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                      Navigation promo copy stays locked in this editor. Use the visibility controls
                      here to stage or publish the record, but leave the content fields unchanged.
                    </p>
                  </div>
                )}

                <SectionCard
                  title="Preview"
                  description="A compact summary of what this entry will push to the storefront."
                >
                  <div style={{ display: "grid", gap: 12 }}>
                    <span style={{ color: "var(--color-text-muted)" }}>
                      Status: <strong>{formState.visibility}</strong>
                    </span>
                    {isHomepageHeroEntry && (
                      <span style={{ color: "var(--color-text-muted)" }}>
                        Media: {formState.mediaKind} · {formState.mediaUrl || "no URL set"}
                      </span>
                    )}
                    {(isFeaturedDropEntry || isStoryEntry) && (
                      <span style={{ color: "var(--color-text-muted)" }}>
                        Linked products: {formState.linkedProductIds.length}
                      </span>
                    )}
                    {isStoryEntry && (
                      <>
                        <div>
                          <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Headline</p>
                          <strong>{formState.headline}</strong>
                        </div>
                        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>{formState.body}</p>
                      </>
                    )}
                  </div>
                </SectionCard>

                <div className="dashboard-action-row">
                  <button
                    onClick={() => void handleSaveEntry(entry, "draft")}
                    style={subtleButtonStyle}
                    type="button"
                  >
                    Save this section as draft
                  </button>
                  <button
                    onClick={() => void handleSaveEntry(entry, "ready")}
                    style={subtleButtonStyle}
                    type="button"
                  >
                    Mark this section ready
                  </button>
                  <button
                    onClick={() => void handleSaveEntry(entry, "published")}
                    style={darkButtonStyle}
                    type="button"
                  >
                    Publish this section live
                  </button>
                </div>
              </div>
            </SectionCard>
          );
        })}

        <SectionCard
          title="Bulk publish control"
          description="Apply a status change to every section on this editor page at once when you intentionally want the grouped homepage or stories surfaces to move together."
        >
          <div className="dashboard-action-row">
            <button onClick={() => void handleSave("draft")} style={subtleButtonStyle} type="button">
              Save all as draft
            </button>
            <button onClick={() => void handleSave("ready")} style={darkButtonStyle} type="button">
              Mark all ready
            </button>
            <button onClick={() => void handleSave("published")} style={darkButtonStyle} type="button">
              Publish all live
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

const hintStyle = {
  fontWeight: 400,
  fontSize: 12,
  color: "var(--color-text-muted)",
  display: "block",
  marginTop: 2,
} as const;

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
