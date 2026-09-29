import { fetchAllPages, type DeskLoadStatus } from "@/src/core/api/paginate";
import type { DashboardOrderRecord } from "@/src/core/types/dashboard";
import {
  archiveDashboardOrder,
  fetchDashboardOrder,
  fetchDashboardOrders,
  updateDashboardOrder,
} from "@/src/features/orders/data/api/order-api-client";

const ORDER_CHANGE_EVENT = "sohe-dashboard-orders-change";
const EMPTY_ORDERS: DashboardOrderRecord[] = [];

let cachedOrders: DashboardOrderRecord[] | null = null;
let lastOrdersError: Error | null = null;
let fetchPromise: Promise<DashboardOrderRecord[]> | null = null;

function dispatchChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ORDER_CHANGE_EVENT));
  }
}

async function loadOrders(): Promise<DashboardOrderRecord[]> {
  const results = await fetchAllPages(fetchDashboardOrders);
  cachedOrders = results;
  fetchPromise = null;
  lastOrdersError = null;
  dispatchChange();
  return results;
}

export function subscribeToStoredOrders(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handle = () => onStoreChange();
  window.addEventListener(ORDER_CHANGE_EVENT, handle);
  return () => window.removeEventListener(ORDER_CHANGE_EVENT, handle);
}

export function getStoredOrdersSnapshot(): DashboardOrderRecord[] {
  if (cachedOrders !== null) return cachedOrders;

  if (!fetchPromise) {
    fetchPromise = loadOrders().catch((error) => {
      cachedOrders = EMPTY_ORDERS;
      fetchPromise = null;
      lastOrdersError = error instanceof Error ? error : new Error("Orders fetch failed.");
      dispatchChange();
      return EMPTY_ORDERS;
    });
  }

  return EMPTY_ORDERS;
}

export function getOrdersErrorSnapshot(): Error | null {
  return lastOrdersError;
}

export function getOrdersStatusSnapshot(): DeskLoadStatus {
  if (lastOrdersError) return "error";
  return cachedOrders === null ? "loading" : "ready";
}

/** Drop the cached desk (including a failed load) so the next read refetches from the API. */
export function retryOrdersLoad(): void {
  cachedOrders = null;
  lastOrdersError = null;
  fetchPromise = null;
  dispatchChange();
}

export function getServerOrdersSnapshot(): DashboardOrderRecord[] {
  return EMPTY_ORDERS;
}

export function listOrders(): DashboardOrderRecord[] {
  return getStoredOrdersSnapshot();
}

export async function listOrdersFromApi(
  params: Parameters<typeof fetchDashboardOrders>[0] = {},
): Promise<DashboardOrderRecord[]> {
  const { results } = await fetchDashboardOrders(params);
  return results;
}

export function listRecentOrders(limit = 3): DashboardOrderRecord[] {
  return getStoredOrdersSnapshot().slice(0, limit);
}

export function getOrderById(orderId: string): DashboardOrderRecord | null {
  return getStoredOrdersSnapshot().find((order) => order.id === orderId) ?? null;
}

export function getOrderByOrderNumber(orderNumber: string): DashboardOrderRecord | null {
  return getStoredOrdersSnapshot().find((order) => order.orderNumber === orderNumber) ?? null;
}

export async function getOrderByIdFromApi(orderId: string): Promise<DashboardOrderRecord | null> {
  try {
    return await fetchDashboardOrder(orderId);
  } catch {
    return null;
  }
}

/**
 * Fetch one order straight from the API and add it to the desk.
 * Used when a detail page opens an order the loaded desk does not contain.
 */
export async function loadOrderIntoDesk(orderId: string): Promise<DashboardOrderRecord | null> {
  const order = await getOrderByIdFromApi(orderId);
  if (order && cachedOrders !== null && !cachedOrders.some((item) => item.id === order.id)) {
    cachedOrders = [order, ...cachedOrders];
    dispatchChange();
  }
  return order;
}

export async function updateOrderRecord(
  nextOrder: DashboardOrderRecord,
): Promise<DashboardOrderRecord> {
  const updated = await updateDashboardOrder(nextOrder.id, {
    status: nextOrder.status,
    fulfillment_note: nextOrder.fulfillmentNote,
    internal_note: nextOrder.internalNote,
  });
  if (cachedOrders !== null) {
    cachedOrders = cachedOrders.map((o) => (o.id === updated.id ? updated : o));
  }
  dispatchChange();
  return updated;
}

export async function archiveOrderRecord(orderId: string): Promise<void> {
  await archiveDashboardOrder(orderId);
  if (cachedOrders !== null) {
    cachedOrders = cachedOrders.filter((o) => o.id !== orderId);
  }
  dispatchChange();
}
