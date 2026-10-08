import type { DashboardReturnRecord } from "@/src/core/types/dashboard";

export type ApiReturnRecord = {
  id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: DashboardReturnRecord["status"];
  reason: string;
  requested_at: string;
  item_summary: string;
  customer_note: string;
  internal_decision: string;
  lines?: Array<{
    id: string;
    order_line_id: string;
    title: string;
    variant_label: string;
    quantity: number;
    reason_code: string;
    reason_label: string;
    return_policy: DashboardReturnRecord["lines"][number]["returnPolicy"];
    return_window_days: number | null;
  }>;
};

export type ApiPaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function mapApiReturnToRecord(api: ApiReturnRecord): DashboardReturnRecord {
  return {
    id: api.id,
    orderId: api.order_id,
    customerId: api.customer_id,
    customerName: api.customer_name,
    customerEmail: api.customer_email,
    status: api.status,
    reason: api.reason,
    requestedAt: api.requested_at,
    itemSummary: api.item_summary,
    customerNote: api.customer_note,
    internalDecision: api.internal_decision,
    lines: (api.lines ?? []).map((line) => ({
      id: line.id,
      orderLineId: line.order_line_id,
      title: line.title,
      variantLabel: line.variant_label,
      quantity: line.quantity,
      reasonCode: line.reason_code,
      reasonLabel: line.reason_label,
      returnPolicy: line.return_policy,
      returnWindowDays: line.return_window_days,
    })),
  };
}
