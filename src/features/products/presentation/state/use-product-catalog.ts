"use client";

import { useSyncExternalStore } from "react";
import {
  subscribeToProducts,
  getProductsSnapshot,
  getServerProductsSnapshot,
} from "@/src/features/products/data/repositories/product-repository";

export function useProductCatalog() {
  return useSyncExternalStore(
    subscribeToProducts,
    getProductsSnapshot,
    getServerProductsSnapshot,
  );
}
