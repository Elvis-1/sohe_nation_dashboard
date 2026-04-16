"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import type { DashboardSettingGroup } from "@/src/core/types/dashboard";
import { updateSettingGroups } from "@/src/features/settings/data/repositories/mock-setting-repository";
import { useSettingGroups } from "@/src/features/settings/presentation/state/use-setting-groups";

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

export function SettingsPageShell() {
  const settingGroups = useSettingGroups();
  const [draftGroups, setDraftGroups] = useState<DashboardSettingGroup[]>(settingGroups);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftGroups(settingGroups);
  }, [settingGroups]);

  function updateField(groupId: string, fieldId: string, value: string) {
    setDraftGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              fields: group.fields.map((field) =>
                field.id === fieldId ? { ...field, value } : field,
              ),
            }
          : group,
      ),
    );
  }

  function handleSave() {
    updateSettingGroups(draftGroups);
    setSaveMessage("Settings changes saved to the mocked control desk.");
  }

  if (settingGroups.length === 0) {
    return (
      <div>
        <PageHeader
          eyebrow="Settings"
          title="Operational defaults before live wiring."
          description="The settings area stays intentionally lean in the MVP phase: enough structure for payments, shipping, store profile, and staff access placeholders without overbuilding config systems."
        />
        <EmptyStatePanel
          eyebrow="Settings"
          title="No operational defaults are staged yet."
          description="This panel will hold store profile, payments, shipping, and staff access defaults once the configuration placeholders are loaded."
          actionHref="/"
          actionLabel="Return to overview"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Operational defaults before live wiring."
        description="Review grouped settings, update fixture-backed placeholders, and save the defaults the dashboard will carry into later API work."
        actions={
          <Link href="/" style={subtleLinkStyle}>
            Return to overview
          </Link>
        }
      />

      <SectionCard
        title="Settings groups"
        description="Grouped placeholders for store profile, payments, shipping, notifications, and staff access defaults."
      >
        <div style={{ display: "grid", gap: 16 }}>
          {draftGroups.map((group) => (
            <SectionCard key={group.id} title={group.title} description={group.description}>
              <div
                style={{
                  display: "grid",
                  gap: 14,
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                {group.fields.map((field) => (
                  <label key={field.id} style={{ display: "grid", gap: 8 }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
                      {field.label}
                      {field.placeholder ? " · placeholder" : ""}
                    </span>
                    <input
                      aria-label={`${group.title} ${field.label}`}
                      onChange={(event) => updateField(group.id, field.id, event.target.value)}
                      style={inputStyle}
                      value={field.value}
                    />
                  </label>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          <button onClick={handleSave} style={primaryButtonStyle} type="button">
            Save settings
          </button>
        </div>

        {saveMessage ? (
          <p style={{ marginTop: 14, color: "var(--color-success)", lineHeight: 1.5 }}>
            {saveMessage}
          </p>
        ) : null}
      </SectionCard>
    </div>
  );
}

const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "var(--color-surface)",
} as const;
