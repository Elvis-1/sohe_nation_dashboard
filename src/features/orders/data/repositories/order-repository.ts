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
let fetchPromise: Promise<DashboardOrderRecord[]> | null = null;

function dispatchChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ORDER_CHANGE_EVENT));
  }
}

async function loadOrders(): Promise<DashboardOrderRecord[]> {
  const { results } = await fetchDashboardOrders({ page_size: 100 });
  cachedOrders = results;
  fetchPromise = null;
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
    fetchPromise = loadOrders().catch(() => {
      cachedOrders = EMPTY_ORDERS;
      fetchPromise = null;
      dispatchChange();
      return EMPTY_ORDERS;
    });
  }

  return EMPTY_ORDERS;
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
