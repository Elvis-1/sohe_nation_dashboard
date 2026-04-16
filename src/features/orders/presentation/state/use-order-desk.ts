"use client";

import { useSyncExternalStore } from "react";
import {
  getStoredOrdersSnapshot,
  listOrders,
  subscribeToStoredOrders,
} from "@/src/features/orders/data/repositories/mock-order-repository";

export function useOrderDesk() {
  return useSyncExternalStore(subscribeToStoredOrders, getStoredOrdersSnapshot, listOrders);
}
