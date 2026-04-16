/**
 * Product repository — API-backed.
 * Replaces the localStorage mock repository used in the fixture phase.
 *
 * All reads and writes go through the real API.
 * Components subscribe to in-memory state invalidation via a lightweight event bus.
 */

import type { DashboardProductRecord } from "@/src/core/types/dashboard";
import {
  fetchDashboardProducts,
  fetchDashboardProduct,
  createDashboardProduct,
  updateDashboardProduct,
} from "@/src/features/products/data/api/product-api-client";

// ---------------------------------------------------------------------------
// In-memory cache + invalidation bus
// ---------------------------------------------------------------------------

const PRODUCT_CHANGE_EVENT = "sohe-dashboard-products-change";

const EMPTY_PRODUCTS: DashboardProductRecord[] = [];

let cachedProducts: DashboardProductRecord[] | null = null;
let fetchPromise: Promise<DashboardProductRecord[]> | null = null;

function invalidate() {
  cachedProducts = null;
  fetchPromise = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PRODUCT_CHANGE_EVENT));
  }
}

// ---------------------------------------------------------------------------
// Subscription (compatible with useSyncExternalStore)
// ---------------------------------------------------------------------------

export function subscribeToProducts(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handleChange = () => onStoreChange();

  window.addEventListener(PRODUCT_CHANGE_EVENT, handleChange);
  return () => window.removeEventListener(PRODUCT_CHANGE_EVENT, handleChange);
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

async function loadProducts(): Promise<DashboardProductRecord[]> {
  const { results } = await fetchDashboardProducts({ page_size: 100 });
  cachedProducts = results;
  fetchPromise = null;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PRODUCT_CHANGE_EVENT));
  }

  return results;
}

/**
 * Returns current cached snapshot or triggers a load.
 * Used as the `getSnapshot` argument in useSyncExternalStore.
 * Returns an empty array until the first API response lands.
 */
export function getProductsSnapshot(): DashboardProductRecord[] {
  if (cachedProducts !== null) return cachedProducts;

  // Trigger background load if not already in flight
  if (!fetchPromise) {
    fetchPromise = loadProducts().catch(() => {
      cachedProducts = EMPTY_PRODUCTS;
      fetchPromise = null;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(PRODUCT_CHANGE_EVENT));
      }
      return EMPTY_PRODUCTS;
    });
  }

  return EMPTY_PRODUCTS;
}

/**
 * Server-side snapshot — returns an empty array (no localStorage, no fetch).
 * Passed as the `getServerSnapshot` argument in useSyncExternalStore.
 */
export function getServerProductsSnapshot(): DashboardProductRecord[] {
  return EMPTY_PRODUCTS;
}

export async function listProducts(
  params: Parameters<typeof fetchDashboardProducts>[0] = {},
): Promise<DashboardProductRecord[]> {
  const { results } = await fetchDashboardProducts(params);
  return results;
}

export async function getProductById(productId: string): Promise<DashboardProductRecord | null> {
  try {
    return await fetchDashboardProduct(productId);
  } catch {
    return null;
  }
}

export async function listLowStockProducts(threshold = 5): Promise<DashboardProductRecord[]> {
  const { results } = await fetchDashboardProducts({ page_size: 100 });
  return results.filter((p) => p.inventoryQuantity <= threshold);
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createProductRecord(
  payload: Parameters<typeof createDashboardProduct>[0],
): Promise<DashboardProductRecord> {
  const product = await createDashboardProduct(payload);
  invalidate();
  return product;
}

export async function updateProductRecord(
  productId: string,
  payload: Parameters<typeof updateDashboardProduct>[1],
): Promise<DashboardProductRecord> {
  const product = await updateDashboardProduct(productId, payload);
  invalidate();
  return product;
}
