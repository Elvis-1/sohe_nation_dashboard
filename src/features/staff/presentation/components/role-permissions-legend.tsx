"use client";

import { useState } from "react";

type Section =
  | "Overview"
  | "Products"
  | "Orders"
  | "Content"
  | "Returns"
  | "Customers"
  | "Settings"
  | "Team";

type Access = "full" | "view" | "none";

type RoleRow = {
  role: string;
  label: string;
  description: string;
  access: Record<Section, Access>;
};

const SECTIONS: Section[] = [
  "Overview",
  "Products",
  "Orders",
  "Content",
  "Returns",
  "Customers",
  "Settings",
  "Team",
];

const ROLES: RoleRow[] = [
  {
    role: "admin",
    label: "Admin",
    description: "Broad access for senior staff. Cannot modify owner accounts.",
    access: {
      Overview: "full",
      Products: "full",
      Orders: "full",
      Content: "full",
      Returns: "full",
      Customers: "full",
      Settings: "full",
      Team: "full",
    },
  },
  {
    role: "editor",
    label: "Editor",
    description: "Catalogue and content management. Limited order visibility.",
    access: {
      Overview: "full",
      Products: "full",
      Orders: "view",
      Content: "full",
      Returns: "view",
      Customers: "view",
      Settings: "none",
      Team: "none",
    },
  },
  {
    role: "operations",
    label: "Operations",
    description: "Fulfilment and post-purchase focus. No content editing.",
    access: {
      Overview: "full",
      Products: "view",
      Orders: "full",
      Content: "none",
      Returns: "full",
      Customers: "view",
      Settings: "none",
      Team: "none",
    },
  },
  {
    role: "support",
    label: "Support",
    description: "Read-only access to customer and order context.",
    access: {
      Overview: "full",
      Products: "none",
      Orders: "view",
      Content: "none",
      Returns: "view",
      Customers: "view",
      Settings: "none",
      Team: "none",
    },
  },
];

const ACCESS_CELL: Record<Access, { symbol: string; color: string; title: string }> = {
  full: { symbol: "●", color: "#1e7a44", title: "Full access" },
  view: { symbol: "◐", color: "#b37a1f", title: "View only" },
  none: { symbol: "○", color: "#c0b8aa", title: "No access" },
};

export function RolePermissionsLegend({ activeRole }: { activeRole?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 4 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontSize: 13,
          color: "var(--color-accent)",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        {open ? "Hide" : "View"} role permissions
        <span style={{ fontSize: 10, lineHeight: 1 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          style={{
            marginTop: 12,
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            overflow: "hidden",
            fontSize: 12,
          }}
        >
          {/* Legend key */}
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: "10px 14px",
              background: "rgba(234,215,177,0.18)",
              borderBottom: "1px solid var(--color-border)",
              flexWrap: "wrap",
            }}
          >
            {(Object.entries(ACCESS_CELL) as [Access, (typeof ACCESS_CELL)[Access]][]).map(
              ([key, { symbol, color, title }]) => (
                <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color, fontSize: 14 }}>{symbol}</span>
                  <span style={{ color: "var(--color-text-muted)" }}>{title}</span>
                </span>
              ),
            )}
          </div>

          {/* Role rows */}
          {ROLES.map((row, idx) => {
            const isActive = row.role === activeRole;
            return (
              <div
                key={row.role}
                style={{
                  borderTop: idx === 0 ? undefined : "1px solid var(--color-border)",
                  background: isActive ? "rgba(179,123,31,0.06)" : "transparent",
                  padding: "10px 14px",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <strong style={{ fontSize: 13, minWidth: 80 }}>{row.label}</strong>
                  {isActive && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--color-accent)",
                        background: "rgba(179,123,31,0.12)",
                        border: "1px solid rgba(179,123,31,0.2)",
                        borderRadius: 999,
                        padding: "1px 7px",
                      }}
                    >
                      selected
                    </span>
                  )}
                  <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                    {row.description}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {SECTIONS.map((section) => {
                    const { symbol, color, title } = ACCESS_CELL[row.access[section]];
                    return (
                      <span
                        key={section}
                        title={`${section}: ${title}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          border: "1px solid var(--color-border)",
                          borderRadius: 999,
                          padding: "2px 8px",
                          fontSize: 11,
                          color:
                            row.access[section] === "none"
                              ? "var(--color-text-muted)"
                              : "var(--color-text)",
                          opacity: row.access[section] === "none" ? 0.5 : 1,
                        }}
                      >
                        <span style={{ color, fontSize: 12 }}>{symbol}</span>
                        {section}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
