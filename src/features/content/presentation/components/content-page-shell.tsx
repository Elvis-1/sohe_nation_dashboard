"use client";

import Link from "next/link";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import type { DashboardContentArea } from "@/src/core/types/dashboard";
import { useContentDesk } from "@/src/features/content/presentation/state/use-content-desk";

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

export function ContentPageShell() {
  const contentEntries = useContentDesk();

  if (contentEntries.length === 0) {
    return (
      <div>
        <PageHeader
          eyebrow="Content"
          title="Manage campaign and editorial surfaces."
          description="This module is scoped to homepage, story, and merchandising content that currently lives in fixture-backed storefront data."
        />
        <EmptyStatePanel
          eyebrow="Content"
          title="No editorial surfaces are staged yet."
          description="Homepage, story, and merchandising entries will appear here once fixture or live content records are ready."
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
        description="Choose a content area, review the storefront-facing structure, and move fixture-backed entries between draft, ready, and published states."
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
            <article
              key={entry.id}
              style={{
                display: "grid",
                gap: 10,
                border: "1px solid var(--color-border)",
                borderRadius: 20,
                padding: "18px",
                background: "rgba(255, 253, 248, 0.82)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <strong>{entry.title}</strong>
                  <span style={{ color: "var(--color-text-muted)" }}>{areaLabelMap[entry.area]}</span>
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

              <div style={{ display: "grid", gap: 8 }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                  {entry.linkedProductIds.length} linked products · {entry.mediaReferences.length} media refs
                </span>
                <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                  Preview: {entry.previewBullets.join(" · ")}
                </span>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href={areaRouteMap[entry.area]} style={darkPillStyle}>
                  Edit area
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
