"use client";

import Link from "next/link";
import { useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useToast } from "@/src/core/ui/toast";
import type { DashboardStaffMember, StaffRole } from "@/src/core/types/dashboard";
import { inviteStaffMember } from "@/src/features/staff/data/repositories/staff-repository";
import { useStaffList } from "@/src/features/staff/presentation/state/use-staff-list";
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

const pillStyle = (active: boolean) => ({
  display: "inline-block",
  borderRadius: 999,
  padding: "3px 10px",
  fontSize: 12,
  fontWeight: 600,
  background: active ? "rgba(50, 180, 100, 0.12)" : "rgba(200,80,80,0.10)",
  color: active ? "#1e7a44" : "#b04040",
  border: `1px solid ${active ? "rgba(50,180,100,0.22)" : "rgba(200,80,80,0.18)"}`,
});

const roleBadge = {
  display: "inline-block",
  borderRadius: 999,
  padding: "2px 9px",
  fontSize: 12,
  fontWeight: 600,
  background: "rgba(179,123,31,0.10)",
  color: "var(--color-accent)",
  border: "1px solid rgba(179,123,31,0.18)",
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

const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "12px 16px",
  background: "var(--color-surface)",
  width: "100%",
  fontSize: 14,
} as const;

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};

export function TeamPageShell() {
  const toast = useToast();
  const { session } = useDashboardAuth();
  const members = useStaffList();
  const isOwner = session?.isOwner === true;

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteRole, setInviteRole] = useState<StaffRole>("support");
  const [submitting, setSubmitting] = useState(false);

  async function handleInvite() {
    if (!inviteEmail || !inviteFirstName || !inviteLastName) return;
    setSubmitting(true);
    try {
      const result = await inviteStaffMember({
        email: inviteEmail,
        firstName: inviteFirstName,
        lastName: inviteLastName,
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInviteRole("support");
      setShowInvite(false);
      toast.success(
        result.inviteEmailSent
          ? `${result.firstName} invited. Login details were sent by email.`
          : `${result.firstName} added.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create staff member.");
    } finally {
      setSubmitting(false);
    }
  }

  if (members.length === 0) {
    return (
      <div>
        <PageHeader
          eyebrow="Team"
          title="Staff access and role management."
          description="Create staff accounts, assign roles, and manage access from a single place."
        />
        <EmptyStatePanel
          eyebrow="Team"
          title="No staff records loaded yet."
          description="Staff records will appear once the API bootstrap completes."
          actionHref="/"
          actionLabel="Return to overview"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title="Staff access and role management."
        description="Create staff accounts, assign roles, and control access. Owner actions are protected."
        actions={
          <Link href="/" style={subtleButton}>
            Return to overview
          </Link>
        }
      />

      <SectionCard
        title="Staff members"
        description="All active and inactive staff accounts with their assigned roles."
      >
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {members.map((member) => (
            <div
              key={member.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                border: "1px solid var(--color-border)",
                borderRadius: 18,
                padding: "14px 18px",
                background: "rgba(255,253,248,0.7)",
              }}
            >
              <div>
                <strong style={{ display: "block", marginBottom: 3 }}>
                  {member.firstName} {member.lastName}
                </strong>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{member.email}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={roleBadge}>{ROLE_LABELS[member.role]}</span>
                <span style={pillStyle(member.isActive)}>
                  {member.isActive ? "Active" : "Inactive"}
                </span>
                <Link
                  href={`/team/${member.id}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    textDecoration: "underline",
                  }}
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>

        {isOwner && (
          <>
            {showInvite ? (
              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 20,
                  padding: "18px 20px",
                  display: "grid",
                  gap: 14,
                }}
              >
                <strong>Add staff member</strong>
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
                  The new staff member will receive a secure email link to create their password and enter the dashboard.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                  }}
                >
                  <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
                    First name
                    <input
                      style={inputStyle}
                      value={inviteFirstName}
                      onChange={(e) => setInviteFirstName(e.target.value)}
                      placeholder="Tolu"
                    />
                  </label>
                  <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
                    Last name
                    <input
                      style={inputStyle}
                      value={inviteLastName}
                      onChange={(e) => setInviteLastName(e.target.value)}
                      placeholder="Adeyemi"
                    />
                  </label>
                </div>
                <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
                  Email
                  <input
                    style={inputStyle}
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="tolu@sohesnation.com"
                  />
                </label>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
                    Role
                    <select
                      style={selectStyle}
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as StaffRole)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <RolePermissionsLegend activeRole={inviteRole} />
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={handleInvite} style={primaryButton} disabled={submitting}>
                    {submitting ? "Adding…" : "Add member"}
                  </button>
                  <button onClick={() => setShowInvite(false)} style={subtleButton}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowInvite(true)} style={primaryButton}>
                Add staff member
              </button>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}
