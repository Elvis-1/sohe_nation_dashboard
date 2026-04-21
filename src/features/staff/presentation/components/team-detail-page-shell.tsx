"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useToast } from "@/src/core/ui/toast";
import type { DashboardStaffMember, StaffRole } from "@/src/core/types/dashboard";
import {
  deleteStaffMember,
  loadStaffMember,
  updateStaffMember,
} from "@/src/features/staff/data/repositories/staff-repository";
import { useDashboardAuth } from "@/src/features/auth/presentation/state/dashboard-auth-provider";
import { RolePermissionsLegend } from "@/src/features/staff/presentation/components/role-permissions-legend";

const ROLES: StaffRole[] = ["admin", "editor", "operations", "support"];

const ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  operations: "Operations",
  support: "Support",
};

const ACTION_LABELS: Record<string, string> = {
  created: "Account created",
  role_changed: "Role changed",
  deactivated: "Deactivated",
  reactivated: "Reactivated",
};

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  border: 0,
  borderRadius: "var(--radius-pill)",
  padding: "12px 18px",
  background: "var(--color-surface-inverse)",
  color: "var(--color-text-inverse)",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
} as const;

const subtleButton = {
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  padding: "12px 18px",
  background: "rgba(255,253,248,0.82)",
  color: "var(--color-text)",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
} as const;

const dangerButton = {
  ...subtleButton,
  color: "#b04040",
  borderColor: "rgba(200,80,80,0.28)",
} as const;

const solidDangerButton = {
  ...primaryButton,
  background: "#b04040",
} as const;

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(34, 24, 12, 0.42)",
  backdropFilter: "blur(6px)",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  zIndex: 1000,
} as const;

const dialogStyle = {
  width: "min(100%, 460px)",
  borderRadius: 28,
  border: "1px solid rgba(200,80,80,0.18)",
  background:
    "linear-gradient(180deg, rgba(255,251,247,0.98) 0%, rgba(255,245,239,0.96) 100%)",
  boxShadow: "0 26px 90px rgba(45, 28, 17, 0.18)",
  padding: "24px",
  display: "grid",
  gap: 16,
} as const;

const selectStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "12px 16px",
  background: "var(--color-surface)",
  width: "100%",
  fontSize: 14,
  cursor: "pointer",
} as const;

type Props = { memberId: string };

export function TeamDetailPageShell({ memberId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { session } = useDashboardAuth();
  const isOwner = session?.isOwner === true;

  const [member, setMember] = useState<DashboardStaffMember | null | "loading">("loading");
  const [selectedRole, setSelectedRole] = useState<StaffRole>("support");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadStaffMember(memberId)
      .then((m) => {
        setMember(m);
        setSelectedRole(m.role as StaffRole);
      })
      .catch(() => setMember(null));
  }, [memberId]);

  async function handleRoleChange() {
    if (!member || member === "loading") return;
    setSaving(true);
    try {
      const updated = await updateStaffMember(member.id, { role: selectedRole });
      setMember(updated);
      toast.success("Role updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!member || member === "loading") return;
    setSaving(true);
    try {
      const updated = await updateStaffMember(member.id, { isActive: !member.isActive });
      setMember(updated);
      toast.success(updated.isActive ? "Staff member reactivated." : "Staff member deactivated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!member || member === "loading") return;
    setSaving(true);
    try {
      await deleteStaffMember(member.id);
      toast.success("Deactivated staff member deleted.");
      router.push("/team");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete staff member.");
    } finally {
      setShowDeleteConfirm(false);
      setSaving(false);
    }
  }

  if (member === "loading") {
    return (
      <AppStateMessage eyebrow="Team" title="Loading staff member…" description="" action={null} />
    );
  }

  if (member === null) {
    return (
      <AppStateMessage
        eyebrow="Team"
        title="Staff member not found."
        description="This account may have been removed or the ID is incorrect."
        action={<Link href="/team">Back to team</Link>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title={`${member.firstName} ${member.lastName}`}
        description={`${member.email} · ${ROLE_LABELS[member.role]} · ${member.isActive ? "Active" : "Inactive"}`}
        actions={
          <Link href="/team" style={subtleButton}>
            Back to team
          </Link>
        }
      />

      {isOwner && !member.isOwner && (
        <SectionCard
          title="Role and access"
          description="Change the staff member's role, deactivate access, or permanently delete an already deactivated account. Owner accounts are protected."
        >
          <div style={{ display: "grid", gap: 14, maxWidth: 380 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
                Role
                <select
                  style={selectStyle}
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as StaffRole)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
              <RolePermissionsLegend activeRole={selectedRole} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleRoleChange}
                style={primaryButton}
                disabled={saving || selectedRole === member.role}
              >
                {saving ? "Saving…" : "Save role"}
              </button>
              <button onClick={handleToggleActive} style={dangerButton} disabled={saving}>
                {member.isActive ? "Deactivate" : "Reactivate"}
              </button>
              {!member.isActive && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={dangerButton}
                  disabled={saving}
                >
                  Delete account
                </button>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      {member.isOwner && (
        <SectionCard title="Owner account" description="Owner accounts cannot be modified through this interface.">
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            The owner role and account status are managed through the server configuration.
          </p>
        </SectionCard>
      )}

      {member.auditLog && member.auditLog.length > 0 && (
        <SectionCard title="Audit log" description="Recent actions taken on this account.">
          <div style={{ display: "grid", gap: 8 }}>
            {member.auditLog.map((entry, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  border: "1px solid var(--color-border)",
                  borderRadius: 14,
                  padding: "10px 14px",
                  fontSize: 13,
                }}
              >
                <div>
                  <strong style={{ display: "block", marginBottom: 2 }}>
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </strong>
                  <span style={{ color: "var(--color-text-muted)" }}>
                    by {entry.performedByEmail}
                    {entry.metadata.from && entry.metadata.to
                      ? ` · ${entry.metadata.from} → ${entry.metadata.to}`
                      : ""}
                  </span>
                </div>
                <span style={{ color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {showDeleteConfirm && !member.isOwner && !member.isActive && (
        <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="delete-staff-title">
          <div style={dialogStyle}>
            <div style={{ display: "grid", gap: 8 }}>
              <p
                style={{
                  margin: 0,
                  color: "#b04040",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Permanent Delete
              </p>
              <h2
                id="delete-staff-title"
                style={{
                  margin: 0,
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  lineHeight: 0.96,
                }}
              >
                Delete {member.firstName} {member.lastName}&rsquo;s account?
              </h2>
              <p style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                This permanently removes the deactivated staff account from the dashboard. This action
                cannot be undone.
              </p>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(200,80,80,0.14)",
                background: "rgba(255,255,255,0.62)",
                padding: "14px 16px",
                display: "grid",
                gap: 6,
              }}
            >
              <strong style={{ fontSize: 14 }}>
                {member.email}
              </strong>
              <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                {ROLE_LABELS[member.role]} · Inactive account
              </span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={subtleButton}
                disabled={saving}
              >
                Cancel
              </button>
              <button onClick={handleDelete} style={solidDangerButton} disabled={saving}>
                {saving ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
