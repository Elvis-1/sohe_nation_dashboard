import type { DashboardCustomerRecord } from "@/src/core/types/dashboard";
import { ApiError, apiRequest } from "@/src/core/api/http-client";

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
    addressCount: api.address_count,
  };
}

// ── client-side store ──────────────────────────────────────────────────────

const CUSTOMER_CHANGE_EVENT = "sohe-dashboard-customers-change";
const EMPTY: DashboardCustomerRecord[] = [];

let cachedCustomers: DashboardCustomerRecord[] | null = null;
let fetchPromise: Promise<DashboardCustomerRecord[]> | null = null;
let customerLoadError: string | null = null;
let customerLoading = false;

function dispatchChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CUSTOMER_CHANGE_EVENT));
  }
}

async function loadCustomers(): Promise<DashboardCustomerRecord[]> {
  customerLoading = true;
  customerLoadError = null;
  dispatchChange();
  try {
    const data = await apiRequest<ApiCustomerList>("/dashboard/customers/?page_size=200");
    cachedCustomers = (data.results ?? []).map(mapApiCustomer);
    fetchPromise = null;
    return cachedCustomers;
  } catch (error) {
    cachedCustomers = EMPTY;
    fetchPromise = null;
    customerLoadError =
      error instanceof ApiError
        ? error.message
        : "Unable to load customers right now.";
    return EMPTY;
  } finally {
    customerLoading = false;
    dispatchChange();
  }
}

export function subscribeToStoredCustomers(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handle = () => onStoreChange();
  window.addEventListener(CUSTOMER_CHANGE_EVENT, handle);
  return () => window.removeEventListener(CUSTOMER_CHANGE_EVENT, handle);
}

export function getStoredCustomersSnapshot(): DashboardCustomerRecord[] {
  if (cachedCustomers !== null) return cachedCustomers;
  if (!fetchPromise) {
    fetchPromise = loadCustomers();
  }
  return EMPTY;
}

export function getServerCustomersSnapshot(): DashboardCustomerRecord[] {
  return EMPTY;
}

export function getCustomersLoadErrorSnapshot(): string | null {
  return customerLoadError;
}

export function getCustomersLoadingSnapshot(): boolean {
  return customerLoading;
}

export function getServerCustomersLoadErrorSnapshot(): string | null {
  return null;
}

export function getServerCustomersLoadingSnapshot(): boolean {
  return false;
}

export function refreshCustomers() {
  cachedCustomers = null;
  fetchPromise = null;
  customerLoadError = null;
  dispatchChange();
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
