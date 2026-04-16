"use client";

import { useSyncExternalStore } from "react";
import {
  getStoredReturnsSnapshot,
  listReturns,
  subscribeToStoredReturns,
} from "@/src/features/returns/data/repositories/mock-return-repository";

export function useReturnDesk() {
  return useSyncExternalStore(subscribeToStoredReturns, getStoredReturnsSnapshot, listReturns);
}
