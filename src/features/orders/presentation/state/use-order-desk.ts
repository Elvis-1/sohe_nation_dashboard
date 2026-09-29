"use client";

import { useSyncExternalStore } from "react";
import {
  getOrdersErrorSnapshot,
  getOrdersStatusSnapshot,
  getServerOrdersSnapshot,
  getStoredOrdersSnapshot,
  subscribeToStoredOrders,
} from "@/src/features/orders/data/repositories/order-repository";

export function useOrderDesk() {
  return useSyncExternalStore(subscribeToStoredOrders, getStoredOrdersSnapshot, getServerOrdersSnapshot);
}

export function useOrderDeskError() {
  return useSyncExternalStore(subscribeToStoredOrders, getOrdersErrorSnapshot, () => null);
}

export function useOrderDeskStatus() {
  return useSyncExternalStore(subscribeToStoredOrders, getOrdersStatusSnapshot, () => "loading" as const);
}
