import { apiRequest } from "@/src/core/api/http-client";
import type { DashboardOrderRecord } from "@/src/core/types/dashboard";
import {
  mapApiOrderToRecord,
  type ApiOrderRecord,
  type ApiPaginatedResponse,
} from "@/src/features/orders/data/mappers/order-api-mapper";

const BASE = "/dashboard/orders";

type ListOrdersParams = {
  status?: string;
  payment_provider?: string;
  search?: string;
  created_after?: string;
  created_before?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export async function fetchDashboardOrders(
  params: ListOrdersParams = {},
): Promise<{ count: number; results: DashboardOrderRecord[] }> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.payment_provider) query.set("payment_provider", params.payment_provider);
  if (params.search) query.set("search", params.search);
  if (params.created_after) query.set("created_after", params.created_after);
  if (params.created_before) query.set("created_before", params.created_before);
  if (params.ordering) query.set("ordering", params.ordering);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));

  const path = `${BASE}${query.toString() ? `?${query}` : ""}`;
  const data = await apiRequest<ApiPaginatedResponse<ApiOrderRecord>>(path);

  return {
    count: data.count,
    results: data.results.map(mapApiOrderToRecord),
  };
}

export async function fetchDashboardOrder(orderId: string): Promise<DashboardOrderRecord> {
  const data = await apiRequest<ApiOrderRecord>(`${BASE}/${orderId}`);
  return mapApiOrderToRecord(data);
}

type UpdateOrderPayload = Partial<{
  status: DashboardOrderRecord["status"];
  fulfillment_note: string;
  internal_note: string;
}>;

export async function updateDashboardOrder(
  orderId: string,
  payload: UpdateOrderPayload,
): Promise<DashboardOrderRecord> {
  const data = await apiRequest<ApiOrderRecord>(`${BASE}/${orderId}`, {
    method: "PATCH",
    body: payload,
  });
  return mapApiOrderToRecord(data);
}

export async function archiveDashboardOrder(orderId: string): Promise<void> {
  await apiRequest<void>(`${BASE}/${orderId}`, {
    method: "DELETE",
  });
}
