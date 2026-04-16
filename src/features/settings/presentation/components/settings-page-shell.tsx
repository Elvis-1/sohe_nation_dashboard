import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { ModuleStatePanel } from "@/src/core/ui/module-state-panel";
import { SectionCard } from "@/src/core/ui/section-card";
import { listSettingGroups } from "@/src/features/settings/data/repositories/mock-setting-repository";

export function SettingsPageShell() {
  const settingGroups = listSettingGroups();

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Operational defaults before live wiring."
        description="The settings area stays intentionally lean in the MVP phase: enough structure for payments, shipping, store profile, and staff access placeholders without overbuilding config systems."
      />
      <SectionCard
        title="Settings groups"
        description="Scaffolded placeholders for later backend-backed configuration."
      >
        {settingGroups.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Settings"
            title="No operational defaults are staged yet."
            description="This panel will hold store profile, payments, shipping, and staff access defaults once the configuration placeholders are loaded."
            actionHref="/"
            actionLabel="Return to overview"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {settingGroups.map((group) => (
              <div
                key={group.id}
                style={{
                  display: "grid",
                  gap: 6,
                  border: "1px solid var(--color-border)",
                  borderRadius: 18,
                  padding: "16px",
                }}
              >
                <strong>{group.title}</strong>
                <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                  {group.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <div style={{ marginTop: 16 }}>
        <ModuleStatePanel
          eyebrow="Module state"
          title="Operational defaults will deepen during the settings phase."
          description="Until then, this shared panel keeps incomplete modules consistent and gives the dashboard a clearer temporary state pattern."
          nextLabel="Back to overview"
          nextHref="/"
        />
      </div>
    </div>
  );
}
