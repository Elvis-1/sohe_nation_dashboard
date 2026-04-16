"use client";

import { useSyncExternalStore } from "react";
import {
  getStoredProductsSnapshot,
  listProducts,
  subscribeToStoredProducts,
} from "@/src/features/products/data/repositories/mock-product-repository";

export function useProductCatalog() {
  return useSyncExternalStore(subscribeToStoredProducts, getStoredProductsSnapshot, listProducts);
}
