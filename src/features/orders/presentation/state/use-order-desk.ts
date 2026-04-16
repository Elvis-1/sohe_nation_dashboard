"use client";

import { useSyncExternalStore } from "react";
import {
  getServerOrdersSnapshot,
  getStoredOrdersSnapshot,
  subscribeToStoredOrders,
} from "@/src/features/orders/data/repositories/order-repository";

export function useOrderDesk() {
  return useSyncExternalStore(subscribeToStoredOrders, getStoredOrdersSnapshot, getServerOrdersSnapshot);
}
