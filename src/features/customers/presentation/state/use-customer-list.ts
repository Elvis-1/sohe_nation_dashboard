"use client";

import { useSyncExternalStore } from "react";
import {
  getCustomersLoadErrorSnapshot,
  getCustomersLoadingSnapshot,
  getServerCustomersSnapshot,
  getServerCustomersLoadErrorSnapshot,
  getServerCustomersLoadingSnapshot,
  getStoredCustomersSnapshot,
  refreshCustomers,
  subscribeToStoredCustomers,
} from "@/src/features/customers/data/repositories/customer-repository";

export function useCustomerList() {
  return useSyncExternalStore(
    subscribeToStoredCustomers,
    getStoredCustomersSnapshot,
    getServerCustomersSnapshot,
  );
}

export function useCustomerListError() {
  return useSyncExternalStore(
    subscribeToStoredCustomers,
    getCustomersLoadErrorSnapshot,
    getServerCustomersLoadErrorSnapshot,
  );
}

export function useCustomerListLoading() {
  return useSyncExternalStore(
    subscribeToStoredCustomers,
    getCustomersLoadingSnapshot,
    getServerCustomersLoadingSnapshot,
  );
}

export { refreshCustomers };
