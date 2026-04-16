/**
 * API client for the catalog/products dashboard endpoints.
 * All communication with /api/v1/dashboard/catalog/products/ goes through here.
 */

import { apiRequest } from "@/src/core/api/http-client";
import type { DashboardProductRecord } from "@/src/core/types/dashboard";
import {
  mapApiProductToRecord,
  type ApiProductRecord,
  type ApiPaginatedResponse,
} from "@/src/features/products/data/mappers/product-api-mapper";

const BASE = "/dashboard/catalog/products";

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

type ListProductsParams = {
  visibility?: string;
  category?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export async function fetchDashboardProducts(
  params: ListProductsParams = {},
): Promise<{ count: number; results: DashboardProductRecord[] }> {
  const query = new URLSearchParams();
  if (params.visibility) query.set("visibility", params.visibility);
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.ordering) query.set("ordering", params.ordering);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));

  const path = `${BASE}${query.toString() ? `?${query}` : ""}`;
  const data = await apiRequest<ApiPaginatedResponse<ApiProductRecord>>(path);

  return {
    count: data.count,
    results: data.results.map(mapApiProductToRecord),
  };
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export async function fetchDashboardProduct(productId: string): Promise<DashboardProductRecord> {
  const data = await apiRequest<ApiProductRecord>(`${BASE}/${productId}`);
  return mapApiProductToRecord(data);
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

type CreateProductPayload = {
  slug: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  category: DashboardProductRecord["category"];
  gender: DashboardProductRecord["audience"];
  visibility?: DashboardProductRecord["visibility"];
  default_region?: string;
  region_availability?: string[];
  media?: Array<{
    alt: string;
    kind: "image" | "video";
    url: string;
    poster_url?: string;
    is_primary?: boolean;
    order?: number;
  }>;
  narrative?: {
    campaign_note?: string;
    fit_guidance?: string;
    material_story?: string;
    sustainability_note?: string;
    delivery_note?: string;
  };
  variants?: Array<{
    sku: string;
    size: string;
    color: string;
    inventory_quantity?: number;
    price_amount: number;
    price_currency: string;
    compare_at_price_amount?: number;
    compare_at_price_currency?: string;
  }>;
};

export async function createDashboardProduct(
  payload: CreateProductPayload,
): Promise<DashboardProductRecord> {
  const data = await apiRequest<ApiProductRecord>(BASE, {
    method: "POST",
    body: payload,
  });
  return mapApiProductToRecord(data);
}

// ---------------------------------------------------------------------------
// Update (PATCH)
// ---------------------------------------------------------------------------

type VariantUpdateItem =
  | {
      id: string;
      size?: string;
      color?: string;
      inventory_quantity?: number;
      price_amount?: number;
      price_currency?: string;
      compare_at_price_amount?: number | null;
      compare_at_price_currency?: string;
    }
  | {
      sku: string;
      size: string;
      color: string;
      inventory_quantity?: number;
      price_amount: number;
      price_currency: string;
      compare_at_price_amount?: number | null;
      compare_at_price_currency?: string;
    };

type UpdateProductPayload = Partial<{
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  category: DashboardProductRecord["category"];
  gender: DashboardProductRecord["audience"];
  visibility: DashboardProductRecord["visibility"];
  default_region: string;
  region_availability: string[];
  narrative: {
    campaign_note?: string;
    fit_guidance?: string;
    material_story?: string;
    sustainability_note?: string;
    delivery_note?: string;
  };
  variants: VariantUpdateItem[];
}>;

export async function updateDashboardProduct(
  productId: string,
  payload: UpdateProductPayload,
): Promise<DashboardProductRecord> {
  const data = await apiRequest<ApiProductRecord>(`${BASE}/${productId}`, {
    method: "PATCH",
    body: payload,
  });
  return mapApiProductToRecord(data);
}
