"use client";

import { useSyncExternalStore } from "react";
import {
  subscribeToProducts,
  getProductsSnapshot,
  getServerProductsSnapshot,
  getProductsErrorSnapshot,
  getProductsStatusSnapshot,
} from "@/src/features/products/data/repositories/product-repository";

export function useProductCatalog() {
  return useSyncExternalStore(
    subscribeToProducts,
    getProductsSnapshot,
    getServerProductsSnapshot,
  );
}

export function useProductCatalogError() {
  return useSyncExternalStore(subscribeToProducts, getProductsErrorSnapshot, () => null);
}

export function useProductCatalogStatus() {
  return useSyncExternalStore(subscribeToProducts, getProductsStatusSnapshot, () => "loading" as const);
}
