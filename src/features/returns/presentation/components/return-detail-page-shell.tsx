"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useToast } from "@/src/core/ui/toast";
import { ApiError } from "@/src/core/api/http-client";
import type { DashboardReturnRecord } from "@/src/core/types/dashboard";
import { updateReturnRecord } from "@/src/features/returns/data/repositories/return-repository";
import { useReturnDesk } from "@/src/features/returns/presentation/state/use-return-desk";

type ReturnDetailPageShellProps = {
  returnId: string;
};

export function ReturnDetailPageShell({ returnId }: ReturnDetailPageShellProps) {
  const returns = useReturnDesk();
  const returnRecord = useMemo(
    () => returns.find((item) => item.id === returnId) ?? null,
    [returnId, returns],
  );
  const toast = useToast();
  const [status, setStatus] = useState<DashboardReturnRecord["status"] | "">(returnRecord?.status ?? "");
  const [internalDecision, setInternalDecision] = useState(returnRecord?.internalDecision ?? "");

  if (!returnRecord) {
    return (
      <AppStateMessage
        eyebrow="Returns"
        title="This return record is missing"
        description="The return you tried to open is not available in the current fixture queue."
        action={<Link href="/returns">Back to returns</Link>}
      />
    );
  }

  async function handleSave() {
    if (!returnRecord) {
      return;
    }

    try {
      await updateReturnRecord({
        ...returnRecord,
        status: (status || returnRecord.status) as DashboardReturnRecord["status"],
        internalDecision,
      });
      toast.success("Return updates saved.");
    } catch (error) {
      if (error instanceof ApiError && error.code === "invalid_return_transition") {
        toast.error(`Can't move to "${status}" from "${returnRecord.status}". Check the allowed transition order: New → In Review → Approved or Rejected → Completed.`);
        return;
      }
      toast.error(error instanceof ApiError ? error.message : "Unable to save. Check your connection and try again.");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Returns"
        title={`Return ${returnRecord.id}`}
        description="Review the customer context, request reason, and item details, then record the internal decision that moves the return through its next step."
        actions={
          <Link
            href="/returns"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-pill)",
              padding: "14px 18px",
              border: "1px solid var(--color-border)",
              background: "rgba(255, 253, 248, 0.82)",
              color: "var(--color-text)",
              fontWeight: 600,
            }}
          >
            Back to returns
          </Link>
        }
      />

      <div style={{ display: "grid", gap: 16 }}>
        <SectionCard
          title="Return summary"
          description="The core request data already implied by the storefront account returns workflow."
        >
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Customer</p>
              <strong>{returnRecord.customerName}</strong>
              <p style={{ marginTop: 4, color: "var(--color-text-muted)" }}>
                {returnRecord.customerEmail}
              </p>
            </div>
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Order</p>
              <strong>{returnRecord.orderId}</strong>
            </div>
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Requested</p>
              <strong>{returnRecord.requestedAt.slice(0, 10)}</strong>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Item</p>
              <strong>{returnRecord.itemSummary}</strong>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Reason</p>
              <strong>{returnRecord.reason}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Customer note"
          description="The request note submitted by the customer. Read-only."
        >
          {returnRecord.customerNote ? (
            <p style={{ margin: 0, lineHeight: 1.6 }}>{returnRecord.customerNote}</p>
          ) : (
            <p style={{ margin: 0, color: "var(--color-text-muted)", fontStyle: "italic" }}>
              No note provided.
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="Decision control"
          description="Move the return through the mocked lifecycle and record the internal decision for staff follow-through."
        >
          <div style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Return status</span>
              <select
                aria-label="Return status"
                onChange={(event) => setStatus(event.target.value as DashboardReturnRecord["status"])}
                style={inputStyle}
                value={status}
              >
                <option value="new">New</option>
                <option value="in_review">In review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Internal decision</span>
              <textarea
                aria-label="Internal decision"
                onChange={(event) => setInternalDecision(event.target.value)}
                rows={5}
                style={textareaStyle}
                value={internalDecision}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
            <button onClick={handleSave} style={primaryButtonStyle} type="button">
              Save return updates
            </button>
            <Link href={`/customers/${returnRecord.customerId}`} style={secondaryLinkStyle}>
              Open customer
            </Link>
          </div>

        </SectionCard>
      </div>
    </div>
  );
}

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

const secondaryLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  padding: "14px 18px",
  background: "rgba(255, 253, 248, 0.82)",
  color: "var(--color-text)",
  fontWeight: 600,
} as const;
