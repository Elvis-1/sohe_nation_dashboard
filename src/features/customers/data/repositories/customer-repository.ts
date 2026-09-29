import type { DashboardCustomerRecord } from "@/src/core/types/dashboard";
import { apiRequest } from "@/src/core/api/http-client";

/** Customers shown per page on the dashboard list. */
export const CUSTOMER_PAGE_SIZE = 25;

type ApiCustomerList = {
  count: number;
  results: ApiCustomer[];
};

type ApiCustomer = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  default_region: DashboardCustomerRecord["defaultRegion"];
  order_count: number;
  return_count: number;
  address_count: number;
  order_ids?: string[];
  return_ids?: string[];
};

function mapApiCustomer(api: ApiCustomer): DashboardCustomerRecord {
  return {
    id: api.id,
    email: api.email,
    firstName: api.first_name,
    lastName: api.last_name,
    defaultRegion: api.default_region,
    orderIds: api.order_ids ?? [],
    returnIds: api.return_ids ?? [],
    orderCount: api.order_count,
    returnCount: api.return_count,
    addressCount: api.address_count,
  };
}

export type CustomerListFilters = {
  /** Matches email, first name, last name, or an exact customer ID. */
  search: string;
  region: string;
  page: number;
};

export type CustomerPage = {
  count: number;
  results: DashboardCustomerRecord[];
};

export async function fetchCustomerPage(filters: CustomerListFilters): Promise<CustomerPage> {
  const query = new URLSearchParams({
    page: String(filters.page),
    page_size: String(CUSTOMER_PAGE_SIZE),
  });
  if (filters.search.trim()) query.set("search", filters.search.trim());
  if (filters.region) query.set("default_region", filters.region);

  const data = await apiRequest<ApiCustomerList>(`/dashboard/customers/?${query}`);
  return { count: data.count, results: (data.results ?? []).map(mapApiCustomer) };
}

// ── detail fetch ───────────────────────────────────────────────────────────

export async function fetchCustomerById(
  customerId: string,
): Promise<DashboardCustomerRecord | null> {
  try {
    const data = await apiRequest<ApiCustomer>(`/dashboard/customers/${customerId}/`);
    return mapApiCustomer(data);
  } catch {
    return null;
  }
}
