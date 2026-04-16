import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { ModuleStatePanel } from "@/src/core/ui/module-state-panel";
import { SectionCard } from "@/src/core/ui/section-card";
import { listContentEntries } from "@/src/features/content/data/repositories/mock-content-repository";

export function ContentPageShell() {
  const contentEntries = listContentEntries();

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Manage campaign and editorial surfaces."
        description="This module is scoped to homepage, story, and merchandising content that currently lives in fixture-backed storefront data."
      />
      <SectionCard
        title="Content hub"
        description="Scaffolded launch point for homepage, stories, and merchandising controls."
      >
        {contentEntries.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Content"
            title="No editorial surfaces are staged yet."
            description="Homepage, story, and merchandising entries will appear here once fixture or live content records are ready."
            actionHref="/"
            actionLabel="Return to overview"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {contentEntries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "grid",
                  gap: 6,
                  border: "1px solid var(--color-border)",
                  borderRadius: 18,
                  padding: "16px",
                }}
              >
                <strong>{entry.title}</strong>
                <span style={{ color: "var(--color-accent)", textTransform: "capitalize" }}>
                  {entry.visibility}
                </span>
                <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                  {entry.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <div style={{ marginTop: 16 }}>
        <ModuleStatePanel
          eyebrow="Module state"
          title="Content editing is intentionally held for its own phase."
          description="The placeholder flow now uses the same shell-level state pattern as the rest of the dashboard while homepage and story editing remain pending."
          nextLabel="Return to overview"
          nextHref="/"
        />
      </div>
    </div>
  );
}
