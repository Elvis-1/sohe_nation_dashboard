import { apiRequest } from "@/src/core/api/http-client";
import type { DashboardContentRecord } from "@/src/core/types/dashboard";
import {
  mapApiContentToRecord,
  type ApiContentRecord,
  type ApiPaginatedResponse,
} from "@/src/features/content/data/mappers/content-api-mapper";

const BASE = "/dashboard/content";

type ListContentParams = {
  area?: string;
  visibility?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export async function fetchDashboardContent(
  params: ListContentParams = {},
): Promise<{ count: number; results: DashboardContentRecord[] }> {
  const query = new URLSearchParams();
  if (params.area) query.set("area", params.area);
  if (params.visibility) query.set("visibility", params.visibility);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));

  const path = `${BASE}${query.toString() ? `?${query}` : ""}`;
  const data = await apiRequest<ApiPaginatedResponse<ApiContentRecord>>(path);
  return {
    count: data.count,
    results: data.results.map(mapApiContentToRecord),
  };
}

export async function fetchDashboardContentRecord(
  contentId: string,
): Promise<DashboardContentRecord> {
  const data = await apiRequest<ApiContentRecord>(`${BASE}/${contentId}`);
  return mapApiContentToRecord(data);
}

type WritePayload = Partial<{
  area: DashboardContentRecord["area"];
  slug: string;
  title: string;
  visibility: DashboardContentRecord["visibility"];
  eyebrow: string;
  headline: string;
  body: string;
  summary: string;
  call_to_action_label: string;
  call_to_action_href: string;
  secondary_call_to_action_label: string;
  secondary_call_to_action_href: string;
  chapter_label: string;
  campaign_statement: string;
  linked_product_ids: string[];
  media_references: Array<{
    id: string;
    alt: string;
    kind: "image" | "video";
    url: string;
    poster_url?: string;
  }>;
  preview_bullets: string[];
  campaign_stats: Array<{ label: string; value: string }>;
  modules: Array<{ title: string; body: string }>;
  hotspots: Array<{
    id: string;
    label: string;
    product_slug: string;
    top: string;
    left: string;
    note: string;
  }>;
}>;

export async function createDashboardContentRecord(
  payload: WritePayload,
): Promise<DashboardContentRecord> {
  const data = await apiRequest<ApiContentRecord>(BASE, {
    method: "POST",
    body: payload,
  });
  return mapApiContentToRecord(data);
}

export async function updateDashboardContentRecord(
  contentId: string,
  payload: WritePayload,
): Promise<DashboardContentRecord> {
  const data = await apiRequest<ApiContentRecord>(`${BASE}/${contentId}`, {
    method: "PATCH",
    body: payload,
  });
  return mapApiContentToRecord(data);
}

type UploadContentMediaResponse = {
  url: string;
  kind: "image" | "video";
  original_filename: string;
  public_id: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

export async function uploadDashboardContentMedia(
  file: File,
): Promise<UploadContentMediaResponse> {
  const formData = new FormData();
  formData.set("file", file);

  return apiRequest<UploadContentMediaResponse>("/dashboard/content/media/upload", {
    method: "POST",
    body: formData,
  });
}
