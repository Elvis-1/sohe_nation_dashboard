"use client";

import { useSyncExternalStore } from "react";
import {
  getReturnsErrorSnapshot,
  getReturnsStatusSnapshot,
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

export function useReturnDeskError() {
  return useSyncExternalStore(subscribeToStoredReturns, getReturnsErrorSnapshot, () => null);
}

export function useReturnDeskStatus() {
  return useSyncExternalStore(subscribeToStoredReturns, getReturnsStatusSnapshot, () => "loading" as const);
}
