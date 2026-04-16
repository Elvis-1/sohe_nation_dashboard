/**
 * Orders repository — API-backed with fixture fallback.
 *
 * The dashboard orders desk should read from the canonical backend contract.
 * If the API is temporarily unavailable in local fixture runs, we keep the
 * desk usable by falling back to static mock orders.
 */

import type { DashboardOrderRecord } from "@/src/core/types/dashboard";
import { ApiError } from "@/src/core/api/http-client";
import { mockOrders } from "@/src/features/orders/data/mock-orders";
import {
  fetchDashboardOrder,
  fetchDashboardOrders,
  updateDashboardOrder,
} from "@/src/features/orders/data/api/order-api-client";

const ORDER_CHANGE_EVENT = "sohe-dashboard-orders-change";
const ORDER_STORAGE_KEY = "sohe-dashboard-orders";
const DEFAULT_ORDERS: DashboardOrderRecord[] = JSON.parse(
  JSON.stringify(mockOrders),
) as DashboardOrderRecord[];

let cachedOrders: DashboardOrderRecord[] | null = null;
let fetchPromise: Promise<DashboardOrderRecord[]> | null = null;

function cloneMockOrders(): DashboardOrderRecord[] {
  return JSON.parse(JSON.stringify(mockOrders)) as DashboardOrderRecord[];
}

function dispatchChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ORDER_CHANGE_EVENT));
  }
}

function readStoredFallbackOrders(): DashboardOrderRecord[] {
  if (typeof window === "undefined") return cloneMockOrders();

  const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
  if (!raw) return cloneMockOrders();

  try {
    const parsed = JSON.parse(raw) as DashboardOrderRecord[];
    return Array.isArray(parsed) ? parsed : cloneMockOrders();
  } catch {
    window.localStorage.removeItem(ORDER_STORAGE_KEY);
    return cloneMockOrders();
  }
}

function writeStoredFallbackOrders(orders: DashboardOrderRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

function invalidate() {
  // Keep the current snapshot visible while we refetch so detail pages do not
  // momentarily drop into fixture fallback records with different IDs.
  if (!fetchPromise) {
    fetchPromise = loadOrders().catch(() => {
      fetchPromise = null;
      return cachedOrders ?? cloneMockOrders();
    });
  }
  dispatchChange();
}

async function loadOrders(): Promise<DashboardOrderRecord[]> {
  try {
    const { results } = await fetchDashboardOrders({ page_size: 100 });
    cachedOrders = results.length > 0 ? results : readStoredFallbackOrders();
  } catch {
    cachedOrders = readStoredFallbackOrders();
  } finally {
    fetchPromise = null;
    dispatchChange();
  }

  return cachedOrders ?? cloneMockOrders();
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
      cachedOrders = cloneMockOrders();
      fetchPromise = null;
      dispatchChange();
      return cachedOrders;
    });
  }

  return DEFAULT_ORDERS;
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

export async function updateOrderRecord(nextOrder: DashboardOrderRecord): Promise<DashboardOrderRecord> {
  try {
    const updated = await updateDashboardOrder(nextOrder.id, {
      status: nextOrder.status,
      fulfillment_note: nextOrder.fulfillmentNote,
      internal_note: nextOrder.internalNote,
    });
    invalidate();
    return updated;
  } catch (error) {
    // If the backend explicitly rejected the update (validation/transition/auth),
    // surface that to the UI instead of silently diverging with local fallback.
    if (error instanceof ApiError) {
      throw error;
    }

    // Local fallback for fixture mode without API connectivity.
    const current = cachedOrders ?? readStoredFallbackOrders();
    cachedOrders = current.map((order) => (order.id === nextOrder.id ? nextOrder : order));
    writeStoredFallbackOrders(cachedOrders);
    dispatchChange();
    return nextOrder;
  }
}

export function getServerOrdersSnapshot(): DashboardOrderRecord[] {
  return DEFAULT_ORDERS;
}
