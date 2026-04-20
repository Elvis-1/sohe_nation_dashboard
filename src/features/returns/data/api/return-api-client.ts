import { apiRequest } from "@/src/core/api/http-client";
import type { DashboardReturnRecord } from "@/src/core/types/dashboard";
import {
  mapApiReturnToRecord,
  type ApiReturnRecord,
  type ApiPaginatedResponse,
} from "@/src/features/returns/data/mappers/return-api-mapper";

const BASE = "/dashboard/returns";

type ListReturnsParams = {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export async function fetchDashboardReturns(
  params: ListReturnsParams = {},
): Promise<{ count: number; results: DashboardReturnRecord[] }> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));

  const path = `${BASE}${query.toString() ? `?${query}` : ""}`;
  const data = await apiRequest<ApiPaginatedResponse<ApiReturnRecord>>(path);

  return {
    count: data.count,
    results: data.results.map(mapApiReturnToRecord),
  };
}

export async function fetchDashboardReturn(returnId: string): Promise<DashboardReturnRecord> {
  const data = await apiRequest<ApiReturnRecord>(`${BASE}/${returnId}`);
  return mapApiReturnToRecord(data);
}

type UpdateReturnPayload = Partial<{
  status: DashboardReturnRecord["status"];
  internal_decision: string;
}>;

export async function updateDashboardReturn(
  returnId: string,
  payload: UpdateReturnPayload,
): Promise<DashboardReturnRecord> {
  const data = await apiRequest<ApiReturnRecord>(`${BASE}/${returnId}`, {
    method: "PATCH",
    body: payload,
  });
  return mapApiReturnToRecord(data);
}
