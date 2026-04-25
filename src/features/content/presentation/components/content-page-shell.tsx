"use client";

import Link from "next/link";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import type { DashboardContentArea } from "@/src/core/types/dashboard";
import {
  useContentDesk,
  useContentDeskError,
} from "@/src/features/content/presentation/state/use-content-desk";

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

const areaRouteMap: Record<DashboardContentArea, string> = {
  homepage: "/content/homepage",
  featured_drop: "/content/homepage#featured-drop",
  stories: "/content/stories",
  navigation_promos: "/content/stories#navigation-promos",
};

const areaLabelMap: Record<DashboardContentArea, string> = {
  homepage: "Homepage",
  featured_drop: "Featured drop",
  stories: "Stories",
  navigation_promos: "Navigation promos",
};

const areaMetaMap: Record<
  DashboardContentArea,
  {
    storefrontRoute: string;
    storefrontSurface: string;
    storefrontComponent: string;
    publishingNote: string;
  }
> = {
  homepage: {
    storefrontRoute: "/",
    storefrontSurface: "Marketing homepage hero",
    storefrontComponent: "HeroCampaign",
    publishingNote: "A published homepage record drives the lead hero and prevents the storefront homepage from falling back to the unpublished notice.",
  },
  featured_drop: {
    storefrontRoute: "/#featured-drop",
    storefrontSurface: "Homepage featured product rail",
    storefrontComponent: "ProductGrid",
    publishingNote: "This controls the product grid directly under the hero, including the lead featured look and linked products.",
  },
  stories: {
    storefrontRoute: "/stories and /stories/[slug]",
    storefrontSurface: "Stories index and story detail pages",
    storefrontComponent: "Lookbook stories",
    publishingNote: "Published stories appear in the stories listing and unlock their individual story detail routes.",
  },
  navigation_promos: {
    storefrontRoute: "/#story-band",
    storefrontSurface: "Homepage story band promo",
    storefrontComponent: "StoryBand",
    publishingNote: "A published navigation promo feeds the story band CTA and promo modules near the bottom of the homepage.",
  },
};

export function ContentPageShell() {
  const contentEntries = useContentDesk();
  const contentError = useContentDeskError();

  if (contentError) {
    return (
      <AppStateMessage
        eyebrow="Content"
        title="The content desk could not load."
        description={`The dashboard could not read content records from the API. ${contentError.message}`}
        action={<Link href="/">Return to overview</Link>}
      />
    );
  }

  if (contentEntries.length === 0) {
    return (
      <div>
        <PageHeader
          eyebrow="Content"
          title="Manage campaign and editorial surfaces."
          description="This module manages the canonical homepage, story, and merchandising content records that drive the storefront campaign surfaces."
        />
        <EmptyStatePanel
          eyebrow="Content"
          title="No editorial surfaces are staged yet."
          description="Homepage, story, and merchandising entries will appear here once content records are created in the API."
          actionHref="/"
          actionLabel="Return to overview"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Manage campaign and editorial surfaces."
        description="Choose a content area, review the storefront-facing structure, and move canonical content records between draft, ready, and published states."
        actions={
          <>
            <Link href="/content/homepage" style={darkPillStyle}>
              Open homepage editor
            </Link>
            <Link href="/content/stories" style={lightPillStyle}>
              Open stories editor
            </Link>
          </>
        }
      />

      <SectionCard
        title="Content hub"
        description="Choose the operational surface you want to update: homepage, featured drop, stories/lookbooks, or navigation promos."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {contentEntries.map((entry) => (
            (() => {
              const meta = areaMetaMap[entry.area];

              return (
                <article
                  key={entry.id}
                  style={{
                    display: "grid",
                    gap: 12,
                    border: "1px solid var(--color-border)",
                    borderRadius: 20,
                    padding: "18px",
                    background: "rgba(255, 253, 248, 0.82)",
                  }}
                >
                  <div className="dashboard-split-row dashboard-split-row--center">
                    <div style={{ display: "grid", gap: 6 }}>
                      <strong>{meta.storefrontSurface}</strong>
                      <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                        Record title: {entry.title}
                      </span>
                      <span style={{ color: "var(--color-text-muted)" }}>
                        {areaLabelMap[entry.area]} updates the {meta.storefrontSurface.toLowerCase()}.
                      </span>
                    </div>
                    <span
                      style={{
                        borderRadius: "var(--radius-pill)",
                        padding: "8px 12px",
                        background:
                          entry.visibility === "published"
                            ? "rgba(47, 125, 50, 0.14)"
                            : "rgba(179, 123, 31, 0.14)",
                        color:
                          entry.visibility === "published"
                            ? "var(--color-success)"
                            : "var(--color-accent)",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {entry.visibility}
                    </span>
                  </div>

                  <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>{entry.summary}</p>

                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      border: "1px solid var(--color-border)",
                      borderRadius: 16,
                      padding: "14px 16px",
                      background: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    <div style={{ display: "grid", gap: 4 }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Storefront surface
                      </span>
                      <strong>{meta.storefrontSurface}</strong>
                    </div>
                    <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                      Route: {meta.storefrontRoute}
                    </span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                      Rendered by: {meta.storefrontComponent}
                    </span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                      Live state: {entry.visibility === "published" ? "Currently live on storefront" : `Not live yet (${entry.visibility})`}
                    </span>
                    <p style={{ color: "var(--color-text-muted)", lineHeight: 1.5, margin: 0 }}>
                      {meta.publishingNote}
                    </p>
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                      {entry.linkedProductIds.length} linked products · {entry.mediaReferences.length} media refs
                    </span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                      Preview structure: {entry.previewBullets.join(" · ")}
                    </span>
                  </div>

                  <div className="dashboard-action-row">
                    <Link href={areaRouteMap[entry.area]} style={darkPillStyle}>
                      Edit this storefront surface
                    </Link>
                  </div>
                </article>
              );
            })()
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
