/**
 * Product repository — API-backed.
 * Replaces the localStorage mock repository used in the fixture phase.
 *
 * All reads and writes go through the real API.
 * Components subscribe to in-memory state invalidation via a lightweight event bus.
 */

import { ApiError } from "@/src/core/api/http-client";
import { fetchAllPages, type DeskLoadStatus } from "@/src/core/api/paginate";
import type { DashboardProductRecord } from "@/src/core/types/dashboard";
import {
  fetchDashboardProducts,
  fetchDashboardProduct,
  createDashboardProduct,
  updateDashboardProduct,
  archiveDashboardProduct,
} from "@/src/features/products/data/api/product-api-client";

// ---------------------------------------------------------------------------
// In-memory cache + invalidation bus
// ---------------------------------------------------------------------------

const PRODUCT_CHANGE_EVENT = "sohe-dashboard-products-change";

const EMPTY_PRODUCTS: DashboardProductRecord[] = [];

let cachedProducts: DashboardProductRecord[] | null = null;
let fetchPromise: Promise<DashboardProductRecord[]> | null = null;
let lastProductsError: Error | null = null;
// Ignores results from a load that a newer load has replaced.
let loadGeneration = 0;

function dispatchChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PRODUCT_CHANGE_EVENT));
  }
}

function startLoad() {
  const generation = ++loadGeneration;
  fetchPromise = fetchAllPages(fetchDashboardProducts)
    .then((results) => {
      if (generation !== loadGeneration) return results;
      cachedProducts = results;
      lastProductsError = null;
      fetchPromise = null;
      dispatchChange();
      return results;
    })
    .catch((error) => {
      if (generation !== loadGeneration) return EMPTY_PRODUCTS;
      cachedProducts = EMPTY_PRODUCTS;
      lastProductsError = error instanceof Error ? error : new Error("Products fetch failed.");
      fetchPromise = null;
      dispatchChange();
      return EMPTY_PRODUCTS;
    });
}

/** Refresh after a write, keeping the current catalog on screen until the new one lands. */
function invalidate() {
  if (cachedProducts === null || lastProductsError) {
    resetProducts();
    return;
  }
  startLoad();
}

function resetProducts() {
  loadGeneration += 1;
  cachedProducts = null;
  fetchPromise = null;
  lastProductsError = null;
  dispatchChange();
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

/**
 * Returns current cached snapshot or triggers a load.
 * Used as the `getSnapshot` argument in useSyncExternalStore.
 * Returns an empty array until the first API response lands.
 */
export function getProductsSnapshot(): DashboardProductRecord[] {
  if (cachedProducts !== null) return cachedProducts;
  if (!fetchPromise) startLoad();
  return EMPTY_PRODUCTS;
}

export function getProductsErrorSnapshot(): Error | null {
  return lastProductsError;
}

export function getProductsStatusSnapshot(): DeskLoadStatus {
  if (lastProductsError) return "error";
  return cachedProducts === null ? "loading" : "ready";
}

/** Drop the cached catalog (including a failed load) so the next read refetches from the API. */
export function retryProductsLoad(): void {
  resetProducts();
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

/**
 * Full product record for the editor. The list endpoint omits narrative and region fields,
 * so editing from a list record would save them back blank. Null when the product does not exist.
 */
export async function loadProductDetail(productId: string): Promise<DashboardProductRecord | null> {
  try {
    return await fetchDashboardProduct(productId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getProductById(productId: string): Promise<DashboardProductRecord | null> {
  try {
    return await fetchDashboardProduct(productId);
  } catch {
    return null;
  }
}

export async function listLowStockProducts(threshold = 5): Promise<DashboardProductRecord[]> {
  const results = await fetchAllPages(fetchDashboardProducts);
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

export async function archiveProductRecord(productId: string): Promise<void> {
  await archiveDashboardProduct(productId);
  invalidate();
}
