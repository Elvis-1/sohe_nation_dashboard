"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useToast } from "@/src/core/ui/toast";
import type { DashboardSettingGroup } from "@/src/core/types/dashboard";
import { updateSettingGroups } from "@/src/features/settings/data/repositories/setting-repository";
import {
  useSettingGroups,
  useSettingGroupsError,
} from "@/src/features/settings/presentation/state/use-setting-groups";

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
  const toast = useToast();
  const settingGroups = useSettingGroups();
  const settingGroupsError = useSettingGroupsError();
  const [draftGroups, setDraftGroups] = useState<DashboardSettingGroup[]>(settingGroups);

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

  async function handleSave() {
    try {
      await updateSettingGroups(draftGroups);
      toast.success("Settings changes saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The settings API update failed.");
    }
  }

  if (settingGroupsError) {
    return (
      <AppStateMessage
        eyebrow="Settings"
        title="The settings desk could not load."
        description={`The dashboard could not read grouped settings from the API. ${settingGroupsError.message}`}
        action={<Link href="/">Return to overview</Link>}
      />
    );
  }

  if (settingGroups.length === 0) {
    return (
      <div>
        <PageHeader
          eyebrow="Settings"
          title="Operational defaults with live API backing."
          description="The settings area stays intentionally lean in the MVP phase: enough structure for payments, shipping, store profile, and staff access placeholders once the API bootstrap runs."
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
        title="Operational defaults with live API backing."
        description="Review grouped settings, update API-backed defaults, and save the operational values the dashboard will carry into later integration work."
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

        <div className="dashboard-action-row" style={{ marginTop: 18 }}>
          <button onClick={handleSave} style={primaryButtonStyle} type="button">
            Save settings
          </button>
        </div>
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
