"use client";

import { useSyncExternalStore } from "react";
import {
  getServerReturnsSnapshot,
  getStoredReturnsSnapshot,
  subscribeToStoredReturns,
} from "@/src/features/returns/data/repositories/return-repository";

export function useReturnDesk() {
  return useSyncExternalStore(
    subscribeToStoredReturns,
    getStoredReturnsSnapshot,
    getServerReturnsSnapshot,
  );
}
